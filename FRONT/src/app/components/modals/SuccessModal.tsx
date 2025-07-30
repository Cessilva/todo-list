'use client';

import React from 'react';
import Button from '../Button';

interface SuccessModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          {/* Ícono de éxito */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <span className="material-icons text-green-600 text-2xl">
              check_circle
            </span>
          </div>

          {/* Título */}
          <h3 className="text-lg leading-6 font-medium text-green-900 mt-4">
            {title}
          </h3>

          {/* Mensaje */}
          <div className="mt-2 px-7 py-3">
            <p className="text-sm text-gray-500">{message}</p>
          </div>

          {/* Botón */}
          <div className="items-center px-4 py-3">
            <Button
              onClick={onClose}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-base font-medium rounded-md w-full shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors duration-200"
            >
              ¡Perfecto!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
