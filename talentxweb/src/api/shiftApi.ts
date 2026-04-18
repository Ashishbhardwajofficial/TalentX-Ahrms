// frontend/src/api/shiftApi.ts
import apiClient from "./axiosClient";
import {
  Shift,
  EmployeeShift,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { mockShifts, mockEmployeeShifts, createPaginatedResponse, simulateDelay } from "./mockData";

// Check if mock mode is enabled
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// ============================================================================
// SHIFT API DTOs
// ============================================================================

/**
 * DTO for shift response
 */
export interface ShiftDTO {
  id: number;
  organizationId: number;
  name: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  isNightShift: boolean;
  createdAt: string;
}

/**
 * DTO for creating a shift
 */
export interface ShiftCreateDTO {
  organizationId: number;
  name: string;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  breakMinutes: number;
  isNightShift: boolean;
}

/**
 * DTO for updating a shift
 */
export interface ShiftUpdateDTO {
  name?: string;
  startTime?: string; // HH:mm format
  endTime?: string; // HH:mm format
  breakMinutes?: number;
  isNightShift?: boolean;
}

/**
 * Search parameters for shifts
 */
export interface ShiftSearchParams extends PaginationParams {
  organizationId?: number;
  name?: string;
  isNightShift?: boolean;
  search?: string;
}

/**
 * DTO for employee shift response
 */
export interface EmployeeShiftDTO {
  id: number;
  employeeId: number;
  employeeName?: string;
  shiftId: number;
  shift?: ShiftDTO;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * DTO for assigning a shift to an employee
 */
export interface ShiftAssignmentDTO {
  employeeId: number;
  shiftId: number;
  effectiveFrom: string; // ISO date
  effectiveTo?: string; // ISO date
}

/**
 * DTO for updating employee shift assignment
 */
export interface ShiftAssignmentUpdateDTO {
  effectiveFrom?: string;
  effectiveTo?: string;
  isActive?: boolean;
}

/**
 * Search parameters for employee shifts
 */
export interface EmployeeShiftSearchParams extends PaginationParams {
  employeeId?: number;
  shiftId?: number;
  isActive?: boolean;
  effectiveFrom?: string;
  effectiveTo?: string;
}

/**
 * DTO for shift conflict warning
 */
export interface ShiftConflictDTO {
  hasConflict: boolean;
  conflictingAssignments: EmployeeShiftDTO[];
  message?: string;
}

// ============================================================================
// SHIFT API CLIENT INTERFACE
// ============================================================================

/**
 * Interface for Shift API client
 */
export interface ShiftApiClient {
  // Shift CRUD operations
  getShifts(params: ShiftSearchParams): Promise<PaginatedResponse<ShiftDTO>>;
  getShift(id: number): Promise<ShiftDTO>;
  createShift(data: ShiftCreateDTO): Promise<ShiftDTO>;
  updateShift(id: number, data: ShiftUpdateDTO): Promise<ShiftDTO>;
  deleteShift(id: number): Promise<void>;

  // Shift assignment operations
  assignShift(data: ShiftAssignmentDTO): Promise<EmployeeShiftDTO>;
  updateShiftAssignment(id: number, data: ShiftAssignmentUpdateDTO): Promise<EmployeeShiftDTO>;
  deleteShiftAssignment(id: number): Promise<void>;

  // Employee shift queries
  getEmployeeShifts(employeeId: number, params?: EmployeeShiftSearchParams): Promise<PaginatedResponse<EmployeeShiftDTO>>;
  getActiveEmployeeShift(employeeId: number): Promise<EmployeeShiftDTO | null>;
  getShiftAssignments(params: EmployeeShiftSearchParams): Promise<PaginatedResponse<EmployeeShiftDTO>>;

  // Shift conflict detection
  checkShiftConflict(employeeId: number, effectiveFrom: string, effectiveTo?: string): Promise<ShiftConflictDTO>;
}

// ============================================================================
// SHIFT API CLIENT IMPLEMENTATION
// ============================================================================

/**
 * Implementation of Shift API client
 */
class ShiftApiClientImpl implements ShiftApiClient {
  private readonly ENDPOINTS = {
    BASE: '/shifts',
    BY_ID: (id: number) => `/shifts/${id}`,
    ASSIGN: '/shifts/assign',
    ASSIGNMENT_BY_ID: (id: number) => `/shifts/assignments/${id}`,
    EMPLOYEE_SHIFTS: (employeeId: number) => `/shifts/employee/${employeeId}`,
    ACTIVE_SHIFT: (employeeId: number) => `/shifts/employee/${employeeId}/active`,
    ASSIGNMENTS: '/shifts/assignments',
    CHECK_CONFLICT: '/shifts/check-conflict'
  } as const;

  /**
   * Get paginated list of shifts with filtering
   */
  async getShifts(params: ShiftSearchParams): Promise<PaginatedResponse<ShiftDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockShifts];

      // Apply filters
      if (params.organizationId) {
        filtered = filtered.filter(s => s.organizationId === params.organizationId);
      }
      if (params.name) {
        filtered = filtered.filter(s => s.name.toLowerCase().includes(params.name!.toLowerCase()));
      }
      if (params.isNightShift !== undefined) {
        filtered = filtered.filter(s => s.isNightShift === params.isNightShift);
      }
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        filtered = filtered.filter(s => s.name.toLowerCase().includes(searchLower));
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<ShiftDTO>>(
      `${this.ENDPOINTS.BASE}?${queryParams}`
    );
  }

  /**
   * Get single shift by ID
   */
  async getShift(id: number): Promise<ShiftDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const shift = mockShifts.find(s => s.id === id);
      if (!shift) {
        throw new Error(`Shift with ID ${id} not found`);
      }
      return shift;
    }

    // Real API call
    return apiClient.get<ShiftDTO>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Create new shift
   */
  async createShift(data: ShiftCreateDTO): Promise<ShiftDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const newShift: ShiftDTO = {
        id: mockShifts.length + 1,
        ...data,
        createdAt: new Date().toISOString()
      };
      mockShifts.push(newShift);
      return newShift;
    }

    // Real API call
    return apiClient.post<ShiftDTO>(this.ENDPOINTS.BASE, data);
  }

  /**
   * Update existing shift
   */
  async updateShift(id: number, data: ShiftUpdateDTO): Promise<ShiftDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockShifts.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error(`Shift with ID ${id} not found`);
      }

      const existingShift = mockShifts[index];
      if (!existingShift) {
        throw new Error(`Shift with ID ${id} not found`);
      }

      const updated: ShiftDTO = {
        ...existingShift,
        ...data
      };
      mockShifts[index] = updated;
      return updated;
    }

    // Real API call
    return apiClient.put<ShiftDTO>(this.ENDPOINTS.BY_ID(id), data);
  }

  /**
   * Delete shift
   */
  async deleteShift(id: number): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockShifts.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error(`Shift with ID ${id} not found`);
      }
      mockShifts.splice(index, 1);
      return;
    }

    // Real API call
    return apiClient.delete<void>(this.ENDPOINTS.BY_ID(id));
  }

  /**
   * Assign shift to employee
   */
  async assignShift(data: ShiftAssignmentDTO): Promise<EmployeeShiftDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const newAssignment: EmployeeShiftDTO = {
        id: mockEmployeeShifts.length + 1,
        employeeId: data.employeeId,
        shiftId: data.shiftId,
        effectiveFrom: data.effectiveFrom,
        ...(data.effectiveTo && { effectiveTo: data.effectiveTo }),
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockEmployeeShifts.push(newAssignment);
      return newAssignment;
    }

    // Real API call
    return apiClient.post<EmployeeShiftDTO>(this.ENDPOINTS.ASSIGN, data);
  }

  /**
   * Update shift assignment
   */
  async updateShiftAssignment(id: number, data: ShiftAssignmentUpdateDTO): Promise<EmployeeShiftDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockEmployeeShifts.findIndex(es => es.id === id);
      if (index === -1) {
        throw new Error(`Shift assignment with ID ${id} not found`);
      }

      const existingAssignment = mockEmployeeShifts[index];
      if (!existingAssignment) {
        throw new Error(`Shift assignment with ID ${id} not found`);
      }

      const updated: EmployeeShiftDTO = {
        ...existingAssignment,
        ...data,
        updatedAt: new Date().toISOString()
      };
      mockEmployeeShifts[index] = updated;
      return updated;
    }

    // Real API call
    return apiClient.put<EmployeeShiftDTO>(this.ENDPOINTS.ASSIGNMENT_BY_ID(id), data);
  }

  /**
   * Delete shift assignment
   */
  async deleteShiftAssignment(id: number): Promise<void> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockEmployeeShifts.findIndex(es => es.id === id);
      if (index === -1) {
        throw new Error(`Shift assignment with ID ${id} not found`);
      }
      mockEmployeeShifts.splice(index, 1);
      return;
    }

    // Real API call
    return apiClient.delete<void>(this.ENDPOINTS.ASSIGNMENT_BY_ID(id));
  }

  /**
   * Get shift assignments for a specific employee
   */
  async getEmployeeShifts(
    employeeId: number,
    params: EmployeeShiftSearchParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<EmployeeShiftDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = mockEmployeeShifts.filter(es => es.employeeId === employeeId);

      // Apply additional filters
      if (params.isActive !== undefined) {
        filtered = filtered.filter(es => es.isActive === params.isActive);
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<EmployeeShiftDTO>>(
      `${this.ENDPOINTS.EMPLOYEE_SHIFTS(employeeId)}?${queryParams}`
    );
  }

  /**
   * Get active shift assignment for an employee
   */
  async getActiveEmployeeShift(employeeId: number): Promise<EmployeeShiftDTO | null> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const activeShift = mockEmployeeShifts.find(
        es => es.employeeId === employeeId && es.isActive
      );
      return activeShift || null;
    }

    // Real API call
    try {
      return await apiClient.get<EmployeeShiftDTO>(this.ENDPOINTS.ACTIVE_SHIFT(employeeId));
    } catch (error: any) {
      // Return null if no active shift found
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get all shift assignments with filtering
   */
  async getShiftAssignments(params: EmployeeShiftSearchParams): Promise<PaginatedResponse<EmployeeShiftDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockEmployeeShifts];

      // Apply filters
      if (params.employeeId) {
        filtered = filtered.filter(es => es.employeeId === params.employeeId);
      }
      if (params.shiftId) {
        filtered = filtered.filter(es => es.shiftId === params.shiftId);
      }
      if (params.isActive !== undefined) {
        filtered = filtered.filter(es => es.isActive === params.isActive);
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<EmployeeShiftDTO>>(
      `${this.ENDPOINTS.ASSIGNMENTS}?${queryParams}`
    );
  }

  /**
   * Check for shift conflicts for an employee
   */
  async checkShiftConflict(
    employeeId: number,
    effectiveFrom: string,
    effectiveTo?: string
  ): Promise<ShiftConflictDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();

      // Check for overlapping assignments
      const conflictingAssignments = mockEmployeeShifts.filter(es => {
        if (es.employeeId !== employeeId || !es.isActive) return false;

        const assignmentStart = new Date(es.effectiveFrom);
        const assignmentEnd = es.effectiveTo ? new Date(es.effectiveTo) : new Date('2099-12-31');
        const checkStart = new Date(effectiveFrom);
        const checkEnd = effectiveTo ? new Date(effectiveTo) : new Date('2099-12-31');

        // Check for overlap
        return assignmentStart <= checkEnd && assignmentEnd >= checkStart;
      });

      const hasConflict = conflictingAssignments.length > 0;
      const result: ShiftConflictDTO = {
        hasConflict,
        conflictingAssignments
      };

      // Only add message if there's a conflict (with exactOptionalPropertyTypes)
      if (hasConflict) {
        result.message = 'This employee already has a shift assignment for the selected date range.';
      }

      return result;
    }

    // Real API call
    const queryParams = this.buildQueryParams({ employeeId, effectiveFrom, effectiveTo });
    return apiClient.get<ShiftConflictDTO>(
      `${this.ENDPOINTS.CHECK_CONFLICT}?${queryParams}`
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

// ============================================================================
// EXPORTS
// ============================================================================

// Create and export singleton instance
const shiftApi = new ShiftApiClientImpl();

export default shiftApi;

// Export the class for testing purposes
export { ShiftApiClientImpl };
