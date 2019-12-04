import * as React from 'react';

import { injectIntl } from 'react-intl';

import { useIntlState } from 'src/state/IntlState';
import { useAdminFeatureValuesState } from 'src/state/AdminFeatureValuesState';

import { AdminFeatureValuesListPresenter } from './AdminFeatureValuesListPresenter';
import { AdminFeatureValuesListView } from './AdminFeatureValuesListView';

export const AdminFeatureValuesListContainer = () => {
  const { intlState } = useIntlState();
  const { adminFeatureValuesState } = useAdminFeatureValuesState();

  return (
    <AdminFeatureValuesListPresenter
      View={injectIntl(AdminFeatureValuesListView)}
      adminFeatureValuesState={adminFeatureValuesState}
      intlState={intlState}
    />
  );
};
