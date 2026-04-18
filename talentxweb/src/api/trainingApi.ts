// frontend/src/api/trainingApi.ts
import apiClient from "./axiosClient";
import {
  TrainingProgram,
  TrainingEnrollment,
  TrainingType,
  DeliveryMethod,
  TrainingEnrollmentStatus,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { createPaginatedResponse, simulateDelay } from "./mockData";

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// ============================================================================
// TRAINING PROGRAM DTOs
// ============================================================================

export interface TrainingProgramDTO {
  id: number;
  organizationId: number;
  title: string;
  description?: string | undefined;
  trainingType: TrainingType;
  deliveryMethod: DeliveryMethod;
  durationHours?: number | undefined;
  costPerParticipant?: number | undefined;
  maxParticipants?: number | undefined;
  provider?: string | undefined;
  externalUrl?: string | undefined;
  isMandatory: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingProgramCreateDTO {
  organizationId?: number | undefined;
  title: string;
  description?: string | undefined;
  trainingType: TrainingType;
  deliveryMethod: DeliveryMethod;
  durationHours?: number | undefined;
  costPerParticipant?: number | undefined;
  maxParticipants?: number | undefined;
  provider?: string | undefined;
  externalUrl?: string | undefined;
  isMandatory?: boolean | undefined;
  isActive?: boolean | undefined;
}

export interface TrainingProgramUpdateDTO {
  title?: string | undefined;
  description?: string | undefined;
  trainingType?: TrainingType | undefined;
  deliveryMethod?: DeliveryMethod | undefined;
  durationHours?: number | undefined;
  costPerParticipant?: number | undefined;
  maxParticipants?: number | undefined;
  provider?: string | undefined;
  externalUrl?: string | undefined;
  isMandatory?: boolean | undefined;
  isActive?: boolean | undefined;
}

export interface TrainingProgramSearchParams extends PaginationParams {
  organizationId?: number | undefined;
  trainingType?: TrainingType | undefined;
  deliveryMethod?: DeliveryMethod | undefined;
  isMandatory?: boolean | undefined;
  isActive?: boolean | undefined;
  search?: string | undefined;
}

// ============================================================================
// TRAINING ENROLLMENT DTOs
// ============================================================================

export interface TrainingEnrollmentDTO {
  id: number;
  trainingProgramId: number;
  employeeId: number;
  enrolledDate: string;
  startDate?: string | undefined;
  completionDate?: string | undefined;
  dueDate?: string | undefined;
  status: TrainingEnrollmentStatus;
  score?: number | undefined;
  passingScore?: number | undefined;
  certificateUrl?: string | undefined;
  assignedBy?: number | undefined;
  createdAt: string;
  updatedAt: string;
  // Additional fields for display
  trainingTitle?: string | undefined;
  employeeName?: string | undefined;
  assignedByName?: string | undefined;
  trainingProgram?: TrainingProgramDTO | undefined;
}

export interface TrainingEnrollmentCreateDTO {
  trainingProgramId: number;
  employeeId: number;
  startDate?: string | undefined;
  dueDate?: string | undefined;
  assignedBy?: number | undefined;
}

export interface TrainingEnrollmentUpdateDTO {
  startDate?: string | undefined;
  completionDate?: string | undefined;
  dueDate?: string | undefined;
  status?: TrainingEnrollmentStatus | undefined;
  score?: number | undefined;
  certificateUrl?: string | undefined;
}

export interface TrainingEnrollmentSearchParams extends PaginationParams {
  trainingProgramId?: number | undefined;
  employeeId?: number | undefined;
  status?: TrainingEnrollmentStatus | undefined;
  assignedBy?: number | undefined;
  dueDateFrom?: string | undefined;
  dueDateTo?: string | undefined;
  search?: string | undefined;
}

export interface BulkEnrollmentDTO {
  trainingProgramId: number;
  employeeIds: number[];
  dueDate?: string | undefined;
  assignedBy?: number | undefined;
}

// ============================================================================
// TRAINING COMPLETION AND STATISTICS DTOs
// ============================================================================

export interface TrainingEnrollmentCompleteDTO {
  completionDate: string;
  score?: number | undefined;
  certificateUrl?: string | undefined;
  notes?: string | undefined;
}

export interface TrainingStatsResponse {
  totalPrograms: number;
  activePrograms: number;
  totalEnrollments: number;
  completionRate: number;
  byType: Record<TrainingType, number>;
  byStatus: Record<TrainingEnrollmentStatus, number>;
}

export interface TrainingProgramStatsResponse {
  programId: number;
  enrollmentCount: number;
  completionCount: number;
  averageScore?: number | undefined;
}

// ============================================================================
// TRAINING API CLIENT INTERFACE
// ============================================================================

export interface TrainingApiClient {
  // Training program management
  getTrainingPrograms(params: TrainingProgramSearchParams): Promise<PaginatedResponse<TrainingProgramDTO>>;
  getTrainingProgram(id: number): Promise<TrainingProgramDTO>;
  createTrainingProgram(data: TrainingProgramCreateDTO): Promise<TrainingProgramDTO>;
  updateTrainingProgram(id: number, data: TrainingProgramUpdateDTO): Promise<TrainingProgramDTO>;
  deleteTrainingProgram(id: number): Promise<void>;
  getMandatoryTrainings(organizationId: number, params?: PaginationParams): Promise<PaginatedResponse<TrainingProgramDTO>>;

  // Training enrollment management
  getEnrollments(params: TrainingEnrollmentSearchParams): Promise<PaginatedResponse<TrainingEnrollmentDTO>>;
  getEnrollment(id: number): Promise<TrainingEnrollmentDTO>;
  createEnrollment(data: TrainingEnrollmentCreateDTO): Promise<TrainingEnrollmentDTO>;
  updateEnrollment(id: number, data: TrainingEnrollmentUpdateDTO): Promise<TrainingEnrollmentDTO>;
  deleteEnrollment(id: number): Promise<void>;
  bulkEnroll(data: BulkEnrollmentDTO): Promise<TrainingEnrollmentDTO[]>;
  getEmployeeEnrollments(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<TrainingEnrollmentDTO>>;
  getProgramEnrollments(programId: number, params?: PaginationParams): Promise<PaginatedResponse<TrainingEnrollmentDTO>>;

  // Method aliases for naming consistency
  getTrainingEnrollments(params: TrainingEnrollmentSearchParams): Promise<PaginatedResponse<TrainingEnrollmentDTO>>;
  createTrainingEnrollment(data: TrainingEnrollmentCreateDTO): Promise<TrainingEnrollmentDTO>;
  deleteTrainingEnrollment(id: number): Promise<void>;
  completeTrainingEnrollment(id: number, data: TrainingEnrollmentCompleteDTO): Promise<TrainingEnrollmentDTO>;

  // Statistics
  getTrainingStats(): Promise<TrainingStatsResponse>;
}

// ============================================================================
// TRAINING API CLIENT IMPLEMENTATION
// ============================================================================

class TrainingApiClientImpl implements TrainingApiClient {
  private readonly ENDPOINTS = {
    PROGRAMS: '/training/programs',
    PROGRAM_BY_ID: (id: number) => `/training/programs/${id}`,
    MANDATORY_PROGRAMS: '/training/programs/mandatory',
    ENROLLMENTS: '/training/enrollments',
    ENROLLMENT_BY_ID: (id: number) => `/training/enrollments/${id}`,
    ENROLLMENT_COMPLETE: (id: number) => `/training/enrollments/${id}/complete`,
    ENROLLMENT_CANCEL: (id: number) => `/training/enrollments/${id}/cancel`,
    ENROLLMENT_SEARCH: '/training/enrollments/search',
    ENROLLMENTS_BY_EMPLOYEE: (employeeId: number) => `/training/enrollments/employee/${employeeId}`,
    ENROLLMENTS_BY_PROGRAM: (programId: number) => `/training/enrollments/program/${programId}`,
  } as const;

  // ============================================================================
  // TRAINING PROGRAM METHODS
  // ============================================================================

  async getTrainingPrograms(params: TrainingProgramSearchParams): Promise<PaginatedResponse<TrainingProgramDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingPrograms } = await import('./mockData');

      let filtered = [...mockTrainingPrograms];

      if (params.organizationId) {
        filtered = filtered.filter(tp => tp.organizationId === params.organizationId);
      }
      if (params.trainingType) {
        filtered = filtered.filter(tp => tp.trainingType === params.trainingType);
      }
      if (params.deliveryMethod) {
        filtered = filtered.filter(tp => tp.deliveryMethod === params.deliveryMethod);
      }
      if (params.isMandatory !== undefined) {
        filtered = filtered.filter(tp => tp.isMandatory === params.isMandatory);
      }
      if (params.isActive !== undefined) {
        filtered = filtered.filter(tp => tp.isActive === params.isActive);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(tp =>
          tp.title.toLowerCase().includes(search) ||
          (tp.description && tp.description.toLowerCase().includes(search))
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const backendParams = {
      organizationId: params.organizationId ?? 1,
      title: params.search,
      trainingType: params.trainingType,
      deliveryMethod: params.deliveryMethod,
      isMandatory: params.isMandatory,
      page: params.page,
      size: params.size
    };
    const queryParams = this.buildQueryParams(backendParams);
    return apiClient.get<PaginatedResponse<TrainingProgramDTO>>(
      `${this.ENDPOINTS.PROGRAMS}?${queryParams}`
    );
  }

  async getTrainingProgram(id: number): Promise<TrainingProgramDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingPrograms } = await import('./mockData');
      const program = mockTrainingPrograms.find(tp => tp.id === id);
      if (!program) {
        throw new Error(`Training program with id ${id} not found`);
      }
      return program;
    }

    return apiClient.get<TrainingProgramDTO>(this.ENDPOINTS.PROGRAM_BY_ID(id));
  }

  async createTrainingProgram(data: TrainingProgramCreateDTO): Promise<TrainingProgramDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingPrograms } = await import('./mockData');
      const newProgram: TrainingProgramDTO = {
        id: Math.max(...mockTrainingPrograms.map(tp => tp.id), 0) + 1,
        organizationId: data.organizationId !== undefined ? data.organizationId : 1,
        title: data.title,
        trainingType: data.trainingType,
        deliveryMethod: data.deliveryMethod,
        isMandatory: data.isMandatory ?? false,
        isActive: data.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.durationHours !== undefined && { durationHours: data.durationHours }),
        ...(data.costPerParticipant !== undefined && { costPerParticipant: data.costPerParticipant }),
        ...(data.maxParticipants !== undefined && { maxParticipants: data.maxParticipants }),
        ...(data.provider !== undefined && { provider: data.provider }),
        ...(data.externalUrl !== undefined && { externalUrl: data.externalUrl })
      };
      mockTrainingPrograms.push(newProgram);
      return newProgram;
    }

    return apiClient.post<TrainingProgramDTO>(this.ENDPOINTS.PROGRAMS, data);
  }

  async updateTrainingProgram(id: number, data: TrainingProgramUpdateDTO): Promise<TrainingProgramDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingPrograms } = await import('./mockData');
      const index = mockTrainingPrograms.findIndex(tp => tp.id === id);
      if (index === -1) {
        throw new Error(`Training program with id ${id} not found`);
      }
      mockTrainingPrograms[index] = {
        ...mockTrainingPrograms[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockTrainingPrograms[index];
    }

    return apiClient.put<TrainingProgramDTO>(this.ENDPOINTS.PROGRAM_BY_ID(id), data);
  }

  async deleteTrainingProgram(id: number): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingPrograms } = await import('./mockData');
      const index = mockTrainingPrograms.findIndex(tp => tp.id === id);
      if (index === -1) {
        throw new Error(`Training program with id ${id} not found`);
      }
      mockTrainingPrograms.splice(index, 1);
      return;
    }

    return apiClient.delete<void>(this.ENDPOINTS.PROGRAM_BY_ID(id));
  }

  async getMandatoryTrainings(
    organizationId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<TrainingProgramDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingPrograms } = await import('./mockData');
      const filtered = mockTrainingPrograms.filter(tp =>
        tp.organizationId === organizationId && tp.isMandatory
      );
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams({ ...params, organizationId });
    return apiClient.get<PaginatedResponse<TrainingProgramDTO>>(
      `${this.ENDPOINTS.MANDATORY_PROGRAMS}?${queryParams}`
    );
  }

  // ============================================================================
  // TRAINING ENROLLMENT METHODS
  // ============================================================================

  async getEnrollments(params: TrainingEnrollmentSearchParams): Promise<PaginatedResponse<TrainingEnrollmentDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingEnrollments } = await import('./mockData');

      let filtered = [...mockTrainingEnrollments];

      if (params.trainingProgramId) {
        filtered = filtered.filter(te => te.trainingProgramId === params.trainingProgramId);
      }
      if (params.employeeId) {
        filtered = filtered.filter(te => te.employeeId === params.employeeId);
      }
      if (params.status) {
        filtered = filtered.filter(te => te.status === params.status);
      }
      if (params.assignedBy) {
        filtered = filtered.filter(te => te.assignedBy === params.assignedBy);
      }
      if (params.dueDateFrom) {
        filtered = filtered.filter(te => te.dueDate && te.dueDate >= params.dueDateFrom!);
      }
      if (params.dueDateTo) {
        filtered = filtered.filter(te => te.dueDate && te.dueDate <= params.dueDateTo!);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(te =>
          te.trainingTitle?.toLowerCase().includes(search) ||
          te.employeeName?.toLowerCase().includes(search)
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const backendParams = {
      employeeId: params.employeeId,
      trainingProgramId: params.trainingProgramId,
      status: params.status,
      assignedBy: params.assignedBy,
      page: params.page,
      size: params.size
    };
    const queryParams = this.buildQueryParams(backendParams);
    return apiClient.get<PaginatedResponse<TrainingEnrollmentDTO>>(
      `${this.ENDPOINTS.ENROLLMENT_SEARCH}?${queryParams}`
    );
  }

  async getEnrollment(id: number): Promise<TrainingEnrollmentDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingEnrollments } = await import('./mockData');
      const enrollment = mockTrainingEnrollments.find(te => te.id === id);
      if (!enrollment) {
        throw new Error(`Training enrollment with id ${id} not found`);
      }
      return enrollment;
    }

    return apiClient.get<TrainingEnrollmentDTO>(this.ENDPOINTS.ENROLLMENT_BY_ID(id));
  }

  async createEnrollment(data: TrainingEnrollmentCreateDTO): Promise<TrainingEnrollmentDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingEnrollments, mockTrainingPrograms, mockEmployees } = await import('./mockData');
      const program = mockTrainingPrograms.find(tp => tp.id === data.trainingProgramId);
      const employee = mockEmployees.find(e => e.id === data.employeeId);
      const status: TrainingEnrollmentStatus = TrainingEnrollmentStatus.ENROLLED;
      const newEnrollment: TrainingEnrollmentDTO = {
        id: Math.max(...mockTrainingEnrollments.map(te => te.id), 0) + 1,
        trainingProgramId: data.trainingProgramId,
        employeeId: data.employeeId,
        enrolledDate: new Date().toISOString(),
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(data.startDate && { startDate: data.startDate }),
        ...(data.dueDate && { dueDate: data.dueDate }),
        ...(data.assignedBy && { assignedBy: data.assignedBy }),
        ...(program && { trainingTitle: program.title, trainingProgram: program }),
        ...(employee && { employeeName: employee.fullName })
      };
      mockTrainingEnrollments.push(newEnrollment);
      return newEnrollment;
    }

    return apiClient.post<TrainingEnrollmentDTO>(this.ENDPOINTS.ENROLLMENTS, data);
  }

  async updateEnrollment(id: number, data: TrainingEnrollmentUpdateDTO): Promise<TrainingEnrollmentDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingEnrollments } = await import('./mockData');
      const index = mockTrainingEnrollments.findIndex(te => te.id === id);
      if (index === -1) {
        throw new Error(`Training enrollment with id ${id} not found`);
      }
      mockTrainingEnrollments[index] = {
        ...mockTrainingEnrollments[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockTrainingEnrollments[index];
    }

    return apiClient.put<TrainingEnrollmentDTO>(this.ENDPOINTS.ENROLLMENT_BY_ID(id), data);
  }

  async deleteEnrollment(id: number): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingEnrollments } = await import('./mockData');
      const index = mockTrainingEnrollments.findIndex(te => te.id === id);
      if (index === -1) {
        throw new Error(`Training enrollment with id ${id} not found`);
      }
      mockTrainingEnrollments.splice(index, 1);
      return;
    }

    await apiClient.put<TrainingEnrollmentDTO>(this.ENDPOINTS.ENROLLMENT_CANCEL(id), {});
  }

  async bulkEnroll(data: BulkEnrollmentDTO): Promise<TrainingEnrollmentDTO[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingEnrollments, mockTrainingPrograms, mockEmployees } = await import('./mockData');
      const program = mockTrainingPrograms.find(tp => tp.id === data.trainingProgramId);
      const newEnrollments: TrainingEnrollmentDTO[] = [];

      for (const employeeId of data.employeeIds) {
        const employee = mockEmployees.find(e => e.id === employeeId);
        const status: TrainingEnrollmentStatus = TrainingEnrollmentStatus.ENROLLED;
        const newEnrollment: TrainingEnrollmentDTO = {
          id: Math.max(...mockTrainingEnrollments.map(te => te.id), 0) + newEnrollments.length + 1,
          trainingProgramId: data.trainingProgramId,
          employeeId,
          enrolledDate: new Date().toISOString(),
          status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...(data.dueDate && { dueDate: data.dueDate }),
          ...(data.assignedBy && { assignedBy: data.assignedBy }),
          ...(program && { trainingTitle: program.title, trainingProgram: program }),
          ...(employee && { employeeName: employee.fullName })
        };
        mockTrainingEnrollments.push(newEnrollment);
        newEnrollments.push(newEnrollment);
      }

      return newEnrollments;
    }

    const enrollments = await Promise.all(
      data.employeeIds.map(employeeId =>
        this.createEnrollment({
          trainingProgramId: data.trainingProgramId,
          employeeId,
          dueDate: data.dueDate,
          assignedBy: data.assignedBy
        })
      )
    );
    return enrollments;
  }

  async getEmployeeEnrollments(
    employeeId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<TrainingEnrollmentDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingEnrollments } = await import('./mockData');
      const filtered = mockTrainingEnrollments.filter(te => te.employeeId === employeeId);
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<TrainingEnrollmentDTO>>(
      `${this.ENDPOINTS.ENROLLMENTS_BY_EMPLOYEE(employeeId)}?${queryParams}`
    );
  }

  async getProgramEnrollments(
    programId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<TrainingEnrollmentDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingEnrollments } = await import('./mockData');
      const filtered = mockTrainingEnrollments.filter(te => te.trainingProgramId === programId);
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<TrainingEnrollmentDTO>>(
      `${this.ENDPOINTS.ENROLLMENTS_BY_PROGRAM(programId)}?${queryParams}`
    );
  }

  // ============================================================================
  // METHOD ALIASES FOR NAMING CONSISTENCY
  // ============================================================================

  async getTrainingEnrollments(params: TrainingEnrollmentSearchParams): Promise<PaginatedResponse<TrainingEnrollmentDTO>> {
    return this.getEnrollments(params);
  }

  async createTrainingEnrollment(data: TrainingEnrollmentCreateDTO): Promise<TrainingEnrollmentDTO> {
    return this.createEnrollment(data);
  }

  async deleteTrainingEnrollment(id: number): Promise<void> {
    return this.deleteEnrollment(id);
  }

  async completeTrainingEnrollment(id: number, data: TrainingEnrollmentCompleteDTO): Promise<TrainingEnrollmentDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingEnrollments } = await import('./mockData');
      const index = mockTrainingEnrollments.findIndex(te => te.id === id);
      if (index === -1) {
        throw new Error(`Training enrollment with id ${id} not found`);
      }

      mockTrainingEnrollments[index] = {
        ...mockTrainingEnrollments[index],
        completionDate: data.completionDate,
        status: TrainingEnrollmentStatus.COMPLETED,
        ...(data.score !== undefined && { score: data.score }),
        ...(data.certificateUrl && { certificateUrl: data.certificateUrl }),
        updatedAt: new Date().toISOString()
      };
      return mockTrainingEnrollments[index];
    }

    return apiClient.put<TrainingEnrollmentDTO>(this.ENDPOINTS.ENROLLMENT_COMPLETE(id), {
      completionDate: data.completionDate,
      score: data.score,
      certificateUrl: data.certificateUrl
    });
  }

  // ============================================================================
  // STATISTICS METHODS
  // ============================================================================

  async getTrainingStats(): Promise<TrainingStatsResponse> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockTrainingPrograms, mockTrainingEnrollments } = await import('./mockData');

      const activePrograms = mockTrainingPrograms.filter(tp => tp.isActive).length;
      const completedEnrollments = mockTrainingEnrollments.filter(
        te => te.status === TrainingEnrollmentStatus.COMPLETED
      ).length;
      const completionRate = mockTrainingEnrollments.length > 0
        ? (completedEnrollments / mockTrainingEnrollments.length) * 100
        : 0;

      // Count by type
      const byType: Record<TrainingType, number> = {} as Record<TrainingType, number>;
      Object.values(TrainingType).forEach(type => {
        byType[type] = mockTrainingPrograms.filter(tp => tp.trainingType === type).length;
      });

      // Count by status
      const byStatus: Record<TrainingEnrollmentStatus, number> = {} as Record<TrainingEnrollmentStatus, number>;
      Object.values(TrainingEnrollmentStatus).forEach(status => {
        byStatus[status] = mockTrainingEnrollments.filter(te => te.status === status).length;
      });

      return {
        totalPrograms: mockTrainingPrograms.length,
        activePrograms,
        totalEnrollments: mockTrainingEnrollments.length,
        completionRate,
        byType,
        byStatus
      };
    }

    const stats = await apiClient.get<any>('/training/statistics');
    return {
      totalPrograms: stats.totalPrograms || 0,
      activePrograms: stats.totalPrograms || 0,
      totalEnrollments: stats.totalEnrollments || 0,
      completionRate: stats.completionRate || 0,
      byType: {} as Record<TrainingType, number>,
      byStatus: {
        [TrainingEnrollmentStatus.ENROLLED]: 0,
        [TrainingEnrollmentStatus.IN_PROGRESS]: stats.inProgressEnrollments || 0,
        [TrainingEnrollmentStatus.COMPLETED]: stats.completedEnrollments || 0,
        [TrainingEnrollmentStatus.FAILED]: 0,
        [TrainingEnrollmentStatus.CANCELLED]: 0,
        [TrainingEnrollmentStatus.EXPIRED]: stats.overdueEnrollments || 0
      }
    };
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

const trainingApi = new TrainingApiClientImpl();

export default trainingApi;

export { TrainingApiClientImpl };
