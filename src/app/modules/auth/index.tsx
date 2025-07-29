'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function Auth() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      router.push('/dashboard');
    },
    [router]
  );
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

      {/* Right side - Login form */}
      <div
        key="right-side"
        className="w-full md:w-2/3 bg-primary-600 flex items-center justify-center p-8"
      >
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

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full p-3 rounded text-gray-800"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-6">
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full p-3 rounded text-gray-800"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-primary-50 text-primary-500 font-medium py-2 px-6 rounded hover:bg-secondary-100 transition-colors"
              >
                Acceso
              </button>
              <a
                href="#"
                className="text-secondary-200 text-sm hover:text-primary-50"
              >
                ¿Problemas para acceder?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
