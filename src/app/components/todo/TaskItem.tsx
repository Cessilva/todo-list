'use client';

import React, { useState } from 'react';
import { Task, TaskStatus } from '../../types/todo';
import Button from '../Button';

interface TaskItemProps {
  task: Task;
  level?: number;
  onStatusChange: (id: string, status: TaskStatus) => Promise<void>;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => Promise<void>;
  onAddSubtask: (parentId: string) => void;
  onAddComment: (taskId: string) => void;
  canComplete: boolean;
  hasActiveFilters?: boolean;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  level = 0,
  onStatusChange,
  onEdit,
  onDelete,
  onAddSubtask,
  onAddComment,
  canComplete,
  hasActiveFilters = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!hasActiveFilters);

  const handleStatusToggle = async () => {
    const newStatus: TaskStatus =
      task.status === 'completed' ? 'pending' : 'completed';
    await onStatusChange(task.id, newStatus);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      className={`bg-white rounded-lg p-4 border border-gray-400 transition-all duration-200 hover:shadow-md flex flex-col justify-between ${
        task.status === 'completed' ? 'opacity-75' : ''
      }`}
    >
      {/* Header de la tarea */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          {/* Checkbox */}
          <button
            onClick={handleStatusToggle}
            disabled={task.status === 'pending' && !canComplete}
            className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
              task.status === 'completed'
                ? 'bg-green-500 border-green-500'
                : canComplete
                  ? 'border-gray-400 hover:border-green-400'
                  : 'border-gray-300 cursor-not-allowed opacity-50'
            }`}
            title={
              task.status === 'pending' && !canComplete
                ? 'No se puede completar: tiene subtareas pendientes'
                : task.status === 'completed'
                  ? 'Marcar como pendiente'
                  : 'Marcar como completada'
            }
          >
            {task.status === 'completed' && (
              <span className="material-icons text-white text-sm">check</span>
            )}
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3
                className={`text-lg font-semibold ${
                  task.status === 'completed'
                    ? 'text-gray-500 line-through'
                    : 'text-gray-800'
                }`}
              >
                {task.title}
              </h3>

              <div className="flex gap-1">
                {task.subtasks.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {
                      task.subtasks.filter((st) => st.status === 'completed')
                        .length
                    }
                    /{task.subtasks.length} subtareas completadas
                  </span>
                )}
              </div>
            </div>

            <p
              className={`text-sm mb-2 ${
                task.status === 'completed' ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {task.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>Creada: {formatDate(task.createdAt)}</span>
              {task.updatedAt !== task.createdAt && (
                <span>Actualizada: {formatDate(task.updatedAt)}</span>
              )}
            </div>
          </div>
        </div>
        {/* Botón de expandir/contraer subtareas */}
        {task.subtasks.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 sm:p-2"
            title={isExpanded ? 'Contraer subtareas' : 'Expandir subtareas'}
          >
            <span
              className={`material-icons text-base sm:text-lg transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            >
              expand_more
            </span>
          </button>
        )}
      </div>

      {/* Acciones */}
      <div
        className={`grid mt-3 gap-2 grid-cols-${level === 0 ? '2' : '1'} md:flex md:justify-${level === 0 ? 'start' : ''}`}
      >
        {/* Editar - disponible para tareas y subtareas */}
        <Button
          size="xs"
          variant="info"
          onClick={() => onEdit(task)}
          className="text-xs md:text-sm flex items-center justify-center bg-blue-600 hover:bg-blue-700 px-2 sm:px-3 py-1 sm:py-1.5"
        >
          <span className="material-icons text-sm sm:text-base mr-1 sm:mr-2">
            edit
          </span>
          <span>{level === 0 ? 'Editar' : 'Editar subtarea'}</span>
        </Button>

        {/* Agregar subtarea - solo para tareas principales (level 0) */}
        {level === 0 && (
          <Button
            size="xs"
            variant="secondary"
            onClick={() => onAddSubtask(task.id)}
            className="text-xs md:text-sm flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5"
          >
            <span className="material-icons text-sm sm:text-base mr-1 sm:mr-2">
              add
            </span>
            <span>Subtarea</span>
          </Button>
        )}

        {/* Agregar/Editar comentario - solo para tareas principales (level 0) */}
        {level === 0 && task.comments.length <= 0 && (
          <Button
            size="xs"
            variant="secondary"
            onClick={() => onAddComment(task.id)}
            className="text-xs md:text-sm flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5"
          >
            <span className="material-icons text-sm sm:text-base mr-1 sm:mr-2">
              comment
            </span>
            <span>Agregar comentario</span>
          </Button>
        )}

        {/* Eliminar - disponible para tareas y subtareas */}
        <Button
          size="xs"
          variant="danger"
          onClick={() => onDelete(task.id)}
          className="text-xs md:text-sm flex items-center justify-center bg-red-600 hover:bg-red-700 px-2 sm:px-3 py-1 sm:py-1.5"
        >
          <span className="material-icons text-sm sm:text-base mr-1 sm:mr-2">
            delete
          </span>
          <span>{level === 0 ? 'Eliminar' : 'Eliminar subtarea'}</span>
        </Button>
      </div>

      {/* Comentarios - solo para tareas principales (level 0) */}
      {level === 0 && task.comments.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-400">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Comentario</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto ">
            {task.comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50  rounded p-2 group">
                <div className="flex justify-between items-start mb-1 ">
                  <p className="text-sm text-gray-800">{comment.text}</p>
                  <div className="flex gap-1 ">
                    <button
                      onClick={() => onAddComment(task.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors  "
                      title="Editar comentario"
                    >
                      <span className="material-icons text-xs sm:text-sm">
                        edit
                      </span>
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 ">
                  <span className="text-xs font-medium text-gray-600">
                    {comment.author}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                  {comment.updatedAt !== comment.createdAt && (
                    <span className="text-xs text-gray-400 italic">
                      (editado)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtareas contenidas visualmente */}
      {task.subtasks.length > 0 && isExpanded && (
        <div className="mt-4 pt-3 border-t border-gray-400">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <span className="material-icons text-sm sm:text-base mr-1 sm:mr-2">
              subdirectory_arrow_right
            </span>
            Subtareas ({task.subtasks.length})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {task.subtasks.map((subtask) => (
              <TaskItem
                key={subtask.id}
                task={subtask}
                level={level + 1}
                onStatusChange={onStatusChange}
                onEdit={onEdit}
                onDelete={onDelete}
                onAddSubtask={onAddSubtask}
                onAddComment={onAddComment}
                canComplete={canComplete}
                hasActiveFilters={hasActiveFilters}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
