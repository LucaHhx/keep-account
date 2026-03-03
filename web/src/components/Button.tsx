import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: 'primary' | 'danger' | 'ghost' | 'custom';
}

export default function Button({
  children,
  loading,
  variant = 'primary',
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'w-full h-12 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-400 focus:ring-blue-500',
    danger:
      'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
    ghost:
      'text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-blue-500',
    custom: '',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
