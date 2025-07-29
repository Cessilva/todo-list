'use client';

import React from 'react';
import { useGlobal } from '../../context/GlobalContext';
import { GlobalSpinner } from '../Spinner';
import { ErrorModal } from './ErrorModal';
import { SuccessModal } from './SuccessModal';

export const GlobalUIManager: React.FC = () => {
  const { state, clearError, clearSuccess } = useGlobal();

  return (
    <>
      {/* Global Loading Spinner */}
      {state.isLoading && <GlobalSpinner />}

      {/* Global Error Modal */}
      {state.error && <ErrorModal error={state.error} onClose={clearError} />}

      {/* Global Success Modal */}
      {state.success && (
        <SuccessModal
          isOpen={!!state.success}
          title={state.success.title}
          message={state.success.message}
          onClose={clearSuccess}
        />
      )}
    </>
  );
};
