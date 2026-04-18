import apiClient from "./axiosClient";
import {
  EmployeeAddress,
  PaginationParams,
  PaginatedResponse
} from "../types";

// Employee Address API request/response types
export interface EmployeeAddressDTO {
  id: number;
  employeeId: number;
  addressType: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  isPrimary: boolean;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeAddressCreateDTO {
  employeeId: number;
  addressType: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  isPrimary: boolean;
  isCurrent: boolean;
}

export interface EmployeeAddressUpdateDTO {
  addressType?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  isPrimary?: boolean;
  isCurrent?: boolean;
}

export interface EmployeeAddressSearchParams extends PaginationParams {
  employeeId?: number;
  addressType?: string;
  isPrimary?: boolean;
  isCurrent?: boolean;
}

// Employee Address API client interface
export interface EmployeeAddressApiClient {
  getEmployeeAddresses(params: EmployeeAddressSearchParams): Promise<PaginatedResponse<EmployeeAddressDTO>>;
  getEmployeeAddress(id: number): Promise<EmployeeAddressDTO>;
  createEmployeeAddress(data: EmployeeAddressCreateDTO): Promise<EmployeeAddressDTO>;
  updateEmployeeAddress(id: number, data: EmployeeAddressUpdateDTO): Promise<EmployeeAddressDTO>;
  deleteEmployeeAddress(id: number): Promise<void>;
  getAddressesByEmployee(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<EmployeeAddressDTO>>;
  setPrimaryAddress(id: number): Promise<EmployeeAddressDTO>;
}

// Implementation of employee address API client
class EmployeeAddressApiClientImpl implements EmployeeAddressApiClient {
  private readonly ENDPOINTS = {
    BASE: '/employee-addresses',
    BY_ID: (id: number) => `/employee-addresses/${id}`,
    BY_EMPLOYEE: (employeeId: number) => `/employee-addresses/employee/${employeeId}`,
    SET_PRIMARY: (id: number) => `/employee-addresses/${id}/set-primary`
  } as const;

  /**
   * Get paginated list of employee addresses with filtering and sorting
   */
  async getEmployeeAddresses(params: EmployeeAddressSearchParams): Promise<PaginatedResponse<EmployeeAddressDTO>> {
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<EmployeeAddressDTO>>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
  }

  /**
   * Get single employee address by ID
   */
  async getEmployeeAddress(id: number): Promise<EmployeeAddressDTO> {
    return apiClient.get<EmployeeAddressDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new employee address
   */
  async createEmployeeAddress(data: EmployeeAddressCreateDTO): Promise<EmployeeAddressDTO> {
    return apiClient.post<EmployeeAddressDTO>(this.ENDPOINTS.BASE, data);
  }

  /**
   * Update existing employee address
   */
  async updateEmployeeAddress(id: number, data: EmployeeAddressUpdateDTO): Promise<EmployeeAddressDTO> {
    return apiClient.put<EmployeeAddressDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete employee address
   */
  async deleteEmployeeAddress(id: number): Promise<void> {
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Get addresses by employee ID
   */
  async getAddressesByEmployee(
    employeeId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<EmployeeAddressDTO>> {
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<EmployeeAddressDTO>>(
      `${this.ENDPOINTS.BY_EMPLOYEE(employeeId)}?${queryParams}`
    );
  }

  /**
   * Set address as primary for the employee
   */
  async setPrimaryAddress(id: number): Promise<EmployeeAddressDTO> {
    return apiClient.put<EmployeeAddressDTO>(this.ENDPOINTS.SET_PRIMARY(id), {});
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
const employeeAddressApi = new EmployeeAddressApiClientImpl();

export default employeeAddressApi;

// Export the class for testing purposes
export { EmployeeAddressApiClientImpl };