import { LoginRequest, JwtResponse, User } from '../types';
import { StorageService } from './storage';

// Base API URL - must match axiosClient configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

// Auth service class
export class AuthService {
  private static readonly AUTH_ENDPOINTS = {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  };

  // Login method
  static async login(credentials: LoginRequest): Promise<JwtResponse> {
    const loginUrl = `${API_BASE_URL}${this.AUTH_ENDPOINTS.LOGIN}`;
    console.log('[AuthService] Login URL:', loginUrl);
    console.log('[AuthService] Credentials:', { username: credentials.username, password: '***' });

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      console.log('[AuthService] Response status:', response.status);
      console.log('[AuthService] Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AuthService] Error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Login failed' };
        }
        throw new Error(errorData.message || `Login failed with status ${response.status}`);
      }

      // Backend wraps response in ApiResponse { success, message, data }
      const responseText = await response.text();
      console.log('[AuthService] Raw response:', responseText);

      let apiResponse;
      try {
        apiResponse = JSON.parse(responseText);
      } catch (e) {
        console.error('[AuthService] Failed to parse response:', e);
        throw new Error('Invalid response from server');
      }

      console.log('[AuthService] Parsed response:', apiResponse);

      // Extract JwtResponse from ApiResponse.data
      if (apiResponse.success && apiResponse.data) {
        console.log('[AuthService] Returning data from ApiResponse.data');
        return apiResponse.data as JwtResponse;
      } else if (apiResponse.token) {
        // Fallback: if backend returns JwtResponse directly
        console.log('[AuthService] Returning direct JwtResponse');
        return apiResponse as JwtResponse;
      } else {
        console.error('[AuthService] Unexpected response format:', apiResponse);
        throw new Error(apiResponse.message || 'Login failed - unexpected response format');
      }
    } catch (error) {
      console.error('[AuthService] Login error:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error during login');
    }
  }

  // Logout method
  static async logout(): Promise<void> {
    try {
      const token = StorageService.getToken();
      if (!token) return;

      await fetch(`${API_BASE_URL}${this.AUTH_ENDPOINTS.LOGOUT}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Logout API call failed:', error);
      // Don't throw error for logout - we'll clear local storage anyway
    }
  }

  // Refresh token method - Backend expects token in Authorization header, not body
  static async refreshToken(currentToken: string): Promise<JwtResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}${this.AUTH_ENDPOINTS.REFRESH}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Token refresh failed');
      }

      // Backend wraps response in ApiResponse { success, message, data }
      const apiResponse = await response.json();

      // Extract JwtResponse from ApiResponse.data
      if (apiResponse.success && apiResponse.data) {
        return apiResponse.data as JwtResponse;
      } else if (apiResponse.token) {
        // Fallback: if backend returns JwtResponse directly
        return apiResponse as JwtResponse;
      } else {
        throw new Error(apiResponse.message || 'Token refresh failed');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error during token refresh');
    }
  }

  // Get current user method
  static async getCurrentUser(): Promise<User> {
    try {
      const token = StorageService.getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`${API_BASE_URL}${this.AUTH_ENDPOINTS.ME}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to get user information');
      }

      // Backend wraps response in ApiResponse { success, message, data }
      const apiResponse = await response.json();

      // Extract user data from ApiResponse.data
      if (apiResponse.success && apiResponse.data) {
        const userData = apiResponse.data;
        // Backend returns roles as string[], convert to RoleInfo[]
        const user: User = {
          id: userData.id,
          organizationId: userData.organizationId,
          email: userData.email,
          username: userData.username,
          isActive: userData.isEnabled ?? true,
          isVerified: true,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          organizationName: userData.organizationName,
          mustChangePassword: userData.mustChangePassword,
          accountLocked: !userData.isAccountNonLocked,
          roles: (userData.roles || []).map((roleName: string, index: number) => ({
            id: index + 1,
            name: roleName,
            isActive: true,
            assignedAt: new Date().toISOString(),
          })),
        };
        return user;
      } else {
        throw new Error(apiResponse.message || 'Failed to get user information');
      }
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error while fetching user information');
    }
  }

  // Check if token is expired (basic check)
  static isTokenExpired(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return true;

      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true; // If we can't parse the token, consider it expired
    }
  }

  // Get token expiration time
  static getTokenExpiration(token: string): Date | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3 || !parts[1]) return null;

      const payload = JSON.parse(atob(parts[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }
}