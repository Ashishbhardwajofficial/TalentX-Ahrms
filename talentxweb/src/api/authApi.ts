// frontend/src/api/authApi.ts
import apiClient from "./axiosClient";
import { LoginRequest, JwtResponse, User, RoleInfo } from "../types";

// Authentication API client interface
export interface AuthApiClient {
  login(credentials: LoginRequest): Promise<JwtResponse>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<User>;
  refreshToken(): Promise<JwtResponse>;
  validateToken(): Promise<boolean>;
}

// Authentication request/response types
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  token: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: number;
  organizationName: string;
  roles: string[];
  isEnabled: boolean;
  isAccountNonLocked: boolean;
  mustChangePassword: boolean;
}

// Storage keys - must match StorageService keys
const STORAGE_KEYS = {
  TOKEN: 'hrms_token',
  REFRESH_TOKEN: 'hrms_refresh_token',
  USER: 'hrms_user'
} as const;

// Implementation of authentication API client
class AuthApiClientImpl implements AuthApiClient {
  private readonly AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
    VALIDATE: '/auth/validate'
  } as const;

  /**
   * Authenticate user with username and password
   */
  async login(credentials: LoginRequest): Promise<JwtResponse> {
    try {
      const response = await apiClient.post<JwtResponse>(
        this.AUTH_ENDPOINTS.LOGIN,
        credentials
      );

      // Store tokens in localStorage using consistent keys
      if (response.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        if (response.refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        }
        // Construct User from flat JwtResponse fields and store
        const user: User = {
          id: response.userId,
          organizationId: response.organizationId,
          email: response.email,
          username: response.username,
          isActive: true,
          isVerified: true,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          organizationName: response.organizationName,
          roles: response.roles.map((roleName, index) => ({
            id: index + 1,
            name: roleName,
            isActive: true,
            assignedAt: new Date().toISOString(),
          })),
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }

      return response;
    } catch (error) {
      // Clear any existing tokens on login failure
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Logout current user and invalidate tokens
   */
  async logout(): Promise<void> {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        await apiClient.post<void>(this.AUTH_ENDPOINTS.LOGOUT, { token });
      }
    } catch (error) {
      // Log error but don't throw - we still want to clear local tokens
      console.warn('Logout request failed:', error);
    } finally {
      // Always clear local tokens
      this.clearTokens();
    }
  }

  /**
   * Get current authenticated user information
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await apiClient.get<UserResponse>(this.AUTH_ENDPOINTS.ME);

      // Convert UserResponse to User type
      const roles: RoleInfo[] = response.roles.map((roleName, index) => {
        const mappedRole: RoleInfo = {
          id: index + 1,
          name: roleName,
          isActive: true, // Default value - assuming active roles
          assignedAt: new Date().toISOString(), // Default value - current time
        };

        return mappedRole;
      });

      const user: User = {
        id: response.id,
        organizationId: response.organizationId,
        email: response.email,
        isActive: response.isEnabled,
        isVerified: true, // Default value
        twoFactorEnabled: false, // Default value
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        roles,
        organizationName: response.organizationName,
        mustChangePassword: response.mustChangePassword,
        accountLocked: !response.isAccountNonLocked,
        ...(response.username && { username: response.username }),
      };

      // Update stored user info using consistent key
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));

      return user;
    } catch (error) {
      // If getting current user fails, clear tokens
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Refresh authentication token using refresh token
   */
  async refreshToken(): Promise<JwtResponse> {
    const currentToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!currentToken) {
      throw new Error('No token available for refresh');
    }

    try {
      // Backend expects token in Authorization header, not body
      const response = await apiClient.post<JwtResponse>(
        this.AUTH_ENDPOINTS.REFRESH,
        {},
        {
          headers: {
            'Authorization': `Bearer ${currentToken}`
          }
        }
      );

      // Update stored tokens using consistent keys
      if (response.token) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
        if (response.refreshToken) {
          localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);
        }
        // Construct User from flat JwtResponse fields and store
        const user: User = {
          id: response.userId,
          organizationId: response.organizationId,
          email: response.email,
          username: response.username,
          isActive: true,
          isVerified: true,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          organizationName: response.organizationName,
          roles: response.roles.map((roleName, index) => ({
            id: index + 1,
            name: roleName,
            isActive: true,
            assignedAt: new Date().toISOString(),
          })),
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      }

      return response;
    } catch (error) {
      // Clear tokens if refresh fails
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Validate current token
   */
  async validateToken(): Promise<boolean> {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      return false;
    }

    try {
      await apiClient.get<{ valid: boolean }>(this.AUTH_ENDPOINTS.VALIDATE);
      return true;
    } catch (error) {
      // Token is invalid, clear it
      this.clearTokens();
      return false;
    }
  }

  /**
   * Clear all authentication tokens and user data from localStorage
   */
  private clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): User | null {
    try {
      const userStr = localStorage.getItem(STORAGE_KEYS.USER);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.warn('Failed to parse stored user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Get stored token
   */
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }
}

// Create and export singleton instance
const authApi = new AuthApiClientImpl();

export default authApi;

// Export the class for testing purposes
export { AuthApiClientImpl };
