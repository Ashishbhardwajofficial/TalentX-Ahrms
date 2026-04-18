// frontend/src/api/exitApi.ts
import apiClient from "./axiosClient";
import {
  ExitStatus,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { createPaginatedResponse, simulateDelay } from "./mockData";

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// ============================================================================
// EXIT DTOs
// ============================================================================

export interface EmployeeExitDTO {
  id: number;
  employeeId: number;
  resignationDate: string;
  lastWorkingDay: string;
  exitReason?: string;
  exitType: ExitType;
  status: ExitStatus;
  approvedBy?: number;
  approvedAt?: string;
  exitInterviewCompleted: boolean;
  exitInterviewDate?: string;
  exitInterviewNotes?: string;
  assetsReturned: boolean;
  clearanceCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional fields for display
  employeeName?: string;
  employeeNumber?: string;
  departmentName?: string;
  approverName?: string;
}

export interface EmployeeExitCreateDTO {
  employeeId: number;
  resignationDate: string;
  lastWorkingDay: string;
  exitReason?: string;
  exitType?: ExitType;
}

export interface EmployeeExitUpdateDTO {
  resignationDate?: string;
  lastWorkingDay?: string;
  exitReason?: string;
  exitType?: ExitType;
  status?: ExitStatus;
  exitInterviewCompleted?: boolean;
  exitInterviewDate?: string;
  exitInterviewNotes?: string;
  assetsReturned?: boolean;
  clearanceCompleted?: boolean;
}

export interface ExitSearchParams extends PaginationParams {
  employeeId?: number;
  status?: ExitStatus;
  exitType?: ExitType;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ExitApprovalDTO {
  approvedBy: number;
  approvedAt?: string;
}

export interface ExitInterviewDTO {
  exitInterviewCompleted: boolean;
  exitInterviewDate: string;
  exitInterviewNotes?: string;
}

export interface EmployeeExitWithdrawDTO {
  withdrawalReason?: string;
}

export interface EmployeeExitApproveDTO {
  approvedBy: number;
  approvalComments?: string;
}

export interface EmployeeExitCompleteDTO {
  completedBy?: number;
  completionDate?: string;
  completionNotes?: string;
}

export enum ExitType {
  RESIGNATION = 'RESIGNATION',
  TERMINATION = 'TERMINATION',
  RETIREMENT = 'RETIREMENT',
  END_OF_CONTRACT = 'END_OF_CONTRACT',
  MUTUAL_AGREEMENT = 'MUTUAL_AGREEMENT'
}

// ============================================================================
// EXIT API CLIENT INTERFACE
// ============================================================================

export interface ExitApiClient {
  // Exit management
  getExits(params: ExitSearchParams): Promise<PaginatedResponse<EmployeeExitDTO>>;
  getExit(id: number): Promise<EmployeeExitDTO>;
  createExit(data: EmployeeExitCreateDTO): Promise<EmployeeExitDTO>;
  updateExit(id: number, data: EmployeeExitUpdateDTO): Promise<EmployeeExitDTO>;
  deleteExit(id: number): Promise<void>;
  getExitByEmployee(employeeId: number): Promise<EmployeeExitDTO>;

  // Exit workflow
  approveExit(id: number, data: ExitApprovalDTO): Promise<EmployeeExitDTO>;
  withdrawExit(id: number, data?: { withdrawalReason?: string }): Promise<EmployeeExitDTO>;
  completeExit(id: number, data?: { completionNotes?: string }): Promise<EmployeeExitDTO>;

  // Exit interview
  updateExitInterview(id: number, data: ExitInterviewDTO): Promise<EmployeeExitDTO>;
}

// ============================================================================
// EXIT API CLIENT IMPLEMENTATION
// ============================================================================

class ExitApiClientImpl implements ExitApiClient {
  private readonly ENDPOINTS = {
    EXITS: '/exits',
    EXIT_BY_ID: (id: number) => `/exits/${id}`,
    EXIT_BY_EMPLOYEE: (employeeId: number) => `/exits/employee/${employeeId}`,
    APPROVE_EXIT: (id: number) => `/exits/${id}/approve`,
    WITHDRAW_EXIT: (id: number) => `/exits/${id}/withdraw`,
    COMPLETE_EXIT: (id: number) => `/exits/${id}/complete`,
    EXIT_INTERVIEW: (id: number) => `/exits/${id}/interview`,
  } as const;

  // ============================================================================
  // EXIT MANAGEMENT METHODS
  // ============================================================================

  async getExits(params: ExitSearchParams): Promise<PaginatedResponse<EmployeeExitDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeExits } = await import('./mockData');

      let filtered = [...mockEmployeeExits];

      if (params.employeeId) {
        filtered = filtered.filter(e => e.employeeId === params.employeeId);
      }
      if (params.status) {
        filtered = filtered.filter(e => e.status === params.status);
      }
      if (params.exitType) {
        filtered = filtered.filter(e => e.exitType === params.exitType);
      }
      if (params.startDate) {
        filtered = filtered.filter(e => e.resignationDate >= params.startDate!);
      }
      if (params.endDate) {
        filtered = filtered.filter(e => e.resignationDate <= params.endDate!);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(e =>
          e.employeeName?.toLowerCase().includes(search) ||
          e.employeeNumber?.toLowerCase().includes(search) ||
          e.exitReason?.toLowerCase().includes(search)
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<EmployeeExitDTO>>(
      `${this.ENDPOINTS.EXITS}?${queryParams}`
    );
  }

  async getExit(id: number): Promise<EmployeeExitDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeExits } = await import('./mockData');
      const exit = mockEmployeeExits.find(e => e.id === id);
      if (!exit) {
        throw new Error(`Exit with id ${id} not found`);
      }
      return exit;
    }

    return apiClient.get<EmployeeExitDTO>(this.ENDPOINTS.EXIT_BY_ID(id));
  }

  async createExit(data: EmployeeExitCreateDTO): Promise<EmployeeExitDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeExits, mockEmployees } = await import('./mockData');
      const employee = mockEmployees.find(e => e.id === data.employeeId);
      const status: ExitStatus = ExitStatus.INITIATED;
      const newExit: EmployeeExitDTO = {
        id: Math.max(...mockEmployeeExits.map(e => e.id), 0) + 1,
        ...data,
        exitType: data.exitType || ExitType.RESIGNATION,
        status,
        exitInterviewCompleted: false,
        assetsReturned: false,
        clearanceCompleted: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(employee && {
          employeeName: employee.fullName,
          employeeNumber: employee.employeeNumber,
          departmentName: employee.departmentName
        })
      };
      mockEmployeeExits.push(newExit);
      return newExit;
    }

    return apiClient.post<EmployeeExitDTO>(this.ENDPOINTS.EXITS, {
      ...data,
      exitType: data.exitType || ExitType.RESIGNATION
    });
  }

  async updateExit(id: number, data: EmployeeExitUpdateDTO): Promise<EmployeeExitDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeExits } = await import('./mockData');
      const index = mockEmployeeExits.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Exit with id ${id} not found`);
      }
      mockEmployeeExits[index] = {
        ...mockEmployeeExits[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockEmployeeExits[index];
    }

    return apiClient.put<EmployeeExitDTO>(this.ENDPOINTS.EXIT_BY_ID(id), data);
  }

  async deleteExit(id: number): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeExits } = await import('./mockData');
      const index = mockEmployeeExits.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Exit with id ${id} not found`);
      }
      mockEmployeeExits.splice(index, 1);
      return;
    }

    return apiClient.delete<void>(this.ENDPOINTS.EXIT_BY_ID(id));
  }

  async getExitByEmployee(employeeId: number): Promise<EmployeeExitDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeExits } = await import('./mockData');
      const exit = mockEmployeeExits.find(e => e.employeeId === employeeId && e.status !== ExitStatus.COMPLETED);
      if (!exit) {
        throw new Error(`Active exit for employee ${employeeId} not found`);
      }
      return exit;
    }

    return apiClient.get<EmployeeExitDTO>(this.ENDPOINTS.EXIT_BY_EMPLOYEE(employeeId));
  }

  // ============================================================================
  // EXIT WORKFLOW METHODS
  // ============================================================================

  async approveExit(id: number, data: ExitApprovalDTO): Promise<EmployeeExitDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeExits, mockEmployees } = await import('./mockData');
      const index = mockEmployeeExits.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Exit with id ${id} not found`);
      }
      const approver = mockEmployees.find(e => e.id === data.approvedBy);
      const status: ExitStatus = ExitStatus.APPROVED;
      mockEmployeeExits[index] = {
        ...mockEmployeeExits[index],
        status,
        approvedBy: data.approvedBy,
        approvedAt: data.approvedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(approver && { approverName: approver.fullName })
      };
      return mockEmployeeExits[index];
    }

    return apiClient.put<EmployeeExitDTO>(this.ENDPOINTS.APPROVE_EXIT(id), data);
  }

  async withdrawExit(id: number, data?: { withdrawalReason?: string }): Promise<EmployeeExitDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeExits } = await import('./mockData');
      const index = mockEmployeeExits.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Exit with id ${id} not found`);
      }
      const status: ExitStatus = ExitStatus.WITHDRAWN;
      mockEmployeeExits[index] = {
        ...mockEmployeeExits[index],
        status,
        updatedAt: new Date().toISOString()
      };
      return mockEmployeeExits[index];
    }

    return apiClient.put<EmployeeExitDTO>(this.ENDPOINTS.WITHDRAW_EXIT(id), data || {});
  }

  async completeExit(id: number, data?: { completionNotes?: string }): Promise<EmployeeExitDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeExits } = await import('./mockData');
      const index = mockEmployeeExits.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Exit with id ${id} not found`);
      }
      const status: ExitStatus = ExitStatus.COMPLETED;
      mockEmployeeExits[index] = {
        ...mockEmployeeExits[index],
        status,
        updatedAt: new Date().toISOString()
      };
      return mockEmployeeExits[index];
    }

    return apiClient.put<EmployeeExitDTO>(this.ENDPOINTS.COMPLETE_EXIT(id), data || {});
  }

  // ============================================================================
  // EXIT INTERVIEW METHODS
  // ============================================================================

  async updateExitInterview(id: number, data: ExitInterviewDTO): Promise<EmployeeExitDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeExits } = await import('./mockData');
      const index = mockEmployeeExits.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Exit with id ${id} not found`);
      }
      mockEmployeeExits[index] = {
        ...mockEmployeeExits[index],
        exitInterviewCompleted: data.exitInterviewCompleted,
        exitInterviewDate: data.exitInterviewDate,
        exitInterviewNotes: data.exitInterviewNotes,
        updatedAt: new Date().toISOString()
      };
      return mockEmployeeExits[index];
    }

    return apiClient.put<EmployeeExitDTO>(this.ENDPOINTS.EXIT_INTERVIEW(id), data);
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

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

const exitApi = new ExitApiClientImpl();

export default exitApi;

export { ExitApiClientImpl };
