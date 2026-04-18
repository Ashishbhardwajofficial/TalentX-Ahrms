// frontend/src/api/documentApi.ts
import apiClient from "./axiosClient";
import {
  Document,
  DocumentType,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { mockDocuments, mockDocumentCategories, createPaginatedResponse, simulateDelay } from "./mockData";

// Check if mock mode is enabled
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Document API request/response types
export interface DocumentDTO {
  id: number;
  organizationId: number;
  employeeId?: number;
  documentType: DocumentType;
  title: string;
  description?: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  fileUrl: string;
  storagePath?: string;
  version: number;
  isConfidential: boolean;
  requiresSignature: boolean;
  signedAt?: string;
  signedBy?: number;
  issueDate?: string;
  expiryDate?: string;
  isPublic: boolean;
  uploadedBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUploadDTO {
  organizationId: number;
  employeeId?: number | undefined;
  documentType: DocumentType;
  title: string;
  description?: string | undefined;
  file: File;
  isConfidential?: boolean | undefined;
  requiresSignature?: boolean | undefined;
  issueDate?: string | undefined;
  expiryDate?: string | undefined;
  isPublic?: boolean | undefined;
}

export interface DocumentUpdateDTO {
  title?: string | undefined;
  description?: string | undefined;
  documentType?: DocumentType | undefined;
  isConfidential?: boolean | undefined;
  requiresSignature?: boolean | undefined;
  issueDate?: string | undefined;
  expiryDate?: string | undefined;
  isPublic?: boolean | undefined;
}

export interface DocumentSignRequest {
  documentId: number;
  signatureData?: string;
  signatureMethod?: 'DIGITAL' | 'ELECTRONIC' | 'WET_SIGNATURE';
}

export interface DocumentSearchParams extends PaginationParams {
  organizationId?: number;
  employeeId?: number;
  documentType?: DocumentType;
  isConfidential?: boolean;
  requiresSignature?: boolean;
  signedStatus?: 'SIGNED' | 'UNSIGNED' | 'ALL';
  expiringWithinDays?: number;
  search?: string; // Search by title, description, or filename
  uploadedAfter?: string;
  uploadedBefore?: string;
  expiryAfter?: string;
  expiryBefore?: string;
}

export interface DocumentFilterOptions {
  documentTypes: DocumentType[];
  employees: Array<{ id: number; name: string }>;
  uploaders: Array<{ id: number; name: string }>;
}

// Document API client interface
export interface DocumentApiClient {
  getDocuments(params: DocumentSearchParams): Promise<PaginatedResponse<DocumentDTO>>;
  getDocument(id: number): Promise<DocumentDTO>;
  uploadDocument(data: DocumentUploadDTO): Promise<DocumentDTO>;
  updateDocument(id: number, data: DocumentUpdateDTO): Promise<DocumentDTO>;
  deleteDocument(id: number): Promise<void>;
  downloadDocument(id: number): Promise<Blob>;
  signDocument(data: DocumentSignRequest): Promise<DocumentDTO>;
  getDocumentsByEmployee(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<DocumentDTO>>;
  getExpiringDocuments(organizationId: number, withinDays: number): Promise<DocumentDTO[]>;
  searchDocuments(query: string, params?: PaginationParams): Promise<PaginatedResponse<DocumentDTO>>;
  getFilterOptions(organizationId?: number): Promise<DocumentFilterOptions>;
  bulkDeleteDocuments(documentIds: number[]): Promise<void>;
}

// Implementation of document API client
class DocumentApiClientImpl implements DocumentApiClient {
  private readonly ENDPOINTS = {
    BASE: '/documents',
    BY_ID: (id: number) => `/documents/${id}`,
    UPLOAD: '/documents/upload',
    DOWNLOAD: (id: number) => `/documents/${id}/download`,
    SIGN: '/documents/sign',
    BY_EMPLOYEE: (employeeId: number) => `/documents/employee/${employeeId}`,
    EXPIRING: '/documents/expiring',
    SEARCH: '/documents/search',
    FILTER_OPTIONS: '/documents/filter-options',
    BULK_DELETE: '/documents/bulk-delete'
  } as const;

  /**
   * Get paginated list of documents with filtering and sorting
   */
  async getDocuments(params: DocumentSearchParams): Promise<PaginatedResponse<DocumentDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockDocuments];

      // Apply filters
      if (params.employeeId) {
        filtered = filtered.filter(d => d.employeeId === params.employeeId);
      }
      if (params.documentType) {
        filtered = filtered.filter(d => d.category === params.documentType);
      }
      if (params.isConfidential !== undefined) {
        filtered = filtered.filter(d => d.isConfidential === params.isConfidential);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(d =>
          d.title.toLowerCase().includes(searchLower) ||
          d.description?.toLowerCase().includes(searchLower) ||
          d.fileName.toLowerCase().includes(searchLower)
        );
      }

      return createPaginatedResponse(filtered as any[], params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<DocumentDTO>>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
  }

  /**
   * Get single document by ID
   */
  async getDocument(id: number): Promise<DocumentDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const doc = mockDocuments.find(d => d.id === id);
      if (!doc) {
        throw new Error(`Document with ID ${id} not found`);
      }
      return doc as any;
    }

    // Real API call
    return apiClient.get<DocumentDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Upload new document
   */
  async uploadDocument(data: DocumentUploadDTO): Promise<DocumentDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const newDoc: any = {
        id: mockDocuments.length + 1,
        organizationId: data.organizationId,
        ...(data.employeeId && { employeeId: data.employeeId }),
        title: data.title,
        ...(data.description && { description: data.description }),
        category: data.documentType,
        fileUrl: `/documents/${data.file.name}`,
        fileName: data.file.name,
        fileSize: data.file.size,
        mimeType: data.file.type,
        uploadedBy: 1,
        uploadedByName: "Current User",
        isConfidential: data.isConfidential || false,
        status: "ACTIVE",
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockDocuments.push(newDoc);
      return newDoc;
    }

    // Real API call
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('organizationId', data.organizationId.toString());
    if (data.employeeId) formData.append('employeeId', data.employeeId.toString());
    formData.append('documentType', data.documentType);
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.isConfidential !== undefined) formData.append('isConfidential', data.isConfidential.toString());
    if (data.requiresSignature !== undefined) formData.append('requiresSignature', data.requiresSignature.toString());
    if (data.issueDate) formData.append('issueDate', data.issueDate);
    if (data.expiryDate) formData.append('expiryDate', data.expiryDate);
    if (data.isPublic !== undefined) formData.append('isPublic', data.isPublic.toString());

    return apiClient.post<DocumentDTO>(this.ENDPOINTS.UPLOAD, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Update existing document metadata
   */
  async updateDocument(id: number, data: DocumentUpdateDTO): Promise<DocumentDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockDocuments.findIndex(d => d.id === id);
      if (index === -1) {
        throw new Error(`Document with ID ${id} not found`);
      }
      mockDocuments[index] = {
        ...mockDocuments[index]!,
        ...(data.title && { title: data.title }),
        ...(data.description && { description: data.description }),
        ...(data.documentType && { category: data.documentType }),
        ...(data.isConfidential !== undefined && { isConfidential: data.isConfidential }),
        updatedAt: new Date().toISOString()
      };
      return mockDocuments[index] as any;
    }

    // Real API call
    return apiClient.put<DocumentDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete document
   */
  async deleteDocument(id: number): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockDocuments.findIndex(d => d.id === id);
      if (index === -1) {
        throw new Error(`Document with ID ${id} not found`);
      }
      mockDocuments.splice(index, 1);
      return;
    }

    // Real API call
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Download document file
   */
  async downloadDocument(id: number): Promise<Blob> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const doc = mockDocuments.find(d => d.id === id);
      if (!doc) {
        throw new Error(`Document with ID ${id} not found`);
      }
      return new Blob([`Mock document content for: ${doc.title}`], { type: 'application/pdf' });
    }

    // Real API call
    const response = await apiClient.getAxiosInstance().get(
      this.ENDPOINTS.DOWNLOAD(id),
      { responseType: 'blob' }
    );
    return response.data;
  }

  /**
   * Sign document
   */
  async signDocument(data: DocumentSignRequest): Promise<DocumentDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockDocuments.findIndex(d => d.id === data.documentId);
      if (index === -1) {
        throw new Error(`Document with ID ${data.documentId} not found`);
      }
      mockDocuments[index] = {
        ...mockDocuments[index]!,
        status: "SIGNED" as any,
        updatedAt: new Date().toISOString()
      };
      return mockDocuments[index] as any;
    }

    // Real API call
    return apiClient.post<DocumentDTO>(this.ENDPOINTS.SIGN, data);
  }

  /**
   * Get documents by employee
   */
  async getDocumentsByEmployee(
    employeeId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<DocumentDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const filtered = mockDocuments.filter(d => d.employeeId === employeeId);
      return createPaginatedResponse(filtered as any[], params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<DocumentDTO>>(
      `${this.ENDPOINTS.BY_EMPLOYEE(employeeId)}?${queryParams}`
    );
  }

  /**
   * Get documents expiring within specified days
   */
  async getExpiringDocuments(organizationId: number, withinDays: number): Promise<DocumentDTO[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const now = new Date();
      const futureDate = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000);

      const expiring = mockDocuments.filter(d => {
        if (!d.expiryDate) return false;
        const expiryDate = new Date(d.expiryDate);
        return expiryDate >= now && expiryDate <= futureDate;
      });

      return expiring as any[];
    }

    // Real API call
    const params = `?organizationId=${organizationId}&withinDays=${withinDays}`;
    return apiClient.get<DocumentDTO[]>(`${this.ENDPOINTS.EXPIRING}${params}`);
  }

  /**
   * Search documents by query string
   */
  async searchDocuments(
    query: string,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<DocumentDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const searchLower = query.toLowerCase();
      const filtered = mockDocuments.filter(d =>
        d.title.toLowerCase().includes(searchLower) ||
        d.description?.toLowerCase().includes(searchLower) ||
        d.fileName.toLowerCase().includes(searchLower)
      );
      return createPaginatedResponse(filtered as any[], params.page || 0, params.size || 10);
    }

    // Real API call
    const searchParams = { ...params, search: query };
    const queryParams = this.buildQueryParams(searchParams);
    return apiClient.get<PaginatedResponse<DocumentDTO>>(
      `${this.ENDPOINTS.SEARCH}?${queryParams}`
    );
  }

  /**
   * Get filter options for document search
   */
  async getFilterOptions(organizationId?: number): Promise<DocumentFilterOptions> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      return {
        documentTypes: mockDocumentCategories.map(c => c.name as DocumentType),
        employees: [
          { id: 1, name: "John Doe" },
          { id: 2, name: "Jane Smith" }
        ],
        uploaders: [
          { id: 1, name: "John Doe" },
          { id: 2, name: "Jane Smith" }
        ]
      };
    }

    // Real API call
    const params = organizationId ? `?organizationId=${organizationId}` : '';
    return apiClient.get<DocumentFilterOptions>(`${this.ENDPOINTS.FILTER_OPTIONS}${params}`);
  }

  /**
   * Bulk delete multiple documents
   */
  async bulkDeleteDocuments(documentIds: number[]): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      documentIds.forEach(id => {
        const index = mockDocuments.findIndex(d => d.id === id);
        if (index !== -1) {
          mockDocuments.splice(index, 1);
        }
      });
      return;
    }

    // Real API call
    return apiClient.post<void>(this.ENDPOINTS.BULK_DELETE, { documentIds });
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
const documentApi = new DocumentApiClientImpl();

export default documentApi;

// Export the class for testing purposes
export { DocumentApiClientImpl };