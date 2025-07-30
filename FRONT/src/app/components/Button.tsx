import { twMerge } from 'tailwind-merge';
import React, { ButtonHTMLAttributes } from 'react';

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'link'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  rounded?: boolean;
  outlined?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  rounded = false,
  outlined = false,
  className,
  ...props
}) => {
  const baseStyles =
    'font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed';

  const variantStyles: Record<ButtonVariant, string> = {
    primary: outlined
      ? 'bg-transparent border border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-300'
      : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-300',
    secondary: outlined
      ? 'bg-transparent border border-gray-500 text-gray-500 hover:bg-gray-50 focus:ring-gray-300'
      : 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-300',
    link: 'bg-transparent text-blue-500 hover:underline focus:ring-blue-300 p-0',
    danger: outlined
      ? 'bg-transparent border border-red-500 text-red-500 hover:bg-red-50 focus:ring-red-300'
      : 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-300',
    success: outlined
      ? 'bg-transparent border border-green-500 text-green-500 hover:bg-green-50 focus:ring-green-300'
      : 'bg-green-500 text-white hover:bg-green-600 focus:ring-green-300',
    warning: outlined
      ? 'bg-transparent border border-yellow-500 text-yellow-500 hover:bg-yellow-50 focus:ring-yellow-300'
      : 'bg-yellow-500 text-white hover:bg-yellow-600 focus:ring-yellow-300',
    info: outlined
      ? 'bg-transparent border border-indigo-500 text-indigo-500 hover:bg-indigo-50 focus:ring-indigo-300'
      : 'bg-indigo-500 text-white hover:bg-indigo-600 focus:ring-indigo-300',
  };

  const sizeStyles: Record<ButtonSize, string> = {
    xs: 'px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm',
    sm: 'px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base',
    md: 'px-4 sm:px-5 py-2 sm:py-2.5 text-base sm:text-lg',
    lg: 'px-5 sm:px-6 py-2.5 sm:py-3 text-lg sm:text-xl',
    xl: 'px-6 sm:px-8 py-3 sm:py-4 text-xl sm:text-2xl',
  };

  const widthStyles = fullWidth ? 'w-full' : '';
  const roundedStyles = rounded ? 'rounded-full' : 'rounded-md';

  // No aplicar padding para botones de tipo 'link'
  const paddingStyles = variant === 'link' ? '' : sizeStyles[size];

  const buttonStyles = twMerge(
    baseStyles,
    paddingStyles,
    variantStyles[variant],
    widthStyles,
    roundedStyles,
    className
  );

  return <button className={buttonStyles} {...props} />;
};

export default Button;
