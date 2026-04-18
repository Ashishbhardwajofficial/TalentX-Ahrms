import React from 'react';
import {
  useAttendanceContext,
  useNotificationContext,
  useComplianceContext
} from '../../context';

/**
 * Example component demonstrating how to use the new context providers
 * This is for demonstration purposes only
 */
export const ContextExample: React.FC = () => {
  const {
    isCheckedIn,
    checkInTime,
    totalHours,
    loading: attendanceLoading,
    checkIn,
    checkOut,
    refreshAttendance
  } = useAttendanceContext();

  const {
    unreadCount,
    notifications,
    loading: notificationLoading,
    markAsRead,
    markAllAsRead,
    loadNotifications
  } = useNotificationContext();

  const {
    unresolvedCount,
    complianceScore,
    criticalViolations,
    loading: complianceLoading,
    refreshCompliance,
    resolveViolation
  } = useComplianceContext();

  const handleCheckIn = async () => {
    try {
      await checkIn('Office', 1, 'Regular check-in');
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const handleCheckOut = async () => {
    try {
      await checkOut('End of day', 1);
    } catch (error) {
      console.error('Check-out failed:', error);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleResolveViolation = async (violationId: number) => {
    try {
      await resolveViolation(violationId, 'Issue resolved by admin');
    } catch (error) {
      console.error('Failed to resolve violation:', error);
    }
  };

  return (
    <div className="context-example">
      <h2>Context Providers Example</h2>

      {/* Attendance Section */}
      <div className="attendance-section">
        <h3>Attendance Status</h3>
        <p>Status: {isCheckedIn ? 'Checked In' : 'Checked Out'}</p>
        {checkInTime && <p>Check-in Time: {new Date(checkInTime).toLocaleTimeString()}</p>}
        <p>Total Hours: {totalHours}</p>

        <div className="attendance-actions">
          <button
            onClick={handleCheckIn}
            disabled={isCheckedIn || attendanceLoading}
          >
            Check In
          </button>
          <button
            onClick={handleCheckOut}
            disabled={!isCheckedIn || attendanceLoading}
          >
            Check Out
          </button>
          <button onClick={refreshAttendance} disabled={attendanceLoading}>
            Refresh
          </button>
        </div>
      </div>

      {/* Notifications Section */}
      <div className="notifications-section">
        <h3>Notifications</h3>
        <p>Unread Count: {unreadCount}</p>
        <p>Total Notifications: {notifications.length}</p>

        <div className="notification-actions">
          <button onClick={() => loadNotifications(10)} disabled={notificationLoading}>
            Load Notifications
          </button>
          <button onClick={handleMarkAllNotificationsRead} disabled={notificationLoading}>
            Mark All Read
          </button>
        </div>

        <div className="notifications-list">
          {notifications.slice(0, 3).map(notification => (
            <div key={notification.id} className="notification-item">
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
              <span className={`status ${notification.isRead ? 'read' : 'unread'}`}>
                {notification.isRead ? 'Read' : 'Unread'}
              </span>
              {!notification.isRead && (
                <button onClick={() => markAsRead(notification.id)}>
                  Mark as Read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Section */}
      <div className="compliance-section">
        <h3>Compliance Status</h3>
        <p>Compliance Score: {complianceScore}%</p>
        <p>Unresolved Violations: {unresolvedCount}</p>
        <p>Critical Violations: {criticalViolations.length}</p>

        <div className="compliance-actions">
          <button onClick={refreshCompliance} disabled={complianceLoading}>
            Refresh Compliance
          </button>
        </div>

        <div className="violations-list">
          {criticalViolations.slice(0, 2).map(violation => (
            <div key={violation.id} className="violation-item">
              <h4>Critical Violation</h4>
              <p>Severity: {violation.severity}</p>
              <p>Status: {violation.resolved ? 'Resolved' : 'Unresolved'}</p>
              {!violation.resolved && (
                <button onClick={() => handleResolveViolation(violation.id)}>
                  Resolve
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContextExample;