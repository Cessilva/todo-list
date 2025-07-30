'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { User, LoginCredentials, RegisterCredentials } from '../types/auth';
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
  const { setLoading, setError, setSuccess } = useGlobal();

  // Inicializar autenticación al cargar la aplicación
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar si hay un usuario logueado y si el token es válido
        const currentUser = authService.getCurrentUser();

        if (currentUser && authService.isAuthenticated()) {
          // Verificar token con el servidor
          const isValidToken = await authService.verifyToken();

          if (isValidToken) {
            // Token válido, mantener sesión
            dispatch({ type: 'SET_USER', payload: currentUser });
          } else {
            // Token inválido, limpiar sesión
            await authService.logout();
            dispatch({ type: 'SET_USER', payload: null });
          }
        } else {
          // No hay usuario logueado
          dispatch({ type: 'SET_USER', payload: null });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // En caso de error, limpiar sesión por seguridad
        await authService.logout();
        dispatch({ type: 'SET_USER', payload: null });
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
        // No mantener al usuario logueado después del registro
        // Limpiar cualquier token que se haya guardado automáticamente
        await authService.logout();
        dispatch({ type: 'SET_USER', payload: null });

        setSuccess({
          title: 'Registro exitoso',
          message:
            'Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.',
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

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authService.logout();
      dispatch({ type: 'SET_USER', payload: null });

      // Mostrar mensaje de éxito
      setError({
        type: 'info',
        title: 'Sesión cerrada',
        message: 'Has cerrado sesión exitosamente',
      });
    } catch (error) {
      console.error('Error during logout:', error);
      // Aún así limpiar la sesión local
      dispatch({ type: 'SET_USER', payload: null });

      setError({
        type: 'warning',
        title: 'Sesión cerrada',
        message: 'Sesión cerrada localmente (error de conexión con servidor)',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ state, login, register, logout }}>
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
