import apiClient from "./axiosClient";
import {
  EmergencyContact,
  PaginationParams,
  PaginatedResponse
} from "../types";

// Emergency Contact API request/response types
export interface EmergencyContactDTO {
  id: number;
  employeeId: number;
  contactName: string;
  relationship: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  canPickUpChildren: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContactCreateDTO {
  employeeId: number;
  contactName: string;
  relationship: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  canPickUpChildren: boolean;
  notes?: string;
}

export interface EmergencyContactUpdateDTO {
  contactName?: string;
  relationship?: string;
  primaryPhone?: string;
  secondaryPhone?: string;
  email?: string;
  address?: string;
  isPrimary?: boolean;
  canPickUpChildren?: boolean;
  notes?: string;
}

export interface EmergencyContactSearchParams extends PaginationParams {
  employeeId?: number;
  relationship?: string;
  isPrimary?: boolean;
  canPickUpChildren?: boolean;
}

// Emergency Contact API client interface
export interface EmergencyContactApiClient {
  getEmergencyContacts(params: EmergencyContactSearchParams): Promise<PaginatedResponse<EmergencyContactDTO>>;
  getEmergencyContact(id: number): Promise<EmergencyContactDTO>;
  createEmergencyContact(data: EmergencyContactCreateDTO): Promise<EmergencyContactDTO>;
  updateEmergencyContact(id: number, data: EmergencyContactUpdateDTO): Promise<EmergencyContactDTO>;
  deleteEmergencyContact(id: number): Promise<void>;
  getContactsByEmployee(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<EmergencyContactDTO>>;
  setPrimaryContact(id: number): Promise<EmergencyContactDTO>;
}

// Implementation of emergency contact API client
class EmergencyContactApiClientImpl implements EmergencyContactApiClient {
  private readonly ENDPOINTS = {
    BASE: '/emergency-contacts',
    BY_ID: (id: number) => `/emergency-contacts/${id}`,
    BY_EMPLOYEE: (employeeId: number) => `/emergency-contacts/employee/${employeeId}`,
    SET_PRIMARY: (id: number) => `/emergency-contacts/${id}/set-primary`
  } as const;

  /**
   * Get paginated list of emergency contacts with filtering and sorting
   */
  async getEmergencyContacts(params: EmergencyContactSearchParams): Promise<PaginatedResponse<EmergencyContactDTO>> {
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<EmergencyContactDTO>>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
  }

  /**
   * Get single emergency contact by ID
   */
  async getEmergencyContact(id: number): Promise<EmergencyContactDTO> {
    return apiClient.get<EmergencyContactDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new emergency contact
   */
  async createEmergencyContact(data: EmergencyContactCreateDTO): Promise<EmergencyContactDTO> {
    return apiClient.post<EmergencyContactDTO>(this.ENDPOINTS.BASE, data);
  }

  /**
   * Update existing emergency contact
   */
  async updateEmergencyContact(id: number, data: EmergencyContactUpdateDTO): Promise<EmergencyContactDTO> {
    return apiClient.put<EmergencyContactDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete emergency contact
   */
  async deleteEmergencyContact(id: number): Promise<void> {
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Get emergency contacts by employee ID
   */
  async getContactsByEmployee(
    employeeId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<EmergencyContactDTO>> {
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<EmergencyContactDTO>>(
      `${this.ENDPOINTS.BY_EMPLOYEE(employeeId)}?${queryParams}`
    );
  }

  /**
   * Set contact as primary for the employee
   */
  async setPrimaryContact(id: number): Promise<EmergencyContactDTO> {
    return apiClient.put<EmergencyContactDTO>(this.ENDPOINTS.SET_PRIMARY(id), {});
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
const emergencyContactApi = new EmergencyContactApiClientImpl();

export default emergencyContactApi;

// Export the class for testing purposes
export { EmergencyContactApiClientImpl };