import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthResponse,
} from '../types/auth';

const STORAGE_KEYS = {
  USER: 'todo_app_user',
  USERS: 'todo_app_users',
} as const;

// Simulación de base de datos de usuarios en localStorage
class AuthService {
  // Obtener todos los usuarios registrados
  private getUsers(): User[] {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  }

  // Guardar usuarios en localStorage
  private saveUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
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

  // Generar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Simular delay de red
  private async simulateNetworkDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    await this.simulateNetworkDelay();

    // Limpiar storage y setear usuarios correctos cada vez que alguien se loggue
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
    this.clearAndSetUsers(correctUsers);

    const users = this.getUsers();
    const user = users.find((u) => u.email === credentials.email);

    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado',
      };
    }

    // En una aplicación real, aquí verificarías la contraseña hasheada
    // Por simplicidad, usamos una verificación básica
    if (credentials.password !== 'password123') {
      return {
        success: false,
        message: 'Contraseña incorrecta',
      };
    }

    this.saveCurrentUser(user);
    return {
      success: true,
      message: 'Inicio de sesión exitoso',
      user,
    };
  }

  // Register
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    await this.simulateNetworkDelay();

    const users = this.getUsers();

    // Verificar si el usuario ya existe
    const existingUser = users.find((u) => u.email === credentials.email);
    if (existingUser) {
      return {
        success: false,
        message: 'El usuario ya existe',
      };
    }

    // Validar contraseñas
    if (credentials.password !== credentials.confirmPassword) {
      return {
        success: false,
        message: 'Las contraseñas no coinciden',
      };
    }

    if (credentials.password.length < 6) {
      return {
        success: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      };
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: this.generateId(),
      email: credentials.email,
      name: credentials.name,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    this.saveCurrentUser(newUser);

    return {
      success: true,
      message: 'Registro exitoso',
      user: newUser,
    };
  }

  // Reset password
  async resetPassword(email: string): Promise<AuthResponse> {
    await this.simulateNetworkDelay();

    const users = this.getUsers();
    const user = users.find((u) => u.email === email);

    if (!user) {
      return {
        success: false,
        message: 'Usuario no encontrado',
      };
    }

    // En una aplicación real, aquí enviarías un email
    return {
      success: true,
      message:
        'Se ha enviado un enlace de recuperación a tu correo electrónico',
    };
  }

  // Logout
  async logout(): Promise<void> {
    await this.simulateNetworkDelay();
    this.removeCurrentUser();
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  // Inicializar usuarios de prueba
  initializeTestUsers(): void {
    const users = this.getUsers();
    if (users.length === 0) {
      const testUsers: User[] = [
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
      this.saveUsers(testUsers);
    }
  }

  // Limpiar storage y setear usuarios correctos
  clearAndSetUsers(users: User[]): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.USER);
    this.saveUsers(users);
  }
}

export const authService = new AuthService();
