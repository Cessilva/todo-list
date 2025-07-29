export interface GlobalState {
  isLoading: boolean;
  error: ErrorState | null;
}

export interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info';
  title?: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}
