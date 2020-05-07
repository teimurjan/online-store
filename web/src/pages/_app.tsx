import { CacheProvider } from '@emotion/core';
import { cache } from 'emotion';
import { ThemeProvider } from 'emotion-theming';
import { AppProps, AppContext } from 'next/app';
import * as React from 'react';
import { createIntl, createIntlCache } from 'react-intl';

import { CustomHead } from 'src/_app/CustomHead';
import { EntryPoint } from 'src/_app/EntryPoint';
import { GlobalStyles } from 'src/_app/GlobalStyle';
import { LoadingOverlay } from 'src/_app/LoadingOverlay';
import { SentryErrorBoundary } from 'src/_app/SentryErrorBoundary';
import { CacheBuster } from 'src/components/CacheBuster';
import { PageProgressBar } from 'src/components/PageProgressBar/PageProgressBar';
import { dependenciesFactory, IDependenciesFactoryArgs } from 'src/DI/DependenciesContainer';
import { DIProvider } from 'src/DI/DI';
import { AppStateProvider } from 'src/state/AppState';
import { CategoriesStateProvider } from 'src/state/CategoriesState';
import { IntlStateProvider } from 'src/state/IntlState';
import { RatesStateProvider } from 'src/state/RatesState';
import { UserStateProvider } from 'src/state/UserState';
import { defaultTheme } from 'src/themes';

import 'bulma/css/bulma.css';

const intlCache = createIntlCache();

const CustomNextApp = ({
  Component,
  pageProps,
  locale,
  messages,
  componentsInitialProps,
}: AppProps & Then<ReturnType<typeof getInitialProps>>) => {
  const intl = createIntl(
    {
      locale,
      messages,
    },
    intlCache,
  );

  return (
    <SentryErrorBoundary>
      <CacheProvider value={cache}>
        <DIProvider value={{ dependencies: dependenciesFactory() }}>
          <>
            <ThemeProvider theme={defaultTheme}>
              <AppStateProvider>
                <IntlStateProvider
                  initialProps={{
                    availableLocales: componentsInitialProps.intlState.availableLocales,
                    error: componentsInitialProps.intlState.error,
                  }}
                  intl={intl}
                >
                  <RatesStateProvider>
                    <UserStateProvider>
                      <CategoriesStateProvider initialProps={componentsInitialProps.categoriesState}>
                        <EntryPoint>
                          <>
                            <CustomHead />
                            <GlobalStyles />
                            <PageProgressBar />
                            <Component {...pageProps} />
                            <LoadingOverlay />
                          </>
                        </EntryPoint>
                      </CategoriesStateProvider>
                    </UserStateProvider>
                  </RatesStateProvider>
                </IntlStateProvider>
              </AppStateProvider>
            </ThemeProvider>
            <CacheBuster />
          </>
        </DIProvider>
      </CacheProvider>
    </SentryErrorBoundary>
  );
};

const getComponentsInitialProps = async (args: IDependenciesFactoryArgs) => {
  const {
    services: { category: categoryService, intl: intlService },
  } = dependenciesFactory(args);
  try {
    const { entities, result } = await categoryService.getAll();
    const availableLocales = await intlService.getAvailableLocales();
    return {
      categoriesState: { categories: entities.categories, categoriesOrder: result },
      intlState: { availableLocales },
    };
  } catch (e) {
    return {
      categoriesState: { categories: {}, categoriesOrder: [], error: 'errors.common' },
      intlState: { availableLocales: [], error: 'errors.common' },
    };
  }
};

const getInitialProps = async ({ Component, ctx }: AppContext) => {
  const pageProps = Component.getInitialProps ? await Component.getInitialProps(ctx) : {};

  const { req, res } = ctx;
  const { locale, messages } = req || (window as any).__NEXT_DATA__.props;

  return {
    pageProps,
    locale,
    messages,
    componentsInitialProps: await getComponentsInitialProps({ req, res }),
  };
};

CustomNextApp.getInitialProps = getInitialProps;

export default CustomNextApp;
