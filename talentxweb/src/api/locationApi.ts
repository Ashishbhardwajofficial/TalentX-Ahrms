// frontend/src/api/locationApi.ts
import apiClient from "./axiosClient";
import {
  Location,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { mockLocations, createPaginatedResponse, simulateDelay } from "./mockData";

// Check if mock mode is enabled
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Location API request/response types
export interface LocationDTO {
  id: number;
  organizationId: number;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  isHeadquarters: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocationCreateDTO {
  organizationId: number;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  isHeadquarters: boolean;
}

export interface LocationUpdateDTO {
  name?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  isHeadquarters?: boolean;
  isActive?: boolean;
}

export interface LocationSearchParams extends PaginationParams {
  organizationId?: number;
  search?: string;
  country?: string;
  stateProvince?: string;
  city?: string;
  isHeadquarters?: boolean;
  isActive?: boolean;
}

// Location API client interface
export interface LocationApiClient {
  getLocations(params: LocationSearchParams): Promise<PaginatedResponse<LocationDTO>>;
  getLocation(id: number): Promise<LocationDTO>;
  createLocation(data: LocationCreateDTO): Promise<LocationDTO>;
  updateLocation(id: number, data: LocationUpdateDTO): Promise<LocationDTO>;
  deleteLocation(id: number): Promise<void>;
  getLocationsByOrganization(organizationId: number, params?: PaginationParams): Promise<PaginatedResponse<LocationDTO>>;
}

// Implementation of location API client
class LocationApiClientImpl implements LocationApiClient {
  private readonly ENDPOINTS = {
    BASE: '/locations',
    BY_ID: (id: number) => `/locations/${id}`,
    BY_ORGANIZATION: (organizationId: number) => `/locations/organization/${organizationId}`,
  } as const;

  /**
   * Get paginated list of locations with filtering and sorting
   * @throws {ApiError} When request fails or user lacks permissions
   */
  async getLocations(params: LocationSearchParams): Promise<PaginatedResponse<LocationDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockLocations];

      // Apply filters
      if (params.organizationId) {
        filtered = filtered.filter(l => l.organizationId === params.organizationId);
      }
      if (params.country) {
        filtered = filtered.filter(l => l.country === params.country);
      }
      if (params.stateProvince) {
        filtered = filtered.filter(l => l.stateProvince === params.stateProvince);
      }
      if (params.city) {
        filtered = filtered.filter(l => l.city === params.city);
      }
      if (params.isHeadquarters !== undefined) {
        filtered = filtered.filter(l => l.isHeadquarters === params.isHeadquarters);
      }
      if (params.isActive !== undefined) {
        filtered = filtered.filter(l => l.isActive === params.isActive);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(l =>
          l.name.toLowerCase().includes(searchLower) ||
          l.city?.toLowerCase().includes(searchLower) ||
          l.country?.toLowerCase().includes(searchLower)
        );
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<LocationDTO>>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
  }

  /**
   * Get single location by ID
   * @throws {ApiError} When request fails or location not found
   */
  async getLocation(id: number): Promise<LocationDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const location = mockLocations.find(l => l.id === id);
      if (!location) {
        throw new Error(`Location with ID ${id} not found`);
      }
      return location;
    }

    // Real API call
    return apiClient.get<LocationDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new location
   * @throws {ApiError} When request fails or validation errors occur
   */
  async createLocation(data: LocationCreateDTO): Promise<LocationDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const newLocation: LocationDTO = {
        id: mockLocations.length + 1,
        organizationId: data.organizationId,
        name: data.name,
        isHeadquarters: data.isHeadquarters,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(data.addressLine1 && { addressLine1: data.addressLine1 }),
        ...(data.addressLine2 && { addressLine2: data.addressLine2 }),
        ...(data.city && { city: data.city }),
        ...(data.stateProvince && { stateProvince: data.stateProvince }),
        ...(data.postalCode && { postalCode: data.postalCode }),
        ...(data.country && { country: data.country }),
        ...(data.timezone && { timezone: data.timezone })
      };
      mockLocations.push(newLocation);
      return newLocation;
    }

    // Real API call
    return apiClient.post<LocationDTO>(this.ENDPOINTS.BASE, data);
  }

  /**
   * Update existing location
   * @throws {ApiError} When request fails or location not found
   */
  async updateLocation(id: number, data: LocationUpdateDTO): Promise<LocationDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockLocations.findIndex(l => l.id === id);
      if (index === -1) {
        throw new Error(`Location with ID ${id} not found`);
      }

      const existingLocation = mockLocations[index];
      if (!existingLocation) {
        throw new Error(`Location with ID ${id} not found`);
      }

      const updated: LocationDTO = {
        ...existingLocation,
        updatedAt: new Date().toISOString()
      };

      // Only update fields that are provided
      if (data.name !== undefined) updated.name = data.name;
      if (data.isHeadquarters !== undefined) updated.isHeadquarters = data.isHeadquarters;
      if (data.isActive !== undefined) updated.isActive = data.isActive;
      if (data.addressLine1 !== undefined && data.addressLine1) updated.addressLine1 = data.addressLine1;
      if (data.addressLine2 !== undefined && data.addressLine2) updated.addressLine2 = data.addressLine2;
      if (data.city !== undefined && data.city) updated.city = data.city;
      if (data.stateProvince !== undefined && data.stateProvince) updated.stateProvince = data.stateProvince;
      if (data.postalCode !== undefined && data.postalCode) updated.postalCode = data.postalCode;
      if (data.country !== undefined && data.country) updated.country = data.country;
      if (data.timezone !== undefined && data.timezone) updated.timezone = data.timezone;

      mockLocations[index] = updated;
      return updated;
    }

    // Real API call
    return apiClient.put<LocationDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete location (soft delete)
   * @throws {ApiError} When request fails or location not found
   */
  async deleteLocation(id: number): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockLocations.findIndex(l => l.id === id);
      if (index === -1) {
        throw new Error(`Location with ID ${id} not found`);
      }
      mockLocations.splice(index, 1);
      return;
    }

    // Real API call
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Get locations by organization
   * @throws {ApiError} When request fails or organization not found
   */
  async getLocationsByOrganization(
    organizationId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<LocationDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const filtered = mockLocations.filter(l => l.organizationId === organizationId);
      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<LocationDTO>>(
      `${this.ENDPOINTS.BY_ORGANIZATION(organizationId)}?${queryParams}`
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
const locationApi = new LocationApiClientImpl();

export default locationApi;

// Export the class for testing purposes
export { LocationApiClientImpl };
