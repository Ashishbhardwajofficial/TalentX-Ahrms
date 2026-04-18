import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true
}) => {
  const [mounted, setMounted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setMounted(false), 300);
      document.body.style.overflow = 'unset';
      return () => {
        clearTimeout(timer);
        document.body.style.overflow = 'unset';
      };
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  if (!mounted && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-secondary-900/60 backdrop-blur-md transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleOverlayClick}
      />

      {/* Modal Card */}
      <div
        ref={modalRef}
        className={`w-full ${sizes[size]} transform transition-all duration-300 ease-premium shadow-premium ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-white dark:bg-secondary-900 rounded-[32px] overflow-hidden border border-white/20 dark:border-secondary-800 flex flex-col max-h-[90vh]">
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="px-8 pt-8 pb-6 border-b border-secondary-50 dark:border-secondary-800/50 flex items-start justify-between">
              <div className="space-y-1">
                {title && <h2 className="text-2xl font-black text-secondary-900 dark:text-white tracking-tight leading-none">{title}</h2>}
                {subtitle && <p className="text-secondary-500 dark:text-secondary-400 text-sm font-medium">{subtitle}</p>}
              </div>
              {showCloseButton && (
                <Button
                  variant="glass"
                  size="xs"
                  onClick={onClose}
                  className="rounded-full w-10 h-10 p-0 center"
                >
                  <X className="w-5 h-5" />
                </Button>
              )}
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-premium text-secondary-600 dark:text-secondary-400">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-8 py-6 border-t border-secondary-50 dark:border-secondary-800/50 bg-secondary-50/30 dark:bg-secondary-800/20">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;