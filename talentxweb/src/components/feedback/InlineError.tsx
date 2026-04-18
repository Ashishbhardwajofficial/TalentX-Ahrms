import React from 'react';

interface InlineErrorProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

const InlineError: React.FC<InlineErrorProps> = ({
  message,
  onRetry,
  onDismiss,
}) => {
  return (
    <div className="inline-error">
      <div className="inline-error-content">
        <div className="inline-error-icon">⚠️</div>
        <div className="inline-error-message">
          <p>{message}</p>
        </div>
        <div className="inline-error-actions">
          {onRetry && (
            <button onClick={onRetry} className="inline-error-retry">
              Retry
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} className="inline-error-dismiss">
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InlineError;
