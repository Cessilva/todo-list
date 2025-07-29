'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { LoginCredentials } from '../../types/auth';
import Image from 'next/image';
import { RegisterForm } from '../../components/RegisterForm';
import { ForgotPasswordForm } from '../../components/ForgotPasswordForm';
import Button from '../../components/Button';

type AuthView = 'login' | 'register' | 'forgot-password';

export default function Auth() {
  const router = useRouter();
  const { login } = useAuth();
  const [currentView, setCurrentView] = useState<AuthView>('login');

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>();

  const onSubmit = async (data: LoginCredentials) => {
    const success = await login(data);
    if (success) {
      router.push('/dashboard');
    }
  };

  const renderLoginForm = () => (
    <div className="w-full max-w-xl">
      {/* Mobile logo (visible only on small screens) */}
      <div className="md:hidden mb-10 flex justify-center">
        <Image
          src="/resources/images/done.png"
          alt="Logo"
          width={100}
          height={32}
        />
      </div>
      <h1 className="text-4xl font-bold text-neutral-50 mb-2 text-center md:text-left">
        Bienvenido a TODO-LIST
      </h1>
      <p className="text-blue-100 mb-8 text-2xl text-justify md:text-left">
        Registra tus actividades pendientes y ten un mejor control de ellas.
      </p>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            className={`w-full p-3 rounded text-gray-800 ${
              errors.email ? 'border-2 border-red-500' : ''
            }`}
            {...registerField('email', {
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
        <div className="mb-6">
          <input
            type="password"
            placeholder="Contraseña"
            className={`w-full p-3 rounded text-gray-800 ${
              errors.password ? 'border-2 border-red-500' : ''
            }`}
            {...registerField('password', {
              required: 'La contraseña es requerida',
            })}
          />
          {errors.password && (
            <p className="text-red-300 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>
        <div className="flex items-center justify-between">
          <Button
            type="submit"
            className="bg-primary-50 text-primary-500 font-medium py-2 px-6 rounded hover:bg-secondary-100 transition-colors"
          >
            Acceso
          </Button>
          <Button
            variant="link"
            onClick={() => setCurrentView('forgot-password')}
            className="text-secondary-200 text-sm hover:text-primary-50"
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </div>
        <div className="mt-4 text-center">
          <Button
            variant="link"
            onClick={() => setCurrentView('register')}
            className="text-secondary-200 text-sm hover:text-primary-50"
          >
            ¿No tienes cuenta? Regístrate aquí
          </Button>
        </div>
      </form>

      <div className="mt-8 p-4 bg-blue-900 bg-opacity-30 rounded-lg">
        <h3 className="text-primary-50 font-semibold mb-2">
          Usuarios de prueba disponibles:
        </h3>
        <div className="text-secondary-200 text-sm space-y-1">
          <p>• admin@todolist.com - Cecilia Silva Sandoval (Administrador)</p>
          <p>• user@todolist.com - Pedro Páramo (Usuario)</p>
          <p className="mt-2 text-xs text-blue-200">
            Contraseña para ambos: password123
          </p>
        </div>
      </div>
    </div>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'register':
        return <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />;
      case 'forgot-password':
        return (
          <ForgotPasswordForm onSwitchToLogin={() => setCurrentView('login')} />
        );
      default:
        return renderLoginForm();
    }
  };

  return (
    <div key="auth-container" className="flex min-h-screen">
      {/* Left side - Blue gradient with illustration */}
      <div className="hidden md:flex md:w-1/3 bg-gradient-to-br from-primary-300 to-secondary-400 flex-col items-center justify-center p-8">
        <Image
          src="/resources/images/graphic2.svg"
          alt="Login graphic"
          width={500}
          height={300}
        />
      </div>

      {/* Right side - Auth forms */}
      <div
        key="right-side"
        className="w-full md:w-2/3 bg-primary-600 flex items-center justify-center p-8"
      >
        {renderCurrentView()}
      </div>
    </div>
  );
}
