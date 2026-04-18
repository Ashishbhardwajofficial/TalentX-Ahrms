// frontend/src/api/employmentHistoryApi.ts
import apiClient from "./axiosClient";
import {
  EmploymentHistory,
  EmploymentHistoryReason,
  PaginationParams,
  PaginatedResponse
} from "../types";

// Employment History API request/response types
export interface EmploymentHistoryDTO {
  id: number;
  employeeId: number;
  departmentId?: number;
  departmentName?: string;
  jobTitle?: string;
  jobLevel?: string;
  managerId?: number;
  managerName?: string;
  salaryAmount?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  reason: EmploymentHistoryReason;
  createdAt: string;
}

export interface EmploymentHistoryCreateDTO {
  employeeId: number;
  departmentId?: number;
  jobTitle?: string;
  jobLevel?: string;
  managerId?: number;
  salaryAmount?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  reason: EmploymentHistoryReason;
}

export interface EmploymentHistoryUpdateDTO {
  departmentId?: number;
  jobTitle?: string;
  jobLevel?: string;
  managerId?: number;
  salaryAmount?: number;
  effectiveFrom?: string;
  effectiveTo?: string;
  reason?: EmploymentHistoryReason;
}

export interface EmploymentHistorySearchParams extends PaginationParams {
  employeeId?: number;
  departmentId?: number;
  managerId?: number;
  reason?: EmploymentHistoryReason;
  effectiveFromAfter?: string;
  effectiveFromBefore?: string;
  search?: string;
}

// Employment History API client interface
export interface EmploymentHistoryApiClient {
  getEmploymentHistories(params: EmploymentHistorySearchParams): Promise<PaginatedResponse<EmploymentHistoryDTO>>;
  getEmploymentHistory(id: number): Promise<EmploymentHistoryDTO>;
  createEmploymentHistory(data: EmploymentHistoryCreateDTO): Promise<EmploymentHistoryDTO>;
  updateEmploymentHistory(id: number, data: EmploymentHistoryUpdateDTO): Promise<EmploymentHistoryDTO>;
  deleteEmploymentHistory(id: number): Promise<void>;
  getEmployeeEmploymentHistory(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<EmploymentHistoryDTO>>;
}

// Implementation of employment history API client
class EmploymentHistoryApiClientImpl implements EmploymentHistoryApiClient {
  private readonly ENDPOINTS = {
    BASE: '/employment-history',
    BY_ID: (id: number) => `/employment-history/${id}`,
    BY_EMPLOYEE: (employeeId: number) => `/employment-history/employee/${employeeId}`,
  } as const;

  /**
   * Get paginated list of employment history records with filtering and sorting
   */
  async getEmploymentHistories(params: EmploymentHistorySearchParams): Promise<PaginatedResponse<EmploymentHistoryDTO>> {
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<EmploymentHistoryDTO>>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
  }

  /**
   * Get single employment history record by ID
   */
  async getEmploymentHistory(id: number): Promise<EmploymentHistoryDTO> {
    return apiClient.get<EmploymentHistoryDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new employment history record
   */
  async createEmploymentHistory(data: EmploymentHistoryCreateDTO): Promise<EmploymentHistoryDTO> {
    return apiClient.post<EmploymentHistoryDTO>(this.ENDPOINTS.BASE, data);
  }

  /**
   * Update existing employment history record
   */
  async updateEmploymentHistory(id: number, data: EmploymentHistoryUpdateDTO): Promise<EmploymentHistoryDTO> {
    return apiClient.put<EmploymentHistoryDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete employment history record
   */
  async deleteEmploymentHistory(id: number): Promise<void> {
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Get employment history for a specific employee
   */
  async getEmployeeEmploymentHistory(
    employeeId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<EmploymentHistoryDTO>> {
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<EmploymentHistoryDTO>>(
      `${this.ENDPOINTS.BY_EMPLOYEE(employeeId)}?${queryParams}`
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
const employmentHistoryApi = new EmploymentHistoryApiClientImpl();

export default employmentHistoryApi;

// Export the class for testing purposes
export { EmploymentHistoryApiClientImpl };