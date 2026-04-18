import React from 'react';
import { useNotifications, Notification } from '../../services/notification';

const NotificationContainer: React.FC = () => {
  const { notifications, remove } = useNotifications();

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  };

  const getNotificationClass = (type: Notification['type']) => {
    return `notification notification-${type}`;
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={getNotificationClass(notification.type)}
          role="alert"
          aria-live="polite"
        >
          <div className="notification-content">
            <div className="notification-icon">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="notification-body">
              {notification.title && (
                <div className="notification-title">
                  {notification.title}
                </div>
              )}
              <div className="notification-message">
                {notification.message}
              </div>
            </div>
            <button
              className="notification-close"
              onClick={() => remove(notification.id)}
              aria-label="Close notification"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;