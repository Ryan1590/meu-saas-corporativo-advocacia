import React, { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  required?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      required,
      id,
      className = '',
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            className={`block w-full rounded-lg border text-sm transition-colors duration-150
              ${leftIcon ? 'pl-9' : 'pl-3.5'}
              ${rightIcon ? 'pr-9' : 'pr-3.5'}
              py-2
              ${
                error
                  ? 'border-rose-300 bg-rose-50/40 text-rose-900 placeholder-rose-400 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20 dark:border-rose-800 dark:text-rose-200'
                  : 'border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500'
              }
              disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-800/60 dark:disabled:text-slate-600
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 dark:text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p id={`${inputId}-helper`} className="text-xs text-slate-500 dark:text-slate-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  options: SelectOption[];
  required?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, helperText, error, options, required, id, className = '', disabled, ...props },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            {label}
            {required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative rounded-lg shadow-xs">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`block w-full rounded-lg border text-sm transition-colors duration-150 px-3.5 py-2
              ${
                error
                  ? 'border-rose-300 bg-rose-50/40 text-rose-900 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:bg-rose-950/20 dark:border-rose-800'
                  : 'border-slate-300 bg-white text-slate-900 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100'
              }
              disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed dark:disabled:bg-slate-800/60
              ${className}
            `}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="flex items-center gap-1 text-xs text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        )}

        {!error && helperText && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = '', id, disabled, ...props }, ref) => {
    const checkId = id || Math.random().toString(36).substring(7);

    return (
      <div className="flex items-start gap-2.5">
        <div className="flex items-center h-5">
          <input
            ref={ref}
            type="checkbox"
            id={checkId}
            disabled={disabled}
            className={`h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0 dark:border-slate-700 dark:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${className}`}
            {...props}
          />
        </div>
        {(label || description) && (
          <div className="text-left select-none">
            {label && (
              <label
                htmlFor={checkId}
                className={`text-xs font-medium ${
                  disabled
                    ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed'
                    : 'text-slate-800 dark:text-slate-200 cursor-pointer'
                }`}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal mt-0.5">
                {description}
              </p>
            )}
            {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch: React.FC<SwitchProps> = ({
  label,
  description,
  checked = false,
  onCheckedChange,
  disabled = false,
  id,
  className = '',
}) => {
  const switchId = id || Math.random().toString(36).substring(7);

  return (
    <div className="flex items-center justify-between gap-4">
      {(label || description) && (
        <div className="text-left select-none">
          {label && (
            <label
              htmlFor={switchId}
              className={`text-xs font-medium ${
                disabled ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed' : 'text-slate-800 dark:text-slate-200 cursor-pointer'
              }`}
            >
              {label}
            </label>
          )}
          {description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              {description}
            </p>
          )}
        </div>
      )}
      <button
        type="button"
        id={switchId}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onCheckedChange?.(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
        } ${className}`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
};
