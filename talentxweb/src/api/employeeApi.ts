// frontend/src/api/employeeApi.ts
import apiClient from "./axiosClient";
import {
  Employee,
  EmploymentStatus,
  EmploymentType,
  Gender,
  MaritalStatus,
  PayFrequency,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { mockEmployees, createPaginatedResponse, simulateDelay } from "./mockData";

// Check if mock mode is enabled
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Employee API request/response types
export interface EmployeeRequest {
  organizationId: number;
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  hireDate: string; // ISO date
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  workEmail?: string;
  personalEmail?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  uanNumber?: string;
  esicNumber?: string;
  pfNumber?: string;
  departmentId?: number;
  managerId?: number;
  jobTitle?: string;
  jobLevel?: string;
  salaryAmount?: number;
  salaryCurrency?: string;
  payFrequency?: PayFrequency;
  dateOfBirth?: string;
  gender?: Gender;
  nationality?: string;
  maritalStatus?: MaritalStatus;
  locationId?: number;
  profilePictureUrl?: string;
  bio?: string;
}

export interface EmployeeResponse {
  id: number;
  organizationId: number;
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  fullName: string;
  workEmail?: string;
  personalEmail?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  uanNumber?: string;
  esicNumber?: string;
  pfNumber?: string;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;
  managerId?: number;
  managerName?: string;
  managerEmployeeNumber?: string;
  jobTitle?: string;
  jobLevel?: string;
  salaryAmount?: number;
  salaryCurrency?: string;
  payFrequency?: PayFrequency;
  hireDate: string;
  terminationDate?: string;
  probationEndDate?: string;
  dateOfBirth?: string;
  gender?: Gender;
  nationality?: string;
  maritalStatus?: MaritalStatus;
  locationId?: number;
  locationName?: string;
  profilePictureUrl?: string;
  bio?: string;
  userId?: number;
  username?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;

  // Compatibility fields
  email?: string; // Computed from workEmail or personalEmail
  phone?: string; // Alias for phoneNumber
  mobile?: string; // Alias for mobileNumber
  salary?: number; // Alias for salaryAmount
}

export interface EmployeeUpdateRequest extends Partial<EmployeeRequest> {
  id: number;
}

export interface EmployeeSearchParams extends PaginationParams {
  organizationId?: number;
  employmentStatus?: EmploymentStatus | undefined;
  employmentType?: EmploymentType | undefined;
  departmentId?: number | undefined;
  managerId?: number | undefined;
  search?: string | undefined; // Search by name, email, or employee number
  hiredAfter?: string | undefined;
  hiredBefore?: string | undefined;
}

export interface EmployeeFilterOptions {
  departments: Array<{ id: number; name: string }>;
  managers: Array<{ id: number; name: string }>;
  employmentStatuses: EmploymentStatus[];
  employmentTypes: EmploymentType[];
}

// Employee API client interface
export interface EmployeeApiClient {
  getEmployees(params: EmployeeSearchParams): Promise<PaginatedResponse<EmployeeResponse>>;
  getEmployee(id: number): Promise<EmployeeResponse>;
  createEmployee(data: EmployeeRequest): Promise<EmployeeResponse>;
  updateEmployee(id: number, data: EmployeeUpdateRequest): Promise<EmployeeResponse>;
  deleteEmployee(id: number): Promise<void>;
  getEmployeesByDepartment(departmentId: number, params?: PaginationParams): Promise<PaginatedResponse<EmployeeResponse>>;
  getEmployeesByManager(managerId: number, params?: PaginationParams): Promise<PaginatedResponse<EmployeeResponse>>;
  searchEmployees(query: string, params?: PaginationParams): Promise<PaginatedResponse<EmployeeResponse>>;
  getFilterOptions(organizationId?: number): Promise<EmployeeFilterOptions>;
  bulkUpdateEmployees(updates: EmployeeUpdateRequest[]): Promise<EmployeeResponse[]>;
  exportEmployees(params: EmployeeSearchParams): Promise<Blob>;
}

// Implementation of employee API client
class EmployeeApiClientImpl implements EmployeeApiClient {
  private readonly EMPLOYEE_ENDPOINTS = {
    BASE: '/employees',
    BY_ID: (id: number) => `/employees/${id}`,
    BY_DEPARTMENT: (departmentId: number) => `/employees/department/${departmentId}`,
    BY_MANAGER: (managerId: number) => `/employees/${managerId}/direct-reports`,
    SEARCH: '/employees/search',
    FILTER_OPTIONS: '/employees/filter-options',
    BULK_UPDATE: '/employees/bulk-update',
    EXPORT: '/employees/export'
  } as const;

  /**
   * Get paginated list of employees with filtering and sorting
   */
  async getEmployees(params: EmployeeSearchParams): Promise<PaginatedResponse<EmployeeResponse>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filteredEmployees = [...mockEmployees];

      // Apply filters
      if (params.departmentId) {
        filteredEmployees = filteredEmployees.filter(e => e.departmentId === params.departmentId);
      }
      if (params.employmentStatus) {
        filteredEmployees = filteredEmployees.filter(e => e.employmentStatus === params.employmentStatus);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filteredEmployees = filteredEmployees.filter(e =>
          e.fullName.toLowerCase().includes(searchLower) ||
          e.workEmail?.toLowerCase().includes(searchLower) ||
          e.employeeNumber.toLowerCase().includes(searchLower)
        );
      }

      return createPaginatedResponse(filteredEmployees, params.page || 0, params.size || 10);
    }

    const hasSearchFilters = Boolean(
      params.search ||
      params.departmentId ||
      params.employmentStatus ||
      params.employmentType
    );

    const queryParams = this.buildQueryParams(
      hasSearchFilters
        ? {
            name: params.search,
            departmentId: params.departmentId,
            employmentStatus: params.employmentStatus,
            employmentType: params.employmentType,
            page: params.page,
            size: params.size
          }
        : params
    );
    const endpoint = hasSearchFilters ? this.EMPLOYEE_ENDPOINTS.SEARCH : this.EMPLOYEE_ENDPOINTS.BASE;
    const response = await apiClient.get<PaginatedResponse<EmployeeResponse>>(
      `${endpoint}?${queryParams}`
    );
    return this.normalizePage(response);
  }

  /**
   * Get single employee by ID
   */
  async getEmployee(id: number): Promise<EmployeeResponse> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const employee = mockEmployees.find(e => e.id === id);
      if (!employee) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      return employee;
    }

    // Real API call
    return this.normalizeEmployee(await apiClient.get<EmployeeResponse>(this.EMPLOYEE_ENDPOINTS.BY_ID(id)));
  }

  /**
   * Create new employee
   */
  async createEmployee(data: EmployeeRequest): Promise<EmployeeResponse> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const newEmployee: EmployeeResponse = {
        id: mockEmployees.length + 1,
        ...data,
        fullName: `${data.firstName} ${data.lastName}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockEmployees.push(newEmployee);
      return newEmployee;
    }

    // Real API call
    return this.normalizeEmployee(await apiClient.post<EmployeeResponse>(this.EMPLOYEE_ENDPOINTS.BASE, data));
  }

  /**
   * Update existing employee
   */
  async updateEmployee(id: number, data: EmployeeUpdateRequest): Promise<EmployeeResponse> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockEmployees.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Employee with ID ${id} not found`);
      }

      const existingEmployee = mockEmployees[index];
      if (!existingEmployee) {
        throw new Error(`Employee with ID ${id} not found`);
      }

      const updated: EmployeeResponse = {
        ...existingEmployee,
        ...data,
        fullName: data.firstName && data.lastName
          ? `${data.firstName} ${data.lastName}`
          : existingEmployee.fullName,
        updatedAt: new Date().toISOString()
      };
      mockEmployees[index] = updated;
      return updated;
    }

    // Real API call
    return this.normalizeEmployee(await apiClient.put<EmployeeResponse>(this.EMPLOYEE_ENDPOINTS.BY_ID(id), data));
  }

  /**
   * Delete employee (soft delete)
   */
  async deleteEmployee(id: number): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockEmployees.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Employee with ID ${id} not found`);
      }
      mockEmployees.splice(index, 1);
      return;
    }

    // Real API call
    return apiClient.delete<void>(this.EMPLOYEE_ENDPOINTS.BY_ID(id));
  }

  /**
   * Get employees by department
   */
  async getEmployeesByDepartment(
    departmentId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<EmployeeResponse>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const filtered = mockEmployees.filter(e => e.departmentId === departmentId);
      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    const response = await apiClient.get<PaginatedResponse<EmployeeResponse>>(
      `${this.EMPLOYEE_ENDPOINTS.BY_DEPARTMENT(departmentId)}?${queryParams}`
    );
    return this.normalizePage(response);
  }

  /**
   * Get employees by manager
   */
  async getEmployeesByManager(
    managerId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<EmployeeResponse>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const filtered = mockEmployees.filter(e => e.managerId === managerId);
      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    const reports = await apiClient.get<EmployeeResponse[]>(
      `${this.EMPLOYEE_ENDPOINTS.BY_MANAGER(managerId)}?${queryParams}`
    );
    return this.normalizePage(createPaginatedResponse(reports, params.page || 0, params.size || 10));
  }

  /**
   * Search employees by query string
   */
  async searchEmployees(
    query: string,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<EmployeeResponse>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const searchLower = query.toLowerCase();
      const filtered = mockEmployees.filter(e =>
        e.fullName.toLowerCase().includes(searchLower) ||
        e.workEmail?.toLowerCase().includes(searchLower) ||
        e.employeeNumber.toLowerCase().includes(searchLower)
      );
      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const searchParams = { ...params, search: query };
    const queryParams = this.buildQueryParams(searchParams);
    const response = await apiClient.get<PaginatedResponse<EmployeeResponse>>(
      `${this.EMPLOYEE_ENDPOINTS.SEARCH}?${queryParams}`
    );
    return this.normalizePage(response);
  }

  /**
   * Get filter options for employee search
   */
  async getFilterOptions(organizationId?: number): Promise<EmployeeFilterOptions> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const uniqueDepts = Array.from(new Set(mockEmployees.map(e => e.departmentId).filter(Boolean)));
      const uniqueManagers = Array.from(new Set(mockEmployees.map(e => e.managerId).filter(Boolean)));

      return {
        departments: uniqueDepts.map(id => {
          const emp = mockEmployees.find(e => e.departmentId === id);
          return { id: id!, name: emp?.departmentName || `Department ${id}` };
        }),
        managers: uniqueManagers.map(id => {
          const emp = mockEmployees.find(e => e.id === id);
          return { id: id!, name: emp?.fullName || `Manager ${id}` };
        }),
        employmentStatuses: ["ACTIVE", "INACTIVE", "PROBATION", "ON_LEAVE", "TERMINATED", "SUSPENDED"] as EmploymentStatus[],
        employmentTypes: ["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN", "TEMPORARY"] as EmploymentType[]
      };
    }

    // Real API call
    const params = organizationId ? `?organizationId=${organizationId}` : '';
    return apiClient.get<EmployeeFilterOptions>(`${this.EMPLOYEE_ENDPOINTS.FILTER_OPTIONS}${params}`);
  }

  /**
   * Bulk update multiple employees
   */
  async bulkUpdateEmployees(updates: EmployeeUpdateRequest[]): Promise<EmployeeResponse[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const results: EmployeeResponse[] = [];
      for (const update of updates) {
        const updated = await this.updateEmployee(update.id, update);
        results.push(updated);
      }
      return results;
    }

    // Real API call
    return apiClient.put<EmployeeResponse[]>(this.EMPLOYEE_ENDPOINTS.BULK_UPDATE, updates);
  }

  /**
   * Export employees to CSV/Excel
   */
  async exportEmployees(params: EmployeeSearchParams): Promise<Blob> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      // Create a simple CSV export
      const headers = ['ID', 'Employee Number', 'Full Name', 'Email', 'Department', 'Job Title', 'Status'];
      const rows = mockEmployees.map(e => [
        e.id,
        e.employeeNumber,
        e.fullName,
        e.workEmail || '',
        e.departmentName || '',
        e.jobTitle || '',
        e.employmentStatus
      ]);

      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      return new Blob([csv], { type: 'text/csv' });
    }

    try {
      const queryParams = this.buildQueryParams(params);
      const response = await apiClient.getAxiosInstance().get(
        `${this.EMPLOYEE_ENDPOINTS.EXPORT}?${queryParams}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch {
      const page = await this.getEmployees({
        ...params,
        page: 0,
        size: params.size || 1000
      });
      const headers = ['ID', 'Employee Number', 'Full Name', 'Email', 'Department', 'Job Title', 'Status'];
      const rows = page.content.map(e => [
        e.id,
        e.employeeNumber,
        e.fullName || `${e.firstName} ${e.lastName}`.trim(),
        e.email || e.workEmail || '',
        e.departmentName || '',
        e.jobTitle || '',
        e.employmentStatus
      ]);
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
      return new Blob([csv], { type: 'text/csv' });
    }
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

  private normalizeEmployee(employee: EmployeeResponse): EmployeeResponse {
    const normalized: EmployeeResponse = { ...employee };

    const email = employee.email ?? employee.workEmail ?? employee.personalEmail;
    const phone = employee.phone ?? employee.phoneNumber;
    const mobile = employee.mobile ?? employee.mobileNumber;
    const salary = employee.salary ?? employee.salaryAmount;

    if (email !== undefined) normalized.email = email;
    if (phone !== undefined) normalized.phone = phone;
    if (mobile !== undefined) normalized.mobile = mobile;
    if (salary !== undefined) normalized.salary = salary;

    return normalized;
  }

  private normalizePage(page: PaginatedResponse<EmployeeResponse>): PaginatedResponse<EmployeeResponse> {
    return {
      ...page,
      content: page.content.map(employee => this.normalizeEmployee(employee)),
    };
  }
}

// Create and export singleton instance
const employeeApi = new EmployeeApiClientImpl();

export default employeeApi;

// Export the class for testing purposes
export { EmployeeApiClientImpl };

// Legacy export for backward compatibility
export const employeeApiLegacy = {
  async list(orgId: number, page = 0, size = 10) {
    return employeeApi.getEmployees({ organizationId: orgId, page, size });
  },

  async create(payload: EmployeeRequest) {
    return employeeApi.createEmployee(payload);
  },

  async get(id: number) {
    return employeeApi.getEmployee(id);
  },
};
