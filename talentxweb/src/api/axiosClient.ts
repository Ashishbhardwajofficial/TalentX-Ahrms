// frontend/src/api/axiosClient.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { StorageService } from "../services/storage";
import { ApiResponse, FieldError } from "../types";

// Custom error classes for better error handling
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public fieldErrors?: FieldError[]
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access denied') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, fieldErrors?: FieldError[]) {
    super(message, 400, fieldErrors);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
  }
}

// Base API client configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";
const REQUEST_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

class BaseApiClient {
  private axiosInstance: AxiosInstance;
  private retryCount = 0;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: REQUEST_TIMEOUT,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor for authentication
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Use StorageService to ensure consistent key usage
        const token = StorageService.getToken();

        if (token) {
          // Ensure headers object exists before assignment
          config.headers = config.headers ?? {};
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling and retry logic
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.retryCount = 0; // Reset retry count on successful response
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // Handle network errors with retry logic
        if (!error.response && this.retryCount < MAX_RETRIES && !originalRequest._retry) {
          originalRequest._retry = true;
          this.retryCount++;

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * this.retryCount));

          return this.axiosInstance(originalRequest);
        }

        // Reset retry count
        this.retryCount = 0;

        // Handle different error types
        if (!error.response) {
          throw new NetworkError('Network connection failed');
        }

        const { status, data } = error.response;
        const errorMessage = (data as any)?.message || 'An error occurred';

        switch (status) {
          case 401: {
            // Only trigger logout if this is NOT a login/auth request
            const url = originalRequest.url || '';
            const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register');
            const isLoginPage = window.location.pathname === '/login' ||
              window.location.pathname === '/auth/login';

            if (!isLoginPage && !isAuthRequest) {
              // Only fire logout if a token actually exists — prevents race on initial load
              const token = StorageService.getToken();
              if (token) {
                StorageService.clearAll();
                window.history.replaceState(null, '', '/login');
                window.dispatchEvent(new Event('auth-logout'));
              }
            }
            throw new AuthenticationError(errorMessage);
          }

          case 403:
            throw new AuthorizationError(errorMessage);

          case 400:
            throw new ValidationError(errorMessage, (data as any)?.errors);

          case 404:
            throw new ApiError('Resource not found', 404);

          case 422:
            throw new ValidationError('Validation failed', (data as any)?.errors);

          case 500:
            throw new ApiError('Internal server error', 500);

          default:
            throw new ApiError(errorMessage, status);
        }
      }
    );
  }

  // Generic request method with type safety
  async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.request<ApiResponse<T>>(config);

      // Handle API response format
      if (response.data && typeof response.data === 'object' && 'success' in response.data) {
        const apiResponse = response.data as ApiResponse<T>;
        if (!apiResponse.success) {
          throw new ApiError(apiResponse.message || 'API request failed', response.status, apiResponse.errors);
        }
        return apiResponse.data as T;
      }

      // Return raw data if not in ApiResponse format
      return response.data as T;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Request failed', undefined);
    }
  }

  // Convenience methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  // Get the underlying axios instance for advanced usage
  getAxiosInstance(): AxiosInstance {
    return this.axiosInstance;
  }
}

// Create and export singleton instance
const apiClient = new BaseApiClient();

export default apiClient;

// Export the class for testing purposes
export { BaseApiClient };
