'use client';

import React, { useState, useEffect } from 'react';
import { Comment } from '../../types/todo';
import Button from '../Button';

interface CommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  comments: Comment[];
  onAddComment: (taskId: string, text: string) => Promise<void>;
  onEditComment: (
    taskId: string,
    commentId: string,
    text: string
  ) => Promise<void>;
  onDeleteComment: (taskId: string, commentId: string) => Promise<void>;
}

export const CommentModal: React.FC<CommentModalProps> = ({
  isOpen,
  onClose,
  taskId,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
}) => {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editText, setEditText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingComment) {
      setEditText(editingComment.text);
    }
  }, [editingComment]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
      await onAddComment(taskId, newComment.trim());
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditComment = async () => {
    if (!editingComment || !editText.trim()) return;

    setIsLoading(true);
    try {
      await onEditComment(taskId, editingComment.id, editText.trim());
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Error editing comment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    setIsLoading(true);
    try {
      await onDeleteComment(taskId, commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Comentario
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 sm:p-2"
            >
              <span className="material-icons text-lg sm:text-xl">close</span>
            </button>
          </div>

          {comments.length === 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agrega tu comentario
              </label>
              <div className="flex gap-2">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  className="flex-1 p-3 rounded-md bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                  rows={3}
                  disabled={isLoading}
                />
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 sm:px-4 py-2 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-start"
                >
                  <span className="material-icons text-sm sm:text-base">
                    add
                  </span>
                </Button>
              </div>
            </div>
          )}

          {/* Comments list */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {comments.length > 0 &&
              comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-400"
                >
                  {editingComment?.id === comment.id ? (
                    // Edit mode
                    <div className="space-y-3">
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full p-3 rounded-md bg-white text-gray-900 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                        rows={3}
                        disabled={isLoading}
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={handleEditComment}
                          disabled={!editText.trim() || isLoading}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5"
                        >
                          <span className="material-icons text-sm sm:text-base mr-1 sm:mr-2">
                            save
                          </span>
                          <span className="hidden sm:inline">Guardar</span>
                          <span className="sm:hidden">Save</span>
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingComment(null);
                            setEditText('');
                          }}
                          disabled={isLoading}
                          size="sm"
                          variant="secondary"
                          outlined
                          className="flex items-center justify-center px-2 sm:px-3 py-1 sm:py-1.5"
                        >
                          <span className="material-icons text-sm sm:text-base mr-1 sm:mr-2">
                            cancel
                          </span>
                          <span className="hidden sm:inline">Cancelar</span>
                          <span className="sm:hidden">Cancel</span>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-700">
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
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingComment(comment)}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 sm:p-2 flex align-middle"
                            title="Editar comentario"
                          >
                            <span className="material-icons text-sm sm:text-base">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isLoading}
                            className="text-gray-400 hover:text-red-600 transition-colors p-1 sm:p-2"
                            title="Eliminar comentario"
                          >
                            <span className="material-icons text-sm sm:text-base">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {comment.text}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={onClose}
              variant="secondary"
              outlined
              disabled={isLoading}
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
