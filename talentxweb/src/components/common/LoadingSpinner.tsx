import React from 'react';

export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  overlay?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  message = 'Loading...',
  overlay = false
}) => {
  const spinnerContent = (
    <div className={`loading-spinner loading-spinner-${size}`}>
      <div className="spinner-circle"></div>
      {message && <div className="spinner-message">{message}</div>}
    </div>
  );

  if (overlay) {
    return (
      <div className="loading-overlay">
        {spinnerContent}
      </div>
    );
  }

  return spinnerContent;
};

export default LoadingSpinner;