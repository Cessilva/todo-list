export interface GlobalState {
  isLoading: boolean;
  error: ErrorState | null;
  success: SuccessState | null;
}

export interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info';
  title?: string;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
}

export interface SuccessState {
  title: string;
  message: string;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}
