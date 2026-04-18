import React from 'react';
import { Toast as ToastType } from '../../context/ToastContext';

interface ToastProps {
  toast: ToastType;
  onDismiss: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ',
    loading: '⟳',
  };

  const typeClasses = {
    success: 'toast-success',
    error: 'toast-error',
    warning: 'toast-warning',
    info: 'toast-info',
    loading: 'toast-loading',
  };

  return (
    <div className={`toast ${typeClasses[toast.type]}`}>
      {/* Icon */}
      <div className="toast-icon">{icons[toast.type]}</div>

      {/* Content */}
      <div className="toast-content">
        <p className="toast-message">{toast.message}</p>
        {toast.description && (
          <p className="toast-description">{toast.description}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="toast-action"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="toast-dismiss"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
