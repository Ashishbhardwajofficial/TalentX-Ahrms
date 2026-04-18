import React from 'react';
import { ChevronDown, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

export interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox' | 'tel';
  value?: string | number | boolean | undefined;
  onChange?: (value: any) => void;
  error?: string | undefined;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  options?: Array<{ value: string | number; label: string }>;
  rows?: number;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
  helperText?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false,
  options = [],
  rows = 3,
  min,
  max,
  step,
  className = '',
  helperText
}) => {
  const fieldId = `field-${name}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (!onChange) return;
    if (type === 'checkbox') {
      onChange((e.target as HTMLInputElement).checked);
    } else if (type === 'number') {
      onChange(e.target.value === '' ? '' : Number(e.target.value));
    } else {
      onChange(e.target.value);
    }
  };

  const baseInputClass = `w-full px-4 py-3 bg-white dark:bg-secondary-800/50 border-2 rounded-2xl text-sm font-medium transition-all duration-300 outline-none disabled:opacity-50 disabled:cursor-not-allowed ${error
      ? 'border-danger-200 dark:border-danger-900/30 focus:border-danger-500 focus:ring-4 focus:ring-danger-500/10 text-danger-900 dark:text-danger-200 placeholder-danger-300'
      : 'border-secondary-100 dark:border-secondary-800 focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/10 text-secondary-900 dark:text-white placeholder-secondary-400 hover:border-secondary-200 dark:hover:border-secondary-700'
    } ${className}`;

  const renderInput = () => {
    if (type === 'select') {
      return (
        <div className="relative group">
          <select
            id={fieldId}
            name={name}
            value={value as string | number || ''}
            onChange={handleChange}
            disabled={disabled}
            className={`${baseInputClass} appearance-none pr-10`}
          >
            <option value="">Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-secondary-400 group-hover:text-primary-500 transition-colors">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <textarea
          id={fieldId}
          name={name}
          value={value as string || ''}
          onChange={handleChange}
          disabled={disabled}
          placeholder={placeholder}
          rows={rows}
          className={`${baseInputClass} resize-none scrollbar-premium`}
        />
      );
    }

    if (type === 'checkbox') {
      return (
        <div className="flex items-start gap-3 py-1 group cursor-pointer" onClick={() => !disabled && onChange?.(!value)}>
          <div className="flex items-center h-6">
            <input
              id={fieldId}
              name={name}
              type="checkbox"
              checked={!!value}
              onChange={handleChange}
              disabled={disabled}
              onClick={(e) => e.stopPropagation()}
              className={`w-5 h-5 text-primary-600 rounded-lg border-2 border-secondary-200 dark:border-secondary-700 focus:ring-primary-500 focus:ring-offset-0 transition-all cursor-pointer disabled:cursor-not-allowed ${error ? 'border-danger-300' : ''
                }`}
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor={fieldId} className={`text-sm font-bold select-none cursor-pointer transition-colors ${error ? 'text-danger-700 dark:text-danger-400' : 'text-secondary-700 dark:text-secondary-300 group-hover:text-primary-600'
              }`}>
              {label} {required && <span className="text-danger-500 ml-0.5">*</span>}
            </label>
            {helperText && <p className="text-[10px] text-secondary-500 font-medium uppercase tracking-wider mt-0.5">{helperText}</p>}
          </div>
        </div>
      );
    }

    return (
      <input
        id={fieldId}
        name={name}
        type={type}
        value={value as string | number || ''}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
        className={baseInputClass}
      />
    );
  };

  if (type === 'checkbox') {
    return renderInput();
  }

  return (
    <div className="flex flex-col gap-2 group">
      <div className="flex items-center justify-between">
        <label htmlFor={fieldId} className="text-[10px] font-black text-secondary-500 dark:text-secondary-400 uppercase tracking-[0.15em] transition-colors group-focus-within:text-primary-600">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
        {error && <AlertCircle className="w-3.5 h-3.5 text-danger-500 animate-pulse" />}
      </div>

      {renderInput()}

      <div className="flex items-center justify-between min-h-[16px]">
        {helperText && !error ? (
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-secondary-500">
            <Info className="w-3 h-3" />
            {helperText}
          </div>
        ) : error ? (
          <p className="text-[10px] font-bold text-danger-600 dark:text-danger-400 flex items-center gap-1.5 animate-slide-up">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default FormField;