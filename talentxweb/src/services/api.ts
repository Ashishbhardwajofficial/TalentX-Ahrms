import { StorageService } from './storage';
import { AuthService } from './auth';

interface WrappedApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  fieldErrors?: Array<{ field: string; message: string }> | Record<string, string>;
}

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public fieldErrors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// API Client class
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = StorageService.getToken();

    // Default headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if token exists
    if (token) {
      // Check if token is expired
      if (AuthService.isTokenExpired(token)) {
        try {
          // Try to refresh token - backend expects current token in header
          const response = await AuthService.refreshToken(token);
          StorageService.setToken(response.token);
          // Construct User from flat JwtResponse fields
          const user = {
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
            roles: response.roles.map((roleName: string, index: number) => ({
              id: index + 1,
              name: roleName,
              isActive: true,
              assignedAt: new Date().toISOString(),
            })),
          };
          StorageService.setUser(user);
          headers.Authorization = `Bearer ${response.token}`;
        } catch (error) {
          // Refresh failed, clear storage and redirect to login
          StorageService.clearAll();
          window.location.href = '/login';
          throw new ApiError('Authentication required', 401);
        }
      } else {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle different response types
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorData: any = {};

        if (contentType && contentType.includes('application/json')) {
          try {
            errorData = await response.json();
          } catch (e) {
            // If JSON parsing fails, use default error
          }
        }

        const message = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        const fieldErrors = errorData.fieldErrors || errorData.errors;

        throw new ApiError(message, response.status, fieldErrors);
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const json = await response.json();
        if (json && typeof json === 'object' && 'success' in json) {
          const wrapped = json as WrappedApiResponse<T>;
          if (!wrapped.success) {
            throw new ApiError(
              wrapped.message || 'Request failed',
              response.status,
              normalizeFieldErrors(wrapped.fieldErrors)
            );
          }
          return wrapped.data;
        }
        return json as T;
      } else {
        // For non-JSON responses, return the response object itself
        return response as unknown as T;
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Network or other errors
      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred'
      );
    }
  }

  // HTTP methods
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    return this.request<T>(url, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : null,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // File upload method
  async uploadFile<T>(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const token = StorageService.getToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: formData,
    });
  }
}

// Default API client instance
export const apiClient = new ApiClient();

function normalizeFieldErrors(
  fieldErrors?: Array<{ field: string; message: string }> | Record<string, string>
): Array<{ field: string; message: string }> | undefined {
  if (!fieldErrors) {
    return undefined;
  }

  if (Array.isArray(fieldErrors)) {
    return fieldErrors;
  }

  return Object.entries(fieldErrors).map(([field, message]) => ({ field, message }));
}
