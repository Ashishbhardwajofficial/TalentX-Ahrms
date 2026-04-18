import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ToastContainer from '../components/feedback/ToastContainer';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'loading';
  message: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  success: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string;
  error: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string;
  warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string;
  info: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string;
  loading: (message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>) => string;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration
    if (toast.duration !== 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration || 5000);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>): string => {
    return addToast({ type: 'success', message, ...options });
  }, [addToast]);

  const error = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>): string => {
    return addToast({ type: 'error', message, duration: 7000, ...options });
  }, [addToast]);

  const warning = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>): string => {
    return addToast({ type: 'warning', message, ...options });
  }, [addToast]);

  const info = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>): string => {
    return addToast({ type: 'info', message, ...options });
  }, [addToast]);

  const loading = useCallback((message: string, options?: Partial<Omit<Toast, 'id' | 'type'>>): string => {
    return addToast({ type: 'loading', message, duration: 0, ...options });
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{ toasts, addToast, removeToast, success, error, warning, info, loading }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
