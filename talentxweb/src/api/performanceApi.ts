// frontend/src/api/performanceApi.ts
import apiClient from "./axiosClient";
import {
  ReviewType,
  ReviewCycleStatus,
  PerformanceReviewType,
  PerformanceReviewStatus,
  GoalType,
  GoalCategory,
  GoalStatus,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { createPaginatedResponse, simulateDelay } from "./mockData";

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// ============================================================================
// PERFORMANCE REVIEW CYCLE DTOs
// ============================================================================

export interface PerformanceReviewCycleDTO {
  id: number;
  organizationId: number;
  name: string;
  reviewType: ReviewType;
  startDate: string;
  endDate: string;
  selfReviewDeadline?: string;
  managerReviewDeadline?: string;
  status: ReviewCycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReviewCycleCreateDTO {
  organizationId: number;
  name: string;
  reviewType: ReviewType;
  startDate: string;
  endDate: string;
  selfReviewDeadline?: string;
  managerReviewDeadline?: string;
}

export interface PerformanceReviewCycleUpdateDTO {
  name?: string;
  reviewType?: ReviewType;
  startDate?: string;
  endDate?: string;
  selfReviewDeadline?: string;
  managerReviewDeadline?: string;
  status?: ReviewCycleStatus;
}

export interface PerformanceReviewCycleSearchParams extends PaginationParams {
  organizationId?: number;
  reviewType?: ReviewType;
  status?: ReviewCycleStatus;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  search?: string;
}

// ============================================================================
// PERFORMANCE REVIEW DTOs
// ============================================================================

export interface PerformanceReviewDTO {
  id: number;
  reviewCycleId: number;
  employeeId: number;
  reviewerId: number;
  reviewType: PerformanceReviewType;
  overallRating?: number;
  strengths?: string;
  areasForImprovement?: string;
  achievements?: string;
  goalsNextPeriod?: string;
  status: PerformanceReviewStatus;
  submittedAt?: string;
  acknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for display
  employeeName?: string;
  reviewerName?: string;
  reviewCycleName?: string;
}

export interface PerformanceReviewCreateDTO {
  reviewCycleId: number;
  employeeId: number;
  reviewerId: number;
  reviewType: PerformanceReviewType;
  overallRating?: number;
  strengths?: string;
  areasForImprovement?: string;
  achievements?: string;
  goalsNextPeriod?: string;
}

export interface PerformanceReviewUpdateDTO {
  overallRating?: number;
  strengths?: string;
  areasForImprovement?: string;
  achievements?: string;
  goalsNextPeriod?: string;
  status?: PerformanceReviewStatus;
}

export interface PerformanceReviewSubmitDTO {
  overallRating?: number;
  strengths?: string;
  areasForImprovement?: string;
  achievements?: string;
  goalsNextPeriod?: string;
}

export interface PerformanceReviewSearchParams extends PaginationParams {
  reviewCycleId?: number;
  employeeId?: number;
  reviewerId?: number;
  reviewType?: PerformanceReviewType;
  status?: PerformanceReviewStatus;
  submittedAfter?: string;
  submittedBefore?: string;
  search?: string;
}

// ============================================================================
// GOAL DTOs
// ============================================================================

export interface GoalDTO {
  id: number;
  employeeId: number;
  title: string;
  description?: string;
  goalType: GoalType;
  category: GoalCategory;
  startDate?: string;
  targetDate?: string;
  completionDate?: string;
  progressPercentage: number;
  status: GoalStatus;
  weight?: number;
  measurementCriteria?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
  // Additional fields for display
  employeeName?: string;
  createdByName?: string;
}

export interface GoalCreateDTO {
  employeeId: number;
  title: string;
  description?: string;
  goalType: GoalType;
  category: GoalCategory;
  startDate?: string;
  targetDate?: string;
  weight?: number;
  measurementCriteria?: string;
}

export interface GoalUpdateDTO {
  title?: string;
  description?: string;
  goalType?: GoalType;
  category?: GoalCategory;
  startDate?: string;
  targetDate?: string;
  completionDate?: string;
  progressPercentage?: number;
  status?: GoalStatus;
  weight?: number;
  measurementCriteria?: string;
}

export interface GoalProgressUpdateDTO {
  progressPercentage: number;
  status?: GoalStatus;
  completionDate?: string;
}

export interface GoalSearchParams extends PaginationParams {
  employeeId?: number;
  goalType?: GoalType;
  category?: GoalCategory;
  status?: GoalStatus;
  createdBy?: number;
  startDateFrom?: string;
  startDateTo?: string;
  targetDateFrom?: string;
  targetDateTo?: string;
  search?: string;
}

// ============================================================================
// PERFORMANCE API CLIENT INTERFACE
// ============================================================================

export interface PerformanceApiClient {
  // Review Cycle methods
  getReviewCycles(params: PerformanceReviewCycleSearchParams): Promise<PaginatedResponse<PerformanceReviewCycleDTO>>;
  getReviewCycle(id: number): Promise<PerformanceReviewCycleDTO>;
  createReviewCycle(data: PerformanceReviewCycleCreateDTO): Promise<PerformanceReviewCycleDTO>;
  updateReviewCycle(id: number, data: PerformanceReviewCycleUpdateDTO): Promise<PerformanceReviewCycleDTO>;
  deleteReviewCycle(id: number): Promise<void>;

  // Performance Review methods
  getReviews(params: PerformanceReviewSearchParams): Promise<PaginatedResponse<PerformanceReviewDTO>>;
  getReview(id: number): Promise<PerformanceReviewDTO>;
  createReview(data: PerformanceReviewCreateDTO): Promise<PerformanceReviewDTO>;
  updateReview(id: number, data: PerformanceReviewUpdateDTO): Promise<PerformanceReviewDTO>;
  submitReview(id: number, data: PerformanceReviewSubmitDTO): Promise<PerformanceReviewDTO>;
  acknowledgeReview(id: number): Promise<PerformanceReviewDTO>;
  getEmployeeReviews(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<PerformanceReviewDTO>>;
  getReviewsByReviewer(reviewerId: number, params?: PaginationParams): Promise<PaginatedResponse<PerformanceReviewDTO>>;

  // Goal methods
  getGoals(params: GoalSearchParams): Promise<PaginatedResponse<GoalDTO>>;
  getGoal(id: number): Promise<GoalDTO>;
  createGoal(data: GoalCreateDTO): Promise<GoalDTO>;
  updateGoal(id: number, data: GoalUpdateDTO): Promise<GoalDTO>;
  updateGoalProgress(id: number, data: GoalProgressUpdateDTO): Promise<GoalDTO>;
  deleteGoal(id: number): Promise<void>;
  getEmployeeGoals(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<GoalDTO>>;
}

// ============================================================================
// PERFORMANCE API CLIENT IMPLEMENTATION
// ============================================================================

class PerformanceApiClientImpl implements PerformanceApiClient {
  private readonly ENDPOINTS = {
    // Review Cycle endpoints
    CYCLES: '/performance/cycles',
    CYCLE_BY_ID: (id: number) => `/performance/cycles/${id}`,

    // Performance Review endpoints
    REVIEWS: '/performance/reviews',
    REVIEW_BY_ID: (id: number) => `/performance/reviews/${id}`,
    REVIEW_SUBMIT: (id: number) => `/performance/reviews/${id}/submit`,
    REVIEW_ACKNOWLEDGE: (id: number) => `/performance/reviews/${id}/acknowledge`,
    REVIEWS_BY_EMPLOYEE: (employeeId: number) => `/performance/reviews/employee/${employeeId}`,
    REVIEWS_BY_REVIEWER: (reviewerId: number) => `/performance/reviews/reviewer/${reviewerId}`,

    // Goal endpoints
    GOALS: '/performance/goals',
    GOAL_BY_ID: (id: number) => `/performance/goals/${id}`,
    GOAL_PROGRESS: (id: number) => `/performance/goals/${id}/progress`,
    GOALS_BY_EMPLOYEE: (employeeId: number) => `/performance/goals/employee/${employeeId}`,
  } as const;

  // ============================================================================
  // REVIEW CYCLE METHODS
  // ============================================================================

  async getReviewCycles(params: PerformanceReviewCycleSearchParams): Promise<PaginatedResponse<PerformanceReviewCycleDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviewCycles } = await import('./mockData');

      let filtered = [...mockPerformanceReviewCycles];

      if (params.organizationId) {
        filtered = filtered.filter(c => c.organizationId === params.organizationId);
      }
      if (params.reviewType) {
        filtered = filtered.filter(c => c.reviewType === params.reviewType);
      }
      if (params.status) {
        filtered = filtered.filter(c => c.status === params.status);
      }
      if (params.startDateFrom) {
        filtered = filtered.filter(c => c.startDate >= params.startDateFrom!);
      }
      if (params.startDateTo) {
        filtered = filtered.filter(c => c.startDate <= params.startDateTo!);
      }
      if (params.endDateFrom) {
        filtered = filtered.filter(c => c.endDate >= params.endDateFrom!);
      }
      if (params.endDateTo) {
        filtered = filtered.filter(c => c.endDate <= params.endDateTo!);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(c => c.name.toLowerCase().includes(search));
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<PerformanceReviewCycleDTO>>(
      `${this.ENDPOINTS.CYCLES}?${queryParams}`
    );
  }

  async getReviewCycle(id: number): Promise<PerformanceReviewCycleDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviewCycles } = await import('./mockData');
      const cycle = mockPerformanceReviewCycles.find(c => c.id === id);
      if (!cycle) {
        throw new Error(`Review cycle with id ${id} not found`);
      }
      return cycle;
    }

    return apiClient.get<PerformanceReviewCycleDTO>(this.ENDPOINTS.CYCLE_BY_ID(id));
  }

  async createReviewCycle(data: PerformanceReviewCycleCreateDTO): Promise<PerformanceReviewCycleDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviewCycles } = await import('./mockData');
      const status: ReviewCycleStatus = ReviewCycleStatus.DRAFT;
      const newCycle: PerformanceReviewCycleDTO = {
        id: Math.max(...mockPerformanceReviewCycles.map(c => c.id), 0) + 1,
        ...data,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockPerformanceReviewCycles.push(newCycle);
      return newCycle;
    }

    return apiClient.post<PerformanceReviewCycleDTO>(this.ENDPOINTS.CYCLES, data);
  }

  async updateReviewCycle(id: number, data: PerformanceReviewCycleUpdateDTO): Promise<PerformanceReviewCycleDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviewCycles } = await import('./mockData');
      const index = mockPerformanceReviewCycles.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error(`Review cycle with id ${id} not found`);
      }
      mockPerformanceReviewCycles[index] = {
        ...mockPerformanceReviewCycles[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockPerformanceReviewCycles[index];
    }

    return apiClient.put<PerformanceReviewCycleDTO>(this.ENDPOINTS.CYCLE_BY_ID(id), data);
  }

  async deleteReviewCycle(id: number): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviewCycles } = await import('./mockData');
      const index = mockPerformanceReviewCycles.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error(`Review cycle with id ${id} not found`);
      }
      mockPerformanceReviewCycles.splice(index, 1);
      return;
    }

    return apiClient.delete<void>(this.ENDPOINTS.CYCLE_BY_ID(id));
  }

  // ============================================================================
  // PERFORMANCE REVIEW METHODS
  // ============================================================================

  async getReviews(params: PerformanceReviewSearchParams): Promise<PaginatedResponse<PerformanceReviewDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviews } = await import('./mockData');

      let filtered = [...mockPerformanceReviews];

      if (params.reviewCycleId) {
        filtered = filtered.filter(r => r.reviewCycleId === params.reviewCycleId);
      }
      if (params.employeeId) {
        filtered = filtered.filter(r => r.employeeId === params.employeeId);
      }
      if (params.reviewerId) {
        filtered = filtered.filter(r => r.reviewerId === params.reviewerId);
      }
      if (params.reviewType) {
        filtered = filtered.filter(r => r.reviewType === params.reviewType);
      }
      if (params.status) {
        filtered = filtered.filter(r => r.status === params.status);
      }
      if (params.submittedAfter) {
        filtered = filtered.filter(r => r.submittedAt && r.submittedAt >= params.submittedAfter!);
      }
      if (params.submittedBefore) {
        filtered = filtered.filter(r => r.submittedAt && r.submittedAt <= params.submittedBefore!);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(r =>
          r.employeeName?.toLowerCase().includes(search) ||
          r.reviewerName?.toLowerCase().includes(search)
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<PerformanceReviewDTO>>(
      `${this.ENDPOINTS.REVIEWS}?${queryParams}`
    );
  }

  async getReview(id: number): Promise<PerformanceReviewDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviews } = await import('./mockData');
      const review = mockPerformanceReviews.find(r => r.id === id);
      if (!review) {
        throw new Error(`Performance review with id ${id} not found`);
      }
      return review;
    }

    return apiClient.get<PerformanceReviewDTO>(this.ENDPOINTS.REVIEW_BY_ID(id));
  }

  async createReview(data: PerformanceReviewCreateDTO): Promise<PerformanceReviewDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviews } = await import('./mockData');
      const status: PerformanceReviewStatus = PerformanceReviewStatus.NOT_STARTED;
      const newReview: PerformanceReviewDTO = {
        id: Math.max(...mockPerformanceReviews.map(r => r.id), 0) + 1,
        ...data,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockPerformanceReviews.push(newReview);
      return newReview;
    }

    return apiClient.post<PerformanceReviewDTO>(this.ENDPOINTS.REVIEWS, data);
  }

  async updateReview(id: number, data: PerformanceReviewUpdateDTO): Promise<PerformanceReviewDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviews } = await import('./mockData');
      const index = mockPerformanceReviews.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Performance review with id ${id} not found`);
      }
      mockPerformanceReviews[index] = {
        ...mockPerformanceReviews[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockPerformanceReviews[index];
    }

    return apiClient.put<PerformanceReviewDTO>(this.ENDPOINTS.REVIEW_BY_ID(id), data);
  }

  async submitReview(id: number, data: PerformanceReviewSubmitDTO): Promise<PerformanceReviewDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviews } = await import('./mockData');
      const index = mockPerformanceReviews.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Performance review with id ${id} not found`);
      }
      mockPerformanceReviews[index] = {
        ...mockPerformanceReviews[index],
        ...data,
        status: 'SUBMITTED',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return mockPerformanceReviews[index];
    }

    return apiClient.put<PerformanceReviewDTO>(this.ENDPOINTS.REVIEW_SUBMIT(id), data);
  }

  async acknowledgeReview(id: number): Promise<PerformanceReviewDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviews } = await import('./mockData');
      const index = mockPerformanceReviews.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Performance review with id ${id} not found`);
      }
      mockPerformanceReviews[index] = {
        ...mockPerformanceReviews[index],
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return mockPerformanceReviews[index];
    }

    return apiClient.put<PerformanceReviewDTO>(this.ENDPOINTS.REVIEW_ACKNOWLEDGE(id), {});
  }

  async getEmployeeReviews(
    employeeId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<PerformanceReviewDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviews } = await import('./mockData');
      const filtered = mockPerformanceReviews.filter(r => r.employeeId === employeeId);
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<PerformanceReviewDTO>>(
      `${this.ENDPOINTS.REVIEWS_BY_EMPLOYEE(employeeId)}?${queryParams}`
    );
  }

  async getReviewsByReviewer(
    reviewerId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<PerformanceReviewDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockPerformanceReviews } = await import('./mockData');
      const filtered = mockPerformanceReviews.filter(r => r.reviewerId === reviewerId);
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<PerformanceReviewDTO>>(
      `${this.ENDPOINTS.REVIEWS_BY_REVIEWER(reviewerId)}?${queryParams}`
    );
  }

  // ============================================================================
  // GOAL METHODS
  // ============================================================================

  async getGoals(params: GoalSearchParams): Promise<PaginatedResponse<GoalDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockGoals } = await import('./mockData');

      let filtered = [...mockGoals];

      if (params.employeeId) {
        filtered = filtered.filter(g => g.employeeId === params.employeeId);
      }
      if (params.goalType) {
        filtered = filtered.filter(g => g.goalType === params.goalType);
      }
      if (params.category) {
        filtered = filtered.filter(g => g.category === params.category);
      }
      if (params.status) {
        filtered = filtered.filter(g => g.status === params.status);
      }
      if (params.createdBy) {
        filtered = filtered.filter(g => g.createdBy === params.createdBy);
      }
      if (params.startDateFrom) {
        filtered = filtered.filter(g => g.startDate && g.startDate >= params.startDateFrom!);
      }
      if (params.startDateTo) {
        filtered = filtered.filter(g => g.startDate && g.startDate <= params.startDateTo!);
      }
      if (params.targetDateFrom) {
        filtered = filtered.filter(g => g.targetDate && g.targetDate >= params.targetDateFrom!);
      }
      if (params.targetDateTo) {
        filtered = filtered.filter(g => g.targetDate && g.targetDate <= params.targetDateTo!);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(g =>
          g.title.toLowerCase().includes(search) ||
          (g.description && g.description.toLowerCase().includes(search))
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<GoalDTO>>(
      `${this.ENDPOINTS.GOALS}?${queryParams}`
    );
  }

  async getGoal(id: number): Promise<GoalDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockGoals } = await import('./mockData');
      const goal = mockGoals.find(g => g.id === id);
      if (!goal) {
        throw new Error(`Goal with id ${id} not found`);
      }
      return goal;
    }

    return apiClient.get<GoalDTO>(this.ENDPOINTS.GOAL_BY_ID(id));
  }

  async createGoal(data: GoalCreateDTO): Promise<GoalDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockGoals } = await import('./mockData');
      const status: GoalStatus = GoalStatus.NOT_STARTED;
      const newGoal: GoalDTO = {
        id: Math.max(...mockGoals.map(g => g.id), 0) + 1,
        ...data,
        progressPercentage: 0,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockGoals.push(newGoal);
      return newGoal;
    }

    return apiClient.post<GoalDTO>(this.ENDPOINTS.GOALS, data);
  }

  async updateGoal(id: number, data: GoalUpdateDTO): Promise<GoalDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockGoals } = await import('./mockData');
      const index = mockGoals.findIndex(g => g.id === id);
      if (index === -1) {
        throw new Error(`Goal with id ${id} not found`);
      }
      mockGoals[index] = {
        ...mockGoals[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockGoals[index];
    }

    return apiClient.put<GoalDTO>(this.ENDPOINTS.GOAL_BY_ID(id), data);
  }

  async updateGoalProgress(id: number, data: GoalProgressUpdateDTO): Promise<GoalDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockGoals } = await import('./mockData');
      const index = mockGoals.findIndex(g => g.id === id);
      if (index === -1) {
        throw new Error(`Goal with id ${id} not found`);
      }
      mockGoals[index] = {
        ...mockGoals[index],
        progressPercentage: data.progressPercentage,
        ...(data.status && { status: data.status }),
        ...(data.completionDate && { completionDate: data.completionDate }),
        updatedAt: new Date().toISOString()
      };
      return mockGoals[index];
    }

    return apiClient.put<GoalDTO>(this.ENDPOINTS.GOAL_PROGRESS(id), data);
  }

  async deleteGoal(id: number): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockGoals } = await import('./mockData');
      const index = mockGoals.findIndex(g => g.id === id);
      if (index === -1) {
        throw new Error(`Goal with id ${id} not found`);
      }
      mockGoals.splice(index, 1);
      return;
    }

    return apiClient.delete<void>(this.ENDPOINTS.GOAL_BY_ID(id));
  }

  async getEmployeeGoals(
    employeeId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<GoalDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockGoals } = await import('./mockData');
      const filtered = mockGoals.filter(g => g.employeeId === employeeId);
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<GoalDTO>>(
      `${this.ENDPOINTS.GOALS_BY_EMPLOYEE(employeeId)}?${queryParams}`
    );
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

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
const performanceApi = new PerformanceApiClientImpl();

export default performanceApi;

// Export the class for testing purposes
export { PerformanceApiClientImpl };