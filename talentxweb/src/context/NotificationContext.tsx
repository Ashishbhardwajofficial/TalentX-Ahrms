import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { SystemNotification, NotificationType } from '../types';
import notificationApi, { SystemNotificationDTO, NotificationStats } from '../api/notificationApi';
import { useAuthContext } from './AuthContext';

// Notification state interface
interface NotificationState {
  notifications: SystemNotificationDTO[];
  unreadCount: number;
  stats: NotificationStats | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  realTimeEnabled: boolean;
}

// Notification actions
type NotificationAction =
  | { type: 'NOTIFICATIONS_LOADING' }
  | { type: 'NOTIFICATIONS_SUCCESS'; payload: SystemNotificationDTO[] }
  | { type: 'UNREAD_COUNT_SUCCESS'; payload: number }
  | { type: 'STATS_SUCCESS'; payload: NotificationStats }
  | { type: 'NOTIFICATION_MARKED_READ'; payload: number }
  | { type: 'ALL_NOTIFICATIONS_MARKED_READ' }
  | { type: 'NEW_NOTIFICATION'; payload: SystemNotificationDTO }
  | { type: 'NOTIFICATION_REMOVED'; payload: number }
  | { type: 'NOTIFICATIONS_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_REAL_TIME'; payload: boolean }
  | { type: 'RESET_NOTIFICATIONS' };

// Notification context interface
export interface NotificationContextType extends NotificationState {
  loadNotifications: (limit?: number) => Promise<void>;
  markAsRead: (notificationId: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: number) => Promise<void>;
  refreshUnreadCount: () => Promise<void>;
  refreshStats: () => Promise<void>;
  clearError: () => void;
  enableRealTime: () => void;
  disableRealTime: () => void;
  resetNotifications: () => void;
}

// Initial state
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  stats: null,
  loading: false,
  error: null,
  lastUpdated: null,
  realTimeEnabled: false,
};

// Notification reducer
const notificationReducer = (state: NotificationState, action: NotificationAction): NotificationState => {
  switch (action.type) {
    case 'NOTIFICATIONS_LOADING':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'NOTIFICATIONS_SUCCESS':
      return {
        ...state,
        notifications: action.payload,
        loading: false,
        error: null,
        lastUpdated: new Date().toISOString(),
      };
    case 'UNREAD_COUNT_SUCCESS':
      return {
        ...state,
        unreadCount: action.payload,
        lastUpdated: new Date().toISOString(),
      };
    case 'STATS_SUCCESS':
      return {
        ...state,
        stats: action.payload,
        lastUpdated: new Date().toISOString(),
      };
    case 'NOTIFICATION_MARKED_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
        lastUpdated: new Date().toISOString(),
      };
    case 'ALL_NOTIFICATIONS_MARKED_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString(),
        })),
        unreadCount: 0,
        lastUpdated: new Date().toISOString(),
      };
    case 'NEW_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: action.payload.isRead ? state.unreadCount : state.unreadCount + 1,
        lastUpdated: new Date().toISOString(),
      };
    case 'NOTIFICATION_REMOVED':
      const removedNotification = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
        unreadCount: removedNotification && !removedNotification.isRead
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
        lastUpdated: new Date().toISOString(),
      };
    case 'NOTIFICATIONS_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_REAL_TIME':
      return {
        ...state,
        realTimeEnabled: action.payload,
      };
    case 'RESET_NOTIFICATIONS':
      return initialState;
    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Notification provider props
interface NotificationProviderProps {
  children: ReactNode;
  enableRealTimeUpdates?: boolean;
}

