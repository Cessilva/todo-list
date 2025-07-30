'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  ResetPasswordData,
} from '../types/auth';
import { authService } from '../services/authService';
import { useGlobal } from './GlobalContext';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  register: (credentials: RegisterCredentials) => Promise<boolean>;
  resetPassword: (data: ResetPasswordData) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_INITIALIZED'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: action.payload !== null,
      };
    case 'SET_INITIALIZED':
      return {
        ...state,
        isInitialized: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const { setLoading, setError } = useGlobal();

  // Inicializar autenticación al cargar la aplicación
  useEffect(() => {
    const initializeAuth = () => {
      try {
        // Setear usuarios correctos desde el inicio
        const correctUsers: User[] = [
          {
            id: '1',
            email: 'admin@todolist.com',
            name: 'Cecilia Silva Sandoval',
            role: 'admin',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            email: 'user@todolist.com',
            name: 'Pedro Páramo',
            role: 'user',
            createdAt: new Date().toISOString(),
          },
        ];

        // Limpiar storage y setear usuarios correctos
        authService.clearAndSetUsers(correctUsers);

        // Verificar si hay un usuario logueado
        const currentUser = authService.getCurrentUser();
        dispatch({ type: 'SET_USER', payload: currentUser });
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);

      if (response.success && response.user) {
        dispatch({ type: 'SET_USER', payload: response.user });
        return true;
      } else {
        setError({
          type: 'error',
          title: 'Error de autenticación',
          message: response.message,
        });
        return false;
      }
    } catch (error) {
      setError({
        type: 'error',
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    credentials: RegisterCredentials
  ): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.register(credentials);

      if (response.success && response.user) {
        dispatch({ type: 'SET_USER', payload: response.user });
        setError({
          type: 'info',
          title: 'Registro exitoso',
          message: response.message,
        });
        return true;
      } else {
        setError({
          type: 'error',
          title: 'Error en el registro',
          message: response.message,
        });
        return false;
      }
    } catch (error) {
      setError({
        type: 'error',
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (data: ResetPasswordData): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await authService.resetPassword(data.email);

      if (response.success) {
        setError({
          type: 'info',
          title: 'Recuperación de contraseña',
          message: response.message,
        });
        return true;
      } else {
        setError({
          type: 'error',
          title: 'Error en la recuperación',
          message: response.message,
        });
        return false;
      }
    } catch (error) {
      setError({
        type: 'error',
        title: 'Error de conexión',
        message: 'No se pudo conectar con el servidor',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
      dispatch({ type: 'SET_USER', payload: null });
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ state, login, register, resetPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
