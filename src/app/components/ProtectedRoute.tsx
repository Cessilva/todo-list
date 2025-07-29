'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { Spinner } from './Spinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { state } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (state.isInitialized && !state.isAuthenticated) {
      router.push('/auth');
    }
  }, [state.isInitialized, state.isAuthenticated, router]);

  // Mostrar spinner mientras se inicializa la autenticación
  if (!state.isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" message="Inicializando..." />
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!state.isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
