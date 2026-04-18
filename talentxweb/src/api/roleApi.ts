// frontend/src/api/roleApi.ts
import apiClient from "./axiosClient";
import {
  Role,
  Permission,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { mockRoles, createPaginatedResponse, simulateDelay } from "./mockData";

// Check if mock mode is enabled
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Role API request/response types
export interface RoleDTO {
  id: number;
  organizationId: number;
  name: string;
  code: string;
  description?: string;
  isSystemRole: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleCreateDTO {
  organizationId: number;
  name: string;
  code: string;
  description?: string;
  permissionIds?: number[];
}

export interface RoleUpdateDTO {
  name?: string;
  code?: string;
  description?: string;
}

export interface RoleSearchParams extends PaginationParams {
  organizationId?: number;
  isSystemRole?: boolean;
  search?: string; // Search by name or code
}

export interface PermissionDTO {
  id: number;
  name: string;
  code: string;
  category?: string;
  description?: string;
  createdAt: string;
}

export interface PermissionAssignmentRequest {
  permissionId: number;
}

export interface PermissionsByCategoryResponse {
  [category: string]: PermissionDTO[];
}

// Role API client interface
export interface RoleApiClient {
  getRoles(params: RoleSearchParams): Promise<PaginatedResponse<RoleDTO>>;
  getRole(id: number): Promise<RoleDTO>;
  createRole(data: RoleCreateDTO): Promise<RoleDTO>;
  updateRole(id: number, data: RoleUpdateDTO): Promise<RoleDTO>;
  deleteRole(id: number): Promise<void>;
  assignPermission(roleId: number, permissionId: number): Promise<RoleDTO>;
  removePermission(roleId: number, permissionId: number): Promise<RoleDTO>;
  getPermissions(): Promise<PermissionDTO[]>;
  getPermissionsByCategory(): Promise<PermissionsByCategoryResponse>;
}

// Implementation of role API client
class RoleApiClientImpl implements RoleApiClient {
  private readonly ENDPOINTS = {
    BASE: '/roles',
    BY_ID: (id: number) => `/roles/${id}`,
    ASSIGN_PERMISSION: (roleId: number) => `/roles/${roleId}/permissions`,
    REMOVE_PERMISSION: (roleId: number, permissionId: number) => `/roles/${roleId}/permissions/${permissionId}`,
    PERMISSIONS: '/permissions',
    PERMISSIONS_BY_CATEGORY: '/permissions/categories'
  } as const;

  /**
   * Get paginated list of roles with filtering and sorting
   */
  async getRoles(params: RoleSearchParams): Promise<PaginatedResponse<RoleDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockRoles];

      // Apply filters
      if (params.organizationId) {
        filtered = filtered.filter(r => r.organizationId === params.organizationId);
      }
      if (params.isSystemRole !== undefined) {
        filtered = filtered.filter(r => r.isSystemRole === params.isSystemRole);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(r =>
          r.name.toLowerCase().includes(searchLower) ||
          r.code.toLowerCase().includes(searchLower)
        );
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<RoleDTO>>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
  }

  /**
   * Get single role by ID
   */
  async getRole(id: number): Promise<RoleDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const role = mockRoles.find(r => r.id === id);
      if (!role) {
        throw new Error(`Role with ID ${id} not found`);
      }
      return role;
    }

    // Real API call
    return apiClient.get<RoleDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new role
   */
  async createRole(data: RoleCreateDTO): Promise<RoleDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const newRole: RoleDTO = {
        id: mockRoles.length + 1,
        organizationId: data.organizationId,
        name: data.name,
        code: data.code,
        permissions: [],
        isSystemRole: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(data.description && { description: data.description })
      };
      mockRoles.push(newRole);
      return newRole;
    }

    // Real API call
    return apiClient.post<RoleDTO>(this.ENDPOINTS.BASE, data);
  }

  /**
   * Update existing role
   */
  async updateRole(id: number, data: RoleUpdateDTO): Promise<RoleDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockRoles.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Role with ID ${id} not found`);
      }

      const existingRole = mockRoles[index];
      if (!existingRole) {
        throw new Error(`Role with ID ${id} not found`);
      }

      const updated: RoleDTO = {
        ...existingRole,
        updatedAt: new Date().toISOString()
      };

      if (data.name !== undefined) updated.name = data.name;
      if (data.code !== undefined) updated.code = data.code;
      if (data.description !== undefined && data.description) updated.description = data.description;

      mockRoles[index] = updated;
      return updated;
    }

    // Real API call
    return apiClient.put<RoleDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete role
   */
  async deleteRole(id: number): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockRoles.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Role with ID ${id} not found`);
      }
      mockRoles.splice(index, 1);
      return;
    }

    // Real API call
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Assign permission to role
   */
  async assignPermission(roleId: number, permissionId: number): Promise<RoleDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const role = mockRoles.find(r => r.id === roleId);
      if (!role) {
        throw new Error(`Role with ID ${roleId} not found`);
      }
      // In mock mode, just return the role as-is
      return role;
    }

    // Real API call
    return apiClient.post<RoleDTO>(
      this.ENDPOINTS.ASSIGN_PERMISSION(roleId),
      { permissionId }
    );
  }

  /**
   * Remove permission from role
   */
  async removePermission(roleId: number, permissionId: number): Promise<RoleDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const role = mockRoles.find(r => r.id === roleId);
      if (!role) {
        throw new Error(`Role with ID ${roleId} not found`);
      }
      // In mock mode, just return the role as-is
      return role;
    }

    // Real API call
    return apiClient.delete<RoleDTO>(
      this.ENDPOINTS.REMOVE_PERMISSION(roleId, permissionId)
    );
  }

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<PermissionDTO[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      // Return empty array for mock mode
      return [];
    }

    // Real API call
    return apiClient.get<PermissionDTO[]>(this.ENDPOINTS.PERMISSIONS);
  }

  /**
   * Get permissions grouped by category
   */
  async getPermissionsByCategory(): Promise<PermissionsByCategoryResponse> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      // Return empty object for mock mode
      return {};
    }

    // Real API call
    return apiClient.get<PermissionsByCategoryResponse>(
      this.ENDPOINTS.PERMISSIONS_BY_CATEGORY
    );
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
const roleApi = new RoleApiClientImpl();

export default roleApi;

// Export the class for testing purposes
export { RoleApiClientImpl };
