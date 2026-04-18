// frontend/src/api/bankDetailsApi.ts
import apiClient from "./axiosClient";
import {
  BankDetails,
  BankAccountType,
  PaginationParams,
  PaginatedResponse
} from "../types";

// Bank Details API request/response types
export interface BankDetailsDTO {
  id: number;
  employeeId: number;
  bankName: string;
  accountNumber: string;
  maskedAccountNumber?: string; // For display purposes
  ifscCode?: string;
  branchName?: string;
  accountType: BankAccountType;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BankDetailsCreateDTO {
  employeeId: number;
  bankName: string;
  accountNumber: string;
  ifscCode?: string;
  branchName?: string;
  accountType: BankAccountType;
  isPrimary?: boolean;
}

export interface BankDetailsUpdateDTO {
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  branchName?: string;
  accountType?: BankAccountType;
  isPrimary?: boolean;
}

export interface BankDetailsSearchParams extends PaginationParams {
  employeeId?: number;
  bankName?: string;
  accountType?: BankAccountType;
  isPrimary?: boolean;
  search?: string;
}

// Bank Details API client interface
export interface BankDetailsApiClient {
  getBankDetails(params: BankDetailsSearchParams): Promise<PaginatedResponse<BankDetailsDTO>>;
  getBankDetail(id: number): Promise<BankDetailsDTO>;
  createBankDetails(data: BankDetailsCreateDTO): Promise<BankDetailsDTO>;
  updateBankDetails(id: number, data: BankDetailsUpdateDTO): Promise<BankDetailsDTO>;
  deleteBankDetails(id: number): Promise<void>;
  getEmployeeBankDetails(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<BankDetailsDTO>>;
  setPrimaryBankAccount(id: number): Promise<BankDetailsDTO>;
  validateBankDetails(data: Partial<BankDetailsCreateDTO>): Promise<{ valid: boolean; message?: string }>;
}

// Implementation of bank details API client
class BankDetailsApiClientImpl implements BankDetailsApiClient {
  private readonly ENDPOINTS = {
    BASE: '/bank-details',
    BY_ID: (id: number) => `/bank-details/${id}`,
    BY_EMPLOYEE: (employeeId: number) => `/bank-details/employee/${employeeId}`,
    SET_PRIMARY: (id: number) => `/bank-details/${id}/set-primary`,
    VALIDATE: '/bank-details/validate',
  } as const;

  /**
   * Get paginated list of bank details with filtering and sorting
   */
  async getBankDetails(params: BankDetailsSearchParams): Promise<PaginatedResponse<BankDetailsDTO>> {
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<BankDetailsDTO>>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
  }

  /**
   * Get single bank details record by ID
   */
  async getBankDetail(id: number): Promise<BankDetailsDTO> {
    return apiClient.get<BankDetailsDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new bank details record
   */
  async createBankDetails(data: BankDetailsCreateDTO): Promise<BankDetailsDTO> {
    return apiClient.post<BankDetailsDTO>(this.ENDPOINTS.BASE, data);
  }

  /**
   * Update existing bank details record
   */
  async updateBankDetails(id: number, data: BankDetailsUpdateDTO): Promise<BankDetailsDTO> {
    return apiClient.put<BankDetailsDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete bank details record
   */
  async deleteBankDetails(id: number): Promise<void> {
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Get bank details for a specific employee
   */
  async getEmployeeBankDetails(
    employeeId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<BankDetailsDTO>> {
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<BankDetailsDTO>>(
      `${this.ENDPOINTS.BY_EMPLOYEE(employeeId)}?${queryParams}`
    );
  }

  /**
   * Set a bank account as primary for salary payments
   */
  async setPrimaryBankAccount(id: number): Promise<BankDetailsDTO> {
    return apiClient.put<BankDetailsDTO>(this.ENDPOINTS.SET_PRIMARY(id), {});
  }

  /**
   * Validate bank details (account number format, IFSC code, etc.)
   */
  async validateBankDetails(data: Partial<BankDetailsCreateDTO>): Promise<{ valid: boolean; message?: string }> {
    return apiClient.post<{ valid: boolean; message?: string }>(this.ENDPOINTS.VALIDATE, data);
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
const bankDetailsApi = new BankDetailsApiClientImpl();

export default bankDetailsApi;

// Export the class for testing purposes
export { BankDetailsApiClientImpl };