import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: 'search' | 'empty' | 'filter' | 'success' | 'custom';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  illustration = 'empty',
}) => {
  const illustrations = {
    search: '🔍',
    empty: '📭',
    filter: '🎯',
    success: '✓',
    custom: icon,
  };

  return (
    <div className="empty-state">
      {/* Icon/Illustration */}
      <div className="empty-state-icon">
        {illustrations[illustration]}
      </div>

      {/* Title */}
      <h3 className="empty-state-title">{title}</h3>

      {/* Description */}
      {description && (
        <p className="empty-state-description">{description}</p>
      )}

      {/* Actions */}
      <div className="empty-state-actions">
        {action && (
          <button
            className={`btn ${action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}`}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
        {secondaryAction && (
          <button
            className="btn btn-secondary"
            onClick={secondaryAction.onClick}
          >
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
