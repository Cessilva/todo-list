export type TaskStatus = 'pending' | 'completed';

export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  parentId: string | null;
  subtasks: Task[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  order: number;
}

export interface TaskFilter {
  status?: TaskStatus;
  search?: string;
  parentId?: string | null;
}

export interface CreateTaskData {
  title: string;
  description: string;
  parentId?: string | null;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  order?: number;
}

export interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  filter: TaskFilter;
  isLoading: boolean;
  error: string | null;

  // CRUD Operations
  createTask: (data: CreateTaskData) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;

  // Task Management
  changeTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  addSubtask: (parentId: string, data: CreateTaskData) => Promise<Task>;

  // Comments
  addComment: (taskId: string, text: string) => Promise<Comment>;
  editComment: (
    taskId: string,
    commentId: string,
    text: string
  ) => Promise<void>;
  deleteComment: (taskId: string, commentId: string) => Promise<void>;

  // Filtering and Search
  setFilter: (filter: TaskFilter) => void;

  // Utility
  getTaskById: (id: string) => Task | null;
  canCompleteTask: (taskId: string) => boolean;
}

// API Response types (for future API integration)
export interface TaskResponse {
  success: boolean;
  message: string;
  task?: Task;
  tasks?: Task[];
}
