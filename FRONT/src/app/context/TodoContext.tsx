'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import {
  Task,
  TaskFilter,
  CreateTaskData,
  UpdateTaskData,
  TaskStatus,
  Comment,
  TaskContextType,
} from '../types/todo';
import { todoService } from '../services/todoService';
import { useGlobal } from './GlobalContext';
import { useAuth } from './AuthContext';

interface TodoState {
  tasks: Task[];
  filteredTasks: Task[];
  filter: TaskFilter;
  isLoading: boolean;
  error: string | null;
}

type TodoAction =
  | { type: 'SET_TASKS'; payload: Task[] }
  | { type: 'SET_FILTERED_TASKS'; payload: Task[] }
  | { type: 'SET_FILTER'; payload: TaskFilter }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'UPDATE_TASK'; payload: { id: string; updates: Partial<Task> } }
  | { type: 'DELETE_TASK'; payload: string };

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'SET_TASKS':
      return {
        ...state,
        tasks: action.payload,
      };
    case 'SET_FILTERED_TASKS':
      return {
        ...state,
        filteredTasks: action.payload,
      };
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: updateTaskInArray(
          state.tasks,
          action.payload.id,
          action.payload.updates
        ),
      };
    case 'DELETE_TASK':
      return {
        ...state,
        tasks: removeTaskFromArray(state.tasks, action.payload),
      };
    default:
      return state;
  }
};

// Helper functions para el reducer
const updateTaskInArray = (
  tasks: Task[],
  id: string,
  updates: Partial<Task>
): Task[] => {
  return tasks.map((task) => {
    if (task.id === id) {
      return { ...task, ...updates };
    }
    return {
      ...task,
      subtasks: updateTaskInArray(task.subtasks, id, updates),
    };
  });
};

const removeTaskFromArray = (tasks: Task[], id: string): Task[] => {
  return tasks
    .filter((task) => task.id !== id)
    .map((task) => ({
      ...task,
      subtasks: removeTaskFromArray(task.subtasks, id),
    }));
};

const initialState: TodoState = {
  tasks: [],
  filteredTasks: [],
  filter: {},
  isLoading: false,
  error: null,
};

const TodoContext = createContext<TaskContextType | undefined>(undefined);

