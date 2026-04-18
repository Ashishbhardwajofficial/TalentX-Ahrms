import React from 'react';

interface ErrorStateProps {
  error?: Error | string;
  title?: string;
  description?: string;
  onRetry?: () => void;
  onContactSupport?: () => void;
  variant?: 'network' | 'server' | 'permission' | 'notFound' | 'generic';
}

const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  title,
  description,
  onRetry,
  onContactSupport,
  variant = 'generic',
}) => {
  const errorConfig = {
    network: {
      icon: '📡',
      title: 'Connection Lost',
      description: 'Unable to connect to the server. Please check your internet connection.',
    },
    server: {
      icon: '🔧',
      title: 'Something Went Wrong',
      description: "We're experiencing technical difficulties. Our team has been notified.",
    },
    permission: {
      icon: '🔒',
      title: 'Access Denied',
      description: "You don't have permission to view this page. Contact your administrator for access.",
    },
    notFound: {
      icon: '🔍',
      title: 'Page Not Found',
      description: "The page you're looking for doesn't exist or has been moved.",
    },
    generic: {
      icon: '⚠️',
      title: 'Error',
      description: 'An unexpected error occurred.',
    },
  };

  const config = errorConfig[variant];
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className="error-state">
      {/* Icon */}
      <div className="error-state-icon">{config.icon}</div>

      {/* Title */}
      <h3 className="error-state-title">{title || config.title}</h3>

      {/* Description */}
      <p className="error-state-description">
        {description || config.description}
      </p>

      {/* Error Details (Development only) */}
      {process.env.NODE_ENV === 'development' && errorMessage && (
        <details className="error-state-details">
          <summary>Error Details</summary>
          <pre>{errorMessage}</pre>
        </details>
      )}

      {/* Actions */}
      <div className="error-state-actions">
        {onRetry && (
          <button className="btn btn-primary" onClick={onRetry}>
            Try Again
          </button>
        )}
        {onContactSupport && (
          <button className="btn btn-secondary" onClick={onContactSupport}>
            Contact Support
          </button>
        )}
        {!onRetry && !onContactSupport && (
          <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
            Go to Dashboard
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorState;
