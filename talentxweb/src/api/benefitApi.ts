// frontend/src/api/benefitApi.ts
import apiClient from "./axiosClient";
import {
  BenefitPlan,
  EmployeeBenefit,
  BenefitPlanType,
  BenefitStatus,
  CoverageLevel,
  CostFrequency,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { createPaginatedResponse, simulateDelay } from "./mockData";

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// ============================================================================
// BENEFIT PLAN DTOs
// ============================================================================

export interface BenefitPlanDTO {
  id: number;
  organizationId: number;
  name: string;
  planType: BenefitPlanType;
  description?: string;
  provider?: string;
  employeeCost?: number;
  employerCost?: number;
  costFrequency: CostFrequency;
  isActive: boolean;
  effectiveDate?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BenefitPlanCreateDTO {
  organizationId: number;
  name: string;
  planType: BenefitPlanType;
  description?: string;
  provider?: string;
  employeeCost?: number;
  employerCost?: number;
  costFrequency: CostFrequency;
  isActive?: boolean;
  effectiveDate?: string;
  expiryDate?: string;
}

export interface BenefitPlanUpdateDTO {
  name?: string;
  planType?: BenefitPlanType;
  description?: string;
  provider?: string;
  employeeCost?: number;
  employerCost?: number;
  costFrequency?: CostFrequency;
  isActive?: boolean;
  effectiveDate?: string;
  expiryDate?: string;
}

export interface BenefitPlanSearchParams extends PaginationParams {
  organizationId?: number;
  planType?: BenefitPlanType;
  isActive?: boolean;
  search?: string;
}

// ============================================================================
// EMPLOYEE BENEFIT DTOs
// ============================================================================

export interface EmployeeBenefitDTO {
  id: number;
  employeeId: number;
  benefitPlanId: number;
  enrollmentDate: string;
  effectiveDate: string;
  terminationDate?: string;
  status: BenefitStatus;
  coverageLevel: CoverageLevel;
  beneficiaries?: any;
  createdAt: string;
  updatedAt: string;
  // Additional fields for display
  benefitPlanName?: string;
  employeeName?: string;
  planType?: BenefitPlanType;
  benefitPlan?: BenefitPlanDTO;
}

export interface EmployeeBenefitCreateDTO {
  employeeId: number;
  benefitPlanId: number;
  enrollmentDate: string;
  effectiveDate: string;
  coverageLevel: CoverageLevel;
  beneficiaries?: any;
}

export interface EmployeeBenefitUpdateDTO {
  effectiveDate?: string;
  terminationDate?: string;
  status?: BenefitStatus;
  coverageLevel?: CoverageLevel;
  beneficiaries?: any;
}

export interface EmployeeBenefitSearchParams extends PaginationParams {
  employeeId?: number;
  benefitPlanId?: number;
  status?: BenefitStatus;
  planType?: BenefitPlanType;
  search?: string;
}

// ============================================================================
// BENEFIT API CLIENT INTERFACE
// ============================================================================

export interface BenefitApiClient {
  // Benefit plan management
  getBenefitPlans(params: BenefitPlanSearchParams): Promise<PaginatedResponse<BenefitPlanDTO>>;
  getBenefitPlan(id: number): Promise<BenefitPlanDTO>;
  createBenefitPlan(data: BenefitPlanCreateDTO): Promise<BenefitPlanDTO>;
  updateBenefitPlan(id: number, data: BenefitPlanUpdateDTO): Promise<BenefitPlanDTO>;
  deleteBenefitPlan(id: number): Promise<void>;
  getActiveBenefitPlans(organizationId: number, params: PaginationParams): Promise<PaginatedResponse<BenefitPlanDTO>>;

  // Employee benefit management
  getEmployeeBenefits(params: EmployeeBenefitSearchParams): Promise<PaginatedResponse<EmployeeBenefitDTO>>;
  getEmployeeBenefit(id: number): Promise<EmployeeBenefitDTO>;
  createEmployeeBenefit(data: EmployeeBenefitCreateDTO): Promise<EmployeeBenefitDTO>;
  updateEmployeeBenefit(id: number, data: EmployeeBenefitUpdateDTO): Promise<EmployeeBenefitDTO>;
  deleteEmployeeBenefit(id: number): Promise<void>;
  getBenefitsByEmployee(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<EmployeeBenefitDTO>>;
  terminateEmployeeBenefit(id: number, terminationDate: string): Promise<EmployeeBenefitDTO>;

  // Aliases for consistency
  getEmployeeBenefitsByEmployee(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<EmployeeBenefitDTO>>;
  terminateBenefit(id: number, data: { terminationDate: string }): Promise<EmployeeBenefitDTO>;
  enrollEmployee(data: EmployeeBenefitCreateDTO): Promise<EmployeeBenefitDTO>;
}

// ============================================================================
// BENEFIT API CLIENT IMPLEMENTATION
// ============================================================================

class BenefitApiClientImpl implements BenefitApiClient {
  private readonly ENDPOINTS = {
    PLANS: '/benefits/plans',
    PLAN_BY_ID: (id: number) => `/benefits/plans/${id}`,
    ACTIVE_PLANS: '/benefits/plans/active',
    EMPLOYEE_BENEFITS: '/benefits/enrollments',
    EMPLOYEE_BENEFIT_BY_ID: (id: number) => `/benefits/enrollments/${id}`,
    BENEFITS_BY_EMPLOYEE: (employeeId: number) => `/benefits/enrollments/employee/${employeeId}`,
    TERMINATE_BENEFIT: (id: number) => `/benefits/employee-benefits/${id}/terminate`,
  } as const;

  // ============================================================================
  // BENEFIT PLAN METHODS
  // ============================================================================

  async getBenefitPlans(params: BenefitPlanSearchParams): Promise<PaginatedResponse<BenefitPlanDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockBenefitPlans } = await import('./mockData');

      let filtered = [...mockBenefitPlans];

      if (params.organizationId) {
        filtered = filtered.filter(bp => bp.organizationId === params.organizationId);
      }
      if (params.planType) {
        filtered = filtered.filter(bp => bp.planType === params.planType);
      }
      if (params.isActive !== undefined) {
        filtered = filtered.filter(bp => bp.isActive === params.isActive);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(bp =>
          bp.name.toLowerCase().includes(search) ||
          (bp.description && bp.description.toLowerCase().includes(search))
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<BenefitPlanDTO>>(
      `${this.ENDPOINTS.PLANS}?${queryParams}`
    );
  }

  async getBenefitPlan(id: number): Promise<BenefitPlanDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockBenefitPlans } = await import('./mockData');
      const plan = mockBenefitPlans.find(bp => bp.id === id);
      if (!plan) {
        throw new Error(`Benefit plan with id ${id} not found`);
      }
      return plan;
    }

    return apiClient.get<BenefitPlanDTO>(this.ENDPOINTS.PLAN_BY_ID(id));
  }

  async createBenefitPlan(data: BenefitPlanCreateDTO): Promise<BenefitPlanDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockBenefitPlans } = await import('./mockData');
      const newPlan: BenefitPlanDTO = {
        id: Math.max(...mockBenefitPlans.map(bp => bp.id), 0) + 1,
        ...data,
        isActive: data.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockBenefitPlans.push(newPlan);
      return newPlan;
    }

    return apiClient.post<BenefitPlanDTO>(this.ENDPOINTS.PLANS, data);
  }

  async updateBenefitPlan(id: number, data: BenefitPlanUpdateDTO): Promise<BenefitPlanDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockBenefitPlans } = await import('./mockData');
      const index = mockBenefitPlans.findIndex(bp => bp.id === id);
      if (index === -1) {
        throw new Error(`Benefit plan with id ${id} not found`);
      }
      mockBenefitPlans[index] = {
        ...mockBenefitPlans[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockBenefitPlans[index];
    }

    return apiClient.put<BenefitPlanDTO>(this.ENDPOINTS.PLAN_BY_ID(id), data);
  }

  async deleteBenefitPlan(id: number): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockBenefitPlans } = await import('./mockData');
      const index = mockBenefitPlans.findIndex(bp => bp.id === id);
      if (index === -1) {
        throw new Error(`Benefit plan with id ${id} not found`);
      }
      mockBenefitPlans.splice(index, 1);
      return;
    }

    return apiClient.delete<void>(this.ENDPOINTS.PLAN_BY_ID(id));
  }

  async getActiveBenefitPlans(
    organizationId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<BenefitPlanDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockBenefitPlans } = await import('./mockData');
      const filtered = mockBenefitPlans.filter(
        bp => bp.organizationId === organizationId && bp.isActive
      );
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    const plans = await apiClient.get<BenefitPlanDTO[]>(
      `${this.ENDPOINTS.ACTIVE_PLANS}?${queryParams}`
    );
    return this.arrayToPage(plans, params.page, params.size);
  }

  // ============================================================================
  // EMPLOYEE BENEFIT METHODS
  // ============================================================================

  async getEmployeeBenefits(params: EmployeeBenefitSearchParams): Promise<PaginatedResponse<EmployeeBenefitDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeBenefits } = await import('./mockData');

      let filtered = [...mockEmployeeBenefits];

      if (params.employeeId) {
        filtered = filtered.filter(eb => eb.employeeId === params.employeeId);
      }
      if (params.benefitPlanId) {
        filtered = filtered.filter(eb => eb.benefitPlanId === params.benefitPlanId);
      }
      if (params.status) {
        filtered = filtered.filter(eb => eb.status === params.status);
      }
      if (params.planType) {
        filtered = filtered.filter(eb => eb.planType === params.planType);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(eb =>
          eb.benefitPlanName?.toLowerCase().includes(search) ||
          eb.employeeName?.toLowerCase().includes(search)
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<EmployeeBenefitDTO>>(
      `${this.ENDPOINTS.EMPLOYEE_BENEFITS}?${queryParams}`
    );
  }

  async getEmployeeBenefit(id: number): Promise<EmployeeBenefitDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeBenefits } = await import('./mockData');
      const benefit = mockEmployeeBenefits.find(eb => eb.id === id);
      if (!benefit) {
        throw new Error(`Employee benefit with id ${id} not found`);
      }
      return benefit;
    }

    return apiClient.get<EmployeeBenefitDTO>(this.ENDPOINTS.EMPLOYEE_BENEFIT_BY_ID(id));
  }

  async createEmployeeBenefit(data: EmployeeBenefitCreateDTO): Promise<EmployeeBenefitDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeBenefits, mockBenefitPlans, mockEmployees } = await import('./mockData');
      const plan = mockBenefitPlans.find(bp => bp.id === data.benefitPlanId);
      const employee = mockEmployees.find(e => e.id === data.employeeId);
      const status: BenefitStatus = BenefitStatus.ACTIVE;
      const newBenefit: EmployeeBenefitDTO = {
        id: Math.max(...mockEmployeeBenefits.map(eb => eb.id), 0) + 1,
        ...data,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(plan && { benefitPlanName: plan.name, planType: plan.planType, benefitPlan: plan }),
        ...(employee && { employeeName: employee.fullName })
      };
      mockEmployeeBenefits.push(newBenefit);
      return newBenefit;
    }

    return apiClient.post<EmployeeBenefitDTO>(this.ENDPOINTS.EMPLOYEE_BENEFITS, data);
  }

  async updateEmployeeBenefit(id: number, data: EmployeeBenefitUpdateDTO): Promise<EmployeeBenefitDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeBenefits } = await import('./mockData');
      const index = mockEmployeeBenefits.findIndex(eb => eb.id === id);
      if (index === -1) {
        throw new Error(`Employee benefit with id ${id} not found`);
      }
      mockEmployeeBenefits[index] = {
        ...mockEmployeeBenefits[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockEmployeeBenefits[index];
    }

    return apiClient.put<EmployeeBenefitDTO>(this.ENDPOINTS.EMPLOYEE_BENEFIT_BY_ID(id), data);
  }

  async deleteEmployeeBenefit(id: number): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeBenefits } = await import('./mockData');
      const index = mockEmployeeBenefits.findIndex(eb => eb.id === id);
      if (index === -1) {
        throw new Error(`Employee benefit with id ${id} not found`);
      }
      mockEmployeeBenefits.splice(index, 1);
      return;
    }

    return apiClient.delete<void>(this.ENDPOINTS.EMPLOYEE_BENEFIT_BY_ID(id));
  }

  async getBenefitsByEmployee(
    employeeId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<EmployeeBenefitDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeBenefits } = await import('./mockData');
      const filtered = mockEmployeeBenefits.filter(eb => eb.employeeId === employeeId);
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    const benefits = await apiClient.get<EmployeeBenefitDTO[]>(
      `${this.ENDPOINTS.BENEFITS_BY_EMPLOYEE(employeeId)}?${queryParams}`
    );
    return this.arrayToPage(benefits, params.page, params.size);
  }

  async terminateEmployeeBenefit(id: number, terminationDate: string): Promise<EmployeeBenefitDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeBenefits } = await import('./mockData');
      const index = mockEmployeeBenefits.findIndex(eb => eb.id === id);
      if (index === -1) {
        throw new Error(`Employee benefit with id ${id} not found`);
      }
      const status: BenefitStatus = BenefitStatus.TERMINATED;
      mockEmployeeBenefits[index] = {
        ...mockEmployeeBenefits[index],
        terminationDate,
        status,
        updatedAt: new Date().toISOString()
      };
      return mockEmployeeBenefits[index];
    }

    return apiClient.put<EmployeeBenefitDTO>(
      `/benefits/enrollments/${id}/terminate`,
      { terminationDate }
    );
  }

  // ============================================================================
  // BENEFIT API ALIASES
  // ============================================================================

  async getEmployeeBenefitsByEmployee(
    employeeId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<EmployeeBenefitDTO>> {
    return this.getBenefitsByEmployee(employeeId, params);
  }

  async terminateBenefit(id: number, data: { terminationDate: string }): Promise<EmployeeBenefitDTO> {
    return this.terminateEmployeeBenefit(id, data.terminationDate);
  }

  async enrollEmployee(data: EmployeeBenefitCreateDTO): Promise<EmployeeBenefitDTO> {
    return this.createEmployeeBenefit(data);
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

  private arrayToPage<T>(items: T[], page = 0, size = 10): PaginatedResponse<T> {
    const start = page * size;
    const end = start + size;

    return {
      content: items.slice(start, end),
      totalElements: items.length,
      totalPages: Math.ceil(items.length / size),
      last: end >= items.length,
      size,
      number: page,
      first: page === 0,
    };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const benefitApi = new BenefitApiClientImpl();

export default benefitApi;

export { BenefitApiClientImpl };
