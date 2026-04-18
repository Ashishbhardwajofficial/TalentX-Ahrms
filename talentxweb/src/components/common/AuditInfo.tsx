import React from 'react';

export interface AuditInfoProps {
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  version?: number;
  active?: boolean;
  compact?: boolean;
  className?: string;
}

const AuditInfo: React.FC<AuditInfoProps> = ({
  createdAt,
  createdBy,
  updatedAt,
  updatedBy,
  version,
  active,
  compact = false,
  className = ''
}) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (compact) {
    return (
      <div className={`audit-info-compact ${className}`}>
        {updatedBy && (
          <span className="audit-item">
            <span className="audit-label">Modified by:</span>
            <span className="audit-value">{updatedBy}</span>
          </span>
        )}
        {updatedAt && (
          <span className="audit-item">
            <span className="audit-label">on</span>
            <span className="audit-value">{formatDate(updatedAt)}</span>
          </span>
        )}
        {version !== undefined && (
          <span className="audit-item">
            <span className="audit-label">Version:</span>
            <span className="audit-value">v{version}</span>
          </span>
        )}
        {active !== undefined && (
          <span className={`audit-status ${active ? 'active' : 'inactive'}`}>
            {active ? '✓ Active' : '✕ Inactive'}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`audit-info ${className}`}>
      <h4 className="audit-info-title">Audit Information</h4>
      <div className="audit-info-grid">
        {createdAt && (
          <div className="audit-info-item">
            <span className="audit-label">Created:</span>
            <span className="audit-value">{formatDate(createdAt)}</span>
            {createdBy && (
              <span className="audit-by"> by {createdBy}</span>
            )}
          </div>
        )}

        {updatedAt && (
          <div className="audit-info-item">
            <span className="audit-label">Last Modified:</span>
            <span className="audit-value">{formatDate(updatedAt)}</span>
            {updatedBy && (
              <span className="audit-by"> by {updatedBy}</span>
            )}
          </div>
        )}

        {version !== undefined && (
          <div className="audit-info-item">
            <span className="audit-label">Version:</span>
            <span className="audit-value version-badge">v{version}</span>
            <span className="audit-hint"> (for optimistic locking)</span>
          </div>
        )}

        {active !== undefined && (
          <div className="audit-info-item">
            <span className="audit-label">Status:</span>
            <span className={`audit-status-badge ${active ? 'active' : 'inactive'}`}>
              {active ? '✓ Active' : '✕ Inactive'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditInfo;
