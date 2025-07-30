import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../types/auth';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'todo_app_access_token',
  REFRESH_TOKEN: 'todo_app_refresh_token',
  USER: 'todo_app_user',
} as const;

// Servicio de autenticación que se conecta con la API del backend
class AuthService {
  // Obtener token de acceso
  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Obtener token de refresh
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // Guardar tokens
  private saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  // Eliminar tokens
  private removeTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  // Obtener usuario actual
  getCurrentUser(): User | null {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  // Guardar usuario actual
  private saveCurrentUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  // Eliminar usuario actual
  private removeCurrentUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Realizar petición HTTP con manejo de errores
  private async makeRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('Error en petición:', error);
      throw error;
    }
  }

  // Realizar petición autenticada con manejo automático de tokens
  private async makeAuthenticatedRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<any> {
    const token = this.getAccessToken();

    if (!token) {
      throw new Error('No hay token de acceso');
    }

    try {
      return await this.makeRequest(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error: any) {
      // Si el token expiró, intentar renovarlo
      if (
        error.message?.includes('Token expirado') ||
        error.message?.includes('jwt expired')
      ) {
        try {
          await this.refreshAccessToken();
          const newToken = this.getAccessToken();

          if (newToken) {
            return await this.makeRequest(url, {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newToken}`,
              },
            });
          }
        } catch (refreshError) {
          // Si no se puede renovar, limpiar sesión
          this.removeTokens();
          this.removeCurrentUser();
          throw new Error('Sesión expirada');
        }
      }
      throw error;
    }
  }

  // Renovar token de acceso
  private async refreshAccessToken(): Promise<void> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No hay token de refresh');
    }

    try {
      const response = await this.makeRequest('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });

      if (response.success) {
        const { accessToken, refreshToken: newRefreshToken } =
          response.data.tokens;
        this.saveTokens(accessToken, newRefreshToken);
      } else {
        throw new Error('No se pudo renovar el token');
      }
    } catch (error) {
      throw new Error('Error al renovar token');
    }
  }

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success) {
        const { user, tokens } = response.data;

        // Guardar tokens y usuario
        this.saveTokens(tokens.accessToken, tokens.refreshToken);
        this.saveCurrentUser({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        });

        return {
          success: true,
          message: response.message,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
          },
        };
      }

      return {
        success: false,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión',
      };
    }
  }

  // Register
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const response = await this.makeRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      if (response.success) {
        const { user, tokens } = response.data;

        // Guardar tokens y usuario
        this.saveTokens(tokens.accessToken, tokens.refreshToken);
        this.saveCurrentUser({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        });

        return {
          success: true,
          message: response.message,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            createdAt: user.createdAt,
          },
        };
      }

      return {
        success: false,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al registrar usuario',
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      // Intentar hacer logout en el servidor
      const token = this.getAccessToken();
      if (token) {
        await this.makeAuthenticatedRequest('/auth/logout', {
          method: 'POST',
        });
      }
    } catch (error) {
      console.error('Error al hacer logout en el servidor:', error);
    } finally {
      // Limpiar datos locales siempre
      this.removeTokens();
      this.removeCurrentUser();
    }
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Verificar token con el servidor
  async verifyToken(): Promise<boolean> {
    try {
      const response = await this.makeAuthenticatedRequest('/auth/verify');
      return response.success;
    } catch (error) {
      console.error('Error al verificar token:', error);
      // Si el token no es válido, limpiar datos locales
      this.removeTokens();
      this.removeCurrentUser();
      return false;
    }
  }

  // Obtener perfil del usuario
  async getProfile(): Promise<User | null> {
    try {
      const response = await this.makeAuthenticatedRequest('/auth/profile');

      if (response.success) {
        const user = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          createdAt: response.data.user.createdAt,
        };

        this.saveCurrentUser(user);
        return user;
      }

      return null;
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      return null;
    }
  }

  // Actualizar perfil
  async updateProfile(data: {
    name?: string;
    email?: string;
  }): Promise<AuthResponse> {
    try {
      const response = await this.makeAuthenticatedRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });

      if (response.success) {
        const user = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role,
          createdAt: response.data.user.createdAt,
        };

        this.saveCurrentUser(user);

        return {
          success: true,
          message: response.message,
          user,
        };
      }

      return {
        success: false,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar perfil',
      };
    }
  }

  // Cambiar contraseña
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<AuthResponse> {
    try {
      const response = await this.makeAuthenticatedRequest(
        '/auth/change-password',
        {
          method: 'PUT',
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmNewPassword: newPassword,
          }),
        }
      );

      return {
        success: response.success,
        message: response.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al cambiar contraseña',
      };
    }
  }

  // Métodos de compatibilidad con el código existente
  initializeTestUsers(): void {
    // Ya no necesitamos inicializar usuarios de prueba
    console.log('Usando API real, no se necesitan usuarios de prueba');
  }

  clearAndSetUsers(): void {
    // Ya no necesitamos este método
    console.log('Usando API real, no se necesita limpiar usuarios locales');
  }
}

export const authService = new AuthService();
