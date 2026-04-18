// frontend/src/api/auditLogApi.ts
import apiClient from "./axiosClient";
import {
  AuditAction,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { createPaginatedResponse, simulateDelay } from "./mockData";

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// ============================================================================
// AUDIT LOG DTOs
// ============================================================================

export interface AuditLogDTO {
  id: number;
  organizationId: number;
  userId?: number;
  entityType: string;
  entityId: number;
  action: AuditAction;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  // Additional fields for display
  userName?: string;
  userEmail?: string;
}

export interface AuditLogSearchParams extends PaginationParams {
  organizationId?: number;
  userId?: number;
  entityType?: string;
  entityId?: number;
  action?: AuditAction;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface AuditLogSummaryDTO {
  totalLogs: number;
  byAction: Record<AuditAction, number>;
  byEntityType: Record<string, number>;
  byUser: Array<{ userId: number; userName: string; count: number }>;
}

// ============================================================================
// AUDIT LOG API CLIENT INTERFACE
// ============================================================================

export interface AuditLogApiClient {
  // Audit log retrieval
  getAuditLogs(params: AuditLogSearchParams): Promise<PaginatedResponse<AuditLogDTO>>;
  getAuditLog(id: number): Promise<AuditLogDTO>;
  getAuditLogsByEntity(entityType: string, entityId: number, params?: PaginationParams): Promise<PaginatedResponse<AuditLogDTO>>;
  getAuditLogsByUser(userId: number, params?: PaginationParams): Promise<PaginatedResponse<AuditLogDTO>>;

  // Audit log retrieval (aliases for consistency)
  getEntityAuditTrail(params: AuditLogSearchParams): Promise<PaginatedResponse<AuditLogDTO>>;
  getUserActivity(params: AuditLogSearchParams): Promise<PaginatedResponse<AuditLogDTO>>;

  // Audit log reporting
  getAuditLogSummary(params: AuditLogSearchParams): Promise<AuditLogSummaryDTO>;
  exportAuditLogs(params: AuditLogSearchParams): Promise<Blob>;
}

// ============================================================================
// AUDIT LOG API CLIENT IMPLEMENTATION
// ============================================================================

class AuditLogApiClientImpl implements AuditLogApiClient {
  private readonly ENDPOINTS = {
    AUDIT_LOGS: '/audit-logs',
    AUDIT_LOG_BY_ID: (id: number) => `/audit-logs/${id}`,
    AUDIT_LOGS_BY_ENTITY: (entityType: string, entityId: number) => `/audit-logs/entity/${entityType}/${entityId}`,
    AUDIT_LOGS_BY_USER: (userId: number) => `/audit-logs/user/${userId}`,
    AUDIT_LOG_SUMMARY: '/audit-logs/summary',
    EXPORT_AUDIT_LOGS: '/audit-logs/export',
  } as const;

  // ============================================================================
  // AUDIT LOG RETRIEVAL METHODS
  // ============================================================================

  async getAuditLogs(params: AuditLogSearchParams): Promise<PaginatedResponse<AuditLogDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockAuditLogs } = await import('./mockData');

      let filtered = [...mockAuditLogs];

      if (params.organizationId) {
        filtered = filtered.filter(log => log.organizationId === params.organizationId);
      }
      if (params.userId) {
        filtered = filtered.filter(log => log.userId === params.userId);
      }
      if (params.entityType) {
        filtered = filtered.filter(log => log.entityType === params.entityType);
      }
      if (params.entityId) {
        filtered = filtered.filter(log => log.entityId === params.entityId);
      }
      if (params.action) {
        filtered = filtered.filter(log => log.action === params.action);
      }
      if (params.startDate) {
        filtered = filtered.filter(log => log.timestamp >= params.startDate!);
      }
      if (params.endDate) {
        filtered = filtered.filter(log => log.timestamp <= params.endDate!);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(log =>
          log.userName?.toLowerCase().includes(search) ||
          log.userEmail?.toLowerCase().includes(search) ||
          log.entityType.toLowerCase().includes(search)
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<AuditLogDTO>>(
      `${this.ENDPOINTS.AUDIT_LOGS}?${queryParams}`
    );
  }

  async getAuditLog(id: number): Promise<AuditLogDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockAuditLogs } = await import('./mockData');
      const log = mockAuditLogs.find(l => l.id === id);
      if (!log) {
        throw new Error(`Audit log with id ${id} not found`);
      }
      return log;
    }

    return apiClient.get<AuditLogDTO>(this.ENDPOINTS.AUDIT_LOG_BY_ID(id));
  }

  async getAuditLogsByEntity(
    entityType: string,
    entityId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<AuditLogDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockAuditLogs } = await import('./mockData');
      const filtered = mockAuditLogs.filter(
        log => log.entityType === entityType && log.entityId === entityId
      );
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<AuditLogDTO>>(
      `${this.ENDPOINTS.AUDIT_LOGS_BY_ENTITY(entityType, entityId)}?${queryParams}`
    );
  }

  async getAuditLogsByUser(
    userId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<AuditLogDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockAuditLogs } = await import('./mockData');
      const filtered = mockAuditLogs.filter(log => log.userId === userId);
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<AuditLogDTO>>(
      `${this.ENDPOINTS.AUDIT_LOGS_BY_USER(userId)}?${queryParams}`
    );
  }

  // ============================================================================
  // AUDIT LOG RETRIEVAL ALIASES
  // ============================================================================

  async getEntityAuditTrail(params: AuditLogSearchParams): Promise<PaginatedResponse<AuditLogDTO>> {
    // Alias for getAuditLogs with entity filtering
    return this.getAuditLogs(params);
  }

  async getUserActivity(params: AuditLogSearchParams): Promise<PaginatedResponse<AuditLogDTO>> {
    // Alias for getAuditLogs with user filtering
    return this.getAuditLogs(params);
  }

  // ============================================================================
  // AUDIT LOG REPORTING METHODS
  // ============================================================================

  async getAuditLogSummary(params: AuditLogSearchParams): Promise<AuditLogSummaryDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockAuditLogs } = await import('./mockData');

      let filtered = [...mockAuditLogs];

      if (params.organizationId) {
        filtered = filtered.filter(log => log.organizationId === params.organizationId);
      }
      if (params.startDate) {
        filtered = filtered.filter(log => log.timestamp >= params.startDate!);
      }
      if (params.endDate) {
        filtered = filtered.filter(log => log.timestamp <= params.endDate!);
      }

      const byAction: Record<string, number> = {};
      const byEntityType: Record<string, number> = {};
      const userCounts: Record<number, { userName: string; count: number }> = {};

      filtered.forEach(log => {
        byAction[log.action] = (byAction[log.action] || 0) + 1;
        byEntityType[log.entityType] = (byEntityType[log.entityType] || 0) + 1;

        if (log.userId) {
          if (!userCounts[log.userId]) {
            userCounts[log.userId] = { userName: log.userName || 'Unknown', count: 0 };
          }
          userCounts[log.userId]!.count++;
        }
      });

      const byUser = Object.entries(userCounts).map(([userId, data]) => ({
        userId: parseInt(userId),
        userName: data.userName,
        count: data.count
      }));

      return {
        totalLogs: filtered.length,
        byAction: byAction as Record<AuditAction, number>,
        byEntityType,
        byUser
      };
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<AuditLogSummaryDTO>(
      `${this.ENDPOINTS.AUDIT_LOG_SUMMARY}?${queryParams}`
    );
  }

  async exportAuditLogs(params: AuditLogSearchParams): Promise<Blob> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockAuditLogs } = await import('./mockData');

      let filtered = [...mockAuditLogs];

      if (params.organizationId) {
        filtered = filtered.filter(log => log.organizationId === params.organizationId);
      }
      if (params.startDate) {
        filtered = filtered.filter(log => log.timestamp >= params.startDate!);
      }
      if (params.endDate) {
        filtered = filtered.filter(log => log.timestamp <= params.endDate!);
      }

      // Create CSV content
      const headers = ['ID', 'Timestamp', 'User', 'Action', 'Entity Type', 'Entity ID', 'IP Address'];
      const rows = filtered.map(log => [
        log.id,
        log.timestamp,
        log.userName || 'System',
        log.action,
        log.entityType,
        log.entityId,
        log.ipAddress || 'N/A'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');

      return new Blob([csvContent], { type: 'text/csv' });
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<Blob>(
      `${this.ENDPOINTS.EXPORT_AUDIT_LOGS}?${queryParams}`,
      { responseType: 'blob' }
    );
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

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

// ============================================================================
// EXPORTS
// ============================================================================

const auditLogApi = new AuditLogApiClientImpl();

export default auditLogApi;

export { AuditLogApiClientImpl };
