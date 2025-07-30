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
  // Obtener token de acceso
  private getAccessToken(): string | null {
    return localStorage.getItem('todo_app_access_token');
  }

  // Realizar petición HTTP con manejo de errores
  private async makeRequest(
    url: string,
    options: RequestInit = {}
  ): Promise<any> {
    try {
      const token = this.getAccessToken();

      if (!token) {
        throw new Error('No token, autorización denegada');
      }

      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
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
      parentId: todo.parentId || null,
      subtasks: todo.subtasks
        ? todo.subtasks.map((subtask: any) =>
            this.convertBackendTodoToTask(subtask)
          )
        : [],
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

        return {
          success: true,
          message: 'Tareas obtenidas exitosamente',
          tasks: tasks,
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
      const todoData = {
        title: data.title,
        description: data.description,
        priority: 'medium', // Valor por defecto
        parentId: data.parentId || null,
      };

      const response = await this.makeRequest('/todos', {
        method: 'POST',
        body: JSON.stringify(todoData),
      });

      if (response.success) {
        const task = this.convertBackendTodoToTask(response.data);

        return {
          success: true,
          message: data.parentId
            ? 'Subtarea creada exitosamente'
            : 'Tarea creada exitosamente',
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
      const response = await this.makeRequest(`/todos/${id}`, {
        method: 'DELETE',
      });

      if (response.success) {
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

  // Verificar si una tarea puede completarse
  canCompleteTask(taskId: string, tasks: Task[]): boolean {
    const findTask = (taskList: Task[]): Task | null => {
      for (const task of taskList) {
        if (task.id === taskId) {
          return task;
        }
        const found = findTask(task.subtasks);
        if (found) {
          return found;
        }
      }
      return null;
    };

    const task = findTask(tasks);
    if (!task) return false;

    // Si es una subtarea, siempre puede completarse
    if (task.parentId) return true;

    // Para tareas principales, verificar que todas las subtareas estén completadas
    if (task.subtasks.length > 0) {
      return task.subtasks.every((subtask) => subtask.status === 'completed');
    }

    // Si no tiene subtareas, puede completarse
    return true;
  }

  // Inicializar con tareas de ejemplo (ya no necesario con API)
  initializeSampleTasks(): void {
    console.log('Usando API real, no se necesitan tareas de ejemplo');
  }
}

export const todoService = new TodoService();
