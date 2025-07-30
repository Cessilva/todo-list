import {
  Task,
  CreateTaskData,
  UpdateTaskData,
  TaskStatus,
  Comment,
  TaskResponse,
} from '../types/todo';

const STORAGE_KEYS = {
  TASKS: 'todo_app_tasks',
} as const;

// Simulación de servicio de tareas con localStorage
class TodoService {
  // Generar ID único
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Simular delay de red para futura API
  private async simulateNetworkDelay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Obtener todas las tareas del localStorage
  private getTasks(): Task[] {
    const tasks = localStorage.getItem(STORAGE_KEYS.TASKS);
    return tasks ? JSON.parse(tasks) : [];
  }

  // Guardar tareas en localStorage
  private saveTasks(tasks: Task[]): void {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }

  // Encontrar tarea por ID (búsqueda recursiva)
  private findTaskById(tasks: Task[], id: string): Task | null {
    for (const task of tasks) {
      if (task.id === id) {
        return task;
      }
      const found = this.findTaskById(task.subtasks, id);
      if (found) {
        return found;
      }
    }
    return null;
  }

  // Encontrar tarea padre
  private findParentTask(tasks: Task[], childId: string): Task | null {
    for (const task of tasks) {
      if (task.subtasks.some((subtask) => subtask.id === childId)) {
        return task;
      }
      const found = this.findParentTask(task.subtasks, childId);
      if (found) {
        return found;
      }
    }
    return null;
  }

  // Eliminar tarea de la estructura (búsqueda recursiva)
  private removeTaskFromStructure(tasks: Task[], id: string): Task[] {
    return tasks
      .filter((task) => task.id !== id)
      .map((task) => ({
        ...task,
        subtasks: this.removeTaskFromStructure(task.subtasks, id),
      }));
  }

  // Actualizar tarea en la estructura (búsqueda recursiva)
  private updateTaskInStructure(
    tasks: Task[],
    id: string,
    updates: Partial<Task>
  ): Task[] {
    return tasks.map((task) => {
      if (task.id === id) {
        return { ...task, ...updates, updatedAt: new Date().toISOString() };
      }
      return {
        ...task,
        subtasks: this.updateTaskInStructure(task.subtasks, id, updates),
      };
    });
  }

  // Verificar si una tarea puede completarse (no tiene subtareas pendientes)
  canCompleteTask(taskId: string): boolean {
    const tasks = this.getTasks();
    const task = this.findTaskById(tasks, taskId);

    if (!task) return false;

    return task.subtasks.every((subtask) => subtask.status === 'completed');
  }

  // Propagar estado pendiente hacia arriba en la jerarquía
  private propagatePendingStatus(tasks: Task[], taskId: string): Task[] {
    const parentTask = this.findParentTask(tasks, taskId);

    if (parentTask && parentTask.status === 'completed') {
      const updatedTasks = this.updateTaskInStructure(tasks, parentTask.id, {
        status: 'pending',
      });

      // Continuar propagando hacia arriba
      return this.propagatePendingStatus(updatedTasks, parentTask.id);
    }

    return tasks;
  }

  // Obtener todas las tareas
  async getAllTasks(): Promise<TaskResponse> {
    await this.simulateNetworkDelay();

    try {
      const tasks = this.getTasks();
      return {
        success: true,
        message: 'Tareas obtenidas exitosamente',
        tasks,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al obtener las tareas',
      };
    }
  }

  // Crear nueva tarea
  async createTask(data: CreateTaskData): Promise<TaskResponse> {
    await this.simulateNetworkDelay();

    try {
      const tasks = this.getTasks();
      const now = new Date().toISOString();

      const newTask: Task = {
        id: this.generateId(),
        title: data.title,
        description: data.description,
        status: 'pending',
        parentId: data.parentId || null,
        subtasks: [],
        comments: [],
        createdAt: now,
        updatedAt: now,
        order: Date.now(),
      };

      if (data.parentId) {
        // Agregar como subtarea
        const updatedTasks = this.updateTaskInStructure(tasks, data.parentId, {
          subtasks: [
            ...(this.findTaskById(tasks, data.parentId)?.subtasks || []),
            newTask,
          ],
        });
        this.saveTasks(updatedTasks);
      } else {
        // Agregar como tarea principal
        tasks.push(newTask);
        this.saveTasks(tasks);
      }

      return {
        success: true,
        message: 'Tarea creada exitosamente',
        task: newTask,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al crear la tarea',
      };
    }
  }