export const TodoProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const { setLoading, setError, setSuccess } = useGlobal();
  const { state: authState } = useAuth();

  // Inicializar tareas al cargar el componente solo si el usuario está autenticado
  useEffect(() => {
    const initializeTasks = async () => {
      // Solo cargar tareas si el usuario está autenticado
      if (!authState.isAuthenticated || !authState.user) {
        return;
      }

      try {
        dispatch({ type: 'SET_LOADING', payload: true });

        // Inicializar tareas de ejemplo si no existen
        todoService.initializeSampleTasks();

        // Cargar tareas
        const response = await todoService.getAllTasks();
        if (response.success && response.tasks) {
          dispatch({ type: 'SET_TASKS', payload: response.tasks });
          dispatch({ type: 'SET_FILTERED_TASKS', payload: response.tasks });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: 'Error al cargar las tareas' });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initializeTasks();
  }, [authState.isAuthenticated, authState.user]);

  // Aplicar filtros cuando cambien las tareas o el filtro
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...state.tasks];

      // Filtrar por parentId primero (solo tareas principales)
      if (state.filter.parentId !== undefined) {
        filtered = filtered.filter(
          (task) => task.parentId === state.filter.parentId
        );
      } else {
        // Solo mostrar tareas principales (sin parentId)
        filtered = filtered.filter((task) => !task.parentId);
      }

      // Filtrar por estado
      if (state.filter.status) {
        filtered = filterTasksByStatus(filtered, state.filter.status);
      }

      // Filtrar por búsqueda
      if (state.filter.search) {
        filtered = filterTasksBySearch(filtered, state.filter.search);
      }

      dispatch({ type: 'SET_FILTERED_TASKS', payload: filtered });
    };

    applyFilters();
  }, [state.tasks, state.filter]);

  // Helper functions para filtros
  const filterTasksByStatus = (tasks: Task[], status: TaskStatus): Task[] => {
    return tasks
      .filter((task) => task.status === status)
      .map((task) => ({
        ...task,

        subtasks: task.subtasks,
      }));
  };

  const filterTasksBySearch = (tasks: Task[], search: string): Task[] => {
    const searchLower = search.toLowerCase();
    return tasks
      .filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
      )
      .map((task) => ({
        ...task,
        subtasks: filterTasksBySearch(task.subtasks, search),
      }));
  };

  // CRUD Operations
  const createTask = async (data: CreateTaskData): Promise<Task> => {
    try {
      setLoading(true);
      const response = await todoService.createTask(data);

      if (response.success && response.task) {
        // Recargar todas las tareas para mantener consistencia
        const allTasksResponse = await todoService.getAllTasks();
        if (allTasksResponse.success && allTasksResponse.tasks) {
          dispatch({ type: 'SET_TASKS', payload: allTasksResponse.tasks });
        }

        return response.task;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al crear la tarea';
      setError({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (
    id: string,
    data: UpdateTaskData
  ): Promise<Task> => {
    try {
      setLoading(true);
      const response = await todoService.updateTask(id, data);

      if (response.success && response.task) {
        // Recargar todas las tareas para mantener consistencia
        const allTasksResponse = await todoService.getAllTasks();
        if (allTasksResponse.success && allTasksResponse.tasks) {
          dispatch({ type: 'SET_TASKS', payload: allTasksResponse.tasks });
        }

        return response.task;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al actualizar la tarea';
      setError({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await todoService.deleteTask(id);

      if (response.success) {
        // Recargar todas las tareas para mantener consistencia
        const allTasksResponse = await todoService.getAllTasks();
        if (allTasksResponse.success && allTasksResponse.tasks) {
          dispatch({ type: 'SET_TASKS', payload: allTasksResponse.tasks });
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error al eliminar la tarea';
      setError({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Task Management
  const changeTaskStatus = async (
    id: string,
    status: TaskStatus
  ): Promise<void> => {
    try {
      const task = getTaskById(id);

      // Validaciones del lado del cliente
      if (status === 'completed') {
        // Solo aplicar restricción a tareas principales (no subtareas) que tienen subtareas pendientes
        if (task && !task.parentId && task.subtasks.length > 0) {
          const pendingSubtasks = task.subtasks.filter(
            (subtask) => subtask.status === 'pending'
          );

          if (pendingSubtasks.length > 0) {
            setError({
              type: 'warning',
              title: 'No se puede completar la tarea',
              message: `Esta tarea tiene ${pendingSubtasks.length} subtarea${pendingSubtasks.length > 1 ? 's' : ''} pendiente${pendingSubtasks.length > 1 ? 's' : ''}. Debes completar todas las subtareas antes de marcar la tarea principal como completada.`,
            });
            return;
          }
        }
      } else if (status === 'pending') {
        // Si se intenta desmarcar una subtarea, verificar si la tarea padre está completada
        if (task && task.parentId) {
          const parentTask = getTaskById(task.parentId);
          if (parentTask && parentTask.status === 'completed') {
            setError({
              type: 'warning',
              title: 'No se puede desmarcar la subtarea',
              message:
                'No puedes desmarcar una subtarea mientras la tarea principal esté completada. Primero desmarca la tarea principal.',
            });
            return;
          }
        }
      }

      setLoading(true);
      const response = await todoService.changeTaskStatus(id, status);

      if (response.success) {
        // Recargar todas las tareas para mantener consistencia
        const allTasksResponse = await todoService.getAllTasks();
        if (allTasksResponse.success && allTasksResponse.tasks) {
          dispatch({ type: 'SET_TASKS', payload: allTasksResponse.tasks });
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al cambiar el estado de la tarea';
      setError({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const addSubtask = async (
    parentId: string,
    data: CreateTaskData
  ): Promise<Task> => {
    return createTask({ ...data, parentId });
  };

  // Comments
  const addComment = async (taskId: string, text: string): Promise<Comment> => {
    try {
      setLoading(true);
      const author = authState.user?.name || 'Usuario Anónimo';
      const response = await todoService.addComment(taskId, text, author);

      if (response.success) {
        // Recargar todas las tareas para mantener consistencia
        const allTasksResponse = await todoService.getAllTasks();
        if (allTasksResponse.success && allTasksResponse.tasks) {
          dispatch({ type: 'SET_TASKS', payload: allTasksResponse.tasks });
        }

        // Mostrar mensaje de éxito
        setSuccess({
          title: '¡Comentario agregado!',
          message: 'El comentario se ha agregado exitosamente.',
        });

        // Retornar el comentario creado (necesitamos obtenerlo de la tarea actualizada)
        const updatedTask = getTaskById(taskId);
        const newComment =
          updatedTask?.comments[updatedTask.comments.length - 1];
        if (newComment) {
          return newComment;
        }

        // Crear un comentario dummy si no se encuentra
        return {
          id: 'temp',
          text: text,
          author: author,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      throw new Error(response.message);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al agregar el comentario';
      setError({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const editComment = async (
    taskId: string,
    commentId: string,
    text: string
  ): Promise<void> => {
    try {
      setLoading(true);
      const response = await todoService.editComment(taskId, commentId, text);

      if (response.success) {
        // Recargar todas las tareas para mantener consistencia
        const allTasksResponse = await todoService.getAllTasks();
        if (allTasksResponse.success && allTasksResponse.tasks) {
          dispatch({ type: 'SET_TASKS', payload: allTasksResponse.tasks });
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al editar el comentario';
      setError({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteComment = async (
    taskId: string,
    commentId: string
  ): Promise<void> => {
    try {
      setLoading(true);
      const response = await todoService.deleteComment(taskId, commentId);

      if (response.success) {
        // Recargar todas las tareas para mantener consistencia
        const allTasksResponse = await todoService.getAllTasks();
        if (allTasksResponse.success && allTasksResponse.tasks) {
          dispatch({ type: 'SET_TASKS', payload: allTasksResponse.tasks });
        }
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Error al eliminar el comentario';
      setError({
        type: 'error',
        title: 'Error',
        message: errorMessage,
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Filtering and Search
  const setFilter = (filter: TaskFilter): void => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  // Utility functions
  const getTaskById = (id: string): Task | null => {
    const findTask = (tasks: Task[]): Task | null => {
      for (const task of tasks) {
        if (task.id === id) {
          return task;
        }
        const found = findTask(task.subtasks);
        if (found) {
          return found;
        }
      }
      return null;
    };

    return findTask(state.tasks);
  };

  const canCompleteTask = (taskId: string): boolean => {
    const task = getTaskById(taskId);
    if (!task) return false;

    // Si es una subtarea, siempre puede completarse
    if (task.parentId) return true;

    // Para tareas principales, verificar que todas las subtareas estén completadas
    if (task.subtasks.length > 0) {
      return task.subtasks.every((subtask) => subtask.status === 'completed');
    }

    // Si no tiene subtareas, puede completarse
    return true;
  };

  const contextValue: TaskContextType = {
    tasks: state.tasks,
    filteredTasks: state.filteredTasks,
    filter: state.filter,
    isLoading: state.isLoading,
    error: state.error,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    addSubtask,
    addComment,
    editComment,
    deleteComment,
    setFilter,
    getTaskById,
    canCompleteTask,
  };

  return (
    <TodoContext.Provider value={contextValue}>{children}</TodoContext.Provider>
  );
};

export const useTodo = (): TaskContextType => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodo must be used within a TodoProvider');
  }
  return context;
};
