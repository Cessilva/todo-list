'use client';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PerfilView } from './perfilView';

export const ProfileDropdown = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    // Close the dropdown
    setIsOpen(false);
    // Redirect to auth page
    router.push('/auth');
  };

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón de hamburguesa para móvil */}
      <button
        id="mobile-open-button"
        className="text-2xl sm:hidden flex items-center h-full gap-2 focus:outline-none cursor-pointer rounded-md p-4 hover:border-neutral-400 hover:border transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="material-icons text-lg text-primary-50">menu</span>
      </button>
      {/* Div de perfil para desktop */}
      <div
        className="hidden sm:flex items-center gap-2 focus:outline-none cursor-pointer  rounded-md p-1 hover: transition-colors duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <PerfilView
          perfilName="Cecilia Silva"
          description="Ingeniero de desarrollo"
          rol="Administrador"
          alt="face"
          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        />
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 sm:w-full rounded-md shadow-lg bg-primary-950 ring-1 ring-black ring-opacity-5 focus:outline-none z-10 transform origin-top-right transition-all duration-200">
          <div className="py-1" role="menu" aria-orientation="vertical">
            {/* Solo mostrar PerfilView en móvil, ya que en desktop ya está visible */}
            <div className="sm:hidden px-4 py-2 border-b border-gray-700 ">
              <PerfilView
                perfilName="Cecilia Silva"
                description="Ingeniero de desarrollo"
                rol="Administrador"
                alt="face"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              />
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center w-full text-left pl-6 sm:px-8 py-3 text-sm sm:text-base text-primary-50 hover:translate-x-2 transition-all duration-300"
              role="menuitem"
            >
              <span className="material-icons text-lg">exit_to_app</span>
              <span className="ml-3">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
