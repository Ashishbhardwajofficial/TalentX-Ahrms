// Notification Service for user feedback
import { useState, useEffect } from 'react';

export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number; // in milliseconds, 0 for persistent
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export interface Notification {
  id: string;
  timestamp: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private idCounter = 0;

  // Add a new notification
  show(options: NotificationOptions): string {
    const duration = options.duration ?? (options.type === 'error' ? 0 : 5000);
    const notification: Notification = {
      id: `notification-${++this.idCounter}`,
      timestamp: Date.now(),
      type: options.type,
      ...(options.title !== undefined && { title: options.title }),
      message: options.message,
      duration: duration,
      position: options.position ?? 'top-right'
    };

    this.notifications.push(notification);
    this.notifyListeners();

    // Auto-remove notification after duration (if not persistent)
    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }

    return notification.id;
  }

  // Remove a notification by ID
  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  // Clear all notifications
  clear(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  // Get all current notifications
  getAll(): Notification[] {
    return [...this.notifications];
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners of changes
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Convenience methods for different notification types
  success(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'success', message, ...(title !== undefined && { title }), ...(duration !== undefined && { duration }) });
  }

  error(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'error', message, ...(title !== undefined && { title }), ...(duration !== undefined && { duration }) });
  }

  warning(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'warning', message, ...(title !== undefined && { title }), ...(duration !== undefined && { duration }) });
  }

  info(message: string, title?: string, duration?: number): string {
    return this.show({ type: 'info', message, ...(title !== undefined && { title }), ...(duration !== undefined && { duration }) });
  }
}

// Create and export singleton instance
export const notificationService = new NotificationService();

// React hook for using notifications
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(setNotifications);
    setNotifications(notificationService.getAll());

    return unsubscribe;
  }, []);

  return {
    notifications,
    show: notificationService.show.bind(notificationService),
    remove: notificationService.remove.bind(notificationService),
    clear: notificationService.clear.bind(notificationService),
    success: notificationService.success.bind(notificationService),
    error: notificationService.error.bind(notificationService),
    warning: notificationService.warning.bind(notificationService),
    info: notificationService.info.bind(notificationService)
  };
};

export default notificationService;