// Notification provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  enableRealTimeUpdates = true
}) => {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user, isAuthenticated } = useAuthContext();

  // Initialize notifications when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadNotifications();
      refreshUnreadCount();
      refreshStats();

      if (enableRealTimeUpdates) {
        enableRealTime();
      }
    } else {
      dispatch({ type: 'RESET_NOTIFICATIONS' });
    }
  }, [isAuthenticated, user, enableRealTimeUpdates]);

  // Real-time updates polling
  useEffect(() => {
    if (state.realTimeEnabled && isAuthenticated && user) {
      const interval = setInterval(() => {
        refreshUnreadCount();
        // Only refresh notifications if we have a small number to avoid performance issues
        if (state.notifications.length <= 50) {
          loadNotifications(50);
        }
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
    return undefined;
  }, [state.realTimeEnabled, isAuthenticated, user, state.notifications.length]);

  // Load notifications function
  const loadNotifications = useCallback(async (limit: number = 20): Promise<void> => {
    if (!user) {
      return;
    }

    dispatch({ type: 'NOTIFICATIONS_LOADING' });

    try {
      const response = await notificationApi.getUserNotifications(user.id, {
        page: 0,
        size: limit,
        sort: 'createdAt',
        direction: 'desc'
      });

      dispatch({
        type: 'NOTIFICATIONS_SUCCESS',
        payload: response.content,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load notifications';
      dispatch({
        type: 'NOTIFICATIONS_ERROR',
        payload: errorMessage,
      });
    }
  }, [user]);

  // Mark notification as read function
  const markAsRead = async (notificationId: number): Promise<void> => {
    try {
      await notificationApi.markAsRead(notificationId);

      dispatch({
        type: 'NOTIFICATION_MARKED_READ',
        payload: notificationId,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark notification as read';
      dispatch({
        type: 'NOTIFICATIONS_ERROR',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Mark all notifications as read function
  const markAllAsRead = async (): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      await notificationApi.markAllAsRead(user.id);

      dispatch({ type: 'ALL_NOTIFICATIONS_MARKED_READ' });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to mark all notifications as read';
      dispatch({
        type: 'NOTIFICATIONS_ERROR',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Delete notification function
  const deleteNotification = async (notificationId: number): Promise<void> => {
    try {
      await notificationApi.deleteNotification(notificationId);

      dispatch({
        type: 'NOTIFICATION_REMOVED',
        payload: notificationId,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete notification';
      dispatch({
        type: 'NOTIFICATIONS_ERROR',
        payload: errorMessage,
      });
      throw error;
    }
  };

  // Refresh unread count function
  const refreshUnreadCount = useCallback(async (): Promise<void> => {
    if (!user) {
      return;
    }

    try {
      const count = await notificationApi.getUnreadCount(user.id);

      dispatch({
        type: 'UNREAD_COUNT_SUCCESS',
        payload: count,
      });
    } catch (error) {
      // Silently fail for unread count refresh to avoid disrupting UX
      console.error('Failed to refresh unread count:', error);
    }
  }, [user]);

  // Refresh stats function
  const refreshStats = useCallback(async (): Promise<void> => {
    if (!user) {
      return;
    }

    try {
      const stats = await notificationApi.getNotificationStats(user.id);

      dispatch({
        type: 'STATS_SUCCESS',
        payload: stats,
      });
    } catch (error) {
      // Silently fail for stats refresh to avoid disrupting UX
      console.error('Failed to refresh notification stats:', error);
    }
  }, [user]);

  // Clear error function
  const clearError = (): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Enable real-time updates
  const enableRealTime = (): void => {
    dispatch({ type: 'SET_REAL_TIME', payload: true });
  };

  // Disable real-time updates
  const disableRealTime = (): void => {
    dispatch({ type: 'SET_REAL_TIME', payload: false });
  };

  // Reset notifications function
  const resetNotifications = (): void => {
    dispatch({ type: 'RESET_NOTIFICATIONS' });
  };

  const contextValue: NotificationContextType = {
    ...state,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshUnreadCount,
    refreshStats,
    clearError,
    enableRealTime,
    disableRealTime,
    resetNotifications,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use notification context
export const useNotificationContext = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};