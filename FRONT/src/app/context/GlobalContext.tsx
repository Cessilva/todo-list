'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { GlobalState, ErrorState, SuccessState } from '../types/global';

interface GlobalContextType {
  state: GlobalState;
  setLoading: (isLoading: boolean, message?: string) => void;
  setError: (error: ErrorState | null) => void;
  clearError: () => void;
  setSuccess: (success: SuccessState | null) => void;
  clearSuccess: () => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

type GlobalAction =
  | { type: 'SET_LOADING'; payload: { isLoading: boolean; message?: string } }
  | { type: 'SET_ERROR'; payload: ErrorState | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SUCCESS'; payload: SuccessState | null }
  | { type: 'CLEAR_SUCCESS' };

const globalReducer = (
  state: GlobalState,
  action: GlobalAction
): GlobalState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_SUCCESS':
      return {
        ...state,
        success: action.payload,
        isLoading: false,
      };
    case 'CLEAR_SUCCESS':
      return {
        ...state,
        success: null,
      };
    default:
      return state;
  }
};

const initialState: GlobalState = {
  isLoading: false,
  error: null,
  success: null,
};

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  const setLoading = (isLoading: boolean, message?: string) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading, message } });
  };

  const setError = (error: ErrorState | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setSuccess = (success: SuccessState | null) => {
    dispatch({ type: 'SET_SUCCESS', payload: success });
  };

  const clearSuccess = () => {
    dispatch({ type: 'CLEAR_SUCCESS' });
  };

  return (
    <GlobalContext.Provider
      value={{
        state,
        setLoading,
        setError,
        clearError,
        setSuccess,
        clearSuccess,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};
