'use client';

import React, { useState } from 'react';
import { CreateTaskData } from '../../types/todo';
import Button from '../Button';

interface TaskFormProps {
  onSubmit: (data: CreateTaskData) => Promise<void>;
  onCancel: () => void;
  parentId?: string | null;
  isLoading?: boolean;
  initialData?: {
    title: string;
    description: string;
  };
}

export const TaskForm: React.FC<TaskFormProps> = ({
  onSubmit,
  onCancel,
  parentId = null,
  isLoading = false,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(
    initialData?.description || ''
  );
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  const validateForm = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (title.trim().length < 3) {
      newErrors.title = 'El título debe tener al menos 3 caracteres';
    } else if (title.trim().length > 100) {
      newErrors.title = 'El título no puede exceder 100 caracteres';
    }

    if (!description.trim()) {
      newErrors.description = 'La descripción es requerida';
    } else if (description.trim().length < 10) {
      newErrors.description =
        'La descripción debe tener al menos 10 caracteres';
    } else if (description.trim().length > 500) {
      newErrors.description = 'La descripción no puede exceder 500 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim(),
        parentId,
      });

      // Reset form if it's a new task (not editing)
      if (!initialData) {
        setTitle('');
        setDescription('');
        setErrors({});
      }
    } catch (error) {
      console.error('Error submitting task:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-400 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        {parentId
          ? `Agregar Subtarea`
          : initialData
            ? 'Editar Tarea'
            : 'Nueva Tarea'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Título
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full p-3 rounded-md bg-white text-gray-900 border ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            placeholder="Ingresa el título de la tarea"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Descripción
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`w-full p-3 rounded-md bg-white text-gray-900 border ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical`}
            placeholder="Describe los detalles de la tarea"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? 'Guardando...'
              : parentId
                ? 'Guardar Subtarea'
                : 'Guardar Tarea'}
          </Button>

          <Button
            type="button"
            variant="secondary"
            outlined
            onClick={onCancel}
            disabled={isLoading}
            className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
};