  // Actualizar tarea
  async updateTask(id: string, data: UpdateTaskData): Promise<TaskResponse> {
    await this.simulateNetworkDelay();

    try {
      const tasks = this.getTasks();
      const task = this.findTaskById(tasks, id);

      if (!task) {
        return {
          success: false,
          message: 'Tarea no encontrada',
        };
      }

      const updatedTasks = this.updateTaskInStructure(tasks, id, data);
      this.saveTasks(updatedTasks);

      const updatedTask = this.findTaskById(updatedTasks, id);

      return {
        success: true,
        message: 'Tarea actualizada exitosamente',
        task: updatedTask!,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al actualizar la tarea',
      };
    }
  }

  // Marcar todas las subtareas con el mismo estado
  private markAllSubtasksWithStatus(
    tasks: Task[],
    parentId: string,
    status: TaskStatus
  ): Task[] {
    return tasks.map((task) => {
      if (task.id === parentId) {
        return {
          ...task,
          subtasks: task.subtasks.map((subtask) => ({
            ...subtask,
            status,
            updatedAt: new Date().toISOString(),
            subtasks: this.markAllSubtasksWithStatus(
              [subtask],
              subtask.id,
              status
            )[0].subtasks,
          })),
        };
      }
      return {
        ...task,
        subtasks: this.markAllSubtasksWithStatus(
          task.subtasks,
          parentId,
          status
        ),
      };
    });
  }

  // Cambiar estado de tarea
  async changeTaskStatus(
    id: string,
    status: TaskStatus
  ): Promise<TaskResponse> {
    await this.simulateNetworkDelay();

    try {
      let tasks = this.getTasks();
      const task = this.findTaskById(tasks, id);

      if (!task) {
        return {
          success: false,
          message: 'Tarea no encontrada',
        };
      }

      // Para tareas principales (sin parentId), permitir completar aunque tengan subtareas pendientes
      // Para subtareas, validar si puede completarse
      if (
        status === 'completed' &&
        task.parentId &&
        !this.canCompleteTask(id)
      ) {
        return {
          success: false,
          message:
            'No se puede completar la subtarea porque tiene subtareas pendientes',
        };
      }

      // Actualizar estado de la tarea
      tasks = this.updateTaskInStructure(tasks, id, { status });

      // Si es una tarea principal y se marca como completada, marcar todas las subtareas como completadas
      if (
        status === 'completed' &&
        !task.parentId &&
        task.subtasks.length > 0
      ) {
        tasks = this.markAllSubtasksWithStatus(tasks, id, 'completed');
      }

      // Si se marca como pendiente, propagar hacia arriba
      if (status === 'pending') {
        tasks = this.propagatePendingStatus(tasks, id);
      }

      this.saveTasks(tasks);
      const updatedTask = this.findTaskById(tasks, id);

      return {
        success: true,
        message: 'Estado de tarea actualizado exitosamente',
        task: updatedTask!,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al cambiar el estado de la tarea',
      };
    }
  }

  // Eliminar tarea
  async deleteTask(id: string): Promise<TaskResponse> {
    await this.simulateNetworkDelay();

    try {
      const tasks = this.getTasks();
      const task = this.findTaskById(tasks, id);

      if (!task) {
        return {
          success: false,
          message: 'Tarea no encontrada',
        };
      }

      const updatedTasks = this.removeTaskFromStructure(tasks, id);
      this.saveTasks(updatedTasks);

      return {
        success: true,
        message: 'Tarea eliminada exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al eliminar la tarea',
      };
    }
  }

