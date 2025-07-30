'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { useGlobal } from '../../context/GlobalContext';
import { RegisterCredentials } from '../../types/auth';
import Button from '../Button';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
}) => {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const { state } = useGlobal();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterCredentials>();

  const password = watch('password');

  const onSubmit = async (data: RegisterCredentials) => {
    const success = await registerUser(data);
    if (success) {
      onSwitchToLogin();
    }
  };

  return (
    <div className="w-full max-w-xl">
      <h1 className="text-4xl font-bold text-neutral-50 mb-2 text-center md:text-left">
        Crear cuenta
      </h1>
      <p className="text-blue-100 mb-8 text-2xl text-justify md:text-left">
        Únete a TODO-LIST y organiza tus tareas de manera eficiente.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Nombre completo"
            className={`w-full p-3 rounded text-gray-800 ${
              errors.name ? 'border-2 border-red-500' : ''
            }`}
            {...register('name', {
              required: 'El nombre es requerido',
              minLength: {
                value: 2,
                message: 'El nombre debe tener al menos 2 caracteres',
              },
              maxLength: {
                value: 50,
                message: 'El nombre no puede exceder 50 caracteres',
              },
              pattern: {
                value: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
                message: 'El nombre solo puede contener letras y espacios',
              },
            })}
          />
          {errors.name && (
            <p className="text-red-300 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            placeholder="Correo electrónico"
            className={`w-full p-3 rounded text-gray-800 ${
              errors.email ? 'border-2 border-red-500' : ''
            }`}
            {...register('email', {
              required: 'El correo electrónico es requerido',
              maxLength: {
                value: 100,
                message: 'El email no puede exceder 100 caracteres',
              },
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: 'Debe ser un email válido',
              },
            })}
          />
          {errors.email && (
            <p className="text-red-300 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Contraseña"
            className={`w-full p-3 rounded text-gray-800 ${
              errors.password ? 'border-2 border-red-500' : ''
            }`}
            {...register('password', {
              required: 'La contraseña es requerida',
              minLength: {
                value: 6,
                message: 'La contraseña debe tener al menos 6 caracteres',
              },
              maxLength: {
                value: 128,
                message: 'La contraseña no puede exceder 128 caracteres',
              },
              pattern: {
                value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                message:
                  'La contraseña debe contener al menos una letra minúscula, una mayúscula y un número',
              },
            })}
          />
          {errors.password && (
            <p className="text-red-300 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        <div>
          <input
            type="password"
            placeholder="Confirmar contraseña"
            className={`w-full p-3 rounded text-gray-800 ${
              errors.confirmPassword ? 'border-2 border-red-500' : ''
            }`}
            {...register('confirmPassword', {
              required: 'Confirma tu contraseña',
              validate: (value) =>
                value === password || 'Las contraseñas no coinciden',
            })}
          />
          {errors.confirmPassword && (
            <p className="text-red-300 text-sm mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="text-blue-100 text-sm mt-1">
          La contraseña debe tener al menos 6 caracteres e incluir: una
          minúscula, una mayúscula y un número
        </div>

        <div className="flex justify-center  pt-4">
          <Button
            type="submit"
            className="bg-primary-50 text-primary-500 font-medium py-2 px-6 rounded hover:bg-secondary-100 transition-colors"
          >
            Registrate
          </Button>
        </div>
        <div className="flex justify-center pt-2">
          <Button
            variant="link"
            onClick={onSwitchToLogin}
            className="text-secondary-200 text-sm hover:text-primary-50 transition-colors"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Button>
        </div>
      </form>
    </div>
  );
};
