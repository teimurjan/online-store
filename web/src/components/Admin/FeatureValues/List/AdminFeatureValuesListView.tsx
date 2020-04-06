/** @jsx jsx */
import { jsx } from '@emotion/core';
import { IntlShape, injectIntl } from 'react-intl';

import { AdminTable, IntlRenderer } from 'src/components/Admin/AdminTable';
import { IViewProps as IProps } from 'src/components/Admin/FeatureValues/List/AdminFeatureValuesListPresenter';
import { FeatureValueTypeRenderer } from 'src/components/Admin/FeatureValues/List/FeatureValueTypeRenderer';
import { ReactRouterLinkButton } from 'src/components/common/LinkButton/LinkButton';
import { NoDataAvailable } from 'src/components/common/NoDataAvailable/NoDataAvaiable';
import { Section } from 'src/components/common/Section/Section';
import { fullWidthMixin } from 'src/styles/mixins';

export const NewFeatureValueButton = injectIntl(({ intl }) => (
  <ReactRouterLinkButton to="/admin/featureValues/new" color="is-primary">
    {intl.formatMessage({ id: 'AdminFeatureValues.notFound.cta' })}
  </ReactRouterLinkButton>
));

const NoFeatureValuesAvialable = injectIntl(({ intl }) => (
  <NoDataAvailable
    title={intl.formatMessage({ id: 'AdminFeatureValues.notFound.title' })}
    description={intl.formatMessage({
      id: 'AdminFeatureValues.notFound.description',
    })}
    CTA={<NewFeatureValueButton />}
  />
));

const renderNoData = () => <NoFeatureValuesAvialable />;

type FeatureValue = IProps['featureValues'][0];

export const AdminFeatureValuesListView = ({
  featureValues,
  locales,
  intl,
  isLoading,
  isDataLoaded,
}: IProps & { intl: IntlShape }) => (
  <Section css={fullWidthMixin}>
    <AdminTable<FeatureValue>
      pathPrefix="/admin/featureValues"
      isLoading={isLoading}
      isDataLoaded={isDataLoaded}
      entities={featureValues}
      renderNoData={renderNoData}
      intl={intl}
    >
      <AdminTable.Col<FeatureValue> key_="id" title={intl.formatMessage({ id: 'common.ID' })} />
      <AdminTable.Col<FeatureValue>
        key_="name"
        title={intl.formatMessage({ id: 'AdminFeatureValues.names' })}
        renderer={new IntlRenderer(locales)}
      />
      <AdminTable.Col<FeatureValue>
        key_="feature_type"
        title={intl.formatMessage({ id: 'AdminFeatureValues.featureType' })}
        renderer={new FeatureValueTypeRenderer(intl.locale)}
      />
    </AdminTable>

    {isDataLoaded && featureValues.length > 0 && <NewFeatureValueButton />}
  </Section>
);
