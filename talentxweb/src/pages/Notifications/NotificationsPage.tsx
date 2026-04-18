import React, { useState, useEffect, useCallback } from 'react';
import notificationApi, { SystemNotificationDTO, NotificationSearchParams } from '../../api/notificationApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';
import { NotificationType, PaginatedResponse } from '../../types';

interface NotificationFilters {
  notificationType?: NotificationType;
  isRead?: boolean;
}

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0 });
  const [filters, setFilters] = useState<NotificationFilters>({});
  const [selectedNotification, setSelectedNotification] = useState<SystemNotificationDTO | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: NotificationSearchParams = {
        page: pagination.page - 1,
        size: pagination.size,
        userId: user?.id,
        ...filters,
      };
      const response = await notificationApi.getNotifications(params);
      setNotifications(response.content ?? []);
      setPagination(prev => ({ ...prev, total: response.totalElements ?? 0 }));
    } catch (err: any) {
      setError(err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filters, user?.id]);

  useEffect(() => { loadNotifications(); }, [loadNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationApi.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead(user?.id);
      await loadNotifications();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await notificationApi.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const columns: ColumnDefinition<SystemNotificationDTO>[] = [
    {
      key: 'title',
      header: 'Title',
      render: (value, n) => (
        <div>
          <strong style={{ color: n.isRead ? '#6b7280' : '#111827' }}>{value}</strong>
          {!n.isRead && <span style={{ marginLeft: 8, background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: 10, fontSize: 10 }}>NEW</span>}
        </div>
      )
    },
    { key: 'notificationType', header: 'Type', render: (v) => (v as string)?.replace(/_/g, ' ') ?? '-' },
    { key: 'message', header: 'Message', render: (v) => <span style={{ maxWidth: 300, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span> },
    { key: 'createdAt', header: 'Created', render: (v) => v ? new Date(v).toLocaleString() : '-' },
    {
      key: 'id',
      header: 'Actions',
      render: (_, n) => (
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => { setSelectedNotification(n); setShowDetailModal(true); if (!n.isRead) handleMarkAsRead(n.id); }} style={{ padding: '4px 8px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>View</button>
          {!n.isRead && <button onClick={() => handleMarkAsRead(n.id)} style={{ padding: '4px 8px', background: '#10b981', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Mark Read</button>}
          <button onClick={() => handleDelete(n.id)} style={{ padding: '4px 8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Delete</button>
        </div>
      )
    }
  ];

  if (loading && notifications.length === 0) return <LoadingSpinner message="Loading notifications..." overlay />;

  return (
    <div style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>Notifications</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="secondary" onClick={loadNotifications} isLoading={loading}>Refresh</Button>
          <Button variant="primary" onClick={handleMarkAllAsRead}>Mark All Read</Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 20, padding: 16, background: '#f9fafb', borderRadius: 8 }}>
        <select value={filters.notificationType ?? ''} onChange={e => setFilters(p => ({ ...p, notificationType: e.target.value as NotificationType || undefined }))}>
          <option value="">All Types</option>
          {Object.values(NotificationType).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
        </select>
        <select value={filters.isRead === undefined ? '' : String(filters.isRead)} onChange={e => setFilters(p => ({ ...p, isRead: e.target.value === '' ? undefined : e.target.value === 'true' }))}>
          <option value="">All Status</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
        <button onClick={() => setFilters({})}>Clear</button>
      </div>

      {error && <div style={{ padding: 12, background: '#fef2f2', color: '#dc2626', borderRadius: 4, marginBottom: 16 }}>{error}</div>}

      <DataTable
        data={notifications}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={page => setPagination(p => ({ ...p, page }))}
        onPageSizeChange={size => setPagination(p => ({ ...p, size, page: 1 }))}
      />

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Notification Details" size="md">
        {selectedNotification && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><strong>Type:</strong> {selectedNotification.notificationType?.replace(/_/g, ' ')}</div>
            <div><strong>Title:</strong> {selectedNotification.title}</div>
            <div><strong>Message:</strong><p style={{ marginTop: 4, whiteSpace: 'pre-wrap' }}>{selectedNotification.message}</p></div>
            <div><strong>Created:</strong> {new Date(selectedNotification.createdAt).toLocaleString()}</div>
            {selectedNotification.actionUrl && (
              <button onClick={() => window.open(selectedNotification.actionUrl, '_blank')} style={{ padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Go to Action</button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default NotificationsPage;
