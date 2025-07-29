'use client';

import React from 'react';
import { ErrorState } from '../types/global';
import Button from '../Button';

interface ErrorModalProps {
  error: ErrorState;
  onClose: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ error, onClose }) => {
  const getIconByType = (type: string) => {
    switch (type) {
      case 'error':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="material-icons text-red-600 text-2xl">error</span>
          </div>
        );
      case 'warning':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <span className="material-icons text-yellow-600 text-2xl">
              warning
            </span>
          </div>
        );
      case 'info':
        return (
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <span className="material-icons text-blue-600 text-2xl">info</span>
          </div>
        );
      default:
        return null;
    }
  };

  const getColorsByType = (type: string) => {
    switch (type) {
      case 'error':
        return {
          button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          title: 'text-red-900',
        };
      case 'warning':
        return {
          button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          title: 'text-yellow-900',
        };
      case 'info':
        return {
          button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          title: 'text-blue-900',
        };
      default:
        return {
          button: 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500',
          title: 'text-gray-900',
        };
    }
  };

  const colors = getColorsByType(error.type);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          {getIconByType(error.type)}
          <h3 className={`text-lg leading-6 font-medium ${colors.title} mt-4`}>
            {error.title || 'Notificación'}
          </h3>
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">{error.message}</p>
          </div>
          <div className="items-center px-4 py-3">
            {error.onConfirm ? (
              <div className="flex gap-3">
                <Button
                  onClick={onClose}
                  variant="secondary"
                  outlined
                  className="flex-1"
                >
                  {error.cancelText || 'Cancelar'}
                </Button>
                <Button
                  onClick={async () => {
                    if (error.onConfirm) {
                      await error.onConfirm();
                    }
                    onClose();
                  }}
                  className={`flex-1 px-4 py-2 ${colors.button} text-white text-base font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200`}
                >
                  {error.confirmText || 'Confirmar'}
                </Button>
              </div>
            ) : (
              <Button
                onClick={onClose}
                className={`px-4 py-2 ${colors.button} text-white text-base font-medium rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors duration-200`}
              >
                Entendido
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
