import React, { useState } from 'react';
import { AuditLogDTO } from '../../api/auditLogApi';
import { AuditAction } from '../../types';

interface AuditLogViewerProps {
  auditLog: AuditLogDTO;
  showFullDetails?: boolean;
  compact?: boolean;
}

interface DiffViewerProps {
  oldValues: any;
  newValues: any;
  title?: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ oldValues, newValues, title }) => {
  const [viewMode, setViewMode] = useState<'side-by-side' | 'unified'>('side-by-side');

  const getChangedFields = () => {
    const changes: Array<{
      field: string;
      oldValue: any;
      newValue: any;
      type: 'added' | 'removed' | 'modified';
    }> = [];

    const oldKeys = oldValues ? Object.keys(oldValues) : [];
    const newKeys = newValues ? Object.keys(newValues) : [];
    const allKeys = [...new Set([...oldKeys, ...newKeys])];

    allKeys.forEach(key => {
      const hasOld = oldKeys.includes(key);
      const hasNew = newKeys.includes(key);
      const oldVal = hasOld ? oldValues[key] : undefined;
      const newVal = hasNew ? newValues[key] : undefined;

      if (!hasOld && hasNew) {
        changes.push({ field: key, oldValue: undefined, newValue: newVal, type: 'added' });
      } else if (hasOld && !hasNew) {
        changes.push({ field: key, oldValue: oldVal, newValue: undefined, type: 'removed' });
      } else if (hasOld && hasNew && JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
        changes.push({ field: key, oldValue: oldVal, newValue: newVal, type: 'modified' });
      }
    });

    return changes;
  };

  const formatValue = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getChangeColor = (type: 'added' | 'removed' | 'modified'): string => {
    switch (type) {
      case 'added':
        return '#dcfce7'; // green background
      case 'removed':
        return '#fef2f2'; // red background
      case 'modified':
        return '#fef3c7'; // yellow background
      default:
        return '#f9fafb';
    }
  };

  const getChangeTextColor = (type: 'added' | 'removed' | 'modified'): string => {
    switch (type) {
      case 'added':
        return '#166534'; // green text
      case 'removed':
        return '#dc2626'; // red text
      case 'modified':
        return '#d97706'; // yellow text
      default:
        return '#374151';
    }
  };

  const getChangeIcon = (type: 'added' | 'removed' | 'modified'): string => {
    switch (type) {
      case 'added':
        return '➕';
      case 'removed':
        return '➖';
      case 'modified':
        return '✏️';
      default:
        return '';
    }
  };

  const changes = getChangedFields();

  if (changes.length === 0) {
    return (
      <div style={{
        padding: '15px',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        No changes detected
      </div>
    );
  }

  return (
    <div>
      {title && (
        <div style={{
          marginBottom: '15px',
          fontSize: '16px',
          fontWeight: '600',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {title}
          <div style={{ display: 'flex', gap: '5px' }}>
            <button
              onClick={() => setViewMode('side-by-side')}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #d1d5db',
                backgroundColor: viewMode === 'side-by-side' ? '#3b82f6' : 'white',
                color: viewMode === 'side-by-side' ? 'white' : '#374151',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Side by Side
            </button>
            <button
              onClick={() => setViewMode('unified')}
              style={{
                padding: '4px 8px',
                fontSize: '12px',
                border: '1px solid #d1d5db',
                backgroundColor: viewMode === 'unified' ? '#3b82f6' : 'white',
                color: viewMode === 'unified' ? 'white' : '#374151',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Unified
            </button>
          </div>
        </div>
      )}

      {viewMode === 'side-by-side' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#dc2626'
            }}>
              Before
            </div>
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '12px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <pre style={{
                margin: 0,
                fontSize: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap'
              }}>
                {formatValue(oldValues)}
              </pre>
            </div>
          </div>

          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#16a34a'
            }}>
              After
            </div>
            <div style={{
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              padding: '12px',
              maxHeight: '300px',
              overflowY: 'auto'
            }}>
              <pre style={{
                margin: 0,
                fontSize: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap'
              }}>
                {formatValue(newValues)}
              </pre>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px'
          }}>
            Changes ({changes.length} field{changes.length !== 1 ? 's' : ''})
          </div>
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            {changes.map((change, index) => (
              <div
                key={change.field}
                style={{
                  backgroundColor: getChangeColor(change.type),
                  borderBottom: index < changes.length - 1 ? '1px solid #e5e7eb' : 'none',
                  padding: '12px'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '8px',
                  color: getChangeTextColor(change.type),
                  fontWeight: '500'
                }}>
                  <span style={{ marginRight: '8px' }}>
                    {getChangeIcon(change.type)}
                  </span>
                  <span>{change.field}</span>
                  <span style={{
                    marginLeft: '8px',
                    fontSize: '12px',
                    fontWeight: 'normal',
                    textTransform: 'uppercase'
                  }}>
                    {change.type}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {change.type !== 'added' && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        Old Value:
                      </div>
                      <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        padding: '6px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all'
                      }}>
                        {formatValue(change.oldValue)}
                      </div>
                    </div>
                  )}

                  {change.type !== 'removed' && (
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                        New Value:
                      </div>
                      <div style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.7)',
                        padding: '6px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        wordBreak: 'break-all'
                      }}>
                        {formatValue(change.newValue)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  auditLog,
  showFullDetails = true,
  compact = false
}) => {
  const getActionColor = (action: AuditAction): string => {
    switch (action) {
      case AuditAction.CREATE:
        return '#10b981';
      case AuditAction.UPDATE:
        return '#f59e0b';
      case AuditAction.DELETE:
        return '#ef4444';
      case AuditAction.VIEW:
        return '#6b7280';
      case AuditAction.EXPORT:
        return '#8b5cf6';
      case AuditAction.LOGIN:
        return '#3b82f6';
      case AuditAction.LOGOUT:
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getActionIcon = (action: AuditAction): string => {
    switch (action) {
      case AuditAction.CREATE:
        return '➕';
      case AuditAction.UPDATE:
        return '✏️';
      case AuditAction.DELETE:
        return '🗑️';
      case AuditAction.VIEW:
        return '👁️';
      case AuditAction.EXPORT:
        return '📤';
      case AuditAction.LOGIN:
        return '🔐';
      case AuditAction.LOGOUT:
        return '🚪';
      default:
        return '📝';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (compact) {
    return (
      <div style={{
        padding: '10px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        backgroundColor: '#fafafa'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: getActionColor(auditLog.action) }}>
              {getActionIcon(auditLog.action)}
            </span>
            <span style={{ fontWeight: '500' }}>
              {auditLog.action}
            </span>
            <span style={{ color: '#6b7280' }}>
              on {auditLog.entityType} (ID: {auditLog.entityId})
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {formatDate(auditLog.timestamp)}
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
          by {auditLog.userName || 'System'}
          {auditLog.ipAddress && ` from ${auditLog.ipAddress}`}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      backgroundColor: 'white',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '20px',
              color: getActionColor(auditLog.action)
            }}>
              {getActionIcon(auditLog.action)}
            </span>
            <div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>
                {auditLog.action}
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {auditLog.entityType} (ID: {auditLog.entityId})
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              {formatDate(auditLog.timestamp)}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              by {auditLog.userName || 'System'}
            </div>
          </div>
        </div>
      </div>

      {/* Details */}
      {showFullDetails && (
        <div style={{ padding: '16px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                User
              </div>
              <div style={{ fontWeight: '500' }}>
                {auditLog.userName || 'System'}
                {auditLog.userId && (
                  <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '8px' }}>
                    (ID: {auditLog.userId})
                  </span>
                )}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                IP Address
              </div>
              <div style={{ fontWeight: '500' }}>
                {auditLog.ipAddress || 'N/A'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                Entity
              </div>
              <div style={{ fontWeight: '500' }}>
                {auditLog.entityType}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                ID: {auditLog.entityId}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                Action
              </div>
              <div style={{
                fontWeight: '500',
                color: getActionColor(auditLog.action)
              }}>
                {getActionIcon(auditLog.action)} {auditLog.action}
              </div>
            </div>
          </div>

          {auditLog.userAgent && (
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                User Agent
              </div>
              <div style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                backgroundColor: '#f9fafb',
                padding: '8px',
                borderRadius: '4px',
                wordBreak: 'break-all'
              }}>
                {auditLog.userAgent}
              </div>
            </div>
          )}

          {/* Changes Section */}
          {(auditLog.oldValues || auditLog.newValues) && (
            <div>
              <DiffViewer
                oldValues={auditLog.oldValues}
                newValues={auditLog.newValues}
                title="Data Changes"
              />
            </div>
          )}

          {/* No changes message for actions that don't modify data */}
          {!auditLog.oldValues && !auditLog.newValues && (
            <div style={{
              padding: '15px',
              backgroundColor: '#f9fafb',
              borderRadius: '6px',
              textAlign: 'center',
              color: '#6b7280'
            }}>
              {auditLog.action === AuditAction.VIEW && 'Record was viewed'}
              {auditLog.action === AuditAction.EXPORT && 'Data was exported'}
              {auditLog.action === AuditAction.LOGIN && 'User logged in'}
              {auditLog.action === AuditAction.LOGOUT && 'User logged out'}
              {![AuditAction.VIEW, AuditAction.EXPORT, AuditAction.LOGIN, AuditAction.LOGOUT].includes(auditLog.action) &&
                'No data changes recorded'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogViewer;