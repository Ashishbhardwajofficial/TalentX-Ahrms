import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Inbox, Clock, ChevronRight, X } from 'lucide-react';
import notificationApi, { SystemNotificationDTO } from '../../api/notificationApi';
import { NotificationType } from '../../types';
import Button from './Button';

interface NotificationBellProps {
  userId: number | undefined;
  refreshInterval?: number;
  maxDisplayCount?: number;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  userId,
  refreshInterval = 30000,
  maxDisplayCount = 5
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<SystemNotificationDTO[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const loadNotificationData = useCallback(async () => {
    try {
      setLoading(true);
      // Pass userId only if defined — backend auto-resolves from JWT if not provided
      const count = await notificationApi.getUnreadCount(userId ?? undefined);
      setUnreadCount(count);

      if (userId) {
        const response = await notificationApi.getUnreadNotifications(userId, {
          page: 0,
          size: maxDisplayCount
        });
        setRecentNotifications(response.content ?? []);
      }
    } catch (error) {
      // Silent fail — don't spam console
    } finally {
      setLoading(false);
    }
  }, [userId, maxDisplayCount]);

  useEffect(() => {
    loadNotificationData();
    const interval = setInterval(loadNotificationData, refreshInterval);
    return () => clearInterval(interval);
  }, [loadNotificationData, refreshInterval]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification: SystemNotificationDTO) => {
    try {
      if (!notification.isRead) {
        await notificationApi.markAsRead(notification.id);
        setUnreadCount(prev => Math.max(0, prev - 1));
        setRecentNotifications(prev =>
          prev.map(n =>
            n.id === notification.id
              ? { ...n, isRead: true, readAt: new Date().toISOString() }
              : n
          )
        );
      }
      if (notification.actionUrl) {
        navigate(notification.actionUrl);
      }
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Notification dispatch error:', error);
    }
  };

  const handleMarkAllReadClick = async () => {
    try {
      await notificationApi.markAllAsRead(userId);
      setUnreadCount(0);
      setRecentNotifications(prev =>
        prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Bulk read protocol failure:', error);
    }
  };

  const getTypeConfig = (type: NotificationType) => {
    switch (type) {
      case NotificationType.SUCCESS:
        return { color: 'text-success-500', bg: 'bg-success-500/10' };
      case NotificationType.WARNING:
        return { color: 'text-warning-500', bg: 'bg-warning-500/10' };
      case NotificationType.ERROR:
      case NotificationType.COMPLIANCE_ALERT:
        return { color: 'text-danger-500', bg: 'bg-danger-500/10' };
      case NotificationType.APPROVAL_REQUEST:
        return { color: 'text-primary-500', bg: 'bg-primary-500/10' };
      default:
        return { color: 'text-secondary-400', bg: 'bg-secondary-400/10' };
    }
  };

  const formatTimeAgo = (dateString: string): string => {
    const diff = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`w-10 h-10 rounded-2xl transition-all duration-300 center group overflow-hidden ${isDropdownOpen ? 'bg-primary-600 text-white shadow-glow translate-y-[-2px]' : 'bg-secondary-100/50 dark:bg-white/5 border border-secondary-200 dark:border-white/5 text-secondary-600 dark:text-secondary-400 hover:bg-white/10 hover:text-primary-500 focus-ring'}`}
      >
        <Bell className={`w-5 h-5 transition-transform duration-500 ${isDropdownOpen ? 'scale-110' : 'group-hover:rotate-12'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger-500 rounded-full border-2 border-white dark:border-secondary-900 shadow-sm animate-pulse" />
        )}
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-3 w-96 premium-card p-0 animate-slide-up z-[100] bg-secondary-900 border-primary-500/50 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-white/5 relative overflow-hidden group/header">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-[50px] rounded-full group-hover/header:bg-primary-600/20 transition-all duration-1000" />
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-8 h-8 rounded-xl bg-primary-600/20 center text-primary-500">
                <Inbox className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white italic uppercase tracking-tighter">Personnel Inbox</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest">{unreadCount} Pending Actions</span>
                </div>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllReadClick}
                className="relative z-10 p-2 rounded-lg hover:bg-white/10 text-secondary-400 hover:text-white transition-all group/bulk"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4 transition-transform group-hover/bulk:scale-110" />
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[420px] overflow-y-auto no-scrollbar py-2">
            {loading && recentNotifications.length === 0 ? (
              <div className="py-12 center flex-col gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-primary-500 border-t-transparent animate-spin" />
                <span className="text-[10px] font-black uppercase tracking-widest text-secondary-500">Syncing Registry...</span>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="py-20 center flex-col gap-4 opacity-30 italic">
                <Inbox className="w-10 h-10 mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Atmospheric Silence</p>
                <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-secondary-600 italic">No urgent intel required</p>
              </div>
            ) : (
              recentNotifications.map((notification) => {
                const config = getTypeConfig(notification.notificationType);
                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="px-6 py-4 hover:bg-white/5 cursor-pointer transition-all border-l-4 border-l-transparent hover:border-l-primary-500 group/notif relative overflow-hidden"
                  >
                    {!notification.isRead && (
                      <div className="absolute top-0 left-0 w-full h-full bg-primary-600/5" />
                    )}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className={`w-10 h-10 rounded-2xl center ${config.bg} flex-shrink-0 group-hover/notif:scale-110 transition-transform duration-500`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')} shadow-glow`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <h4 className={`text-xs font-black tracking-tight leading-tight uppercase transition-colors ${notification.isRead ? 'text-secondary-400' : 'text-white'}`}>
                            {notification.title}
                          </h4>
                          <span className="text-[9px] font-bold text-secondary-500 center gap-1 whitespace-nowrap">
                            <Clock className="w-2.5 h-2.5" />
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        <p className={`text-[11px] font-medium leading-relaxed mt-1 line-clamp-2 transition-colors ${notification.isRead ? 'text-secondary-500' : 'text-secondary-300 italic'}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${config.bg} ${config.color} border-current/20`}>
                            {notification.notificationType.replace(/_/g, ' ')}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-primary-500 opacity-0 group-hover/notif:opacity-100 translate-x-[-10px] group-hover/notif:translate-x-0 transition-all duration-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-white/5 border-t border-white/5">
            <Button
              variant="glass"
              fullWidth
              size="sm"
              onClick={() => {
                navigate('/notifications');
                setIsDropdownOpen(false);
              }}
              className="font-black uppercase tracking-widest text-[9px] h-10"
            >
              Access Complete Archive
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
