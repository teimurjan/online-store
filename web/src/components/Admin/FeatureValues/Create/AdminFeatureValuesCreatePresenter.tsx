import * as React from 'react';

import { RouteComponentProps } from 'react-router';
import * as yup from 'yup';

import { IFeatureValueService } from 'src/services/FeatureValueService';

import * as schemaValidator from 'src/components/SchemaValidator';

import { IContextValue as AdminFeatureTypesStateContextValue } from 'src/state/AdminFeatureTypesState';
import { IContextValue as AdminFeatureValuesStateContextValue } from 'src/state/AdminFeatureValuesState';
import { IContextValue as IntlStateContextValue } from 'src/state/IntlState';

import { useTimeoutExpired } from 'src/hooks/useTimeoutExpired';

import { getFieldName, parseFieldName } from '../../IntlField';
import { useLazy } from 'src/hooks/useLazy';

export interface IProps
  extends RouteComponentProps<any>,
    AdminFeatureValuesStateContextValue,
    AdminFeatureTypesStateContextValue,
    IntlStateContextValue {
  View: React.ComponentClass<IViewProps> | React.SFC<IViewProps>;
  service: IFeatureValueService;
}

export interface IViewProps {
  isOpen: boolean;
  create: (values: { names: { [key: string]: string }; feature_type_id: string }) => any;
  isCreating: boolean;
  isLoading: boolean;
  error: string | undefined;
  close: () => any;
  availableLocales: IntlStateContextValue['intlState']['availableLocales'];
  featureTypes: AdminFeatureTypesStateContextValue['adminFeatureTypesState']['featureTypes'];
  validate?: (values: object) => object | Promise<object>;
}

export const FEATURE_VALUE_NAME_FIELD_KEY = 'name';

export const AdminFeatureValuesCreatePresenter: React.FC<IProps> = ({
  intlState: { availableLocales },
  adminFeatureTypesState: { getFeatureTypes, isListLoading: featureTypesLoading, featureTypes },
  adminFeatureValuesState: { addFeatureValue },
  View,
  history,
  service,
}) => {
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [isCreating, setCreating] = React.useState(false);

  const isTimeoutExpired = useTimeoutExpired(1000);

  React.useEffect(() => {
    getFeatureTypes();
  }, [getFeatureTypes]);

  const makeValidator = React.useCallback(
    () =>
      new schemaValidator.SchemaValidator(
        yup.object().shape(
          availableLocales.reduce(
            (acc, locale) => ({
              ...acc,
              [getFieldName(FEATURE_VALUE_NAME_FIELD_KEY, locale)]: yup.string().required('common.errors.field.empty'),
            }),
            {
              feature_type_id: yup.number().required('common.errors.field.empty'),
            },
          ),
        ),
      ),
    [availableLocales],
  );

  const validator = useLazy({
    make: makeValidator,
    trigger: availableLocales.length,
  });

  const close = React.useCallback(() => history.push('/admin/featureValues'), [history]);

  const create: IViewProps['create'] = React.useCallback(
    async values => {
      const formattedValues = Object.keys(values).reduce(
        (acc, fieldName) => {
          const { key, id } = parseFieldName(fieldName);
          if (key === FEATURE_VALUE_NAME_FIELD_KEY) {
            return { ...acc, names: { ...acc.names, [id]: values[fieldName] } };
          }

          return acc;
        },
        {
          feature_type_id: parseInt(values.feature_type_id, 10),
          names: {},
        },
      );

      try {
        const featureValue = await service.create(formattedValues);
        addFeatureValue(featureValue);
        setCreating(false);
        close();
      } catch (e) {
        setError('errors.common');
        setCreating(false);
      }
    },
    [addFeatureValue, close, service],
  );

  return (
    <View
      isOpen={true}
      create={create}
      error={error}
      isCreating={isCreating}
      isLoading={isTimeoutExpired && featureTypesLoading}
      close={close}
      availableLocales={availableLocales}
      featureTypes={featureTypes}
      validate={(validator || { validate: undefined }).validate}
    />
  );
};