  // Agregar comentario
  async addComment(
    taskId: string,
    text: string,
    author: string
  ): Promise<TaskResponse> {
    await this.simulateNetworkDelay();

    try {
      const tasks = this.getTasks();
      const task = this.findTaskById(tasks, taskId);

      if (!task) {
        return {
          success: false,
          message: 'Tarea no encontrada',
        };
      }

      const newComment: Comment = {
        id: this.generateId(),
        text,
        author: 'Usuario', // En una implementación real, esto vendría del contexto de autenticación
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updatedTasks = this.updateTaskInStructure(tasks, taskId, {
        comments: [...task.comments, newComment],
      });

      this.saveTasks(updatedTasks);

      return {
        success: true,
        message: 'Comentario agregado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al agregar el comentario',
      };
    }
  }

  // Editar comentario
  async editComment(
    taskId: string,
    commentId: string,
    text: string
  ): Promise<TaskResponse> {
    await this.simulateNetworkDelay();

    try {
      const tasks = this.getTasks();
      const task = this.findTaskById(tasks, taskId);

      if (!task) {
        return {
          success: false,
          message: 'Tarea no encontrada',
        };
      }

      const commentIndex = task.comments.findIndex(
        (comment) => comment.id === commentId
      );

      if (commentIndex === -1) {
        return {
          success: false,
          message: 'Comentario no encontrado',
        };
      }

      const updatedComments = [...task.comments];
      updatedComments[commentIndex] = {
        ...updatedComments[commentIndex],
        text,
        updatedAt: new Date().toISOString(),
      };

      const updatedTasks = this.updateTaskInStructure(tasks, taskId, {
        comments: updatedComments,
      });

      this.saveTasks(updatedTasks);

      return {
        success: true,
        message: 'Comentario editado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al editar el comentario',
      };
    }
  }

  // Eliminar comentario
  async deleteComment(
    taskId: string,
    commentId: string
  ): Promise<TaskResponse> {
    await this.simulateNetworkDelay();

    try {
      const tasks = this.getTasks();
      const task = this.findTaskById(tasks, taskId);

      if (!task) {
        return {
          success: false,
          message: 'Tarea no encontrada',
        };
      }

      const updatedComments = task.comments.filter(
        (comment) => comment.id !== commentId
      );

      const updatedTasks = this.updateTaskInStructure(tasks, taskId, {
        comments: updatedComments,
      });

      this.saveTasks(updatedTasks);

      return {
        success: true,
        message: 'Comentario eliminado exitosamente',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error al eliminar el comentario',
      };
    }
  }

  // Inicializar con tareas de ejemplo
  initializeSampleTasks(): void {
    const tasks = this.getTasks();
    if (tasks.length === 0) {
      const now = new Date().toISOString();

      const sampleTasks: Task[] = [
        {
          id: '1',
          title: 'Proyecto Frontend TODO-LIST',
          description: 'Desarrollar la aplicación de gestión de tareas',
          status: 'pending',
          parentId: null,
          subtasks: [
            {
              id: '2',
              title: 'Configurar autenticación',
              description: 'Implementar login y registro de usuarios',
              status: 'completed',
              parentId: '1',
              subtasks: [],
              comments: [],
              createdAt: now,
              updatedAt: now,
              order: 1,
            },
            {
              id: '3',
              title: 'Crear sistema de tareas',
              description: 'Implementar CRUD de tareas con Context API',
              status: 'pending',
              parentId: '1',
              subtasks: [],
              comments: [],
              createdAt: now,
              updatedAt: now,
              order: 2,
            },
          ],
          comments: [
            {
              id: 'c1',
              text: 'Proyecto iniciado con éxito',
              author: 'Cecilia Silva Sandoval',
              createdAt: now,
              updatedAt: now,
            },
          ],
          createdAt: now,
          updatedAt: now,
          order: 1,
        },
      ];

      this.saveTasks(sampleTasks);
    }
  }
}

export const todoService = new TodoService();
