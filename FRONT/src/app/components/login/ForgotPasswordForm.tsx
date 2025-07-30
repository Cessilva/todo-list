'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import Button from '../Button';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
}

interface ForgotPasswordData {
  email: string;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onSwitchToLogin,
}) => {
  const { resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordData>();

  const onSubmit = async (data: ForgotPasswordData) => {
    const success = await resetPassword(data);
    if (success) {
      // El contexto manejará la notificación
      reset();
    }
  };

  return (
    <div className="w-full max-w-xl">
      <h1 className="text-4xl font-bold text-neutral-50 mb-2 text-center md:text-left">
        Recuperar contraseña
      </h1>
      <p className="text-blue-100 mb-8 text-2xl text-justify md:text-left">
        Ingresa tu correo electrónico y te enviaremos un enlace para restablecer
        tu contraseña.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Correo electrónico"
            className={`w-full p-3 rounded text-gray-800 ${
              errors.email ? 'border-2 border-red-500' : ''
            }`}
            {...register('email', {
              required: 'El correo electrónico es requerido',
              pattern: {
                value: /\S+@\S+\.\S+/,
                message: 'El correo electrónico no es válido',
              },
            })}
          />
          {errors.email && (
            <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex items-center pt-4">
          <Button
            type="submit"
            className="bg-primary-50 text-primary-500 font-medium py-2 px-6 rounded hover:bg-secondary-100 transition-colors"
          >
            Enviar enlace
          </Button>
        </div>
        <div className="flex justify-center pt-2">
          <Button
            variant="link"
            onClick={onSwitchToLogin}
            className="text-secondary-200 text-sm hover:text-primary-50 transition-colors"
          >
            Volver al inicio de sesión
          </Button>
        </div>
      </form>
    </div>
  );
};
