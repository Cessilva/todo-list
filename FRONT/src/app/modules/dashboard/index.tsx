'use client';

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { TaskList } from '../../components/todo/TaskList';
import { ProfileDropdown } from '../../components/perfil/PerfilDropDown';

export default function Dashboard() {
  const { state } = useAuth();

  return (
    <div className="min-h-scree bg-slate-300">
      {/* Header */}
      <header className="bg-primary-950 text-primary-50 sticky top-0 z-10">
        <section className="max-4-4xl mx-auto p-4 flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl w-auto font-medium flex justify-start">
            <a
              href="#todo-list"
              className="whitespace-normal sm:whitespace-nowrap ml-3 mr-5"
            >
              TODO-LIST
            </a>
          </h1>
          <ProfileDropdown />
        </section>
      </header>

      <main className="min-h-screen h-full flex justify-center  p-4 sm:p-6 lg:p-8">
        <div className="w-full md:w-[90%] lg:w-[80%] xl:w-[60%] bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="mb-8 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-800">
                ¡Bienvenido, {state.user?.name}!
              </h2>
            </div>
            <p className="text-gray-600">
              Gestiona tus tareas de manera eficiente con nuestra aplicación.
            </p>
          </div>
          <TaskList />
        </div>
      </main>
    </div>
  );
}
