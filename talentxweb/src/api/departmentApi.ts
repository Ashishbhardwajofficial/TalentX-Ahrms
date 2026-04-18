// frontend/src/api/departmentApi.ts
import apiClient from "./axiosClient";
import {
  Department,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { mockDepartments, createPaginatedResponse, simulateDelay } from "./mockData";

// Check if mock mode is enabled
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Department API request/response types
export interface DepartmentDTO {
  id: number;
  organizationId: number;
  name: string;
  code?: string;
  description?: string;
  parentDepartmentId?: number;
  managerId?: number;
  costCenter?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentCreateDTO {
  organizationId: number;
  name: string;
  code?: string | undefined;
  description?: string | undefined;
  parentDepartmentId?: number | undefined;
  managerId?: number | undefined;
  costCenter?: string | undefined;
  location?: string | undefined;
}

export interface DepartmentUpdateDTO {
  name?: string | undefined;
  code?: string | undefined;
  description?: string | undefined;
  parentDepartmentId?: number | undefined;
  managerId?: number | undefined;
  costCenter?: string | undefined;
  location?: string | undefined;
}

export interface DepartmentSearchParams extends PaginationParams {
  organizationId?: number;
  search?: string;
  parentDepartmentId?: number;
  managerId?: number;
}

export interface DepartmentHierarchyNode {
  id: number;
  organizationId: number;
  name: string;
  code: string;
  description?: string;
  parentDepartmentId?: number;
  managerId?: number;
  costCenter?: string;
  location?: string;
  children: DepartmentHierarchyNode[];
  createdAt: string;
  updatedAt: string;
}

// Department API client interface
export interface DepartmentApiClient {
  getDepartments(params: DepartmentSearchParams): Promise<PaginatedResponse<DepartmentDTO>>;
  getDepartment(id: number): Promise<DepartmentDTO>;
  createDepartment(data: DepartmentCreateDTO): Promise<DepartmentDTO>;
  updateDepartment(id: number, data: DepartmentUpdateDTO): Promise<DepartmentDTO>;
  deleteDepartment(id: number): Promise<void>;
  getDepartmentHierarchy(organizationId?: number): Promise<DepartmentHierarchyNode[]>;
  getDepartmentsByParent(parentId: number, params?: PaginationParams): Promise<PaginatedResponse<DepartmentDTO>>;
}

// Implementation of department API client
class DepartmentApiClientImpl implements DepartmentApiClient {
  private readonly ENDPOINTS = {
    BASE: '/departments',
    BY_ID: (id: number) => `/departments/${id}`,
    HIERARCHY: '/departments/hierarchy',
    BY_PARENT: (parentId: number) => `/departments/parent/${parentId}`,
  } as const;

  /**
   * Get paginated list of departments with filtering and sorting
   * @throws {ApiError} When request fails or user lacks permissions
   */
  async getDepartments(params: DepartmentSearchParams): Promise<PaginatedResponse<DepartmentDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockDepartments];

      // Apply filters
      if (params.organizationId) {
        filtered = filtered.filter(d => d.organizationId === params.organizationId);
      }
      if (params.parentDepartmentId) {
        filtered = filtered.filter(d => d.parentDepartmentId === params.parentDepartmentId);
      }
      if (params.managerId) {
        filtered = filtered.filter(d => d.managerId === params.managerId);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(d =>
          d.name.toLowerCase().includes(searchLower) ||
          d.code?.toLowerCase().includes(searchLower)
        );
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<DepartmentDTO>>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
  }

  /**
   * Get single department by ID
   * @throws {ApiError} When request fails or department not found
   */
  async getDepartment(id: number): Promise<DepartmentDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const department = mockDepartments.find(d => d.id === id);
      if (!department) {
        throw new Error(`Department with ID ${id} not found`);
      }
      return department;
    }

    // Real API call
    return apiClient.get<DepartmentDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new department
   * @throws {ApiError} When request fails or validation errors occur
   */
  async createDepartment(data: DepartmentCreateDTO): Promise<DepartmentDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const newDepartment: DepartmentDTO = {
        id: mockDepartments.length + 1,
        organizationId: data.organizationId,
        name: data.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(data.code && { code: data.code }),
        ...(data.description && { description: data.description }),
        ...(data.parentDepartmentId && { parentDepartmentId: data.parentDepartmentId }),
        ...(data.managerId && { managerId: data.managerId }),
        ...(data.costCenter && { costCenter: data.costCenter }),
        ...(data.location && { location: data.location })
      };
      mockDepartments.push(newDepartment);
      return newDepartment;
    }

    // Real API call
    return apiClient.post<DepartmentDTO>(this.ENDPOINTS.BASE, data);
  }

  /**
   * Update existing department
   * @throws {ApiError} When request fails or department not found
   */
  async updateDepartment(id: number, data: DepartmentUpdateDTO): Promise<DepartmentDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockDepartments.findIndex(d => d.id === id);
      if (index === -1) {
        throw new Error(`Department with ID ${id} not found`);
      }

      const existingDepartment = mockDepartments[index];
      if (!existingDepartment) {
        throw new Error(`Department with ID ${id} not found`);
      }

      const updated: DepartmentDTO = {
        ...existingDepartment,
        updatedAt: new Date().toISOString()
      };

      // Only update fields that are provided
      if (data.name !== undefined) updated.name = data.name;
      if (data.code !== undefined) {
        if (data.code) updated.code = data.code;
      }
      if (data.description !== undefined) {
        if (data.description) updated.description = data.description;
      }
      if (data.parentDepartmentId !== undefined) {
        if (data.parentDepartmentId) updated.parentDepartmentId = data.parentDepartmentId;
      }
      if (data.managerId !== undefined) {
        if (data.managerId) updated.managerId = data.managerId;
      }
      if (data.costCenter !== undefined) {
        if (data.costCenter) updated.costCenter = data.costCenter;
      }
      if (data.location !== undefined) {
        if (data.location) updated.location = data.location;
      }

      mockDepartments[index] = updated;
      return updated;
    }

    // Real API call
    return apiClient.put<DepartmentDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete department (soft delete)
   * @throws {ApiError} When request fails or department not found
   */
  async deleteDepartment(id: number): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockDepartments.findIndex(d => d.id === id);
      if (index === -1) {
        throw new Error(`Department with ID ${id} not found`);
      }
      mockDepartments.splice(index, 1);
      return;
    }

    // Real API call
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Get department hierarchy tree
   * @throws {ApiError} When request fails or user lacks permissions
   */
  async getDepartmentHierarchy(organizationId?: number): Promise<DepartmentHierarchyNode[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockDepartments];

      if (organizationId) {
        filtered = filtered.filter(d => d.organizationId === organizationId);
      }

      // Build hierarchy (simple flat structure for mock)
      return filtered.map(d => ({
        id: d.id,
        organizationId: d.organizationId,
        name: d.name,
        code: d.code || '',
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        children: [],
        ...(d.description && { description: d.description }),
        ...(d.parentDepartmentId && { parentDepartmentId: d.parentDepartmentId }),
        ...(d.managerId && { managerId: d.managerId }),
        ...(d.costCenter && { costCenter: d.costCenter }),
        ...(d.location && { location: d.location })
      }));
    }

    // Real API call
    const queryParams = organizationId ? `?organizationId=${organizationId}` : '';
    return apiClient.get<DepartmentHierarchyNode[]>(
      `${this.ENDPOINTS.HIERARCHY}${queryParams}`
    );
  }

  /**
   * Get departments by parent department
   * @throws {ApiError} When request fails or parent department not found
   */
  async getDepartmentsByParent(
    parentId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<DepartmentDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const filtered = mockDepartments.filter(d => d.parentDepartmentId === parentId);
      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<DepartmentDTO>>(
      `${this.ENDPOINTS.BY_PARENT(parentId)}?${queryParams}`
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
const departmentApi = new DepartmentApiClientImpl();

export default departmentApi;

// Export the class for testing purposes
export { DepartmentApiClientImpl };
