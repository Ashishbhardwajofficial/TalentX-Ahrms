// frontend/src/api/organizationApi.ts
import apiClient from "./axiosClient";
import {
  Organization,
  CompanySize,
  SubscriptionTier,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { mockOrganizations, createPaginatedResponse, simulateDelay } from "./mockData";

// Check if mock mode is enabled
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Organization API request/response types
export interface OrganizationDTO {
  id: number;
  name: string;
  legalName?: string;
  taxId?: string;
  industry?: string;
  companySize?: CompanySize;
  headquartersCountry?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
  subscriptionTier?: SubscriptionTier;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface OrganizationCreateDTO {
  name: string;
  legalName?: string | undefined;
  taxId?: string | undefined;
  industry?: string | undefined;
  companySize?: CompanySize | undefined;
  headquartersCountry?: string | undefined;
  logoUrl?: string | undefined;
  website?: string | undefined;
  subscriptionTier?: SubscriptionTier | undefined;
}

export interface OrganizationUpdateDTO {
  name?: string | undefined;
  legalName?: string | undefined;
  taxId?: string | undefined;
  industry?: string | undefined;
  companySize?: CompanySize | undefined;
  headquartersCountry?: string | undefined;
  logoUrl?: string | undefined;
  website?: string | undefined;
  isActive?: boolean | undefined;
  subscriptionTier?: SubscriptionTier;
}

export interface OrganizationSearchParams extends PaginationParams {
  search?: string;
  companySize?: CompanySize;
  subscriptionTier?: SubscriptionTier;
  isActive?: boolean;
  industry?: string;
}

// Organization API client interface
export interface OrganizationApiClient {
  getOrganizations(params: OrganizationSearchParams): Promise<PaginatedResponse<OrganizationDTO>>;
  getOrganization(id: number): Promise<OrganizationDTO>;
  createOrganization(data: OrganizationCreateDTO): Promise<OrganizationDTO>;
  updateOrganization(id: number, data: OrganizationUpdateDTO): Promise<OrganizationDTO>;
  deleteOrganization(id: number): Promise<void>;
}

// Implementation of organization API client
class OrganizationApiClientImpl implements OrganizationApiClient {
  private readonly ENDPOINTS = {
    BASE: '/organizations',
    BY_ID: (id: number) => `/organizations/${id}`,
  } as const;

  /**
   * Get paginated list of organizations with filtering and sorting
   * @throws {ApiError} When request fails or user lacks permissions
   */
  async getOrganizations(params: OrganizationSearchParams): Promise<PaginatedResponse<OrganizationDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockOrganizations];

      // Apply filters
      if (params.companySize) {
        filtered = filtered.filter(o => o.companySize === params.companySize);
      }
      if (params.subscriptionTier) {
        filtered = filtered.filter(o => o.subscriptionTier === params.subscriptionTier);
      }
      if (params.isActive !== undefined) {
        filtered = filtered.filter(o => o.isActive === params.isActive);
      }
      if (params.industry) {
        filtered = filtered.filter(o => o.industry === params.industry);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(o =>
          o.name.toLowerCase().includes(searchLower) ||
          o.legalName?.toLowerCase().includes(searchLower)
        );
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<OrganizationDTO>>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
  }

  /**
   * Get single organization by ID
   * @throws {ApiError} When request fails or organization not found
   */
  async getOrganization(id: number): Promise<OrganizationDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const organization = mockOrganizations.find(o => o.id === id);
      if (!organization) {
        throw new Error(`Organization with ID ${id} not found`);
      }
      return organization;
    }

    // Real API call
    return apiClient.get<OrganizationDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new organization
   * @throws {ApiError} When request fails or validation errors occur
   */
  async createOrganization(data: OrganizationCreateDTO): Promise<OrganizationDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const newOrganization: OrganizationDTO = {
        id: mockOrganizations.length + 1,
        name: data.name,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(data.legalName && { legalName: data.legalName }),
        ...(data.taxId && { taxId: data.taxId }),
        ...(data.industry && { industry: data.industry }),
        ...(data.companySize && { companySize: data.companySize }),
        ...(data.headquartersCountry && { headquartersCountry: data.headquartersCountry }),
        ...(data.logoUrl && { logoUrl: data.logoUrl }),
        ...(data.website && { website: data.website }),
        ...(data.subscriptionTier && { subscriptionTier: data.subscriptionTier })
      };
      mockOrganizations.push(newOrganization);
      return newOrganization;
    }

    // Real API call
    return apiClient.post<OrganizationDTO>(this.ENDPOINTS.BASE, data);
  }

  /**
   * Update existing organization
   * @throws {ApiError} When request fails or organization not found
   */
  async updateOrganization(id: number, data: OrganizationUpdateDTO): Promise<OrganizationDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockOrganizations.findIndex(o => o.id === id);
      if (index === -1) {
        throw new Error(`Organization with ID ${id} not found`);
      }

      const existingOrganization = mockOrganizations[index];
      if (!existingOrganization) {
        throw new Error(`Organization with ID ${id} not found`);
      }

      const updated: OrganizationDTO = {
        ...existingOrganization,
        updatedAt: new Date().toISOString()
      };

      // Only update fields that are provided
      if (data.name !== undefined) updated.name = data.name;
      if (data.isActive !== undefined) updated.isActive = data.isActive;
      if (data.legalName !== undefined && data.legalName) updated.legalName = data.legalName;
      if (data.taxId !== undefined && data.taxId) updated.taxId = data.taxId;
      if (data.industry !== undefined && data.industry) updated.industry = data.industry;
      if (data.companySize !== undefined && data.companySize) updated.companySize = data.companySize;
      if (data.headquartersCountry !== undefined && data.headquartersCountry) updated.headquartersCountry = data.headquartersCountry;
      if (data.logoUrl !== undefined && data.logoUrl) updated.logoUrl = data.logoUrl;
      if (data.website !== undefined && data.website) updated.website = data.website;
      if (data.subscriptionTier !== undefined) updated.subscriptionTier = data.subscriptionTier;

      mockOrganizations[index] = updated;
      return updated;
    }

    // Real API call
    return apiClient.put<OrganizationDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete organization (soft delete)
   * @throws {ApiError} When request fails or organization not found
   */
  async deleteOrganization(id: number): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockOrganizations.findIndex(o => o.id === id);
      if (index === -1) {
        throw new Error(`Organization with ID ${id} not found`);
      }
      mockOrganizations.splice(index, 1);
      return;
    }

    // Real API call
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
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
const organizationApi = new OrganizationApiClientImpl();

export default organizationApi;

// Export the class for testing purposes
export { OrganizationApiClientImpl };
