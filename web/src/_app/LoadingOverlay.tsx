import * as React from 'react';

import { PageLoader } from 'src/components/common/PageLoader/PageLoader';
import { useAppState } from 'src/state/AppState';

export const LoadingOverlay = () => {
  const {
    appState: { isLoading },
  } = useAppState();

  return <PageLoader isActive={isLoading} />;
};
