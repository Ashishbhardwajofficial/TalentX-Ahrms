import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning' | 'glass' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  type = 'button',
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] transform-gpu';

  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 shadow-premium',
    secondary: 'bg-secondary-100 dark:bg-secondary-800 text-secondary-700 dark:text-secondary-300 hover:bg-secondary-200 dark:hover:bg-secondary-700 focus:ring-secondary-500',
    outline: 'bg-transparent text-primary-600 border-2 border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/10 focus:ring-primary-500',
    ghost: 'bg-transparent text-secondary-600 dark:text-secondary-400 hover:bg-secondary-100 dark:hover:bg-secondary-800 focus:ring-secondary-500',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500 shadow-soft',
    success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 shadow-soft',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 shadow-soft',
    glass: 'glass-effect text-secondary-900 dark:text-white hover:bg-white/40 dark:hover:bg-black/40 border-white/20 dark:border-white/10 shadow-soft',
    gradient: 'bg-gradient-primary text-white hover:shadow-glow focus:ring-primary-500',
  };

  const sizes = {
    xs: 'px-2 py-1 text-[10px] rounded-lg',
    sm: 'px-3 py-1.5 text-xs rounded-xl',
    md: 'px-5 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-4 text-base rounded-2xl',
  };

  const classes = `
    ${baseClasses}
    ${variants[variant]}
    ${sizes[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  return (
    <button
      type={type}
      className={classes.trim()}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}

      {!isLoading && icon && iconPosition === 'left' && (
        <span className={`${children ? 'mr-2' : ''} flex items-center`}>{icon}</span>
      )}

      {children}

      {!isLoading && icon && iconPosition === 'right' && (
        <span className={`${children ? 'ml-2' : ''} flex items-center`}>{icon}</span>
      )}
    </button>
  );
};

export default Button;