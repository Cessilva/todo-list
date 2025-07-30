import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskStatus,
  Comment,
  TaskResponse,
} from '../types/todo';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002/api';

// Servicio de TODOs que se conecta con la API del backend
class TodoService {
  private readonly SUBTASKS_KEY = 'todo_app_subtasks';

  // Obtener token de acceso
  private getAccessToken(): string | null {
    return localStorage.getItem('todo_app_access_token');
  }

  // Gestión de subtareas en localStorage
  private getSubtasksFromStorage(): { [parentId: string]: Task[] } {
    try {
      const stored = localStorage.getItem(this.SUBTASKS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private saveSubtasksToStorage(subtasks: {
    [parentId: string]: Task[];
  }): void {
    try {
      localStorage.setItem(this.SUBTASKS_KEY, JSON.stringify(subtasks));
    } catch (error) {
      console.error('Error saving subtasks to localStorage:', error);
    }
  }

  private addSubtaskToStorage(parentId: string, subtask: Task): void {
    const subtasks = this.getSubtasksFromStorage();
    if (!subtasks[parentId]) {
      subtasks[parentId] = [];
    }
    subtasks[parentId].push(subtask);
    this.saveSubtasksToStorage(subtasks);
  }

  private updateSubtaskInStorage(taskId: string, updates: Partial<Task>): void {
    const subtasks = this.getSubtasksFromStorage();
    for (const parentId in subtasks) {
      const subtaskIndex = subtasks[parentId].findIndex(
        (task) => task.id === taskId
      );
      if (subtaskIndex !== -1) {
        subtasks[parentId][subtaskIndex] = {
          ...subtasks[parentId][subtaskIndex],
          ...updates,
        };
        this.saveSubtasksToStorage(subtasks);
        break;
      }
    }
  }

  private removeSubtaskFromStorage(taskId: string): void {
    const subtasks = this.getSubtasksFromStorage();
    for (const parentId in subtasks) {
      subtasks[parentId] = subtasks[parentId].filter(
        (task) => task.id !== taskId
      );
      if (subtasks[parentId].length === 0) {
        delete subtasks[parentId];
      }
    }
    this.saveSubtasksToStorage(subtasks);
  }

  // Realizar petición HTTP con manejo de errores
  private async makeRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<any> {
    try {
      const token = this.getAccessToken();

      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
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

  // Obtener información del usuario autenticado
  private getCurrentUser(): { name: string; role: string } | null {
    try {
      const userStr = localStorage.getItem('todo_app_user');
      if (userStr) {
        const user = JSON.parse(userStr);
        return {
          name: user.name || 'Usuario',
          role: user.role || 'user',
        };
      }
    } catch (error) {
      console.error('Error getting current user:', error);
    }
    return null;
  }

  // Convertir TODO del backend al formato del frontend
  private convertBackendTodoToTask(todo: any): Task {
    const currentUser = this.getCurrentUser();

    return {
      id: todo._id || todo.id,
      title: todo.title,
      description: todo.description || '',
      status: todo.completed ? 'completed' : 'pending',
      parentId: null, // El backend no maneja jerarquías por ahora
      subtasks: [], // El backend no maneja subtareas por ahora
      comments:
        todo.comments?.map((comment: any) => ({
          id: comment._id || comment.id,
          text: comment.text,
          author: currentUser
            ? `${currentUser.name} (${currentUser.role === 'admin' ? 'Administrador' : 'Usuario'})`
            : 'Usuario',
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt || comment.createdAt,
        })) || [],
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
      order: new Date(todo.createdAt).getTime(),
    };
  }

  // Obtener todas las tareas
  async getAllTasks(): Promise<TaskResponse> {
    try {
      const response = await this.makeRequest('/todos');

      if (response.success) {
        const tasks = response.data.todos.map((todo: any) =>
          this.convertBackendTodoToTask(todo)
        );

        // Agregar subtareas desde localStorage
        const subtasksFromStorage = this.getSubtasksFromStorage();
        const allTasks = [...tasks];

        // Asignar subtareas a las tareas principales
        tasks.forEach((task: Task) => {
          if (subtasksFromStorage[task.id]) {
            task.subtasks = subtasksFromStorage[task.id];
          }
        });

        // Agregar todas las subtareas a la lista general
        Object.values(subtasksFromStorage).forEach((subtaskArray) => {
          allTasks.push(...subtaskArray);
        });

        return {
          success: true,
          message: 'Tareas obtenidas exitosamente',
          tasks: allTasks,
        };
      }

      return {
        success: false,
        message: response.message || 'Error al obtener las tareas',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al obtener las tareas',
      };
    }
  }

  // Crear nueva tarea
  async createTask(data: CreateTaskData): Promise<TaskResponse> {
    try {
      // Si es una subtarea, crearla solo en localStorage
      if (data.parentId) {
        const subtask: Task = {
          id: `subtask_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: data.title,
          description: data.description,
          status: 'pending',
          parentId: data.parentId,
          subtasks: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: Date.now(),
        };

        this.addSubtaskToStorage(data.parentId, subtask);

        return {
          success: true,
          message: 'Subtarea creada exitosamente',
          task: subtask,
        };
      }

      // Si es una tarea principal, crearla en el backend
      const todoData = {
        title: data.title,
        description: data.description,
        priority: 'medium', // Valor por defecto
      };

      const response = await this.makeRequest('/todos', {
        method: 'POST',
        body: JSON.stringify(todoData),
      });

      if (response.success) {
        const task = this.convertBackendTodoToTask(response.data);

        return {
          success: true,
          message: 'Tarea creada exitosamente',
          task,
        };
      }

      return {
        success: false,
        message: response.message || 'Error al crear la tarea',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al crear la tarea',
      };
    }
  }

  // Actualizar tarea
  async updateTask(id: string, data: UpdateTaskData): Promise<TaskResponse> {
    try {
      // Verificar si es una subtarea (ID empieza con 'subtask_')
      if (id.startsWith('subtask_')) {
        // Actualizar subtarea en localStorage
        const updates: Partial<Task> = {};
        if (data.title !== undefined) updates.title = data.title;
        if (data.description !== undefined)
          updates.description = data.description;
        if (data.status !== undefined) updates.status = data.status;
        updates.updatedAt = new Date().toISOString();

        this.updateSubtaskInStorage(id, updates);

        // Crear una tarea dummy para retornar
        const updatedTask: Task = {
          id,
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'pending',
          parentId: null,
          subtasks: [],
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          order: Date.now(),
        };

        return {
          success: true,
          message: 'Subtarea actualizada exitosamente',
          task: updatedTask,
        };
      }

      // Si es una tarea principal, actualizarla en el backend
      const updateData: any = {};

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.status !== undefined) {
        updateData.status =
          data.status === 'completed' ? 'completed' : 'pending';
      }

      const response = await this.makeRequest(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData),
      });

      if (response.success) {
        const task = this.convertBackendTodoToTask(response.data);

        return {
          success: true,
          message: 'Tarea actualizada exitosamente',
          task,
        };
      }

      return {
        success: false,
        message: response.message || 'Error al actualizar la tarea',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar la tarea',
      };
    }
  }

  // Cambiar estado de tarea
  async changeTaskStatus(
    id: string,
    status: TaskStatus
  ): Promise<TaskResponse> {
    return this.updateTask(id, { status });
  }

  // Eliminar tarea
  async deleteTask(id: string): Promise<TaskResponse> {
    try {
      // Verificar si es una subtarea (ID empieza con 'subtask_')
      if (id.startsWith('subtask_')) {
        // Eliminar subtarea de localStorage
        this.removeSubtaskFromStorage(id);

        return {
          success: true,
          message: 'Subtarea eliminada exitosamente',
        };
      }

      // Si es una tarea principal, eliminarla del backend
      const response = await this.makeRequest(`/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
        // También eliminar todas las subtareas asociadas
        const subtasks = this.getSubtasksFromStorage();
        if (subtasks[id]) {
          delete subtasks[id];
          this.saveSubtasksToStorage(subtasks);
        }

        return {
          success: true,
          message: 'Tarea eliminada exitosamente',
        };
      }

      return {
        success: false,
        message: response.message || 'Error al eliminar la tarea',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar la tarea',
      };
    }
  }

  // Agregar comentario
  async addComment(
    taskId: string,
    text: string,
    author: string
  ): Promise<TaskResponse> {
    try {
      const response = await this.makeRequest(`/todos/${taskId}/comments`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });

      if (response.success) {
        const task = this.convertBackendTodoToTask(response.data);

        return {
          success: true,
          message: 'Comentario agregado exitosamente',
          task,
        };
      }

      return {
        success: false,
        message: response.message || 'Error al agregar el comentario',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al agregar el comentario',
      };
    }
  }

  // Editar comentario
  async editComment(
    taskId: string,
    commentId: string,
    text: string
  ): Promise<TaskResponse> {
    try {
      const response = await this.makeRequest(
        `/todos/${taskId}/comments/${commentId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ text }),
        }
      );

      if (response.success) {
        const task = this.convertBackendTodoToTask(response.data);

        return {
          success: true,
          message: 'Comentario editado exitosamente',
          task,
        };
      }

      return {
        success: false,
        message: response.message || 'Error al editar el comentario',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al editar el comentario',
      };
    }
  }

  // Eliminar comentario
  async deleteComment(
    taskId: string,
    commentId: string
  ): Promise<TaskResponse> {
    try {
      const response = await this.makeRequest(
        `/todos/${taskId}/comments/${commentId}`,
        {
          method: 'DELETE',
        }
      );

      if (response.success) {
        const task = this.convertBackendTodoToTask(response.data);

        return {
          success: true,
          message: 'Comentario eliminado exitosamente',
          task,
        };
      }

      return {
        success: false,
        message: response.message || 'Error al eliminar el comentario',
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al eliminar el comentario',
      };
    }
  }

  // Verificar si una tarea puede completarse (simplificado para API)
  canCompleteTask(taskId: string): boolean {
    return true; // Por ahora siempre permitir completar
  }

  // Inicializar con tareas de ejemplo (ya no necesario con API)
  initializeSampleTasks(): void {
    console.log('Usando API real, no se necesitan tareas de ejemplo');
  }
}

export const todoService = new TodoService();
