import React from 'react';
import { StatusType, getStatusIcon, getStatusLabel } from '../../utils/statusUtils';

export interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  showIcon?: boolean;
  pulse?: boolean;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  showIcon = true,
  pulse = false,
  className = '',
}) => {
  const displayLabel = label || getStatusLabel(status);
  const icon = getStatusIcon(status);

  return (
    <span className={`status-badge status-badge-${status} ${pulse ? 'pulse' : ''} ${className}`}>
      {showIcon && <span className="status-badge-icon">{icon}</span>}
      <span className="status-badge-label">{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
