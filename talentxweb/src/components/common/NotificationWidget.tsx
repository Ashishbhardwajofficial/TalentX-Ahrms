import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationApi, { SystemNotificationDTO } from '../../api/notificationApi';

interface NotificationWidgetProps {
  userId?: number;
  maxItems?: number;
}

const NotificationWidget: React.FC<NotificationWidgetProps> = ({
  userId,
  maxItems = 5
}) => {
  const [notifications, setNotifications] = useState<SystemNotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = userId
        ? await notificationApi.getUnreadNotifications(userId, { page: 0, size: maxItems })
        : await notificationApi.getNotifications({ page: 0, size: maxItems, isRead: false });

      setNotifications(response.content);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: SystemNotificationDTO) => {
    try {
      // Mark as read
      await notificationApi.markAsRead(notification.id);

      // Navigate to action URL if available
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }

      // Refresh notifications
      loadNotifications();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'COMPLIANCE_ALERT': return '⚖️';
      case 'APPROVAL_REQUEST': return '✋';
      case 'WARNING': return '⚠️';
      case 'ERROR': return '❌';
      case 'SUCCESS': return '✅';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'COMPLIANCE_ALERT': return '#ef4444';
      case 'APPROVAL_REQUEST': return '#f59e0b';
      case 'WARNING': return '#f59e0b';
      case 'ERROR': return '#ef4444';
      case 'SUCCESS': return '#10b981';
      default: return '#6b7280';
    }
  };

  const widgetStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '20px'
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    borderBottom: '1px solid #e5e7eb',
    paddingBottom: '8px'
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827'
  };

  const viewAllStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#3b82f6',
    textDecoration: 'none',
    cursor: 'pointer'
  };

  const notificationItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6',
    cursor: 'pointer'
  };

  const iconStyle: React.CSSProperties = {
    marginRight: '12px',
    fontSize: '16px',
    marginTop: '2px'
  };

  const contentStyle: React.CSSProperties = {
    flex: 1
  };

  const notificationTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
    marginBottom: '4px'
  };

  const notificationMessageStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    lineHeight: '1.4'
  };

  const timeStyle: React.CSSProperties = {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '4px'
  };

  const emptyStyle: React.CSSProperties = {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '14px',
    padding: '20px'
  };

  if (loading) {
    return (
      <div style={widgetStyle}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>Recent Notifications</h3>
        </div>
        <div style={emptyStyle}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={widgetStyle}>
      <div style={headerStyle}>
        <h3 style={titleStyle}>Recent Notifications</h3>
        <a
          style={viewAllStyle}
          onClick={() => navigate('/notifications')}
        >
          View All
        </a>
      </div>

      {notifications.length === 0 ? (
        <div style={emptyStyle}>
          No new notifications
        </div>
      ) : (
        <div>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              style={notificationItemStyle}
              onClick={() => handleNotificationClick(notification)}
            >
              <span
                style={{
                  ...iconStyle,
                  color: getNotificationColor(notification.notificationType)
                }}
              >
                {getNotificationIcon(notification.notificationType)}
              </span>
              <div style={contentStyle}>
                <div style={notificationTitleStyle}>
                  {notification.title}
                </div>
                <div style={notificationMessageStyle}>
                  {notification.message}
                </div>
                <div style={timeStyle}>
                  {new Date(notification.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationWidget;