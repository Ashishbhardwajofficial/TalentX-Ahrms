// frontend/src/api/notificationApi.ts
import apiClient from "./axiosClient";
import {
  SystemNotification,
  NotificationType,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { createPaginatedResponse } from "./mockData";

// Notification API request/response types
export interface SystemNotificationDTO {
  id: number;
  organizationId: number;
  userId?: number;
  notificationType: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export interface NotificationCreateDTO {
  organizationId: number;
  userId?: number;
  notificationType: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  expiresAt?: string;
}

export interface NotificationUpdateDTO {
  isRead?: boolean;
  readAt?: string;
}

export interface NotificationSearchParams extends PaginationParams {
  organizationId?: number | undefined;
  userId?: number | undefined;
  notificationType?: NotificationType | undefined;
  isRead?: boolean | undefined;
  createdAfter?: string | undefined;
  createdBefore?: string | undefined;
  expiresAfter?: string | undefined;
  expiresBefore?: string | undefined;
}

export interface NotificationStats {
  totalNotifications: number;
  unreadCount: number;
  readCount: number;
  expiredCount: number;
  byType: Record<NotificationType, number>;
}

// Notification API client interface
export interface NotificationApiClient {
  getNotifications(params: NotificationSearchParams): Promise<PaginatedResponse<SystemNotificationDTO>>;
  getNotification(id: number): Promise<SystemNotificationDTO>;
  createNotification(data: NotificationCreateDTO): Promise<SystemNotificationDTO>;
  markAsRead(id: number): Promise<SystemNotificationDTO>;
  markAllAsRead(userId?: number): Promise<void>;
  deleteNotification(id: number): Promise<void>;
  getUnreadCount(userId?: number): Promise<number>;
  getNotificationStats(userId?: number): Promise<NotificationStats>;
  getUserNotifications(userId: number, params?: PaginationParams): Promise<PaginatedResponse<SystemNotificationDTO>>;
  getUnreadNotifications(userId: number, params?: PaginationParams): Promise<PaginatedResponse<SystemNotificationDTO>>;
}

// Implementation of notification API client
class NotificationApiClientImpl implements NotificationApiClient {
  private readonly ENDPOINTS = {
    BASE: '/notifications',
    BY_ID: (id: number) => `/notifications/${id}`,
    MARK_READ: (id: number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    UNREAD_COUNT: '/notifications/unread-count',
    STATS: '/notifications/stats',
    USER_NOTIFICATIONS: (userId: number) => `/notifications/user/${userId}`,
    UNREAD_NOTIFICATIONS: (userId: number) => `/notifications/user/${userId}/unread`
  } as const;

  private arrayToPage<T>(
    items: T[],
    page: number = 0,
    size: number = items.length || 10
  ): PaginatedResponse<T> {
    return createPaginatedResponse(items, page, size);
  }

  /**
   * Get paginated list of notifications with filtering and sorting
   */
  async getNotifications(params: NotificationSearchParams): Promise<PaginatedResponse<SystemNotificationDTO>> {
    const queryParams = this.buildQueryParams(params);
    // Backend requires userId param
    const notifications = await apiClient.get<SystemNotificationDTO[]>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
    return this.arrayToPage(notifications, params.page ?? 0, params.size ?? 10);
  }

  /**
   * Get single notification by ID
   */
  async getNotification(id: number): Promise<SystemNotificationDTO> {
    return apiClient.get<SystemNotificationDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new notification
   */
  async createNotification(data: NotificationCreateDTO): Promise<SystemNotificationDTO> {
    return apiClient.post<SystemNotificationDTO>(this.ENDPOINTS.BASE, data);
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: number): Promise<SystemNotificationDTO> {
    return apiClient.put<SystemNotificationDTO>(this.ENDPOINTS.MARK_READ(id), {
      isRead: true,
      readAt: new Date().toISOString()
    });
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId?: number): Promise<void> {
    const params = userId ? `?userId=${userId}` : '';
    return apiClient.put<void>(`${this.ENDPOINTS.MARK_ALL_READ}${params}`, {});
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: number): Promise<void> {
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Get unread notification count for a user
   * If userId is undefined, backend auto-resolves from JWT token
   */
  async getUnreadCount(userId?: number): Promise<number> {
    // Don't append userId=undefined to URL — let backend resolve from JWT
    const params = (userId !== undefined && userId !== null) ? `?userId=${userId}` : '';
    const response = await apiClient.get<{ count: number; unreadCount?: number }>(
      `${this.ENDPOINTS.UNREAD_COUNT}${params}`
    );
    return response.unreadCount ?? response.count ?? 0;
  }

  /**
   * Get notification statistics for a user
   */
  async getNotificationStats(userId?: number): Promise<NotificationStats> {
    const params = userId ? `?userId=${userId}` : '';
    return apiClient.get<NotificationStats>(`${this.ENDPOINTS.STATS}${params}`);
  }

  /**
   * Get notifications for a specific user
   */
  async getUserNotifications(
    userId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<SystemNotificationDTO>> {
    const queryParams = this.buildQueryParams(params);
    const notifications = await apiClient.get<SystemNotificationDTO[]>(
      `${this.ENDPOINTS.BASE}?userId=${userId}&${queryParams}`
    );
    return this.arrayToPage(notifications, params.page ?? 0, params.size ?? 10);
  }

  /**
   * Get unread notifications for a specific user
   */
  async getUnreadNotifications(
    userId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<SystemNotificationDTO>> {
    const queryParams = this.buildQueryParams(params);
    const notifications = await apiClient.get<SystemNotificationDTO[]>(
      `${this.ENDPOINTS.UNREAD_NOTIFICATIONS(userId)}?${queryParams}`
    );
    return this.arrayToPage(notifications, params.page ?? 0, params.size ?? 10);
  }

  /**
   * Build query parameters string from search params
   */
  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(item => searchParams.append(key, item.toString()));
        } else {
          searchParams.append(key, value.toString());
        }
      }
    });

    return searchParams.toString();
  }
}

// Create and export singleton instance
const notificationApi = new NotificationApiClientImpl();

export default notificationApi;

// Export the class for testing purposes
export { NotificationApiClientImpl };
