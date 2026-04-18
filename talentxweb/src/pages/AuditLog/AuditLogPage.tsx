import React, { useState, useEffect, useCallback } from 'react';
import auditLogApi, { AuditLogDTO, AuditLogSearchParams } from '../../api/auditLogApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { AuditAction } from '../../types';
import { PaginatedResponse } from '../../types';

interface AuditLogFilters {
  entityType?: string;
  entityId?: number;
  userId?: number;
  action?: AuditAction;
  dateRange?: {
    start: string;
    end: string;
  };
}

interface ViewMode {
  type: 'all' | 'entity' | 'user';
  entityType?: string;
  entityId?: number;
  userId?: number;
}

const AuditLogPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLogDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0
  });
  const [filters, setFilters] = useState<AuditLogFilters>({});
  const [viewMode, setViewMode] = useState<ViewMode>({ type: 'all' });
  const [selectedLog, setSelectedLog] = useState<AuditLogDTO | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  const loadAuditLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: AuditLogSearchParams = {
        page: pagination.page,
        size: pagination.size,
        sort: 'timestamp',
        direction: 'desc',
        ...filters,
        ...(filters.dateRange?.start && { timestampAfter: filters.dateRange.start }),
        ...(filters.dateRange?.end && { timestampBefore: filters.dateRange.end })
      };

      let response: PaginatedResponse<AuditLogDTO>;

      switch (viewMode.type) {
        case 'entity':
          if (viewMode.entityType && viewMode.entityId) {
            response = await auditLogApi.getEntityAuditTrail({
              ...params,
              entityType: viewMode.entityType,
              entityId: viewMode.entityId
            });
          } else {
            response = await auditLogApi.getAuditLogs(params);
          }
          break;
        case 'user':
          if (viewMode.userId) {
            response = await auditLogApi.getUserActivity({
              ...params,
              userId: viewMode.userId
            });
          } else {
            response = await auditLogApi.getAuditLogs(params);
          }
          break;
        default:
          response = await auditLogApi.getAuditLogs(params);
      }

      setAuditLogs(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      console.error('Error loading audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filters, viewMode]);

  useEffect(() => {
    loadAuditLogs();
  }, [loadAuditLogs]);

  const handleViewDetails = (log: AuditLogDTO) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = {
        page: 0,
        size: 10000, // Large size for export
        ...filters,
        ...(filters.dateRange?.start && { timestampAfter: filters.dateRange.start }),
        ...(filters.dateRange?.end && { timestampBefore: filters.dateRange.end }),
        format: 'csv' as const,
        includeDetails: true
      };

      const blob = await auditLogApi.exportAuditLogs(params);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Error exporting audit logs:', err);
      setError(err.message || 'Failed to export audit logs');
    } finally {
      setExporting(false);
    }
  };

  const handleViewEntityAuditTrail = (entityType: string, entityId: number) => {
    setViewMode({ type: 'entity', entityType, entityId });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleViewUserActivity = (userId: number) => {
    setViewMode({ type: 'user', userId });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleResetView = () => {
    setViewMode({ type: 'all' });
    setFilters({});
    setPagination(prev => ({ ...prev, page: 0 }));
  };

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

  const truncateText = (text: string, maxLength: number = 50): string => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const columns: ColumnDefinition<AuditLogDTO>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (value: string) => formatDate(value)
    },
    {
      key: 'action',
      header: 'Action',
      render: (value: AuditAction) => (
        <span style={{
          color: getActionColor(value),
          fontWeight: 'bold'
        }}>
          {getActionIcon(value)} {value}
        </span>
      )
    },
    {
      key: 'userName',
      header: 'User',
      render: (value: string, log: AuditLogDTO) => (
        <div>
          <div style={{ fontWeight: '500' }}>
            {value || 'System'}
          </div>
          {log.userId && (
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                fontSize: '12px',
                textDecoration: 'underline',
                padding: 0
              }}
              onClick={() => handleViewUserActivity(log.userId!)}
            >
              View user activity
            </button>
          )}
        </div>
      )
    },
    {
      key: 'entityType',
      header: 'Entity',
      render: (value: string, log: AuditLogDTO) => (
        <div>
          <div style={{ fontWeight: '500' }}>
            {value}
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            ID: {log.entityId}
          </div>
          <button
            style={{
              background: 'none',
              border: 'none',
              color: '#3b82f6',
              cursor: 'pointer',
              fontSize: '12px',
              textDecoration: 'underline',
              padding: 0
            }}
            onClick={() => handleViewEntityAuditTrail(value, log.entityId)}
          >
            View entity trail
          </button>
        </div>
      )
    },
    {
      key: 'oldValues',
      header: 'Changes',
      render: (oldValues: any, log: AuditLogDTO) => {
        if (log.action === AuditAction.CREATE) {
          return <span style={{ color: '#10b981' }}>New record created</span>;
        }
        if (log.action === AuditAction.DELETE) {
          return <span style={{ color: '#ef4444' }}>Record deleted</span>;
        }
        if (log.action === AuditAction.UPDATE && (oldValues || log.newValues)) {
          const changeCount = Object.keys(log.newValues || {}).length;
          return (
            <span style={{ color: '#f59e0b' }}>
              {changeCount} field{changeCount !== 1 ? 's' : ''} updated
            </span>
          );
        }
        return <span style={{ color: '#6b7280' }}>No changes</span>;
      }
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      render: (value: string) => value || 'N/A'
    },
    {
      key: 'id',
      header: 'Actions',
      render: (value: number, log: AuditLogDTO) => (
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleViewDetails(log)}
        >
          Details
        </Button>
      )
    }
  ];

  if (loading && auditLogs.length === 0) {
    return <LoadingSpinner message="Loading audit logs..." overlay />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <div>
          <h1>Audit Logs</h1>
          {viewMode.type !== 'all' && (
            <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
              {viewMode.type === 'entity' && (
                <>Viewing audit trail for {viewMode.entityType} (ID: {viewMode.entityId})</>
              )}
              {viewMode.type === 'user' && (
                <>Viewing activity for User ID: {viewMode.userId}</>
              )}
              <button
                onClick={handleResetView}
                style={{
                  marginLeft: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                View all logs
              </button>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            onClick={loadAuditLogs}
            isLoading={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={handleExport}
            isLoading={exporting}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div>
          <label htmlFor="action-filter" style={{ marginRight: '5px' }}>Action:</label>
          <select
            id="action-filter"
            value={filters.action || ''}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              action: e.target.value as AuditAction || undefined
            }))}
          >
            <option value="">All Actions</option>
            {Object.values(AuditAction).map(action => (
              <option key={action} value={action}>
                {getActionIcon(action)} {action}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="entity-type-filter" style={{ marginRight: '5px' }}>Entity Type:</label>
          <input
            id="entity-type-filter"
            type="text"
            value={filters.entityType || ''}
            onChange={(e) => {
              const value = e.target.value.trim();
              setFilters(prev => {
                const newFilters = { ...prev };
                if (value) {
                  newFilters.entityType = value;
                } else {
                  delete newFilters.entityType;
                }
                return newFilters;
              });
            }}
            placeholder="e.g., Employee, Department"
          />
        </div>

        <div>
          <label htmlFor="user-id-filter" style={{ marginRight: '5px' }}>User ID:</label>
          <input
            id="user-id-filter"
            type="number"
            value={filters.userId || ''}
            onChange={(e) => {
              const value = e.target.value.trim();
              setFilters(prev => {
                const newFilters = { ...prev };
                if (value) {
                  newFilters.userId = Number(value);
                } else {
                  delete newFilters.userId;
                }
                return newFilters;
              });
            }}
            placeholder="User ID"
          />
        </div>

        <div>
          <label htmlFor="date-start" style={{ marginRight: '5px' }}>From:</label>
          <input
            id="date-start"
            type="datetime-local"
            value={filters.dateRange?.start || ''}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              dateRange: {
                ...prev.dateRange,
                start: e.target.value,
                end: prev.dateRange?.end || ''
              }
            }))}
          />
        </div>

        <div>
          <label htmlFor="date-end" style={{ marginRight: '5px' }}>To:</label>
          <input
            id="date-end"
            type="datetime-local"
            value={filters.dateRange?.end || ''}
            onChange={(e) => setFilters(prev => ({
              ...prev,
              dateRange: {
                start: prev.dateRange?.start || '',
                end: e.target.value
              }
            }))}
          />
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => setFilters({})}
        >
          Clear Filters
        </Button>
      </div>

      {error && (
        <div style={{
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#fef2f2',
          color: '#dc2626',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <DataTable
        data={auditLogs}
        columns={columns}
        loading={loading}
        pagination={{
          page: pagination.page + 1, // DataTable expects 1-based page numbers
          size: pagination.size,
          total: pagination.total
        }}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page: page - 1 }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 0 }))}
      />

      {/* Audit Log Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Audit Log Details"
        size="lg"
      >
        {selectedLog && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <strong>Timestamp:</strong>
                <div style={{ marginTop: '5px' }}>{formatDate(selectedLog.timestamp)}</div>
              </div>

              <div>
                <strong>Action:</strong>
                <div style={{ marginTop: '5px', color: getActionColor(selectedLog.action) }}>
                  {getActionIcon(selectedLog.action)} {selectedLog.action}
                </div>
              </div>

              <div>
                <strong>User:</strong>
                <div style={{ marginTop: '5px' }}>
                  {selectedLog.userName || 'System'} {selectedLog.userId && `(ID: ${selectedLog.userId})`}
                </div>
              </div>

              <div>
                <strong>Entity:</strong>
                <div style={{ marginTop: '5px' }}>
                  {selectedLog.entityType} (ID: {selectedLog.entityId})
                </div>
              </div>

              <div>
                <strong>IP Address:</strong>
                <div style={{ marginTop: '5px' }}>{selectedLog.ipAddress || 'N/A'}</div>
              </div>

              <div>
                <strong>User Agent:</strong>
                <div style={{ marginTop: '5px', fontSize: '12px', wordBreak: 'break-all' }}>
                  {selectedLog.userAgent || 'N/A'}
                </div>
              </div>
            </div>

            {(selectedLog.oldValues || selectedLog.newValues) && (
              <div>
                <strong>Changes:</strong>
                <div style={{ marginTop: '10px' }}>
                  {selectedLog.oldValues && (
                    <div style={{ marginBottom: '15px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>
                        Old Values:
                      </div>
                      <pre style={{
                        backgroundColor: '#fef2f2',
                        padding: '10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {JSON.stringify(selectedLog.oldValues, null, 2)}
                      </pre>
                    </div>
                  )}

                  {selectedLog.newValues && (
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '5px' }}>
                        New Values:
                      </div>
                      <pre style={{
                        backgroundColor: '#f0fdf4',
                        padding: '10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        overflow: 'auto',
                        maxHeight: '200px'
                      }}>
                        {JSON.stringify(selectedLog.newValues, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AuditLogPage;