import * as React from 'react';

import { useDependencies } from 'src/DI/DI';

import { useAdminFeatureTypesState } from 'src/state/AdminFeatureTypesState';

import { DeleteModalContainer } from '../../DeleteModal/DeleteModalContainer';

export const AdminFeatureTypesDeleteContainer = () => {
  const { dependencies } = useDependencies();
  const {
    adminFeatureTypesState: { deleteFeatureType },
  } = useAdminFeatureTypesState();

  const deleteEntity = React.useCallback(
    async (id: number) => {
      await deleteFeatureType(id);
      dependencies.services.featureType.delete(id);
    },
    [deleteFeatureType, dependencies.services.featureType],
  );

  const preloadData = React.useCallback(
    async ({ id, setError, setIsLoading }) => {
      try {
        setIsLoading(true);
        const isExists = await dependencies.services.featureType.exists(id);
        if (!isExists) {
          setError('AdminFeatureTypes.notFound');
        }
      } catch (e) {
        setError('errors.common');
      } finally {
        setIsLoading(false);
      }
    },
    [dependencies.services.featureType],
  );

  return <DeleteModalContainer deleteEntity={deleteEntity} preloadData={preloadData} backPath="/admin/featureTypes" />;
};
