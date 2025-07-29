'use client';

import React from 'react';
import { useGlobal } from '../context/GlobalContext';
import { GlobalSpinner } from './Spinner';
import { ErrorModal } from './ErrorModal';

export const GlobalUIManager: React.FC = () => {
  const { state, clearError } = useGlobal();

  return (
    <>
      {/* Global Loading Spinner */}
      {state.isLoading && <GlobalSpinner />}

      {/* Global Error Modal */}
      {state.error && <ErrorModal error={state.error} onClose={clearError} />}
    </>
  );
};
