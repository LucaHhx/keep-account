import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, id, ...props }, ref) => {
    return (
      <div>
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          className={`w-full h-11 px-4 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-50 text-sm focus:outline-none focus:ring-2 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500 transition-colors duration-200 ${
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-200 dark:border-gray-700 focus:ring-blue-500'
          }`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  },
);

FormInput.displayName = 'FormInput';

export default FormInput;
