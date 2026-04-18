// frontend/src/api/assetApi.ts
import apiClient from "./axiosClient";
import {
  Asset,
  AssetAssignment,
  AssetType,
  AssetStatus,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { mockAssets, mockAssetAssignments, createPaginatedResponse, simulateDelay } from "./mockData";

// Check if mock mode is enabled
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Asset API request/response types
export interface AssetDTO {
  id: number;
  organizationId: number;
  assetType: AssetType;
  assetTag?: string;
  serialNumber?: string;
  status: AssetStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface AssetCreateDTO {
  organizationId: number;
  assetType: AssetType;
  assetTag?: string;
  serialNumber?: string;
}

export interface AssetUpdateDTO {
  assetType?: AssetType;
  assetTag?: string;
  serialNumber?: string;
  status?: AssetStatus;
}

export interface AssetAssignmentDTO {
  id: number;
  assetId: number;
  assetTag?: string;
  assetType?: string;
  employeeId: number;
  employeeName?: string;
  employeeNumber?: string;
  assignedDate?: string;
  returnedDate?: string;
  notes?: string;
  conditionAtAssignment?: string;
  conditionAtReturn?: string;
  active?: boolean;
}

export interface AssetAssignmentCreateDTO {
  assetId: number;
  employeeId: number;
  assignedDate?: string;
  notes?: string;
  conditionAtAssignment?: string;
}

export interface AssetReturnDTO {
  returnedDate: string;
}

export interface AssetSearchParams extends PaginationParams {
  organizationId?: number;
  assetType?: AssetType;
  status?: AssetStatus;
  employeeId?: number;
  search?: string; // Search by asset tag or serial number
}

// Asset API client interface
export interface AssetApiClient {
  getAssets(params: AssetSearchParams): Promise<PaginatedResponse<AssetDTO>>;
  getAsset(id: number): Promise<AssetDTO>;
  createAsset(data: AssetCreateDTO): Promise<AssetDTO>;
  updateAsset(id: number, data: AssetUpdateDTO): Promise<AssetDTO>;
  deleteAsset(id: number): Promise<void>;
  assignAsset(data: AssetAssignmentCreateDTO): Promise<AssetAssignmentDTO>;
  returnAsset(assetId: number, data: AssetReturnDTO): Promise<AssetAssignmentDTO>;
  getAssetAssignments(params?: { page?: number; size?: number }): Promise<PaginatedResponse<AssetAssignmentDTO>>;
  getEmployeeAssets(employeeId: number): Promise<AssetAssignmentDTO[]>;
  getAssetHistory(assetId: number): Promise<AssetAssignmentDTO[]>;
}

// Implementation of asset API client
class AssetApiClientImpl implements AssetApiClient {
  private readonly ENDPOINTS = {
    BASE: '/assets',
    BY_ID: (id: number) => `/assets/${id}`,
    ASSIGN: (assetId: number) => `/assets/${assetId}/assign`,
    RETURN: (assetId: number) => `/assets/${assetId}/return`,
    ASSIGNMENTS: '/assets/assignments',
    EMPLOYEE_ASSETS: (employeeId: number) => `/assets/employee/${employeeId}`,
    ASSET_HISTORY: (assetId: number) => `/assets/${assetId}/history`
  } as const;

  /**
   * Get paginated list of assets with filtering and sorting
   */
  async getAssets(params: AssetSearchParams): Promise<PaginatedResponse<AssetDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockAssets];

      // Apply filters
      if (params.assetType) {
        filtered = filtered.filter(a => a.assetType === params.assetType);
      }
      if (params.status) {
        filtered = filtered.filter(a => a.status === params.status);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(a =>
          a.assetTag?.toLowerCase().includes(searchLower) ||
          a.serialNumber?.toLowerCase().includes(searchLower)
        );
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Use /search endpoint when filters are present, otherwise use base endpoint
    const hasFilters = params.search || params.assetType || params.status;
    const endpoint = hasFilters ? `${this.ENDPOINTS.BASE}/search` : this.ENDPOINTS.BASE;
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<AssetDTO>>(`${endpoint}?${queryParams}`);
  }

  /**
   * Get single asset by ID
   */
  async getAsset(id: number): Promise<AssetDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const asset = mockAssets.find(a => a.id === id);
      if (!asset) {
        throw new Error(`Asset with ID ${id} not found`);
      }
      return asset;
    }

    // Real API call
    return apiClient.get<AssetDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new asset
   */
  async createAsset(data: AssetCreateDTO): Promise<AssetDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const newAsset: AssetDTO = {
        id: mockAssets.length + 1,
        ...data,
        status: "AVAILABLE" as AssetStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockAssets.push(newAsset);
      return newAsset;
    }

    // Real API call — backend gets organizationId from authenticated user, don't send it in body
    return apiClient.post<AssetDTO>(this.ENDPOINTS.BASE, {
      assetType: data.assetType,
      assetTag: data.assetTag,
      serialNumber: data.serialNumber
    });
  }

  /**
   * Update existing asset
   */
  async updateAsset(id: number, data: AssetUpdateDTO): Promise<AssetDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockAssets.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error(`Asset with ID ${id} not found`);
      }

      const existingAsset = mockAssets[index];
      if (!existingAsset) {
        throw new Error(`Asset with ID ${id} not found`);
      }

      const updated: AssetDTO = {
        ...existingAsset,
        ...data,
        updatedAt: new Date().toISOString()
      };
      mockAssets[index] = updated;
      return updated;
    }

    // Real API call
    return apiClient.put<AssetDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete asset
   */
  async deleteAsset(id: number): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockAssets.findIndex(a => a.id === id);
      if (index === -1) {
        throw new Error(`Asset with ID ${id} not found`);
      }
      mockAssets.splice(index, 1);
      return;
    }

    // Real API call
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Assign asset to employee
   */
  async assignAsset(data: AssetAssignmentCreateDTO): Promise<AssetAssignmentDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();

      const assignedDateValue =
        data.assignedDate ?? new Date().toISOString().split('T')[0];

      const newAssignment: AssetAssignmentDTO = {
        id: mockAssetAssignments.length + 1,
        assetId: data.assetId,
        employeeId: data.employeeId,
        ...(assignedDateValue && { assignedDate: assignedDateValue })
      };

      mockAssetAssignments.push(newAssignment);

      const assetIndex = mockAssets.findIndex(a => a.id === data.assetId);
      if (assetIndex !== -1) {
        const asset = mockAssets[assetIndex];
        if (asset) {
          asset.status = "ASSIGNED" as AssetStatus;
        }
      }

      return newAssignment;
    }

    // Real API call — backend expects POST /assets/{id}/assign
    const { assetId, ...requestBody } = data;
    return apiClient.post<AssetAssignmentDTO>(this.ENDPOINTS.ASSIGN(assetId), requestBody);
  }

  /**
   * Return asset from employee
   */
  async returnAsset(assetId: number, data: AssetReturnDTO): Promise<AssetAssignmentDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const assignment = mockAssetAssignments.find(a => a.assetId === assetId && !a.returnedDate);
      if (!assignment) {
        throw new Error(`No active assignment found for asset ${assetId}`);
      }
      assignment.returnedDate = data.returnedDate;

      // Update asset status to AVAILABLE
      const assetIndex = mockAssets.findIndex(a => a.id === assetId);
      if (assetIndex !== -1) {
        const asset = mockAssets[assetIndex];
        if (asset) {
          asset.status = "AVAILABLE" as AssetStatus;
        }
      }

      return assignment;
    }

    // Real API call
    return apiClient.post<AssetAssignmentDTO>(this.ENDPOINTS.RETURN(assetId), data);
  }

  /**
   * Get all assignments for a specific asset
   */
  async getAssetAssignments(params?: { page?: number; size?: number }): Promise<PaginatedResponse<AssetAssignmentDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      return createPaginatedResponse(mockAssetAssignments, params?.page || 0, params?.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams({ page: params?.page ?? 0, size: params?.size ?? 10 });
    return apiClient.get<PaginatedResponse<AssetAssignmentDTO>>(`${this.ENDPOINTS.ASSIGNMENTS}?${queryParams}`);
  }

  /**
   * Get all assets currently assigned to an employee
   */
  async getEmployeeAssets(employeeId: number): Promise<AssetAssignmentDTO[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      return mockAssetAssignments.filter(a => a.employeeId === employeeId && !a.returnedDate);
    }

    // Real API call
    return apiClient.get<AssetAssignmentDTO[]>(this.ENDPOINTS.EMPLOYEE_ASSETS(employeeId));
  }

  /**
   * Get assignment history for a specific asset
   */
  async getAssetHistory(assetId: number): Promise<AssetAssignmentDTO[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      return mockAssetAssignments.filter(a => a.assetId === assetId);
    }

    // Real API call
    return apiClient.get<AssetAssignmentDTO[]>(this.ENDPOINTS.ASSET_HISTORY(assetId));
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
const assetApi = new AssetApiClientImpl();

export default assetApi;

// Export the class for testing purposes
export { AssetApiClientImpl };
