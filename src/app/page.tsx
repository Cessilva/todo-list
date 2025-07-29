'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './context/AuthContext';
import { Spinner } from './components/Spinner';

export default function Home() {
  const router = useRouter();
  const { state } = useAuth();

  useEffect(() => {
    if (state.isInitialized) {
      if (state.isAuthenticated) {
        router.push('/pages/dashboard');
      } else {
        router.push('/pages/auth');
      }
    }
  }, [state.isInitialized, state.isAuthenticated, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Spinner size="lg" message="Redirigiendo al login..." />
    </div>
  );
}
