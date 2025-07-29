import Image from 'next/image';
export interface PerfilViewProps {
  alt: string;
  src: string;
  perfilName: string;
  description: string;
  rol: string;
}

/**
 * Componente para mostrar la vista de un perfil: nombre, foto y descripción.
 *
 * @param {string} alt - Texto alternativo para la imagen.
 * @param {string} src - URL de la imagen que se va a mostrar.
 * @param {string} perfilName - URL de la imagen que se va a mostrar.
 * @param {string} description - URL de la imagen que se va a mostrar.
 * * @param {string} rol - URL de la imagen que se va a mostrar.
 * @returns {JSX.Element} El elemento de la imagen renderizado.
 */

export const PerfilView = ({
  alt,
  src,
  perfilName,
  description,
  rol,
}: PerfilViewProps): JSX.Element => {
  return (
    <div className="flex items-center gap-x-6">
      <Image
        className="size-16 rounded-full"
        alt={alt}
        src={src}
        width={64}
        height={64}
      />
      <div className="text-center">
        <h2 className="text-xl  font-semibold tracking-tight text-primary-50 uppercase">
          {perfilName}
        </h2>
        <p className="text-sm font-bold text-secondary-200 uppercase">
          {description}
        </p>
        <p className="text-xs font-semibold text-secondary-200 uppercase">
          {rol}
        </p>
      </div>
    </div>
  );
};
