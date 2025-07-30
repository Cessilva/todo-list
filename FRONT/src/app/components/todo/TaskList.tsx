'use client';

import React, { useState } from 'react';
import {
  Task,
  TaskFilter,
  TaskStatus,
  CreateTaskData,
  UpdateTaskData,
} from '../../types/todo';
import { useTodo } from '../../context/TodoContext';
import { useGlobal } from '../../context/GlobalContext';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { CommentModal } from './CommentModal';
import Button from '../Button';

export const TaskList: React.FC = () => {
  const {
    filteredTasks,
    filter,
    isLoading,
    createTask,
    updateTask,
    deleteTask,
    changeTaskStatus,
    addComment,
    editComment,
    deleteComment,
    setFilter,
    getTaskById,
    canCompleteTask,
  } = useTodo();

  const { setError } = useGlobal();

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [parentTaskId, setParentTaskId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('');
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Manejar creación de tarea
  const handleCreateTask = async (data: CreateTaskData) => {
    await createTask(data);
    setShowForm(false);
    setParentTaskId(null);
  };

  // Manejar edición de tarea
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Manejar actualización de tarea
  const handleUpdateTask = async (data: CreateTaskData) => {
    if (editingTask) {
      const updateData: UpdateTaskData = {
        title: data.title,
        description: data.description,
      };
      await updateTask(editingTask.id, updateData);
      setEditingTask(null);
      setShowForm(false);
    }
  };

  // Manejar eliminación de tarea con modal
  const handleDeleteTask = async (id: string) => {
    setError({
      type: 'warning',
      title: 'Confirmar eliminación',
      message:
        '¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.',
      onConfirm: async () => {
        try {
          await deleteTask(id);
        } catch (error) {
          console.error('Error deleting task:', error);
        }
      },
    });
  };

  // Manejar cambio de estado
  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await changeTaskStatus(id, status);
  };

  // Manejar agregar subtarea
  const handleAddSubtask = (parentId: string) => {
    setParentTaskId(parentId);
    setShowForm(true);
  };

  // Manejar agregar comentario
  const handleAddComment = (taskId: string) => {
    setSelectedTaskId(taskId);
    setCommentModalOpen(true);
  };

  // Funciones del modal de comentarios
  const handleCloseCommentModal = () => {
    setCommentModalOpen(false);
    setSelectedTaskId(null);
  };

  const handleAddCommentModal = async (taskId: string, text: string) => {
    await addComment(taskId, text);
  };

  const handleEditCommentModal = async (
    taskId: string,
    commentId: string,
    text: string
  ) => {
    await editComment(taskId, commentId, text);
  };

  const handleDeleteCommentModal = async (
    taskId: string,
    commentId: string
  ) => {
    await deleteComment(taskId, commentId);
  };

  // Aplicar filtros
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const newFilter: TaskFilter = { ...filter };
    if (term.trim()) {
      newFilter.search = term.trim();
    } else {
      delete newFilter.search;
    }
    setFilter(newFilter);
  };

  const handleStatusFilter = (status: TaskStatus | '') => {
    setStatusFilter(status);
    const newFilter: TaskFilter = { ...filter };
    if (status) {
      newFilter.status = status as TaskStatus;
    } else {
      delete newFilter.status;
    }
    setFilter(newFilter);
  };

  // Cancelar formulario
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
    setParentTaskId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="bg-white rounded-lg p-6 border border-gray-400 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Gestión de Tareas
          </h2>

          <Button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 sm:px-4 rounded-md transition-colors flex items-center justify-center"
          >
            <span className="material-icons text-sm sm:text-base mr-1 sm:mr-2">
              add
            </span>
            <span className="hidden sm:inline">Nueva Tarea</span>
            <span className="sm:hidden">Nueva</span>
          </Button>
        </div>

        {/* Filtros y búsqueda */}
        <div className="grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar tareas
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Buscar por título o descripción..."
              className="w-full p-2 rounded-md bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) =>
                handleStatusFilter(e.target.value as TaskStatus | '')
              }
              className="w-full p-2 rounded-md bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="completed">Completadas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Formulario de tarea */}
      {showForm && (
        <TaskForm
          onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
          onCancel={handleCancelForm}
          parentId={parentTaskId}
          isLoading={isLoading}
          initialData={
            editingTask
              ? {
                  title: editingTask.title,
                  description: editingTask.description,
                }
              : undefined
          }
        />
      )}

      {/* Lista de tareas */}
      <div className="space-y-4">
        {isLoading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Cargando tareas...</span>
          </div>
        )}

        {!isLoading && filteredTasks.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-400">
            <span className="material-icons text-4xl sm:text-6xl text-gray-400 mb-4 block">
              task_alt
            </span>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No hay tareas
            </h3>
            <p className="text-gray-500 mb-4">
              {filter.search || filter.status
                ? 'No se encontraron tareas que coincidan con los filtros aplicados.'
                : 'Comienza creando tu primera tarea.'}
            </p>
          </div>
        )}

        {!isLoading && filteredTasks.length > 0 && (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                level={0}
                onStatusChange={handleStatusChange}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onAddSubtask={handleAddSubtask}
                onAddComment={handleAddComment}
                canComplete={canCompleteTask(task.id)}
                hasActiveFilters={!!(filter.status || filter.search)}
              />
            ))}
          </div>
        )}
      </div>

      {commentModalOpen && selectedTaskId && (
        <CommentModal
          isOpen={commentModalOpen}
          onClose={handleCloseCommentModal}
          taskId={selectedTaskId}
          comments={getTaskById(selectedTaskId)?.comments || []}
          onAddComment={handleAddCommentModal}
          onEditComment={handleEditCommentModal}
          onDeleteComment={handleDeleteCommentModal}
        />
      )}
    </div>
  );
};
