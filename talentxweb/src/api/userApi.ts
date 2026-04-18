// frontend/src/api/userApi.ts
import apiClient from "./axiosClient";
import {
  User,
  RoleInfo,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { mockUsers, createPaginatedResponse, simulateDelay } from "./mockData";

// Check if mock mode is enabled
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// User API request/response types
export interface UserDTO {
  id: number;
  organizationId: number;
  email: string;
  username?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  organizationName?: string;
  roles: RoleInfo[];
}

export interface UserCreateDTO {
  organizationId: number;
  email: string;
  username?: string;
  password: string;
  isActive?: boolean;
  twoFactorEnabled?: boolean;
  roleIds?: number[];
}

export interface UserUpdateDTO {
  email?: string;
  username?: string;
  isActive?: boolean;
  isVerified?: boolean;
  twoFactorEnabled?: boolean;
}

export interface UserSearchParams extends PaginationParams {
  organizationId?: number;
  isActive?: boolean;
  isVerified?: boolean;
  search?: string; // Search by email or username
  roleId?: number;
}

export interface RoleAssignmentRequest {
  roleId: number;
}

// User API client interface
export interface UserApiClient {
  getUsers(params: UserSearchParams): Promise<PaginatedResponse<UserDTO>>;
  getUser(id: number): Promise<UserDTO>;
  createUser(data: UserCreateDTO): Promise<UserDTO>;
  updateUser(id: number, data: UserUpdateDTO): Promise<UserDTO>;
  deleteUser(id: number): Promise<void>;
  assignRole(userId: number, roleId: number): Promise<UserDTO>;
  removeRole(userId: number, roleId: number): Promise<UserDTO>;
  activateUser(userId: number): Promise<UserDTO>;
  deactivateUser(userId: number): Promise<UserDTO>;
  getUsersByRole(roleId: number, params?: PaginationParams): Promise<PaginatedResponse<UserDTO>>;
}

// Implementation of user API client
class UserApiClientImpl implements UserApiClient {
  private readonly ENDPOINTS = {
    BASE: '/users',
    BY_ID: (id: number) => `/users/${id}`,
    ASSIGN_ROLE: (userId: number) => `/users/${userId}/roles`,
    REMOVE_ROLE: (userId: number, roleId: number) => `/users/${userId}/roles/${roleId}`,
    ACTIVATE: (userId: number) => `/users/${userId}/activate`,
    DEACTIVATE: (userId: number) => `/users/${userId}/deactivate`,
    BY_ROLE: (roleId: number) => `/users/role/${roleId}`
  } as const;

  /**
   * Get paginated list of users with filtering and sorting
   */
  async getUsers(params: UserSearchParams): Promise<PaginatedResponse<UserDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockUsers];

      // Apply filters
      if (params.organizationId) {
        filtered = filtered.filter(u => u.organizationId === params.organizationId);
      }
      if (params.isActive !== undefined) {
        filtered = filtered.filter(u => u.isActive === params.isActive);
      }
      if (params.isVerified !== undefined) {
        filtered = filtered.filter(u => u.isVerified === params.isVerified);
      }
      if (params.roleId) {
        filtered = filtered.filter(u => u.roles.some(r => r.id === params.roleId));
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(u =>
          u.email.toLowerCase().includes(searchLower) ||
          u.username?.toLowerCase().includes(searchLower)
        );
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<UserDTO>>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
  }

  /**
   * Get single user by ID
   */
  async getUser(id: number): Promise<UserDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const user = mockUsers.find(u => u.id === id);
      if (!user) {
        throw new Error(`User with ID ${id} not found`);
      }
      return user;
    }

    // Real API call
    return apiClient.get<UserDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new user
   */
  async createUser(data: UserCreateDTO): Promise<UserDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const newUser: UserDTO = {
        id: mockUsers.length + 1,
        organizationId: data.organizationId,
        email: data.email,
        isActive: data.isActive ?? true,
        isVerified: false,
        twoFactorEnabled: data.twoFactorEnabled ?? false,
        roles: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(data.username && { username: data.username })
      };
      mockUsers.push(newUser);
      return newUser;
    }

    // Real API call
    return apiClient.post<UserDTO>(this.ENDPOINTS.BASE, data);
  }

  /**
   * Update existing user
   */
  async updateUser(id: number, data: UserUpdateDTO): Promise<UserDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error(`User with ID ${id} not found`);
      }

      const existingUser = mockUsers[index];
      if (!existingUser) {
        throw new Error(`User with ID ${id} not found`);
      }

      const updated: UserDTO = {
        ...existingUser,
        updatedAt: new Date().toISOString()
      };

      if (data.email !== undefined) updated.email = data.email;
      if (data.username !== undefined && data.username) updated.username = data.username;
      if (data.isActive !== undefined) updated.isActive = data.isActive;
      if (data.isVerified !== undefined) updated.isVerified = data.isVerified;
      if (data.twoFactorEnabled !== undefined) updated.twoFactorEnabled = data.twoFactorEnabled;

      mockUsers[index] = updated;
      return updated;
    }

    // Real API call
    return apiClient.put<UserDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete user
   */
  async deleteUser(id: number): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockUsers.findIndex(u => u.id === id);
      if (index === -1) {
        throw new Error(`User with ID ${id} not found`);
      }
      mockUsers.splice(index, 1);
      return;
    }

    // Real API call
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Assign role to user
   */
  async assignRole(userId: number, roleId: number): Promise<UserDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      // In mock mode, just return the user as-is
      return user;
    }

    // Real API call
    return apiClient.post<UserDTO>(
      this.ENDPOINTS.ASSIGN_ROLE(userId),
      { roleId }
    );
  }

  /**
   * Remove role from user
   */
  async removeRole(userId: number, roleId: number): Promise<UserDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const user = mockUsers.find(u => u.id === userId);
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }
      // In mock mode, just return the user as-is
      return user;
    }

    // Real API call
    return apiClient.delete<UserDTO>(this.ENDPOINTS.REMOVE_ROLE(userId, roleId));
  }

  /**
   * Activate user account
   */
  async activateUser(userId: number): Promise<UserDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockUsers.findIndex(u => u.id === userId);
      if (index === -1) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const user = mockUsers[index];
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const updated = { ...user, isActive: true, updatedAt: new Date().toISOString() };
      mockUsers[index] = updated;
      return updated;
    }

    // Real API call
    return apiClient.put<UserDTO>(this.ENDPOINTS.ACTIVATE(userId), {});
  }

  /**
   * Deactivate user account
   */
  async deactivateUser(userId: number): Promise<UserDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockUsers.findIndex(u => u.id === userId);
      if (index === -1) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const user = mockUsers[index];
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const updated = { ...user, isActive: false, updatedAt: new Date().toISOString() };
      mockUsers[index] = updated;
      return updated;
    }

    // Real API call
    return apiClient.put<UserDTO>(this.ENDPOINTS.DEACTIVATE(userId), {});
  }

  /**
   * Get users by role
   */
  async getUsersByRole(
    roleId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<UserDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const filtered = mockUsers.filter(u => u.roles.some(r => r.id === roleId));
      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call — backend endpoint uses role name string, not ID
    // We pass the roleId as a string since the backend accepts role names like "ADMIN", "HR"
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<UserDTO>>(
      `${this.ENDPOINTS.BY_ROLE(roleId)}?${queryParams}`
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
const userApi = new UserApiClientImpl();

export default userApi;

// Export the class for testing purposes
export { UserApiClientImpl };
