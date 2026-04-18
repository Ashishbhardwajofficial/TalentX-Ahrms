// frontend/src/api/complianceApi.ts
import apiClient from "./axiosClient";
import {
  JurisdictionType,
  ComplianceRuleCategory,
  ComplianceCheckStatus,
  ComplianceSeverity,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { createPaginatedResponse, simulateDelay } from "./mockData";

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Compliance API request/response types
export interface ComplianceJurisdictionDTO {
  id: number;
  countryCode: string;
  stateProvinceCode?: string;
  name: string;
  jurisdictionType: JurisdictionType;
  parentJurisdictionId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceJurisdictionCreateDTO {
  countryCode: string;
  stateProvinceCode?: string | undefined;
  name: string;
  jurisdictionType: JurisdictionType;
  parentJurisdictionId?: number | undefined;
  isActive?: boolean | undefined;
}

export interface ComplianceJurisdictionUpdateDTO extends Partial<ComplianceJurisdictionCreateDTO> {
  id: number;
}

export interface ComplianceRuleDTO {
  id: number;
  jurisdictionId: number;
  ruleCategory: ComplianceRuleCategory;
  ruleName: string;
  description?: string;
  ruleData?: any;
  effectiveDate?: string;
  expiryDate?: string;
  sourceUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  jurisdiction?: ComplianceJurisdictionDTO;
}

export interface ComplianceRuleCreateDTO {
  jurisdictionId: number;
  ruleCategory: ComplianceRuleCategory;
  ruleName: string;
  description?: string | undefined;
  ruleData?: any;
  effectiveDate?: string | undefined;
  expiryDate?: string | undefined;
  sourceUrl?: string | undefined;
  isActive?: boolean | undefined;
}

export interface ComplianceRuleUpdateDTO extends Partial<ComplianceRuleCreateDTO> {
  id: number;
}

export interface ComplianceCheckDTO {
  id: number;
  organizationId: number;
  employeeId?: number;
  ruleId: number;
  checkDate: string;
  status: ComplianceCheckStatus;
  violationDetails?: any;
  severity: ComplianceSeverity;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: number;
  resolutionNotes?: string;
  createdAt: string;
  rule?: ComplianceRuleDTO;
  employeeName?: string;
}

export interface ComplianceCheckRunRequest {
  organizationId: number;
  employeeId?: number;
  ruleIds?: number[];
}

export interface ComplianceCheckResolveRequest {
  resolutionNotes: string;
}

export interface ComplianceJurisdictionSearchParams extends PaginationParams {
  countryCode?: string;
  jurisdictionType?: JurisdictionType;
  isActive?: boolean;
  search?: string;
}

export interface ComplianceRuleSearchParams extends PaginationParams {
  jurisdictionId?: number;
  ruleCategory?: ComplianceRuleCategory;
  isActive?: boolean;
  effectiveAfter?: string;
  effectiveBefore?: string;
  search?: string;
}

export interface ComplianceCheckSearchParams extends PaginationParams {
  organizationId?: number;
  employeeId?: number;
  ruleId?: number;
  status?: ComplianceCheckStatus;
  severity?: ComplianceSeverity;
  resolved?: boolean;
  checkDateAfter?: string;
  checkDateBefore?: string;
  search?: string;
}

export interface ComplianceOverviewResponse {
  totalChecks: number;
  compliantChecks: number;
  nonCompliantChecks: number;
  warningChecks: number;
  reviewRequiredChecks: number;
  unresolvedViolations: number;
  criticalViolations: number;
  highViolations: number;
  mediumViolations: number;
  lowViolations: number;
}

// Compliance API client interface
export interface ComplianceApiClient {
  // Jurisdiction management
  getJurisdictions(params: ComplianceJurisdictionSearchParams): Promise<PaginatedResponse<ComplianceJurisdictionDTO>>;
  getJurisdiction(id: number): Promise<ComplianceJurisdictionDTO>;
  createJurisdiction(data: ComplianceJurisdictionCreateDTO): Promise<ComplianceJurisdictionDTO>;
  updateJurisdiction(id: number, data: ComplianceJurisdictionUpdateDTO): Promise<ComplianceJurisdictionDTO>;
  deleteJurisdiction(id: number): Promise<void>;
  getJurisdictionHierarchy(): Promise<ComplianceJurisdictionDTO[]>;

  // Rule management
  getRules(params: ComplianceRuleSearchParams): Promise<PaginatedResponse<ComplianceRuleDTO>>;
  getRule(id: number): Promise<ComplianceRuleDTO>;
  createRule(data: ComplianceRuleCreateDTO): Promise<ComplianceRuleDTO>;
  updateRule(id: number, data: ComplianceRuleUpdateDTO): Promise<ComplianceRuleDTO>;
  deleteRule(id: number): Promise<void>;
  getRulesByJurisdiction(jurisdictionId: number, params?: PaginationParams): Promise<PaginatedResponse<ComplianceRuleDTO>>;

  // Compliance checks
  getChecks(params: ComplianceCheckSearchParams): Promise<PaginatedResponse<ComplianceCheckDTO>>;
  getCheck(id: number): Promise<ComplianceCheckDTO>;
  runComplianceCheck(data: ComplianceCheckRunRequest): Promise<ComplianceCheckDTO[]>;
  resolveViolation(id: number, data: ComplianceCheckResolveRequest): Promise<ComplianceCheckDTO>;
  getEmployeeChecks(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<ComplianceCheckDTO>>;
  getUnresolvedViolations(organizationId: number, params?: PaginationParams): Promise<PaginatedResponse<ComplianceCheckDTO>>;

  // Dashboard and reporting
  getComplianceOverview(organizationId: number): Promise<ComplianceOverviewResponse>;
  exportComplianceReport(params: ComplianceCheckSearchParams): Promise<Blob>;
}

// Implementation of compliance API client
class ComplianceApiClientImpl implements ComplianceApiClient {
  private readonly ENDPOINTS = {
    JURISDICTIONS: {
      BASE: '/compliance/jurisdictions',
      BY_ID: (id: number) => `/compliance/jurisdictions/${id}`,
      HIERARCHY: '/compliance/jurisdictions/hierarchy'
    },
    RULES: {
      BASE: '/compliance/rules',
      BY_ID: (id: number) => `/compliance/rules/${id}`,
      BY_JURISDICTION: (jurisdictionId: number) => `/compliance/rules/jurisdiction/${jurisdictionId}`
    },
    CHECKS: {
      BASE: '/compliance/checks',
      BY_ID: (id: number) => `/compliance/checks/${id}`,
      RUN: '/compliance/checks/run',
      RESOLVE: (id: number) => `/compliance/checks/${id}/resolve`,
      BY_EMPLOYEE: (employeeId: number) => `/compliance/checks/employee/${employeeId}`,
      UNRESOLVED: '/compliance/checks/unresolved'
    },
    OVERVIEW: '/compliance/overview',
    EXPORT: '/compliance/export'
  } as const;

  // Jurisdiction management methods
  async getJurisdictions(params: ComplianceJurisdictionSearchParams): Promise<PaginatedResponse<ComplianceJurisdictionDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceJurisdictions } = await import('./mockData');

      let filtered = [...mockComplianceJurisdictions];

      if (params.countryCode) {
        filtered = filtered.filter(j => j.countryCode === params.countryCode);
      }
      if (params.jurisdictionType) {
        filtered = filtered.filter(j => j.jurisdictionType === params.jurisdictionType);
      }
      if (params.isActive !== undefined) {
        filtered = filtered.filter(j => j.isActive === params.isActive);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(j =>
          j.name.toLowerCase().includes(search) ||
          j.countryCode.toLowerCase().includes(search)
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<ComplianceJurisdictionDTO>>(
      `${this.ENDPOINTS.JURISDICTIONS.BASE}?${queryParams}`
    );
  }

  async getJurisdiction(id: number): Promise<ComplianceJurisdictionDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceJurisdictions } = await import('./mockData');
      const jurisdiction = mockComplianceJurisdictions.find(j => j.id === id);
      if (!jurisdiction) {
        throw new Error(`Jurisdiction with id ${id} not found`);
      }
      return jurisdiction;
    }

    return apiClient.get<ComplianceJurisdictionDTO>(this.ENDPOINTS.JURISDICTIONS.BY_ID(id));
  }

  async createJurisdiction(data: ComplianceJurisdictionCreateDTO): Promise<ComplianceJurisdictionDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceJurisdictions } = await import('./mockData');
      const newJurisdiction: ComplianceJurisdictionDTO = {
        id: Math.max(...mockComplianceJurisdictions.map(j => j.id), 0) + 1,
        countryCode: data.countryCode,
        name: data.name,
        jurisdictionType: data.jurisdictionType,
        isActive: data.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(data.stateProvinceCode && { stateProvinceCode: data.stateProvinceCode }),
        ...(data.parentJurisdictionId && { parentJurisdictionId: data.parentJurisdictionId })
      };
      mockComplianceJurisdictions.push(newJurisdiction);
      return newJurisdiction;
    }

    return apiClient.post<ComplianceJurisdictionDTO>(this.ENDPOINTS.JURISDICTIONS.BASE, data);
  }

  async updateJurisdiction(id: number, data: ComplianceJurisdictionUpdateDTO): Promise<ComplianceJurisdictionDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceJurisdictions } = await import('./mockData');
      const index = mockComplianceJurisdictions.findIndex(j => j.id === id);
      if (index === -1) {
        throw new Error(`Jurisdiction with id ${id} not found`);
      }
      mockComplianceJurisdictions[index] = {
        ...mockComplianceJurisdictions[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockComplianceJurisdictions[index];
    }

    return apiClient.put<ComplianceJurisdictionDTO>(this.ENDPOINTS.JURISDICTIONS.BY_ID(id), data);
  }

  async deleteJurisdiction(id: number): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceJurisdictions } = await import('./mockData');
      const index = mockComplianceJurisdictions.findIndex(j => j.id === id);
      if (index === -1) {
        throw new Error(`Jurisdiction with id ${id} not found`);
      }
      mockComplianceJurisdictions.splice(index, 1);
      return;
    }

    return apiClient.delete<void>(this.ENDPOINTS.JURISDICTIONS.BY_ID(id));
  }

  async getJurisdictionHierarchy(): Promise<ComplianceJurisdictionDTO[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceJurisdictions } = await import('./mockData');
      return mockComplianceJurisdictions;
    }

    return apiClient.get<ComplianceJurisdictionDTO[]>(this.ENDPOINTS.JURISDICTIONS.HIERARCHY);
  }

  // Rule management methods
  async getRules(params: ComplianceRuleSearchParams): Promise<PaginatedResponse<ComplianceRuleDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceRules } = await import('./mockData');

      let filtered = [...mockComplianceRules];

      if (params.jurisdictionId) {
        filtered = filtered.filter(r => r.jurisdictionId === params.jurisdictionId);
      }
      if (params.ruleCategory) {
        filtered = filtered.filter(r => r.ruleCategory === params.ruleCategory);
      }
      if (params.isActive !== undefined) {
        filtered = filtered.filter(r => r.isActive === params.isActive);
      }
      if (params.effectiveAfter) {
        filtered = filtered.filter(r => r.effectiveDate && r.effectiveDate >= params.effectiveAfter!);
      }
      if (params.effectiveBefore) {
        filtered = filtered.filter(r => r.effectiveDate && r.effectiveDate <= params.effectiveBefore!);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(r =>
          r.ruleName.toLowerCase().includes(search) ||
          (r.description && r.description.toLowerCase().includes(search))
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<ComplianceRuleDTO>>(
      `${this.ENDPOINTS.RULES.BASE}?${queryParams}`
    );
  }

  async getRule(id: number): Promise<ComplianceRuleDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceRules } = await import('./mockData');
      const rule = mockComplianceRules.find(r => r.id === id);
      if (!rule) {
        throw new Error(`Rule with id ${id} not found`);
      }
      return rule;
    }

    return apiClient.get<ComplianceRuleDTO>(this.ENDPOINTS.RULES.BY_ID(id));
  }

  async createRule(data: ComplianceRuleCreateDTO): Promise<ComplianceRuleDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceRules, mockComplianceJurisdictions } = await import('./mockData');
      const jurisdiction = mockComplianceJurisdictions.find(j => j.id === data.jurisdictionId);
      const newRule: ComplianceRuleDTO = {
        id: Math.max(...mockComplianceRules.map(r => r.id), 0) + 1,
        ...data,
        isActive: data.isActive ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(jurisdiction && { jurisdiction })
      };
      mockComplianceRules.push(newRule);
      return newRule;
    }

    return apiClient.post<ComplianceRuleDTO>(this.ENDPOINTS.RULES.BASE, data);
  }

  async updateRule(id: number, data: ComplianceRuleUpdateDTO): Promise<ComplianceRuleDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceRules } = await import('./mockData');
      const index = mockComplianceRules.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Rule with id ${id} not found`);
      }
      mockComplianceRules[index] = {
        ...mockComplianceRules[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockComplianceRules[index];
    }

    return apiClient.put<ComplianceRuleDTO>(this.ENDPOINTS.RULES.BY_ID(id), data);
  }

  async deleteRule(id: number): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceRules } = await import('./mockData');
      const index = mockComplianceRules.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Rule with id ${id} not found`);
      }
      mockComplianceRules.splice(index, 1);
      return;
    }

    return apiClient.delete<void>(this.ENDPOINTS.RULES.BY_ID(id));
  }

  async getRulesByJurisdiction(
    jurisdictionId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<ComplianceRuleDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceRules } = await import('./mockData');
      const filtered = mockComplianceRules.filter(r => r.jurisdictionId === jurisdictionId);
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<ComplianceRuleDTO>>(
      `${this.ENDPOINTS.RULES.BY_JURISDICTION(jurisdictionId)}?${queryParams}`
    );
  }

  // Compliance check methods
  async getChecks(params: ComplianceCheckSearchParams): Promise<PaginatedResponse<ComplianceCheckDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceChecks } = await import('./mockData');

      let filtered = [...mockComplianceChecks];

      if (params.organizationId) {
        filtered = filtered.filter(c => c.organizationId === params.organizationId);
      }
      if (params.employeeId) {
        filtered = filtered.filter(c => c.employeeId === params.employeeId);
      }
      if (params.ruleId) {
        filtered = filtered.filter(c => c.ruleId === params.ruleId);
      }
      if (params.status) {
        filtered = filtered.filter(c => c.status === params.status);
      }
      if (params.severity) {
        filtered = filtered.filter(c => c.severity === params.severity);
      }
      if (params.resolved !== undefined) {
        filtered = filtered.filter(c => c.resolved === params.resolved);
      }
      if (params.checkDateAfter) {
        filtered = filtered.filter(c => c.checkDate >= params.checkDateAfter!);
      }
      if (params.checkDateBefore) {
        filtered = filtered.filter(c => c.checkDate <= params.checkDateBefore!);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(c =>
          c.employeeName?.toLowerCase().includes(search) ||
          c.rule?.ruleName.toLowerCase().includes(search)
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<ComplianceCheckDTO>>(
      `${this.ENDPOINTS.CHECKS.BASE}?${queryParams}`
    );
  }

  async getCheck(id: number): Promise<ComplianceCheckDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceChecks } = await import('./mockData');
      const check = mockComplianceChecks.find(c => c.id === id);
      if (!check) {
        throw new Error(`Compliance check with id ${id} not found`);
      }
      return check;
    }

    return apiClient.get<ComplianceCheckDTO>(this.ENDPOINTS.CHECKS.BY_ID(id));
  }

  async runComplianceCheck(data: ComplianceCheckRunRequest): Promise<ComplianceCheckDTO[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceChecks, mockComplianceRules } = await import('./mockData');

      // Simulate running compliance checks
      const newChecks: ComplianceCheckDTO[] = [];
      const rulesToCheck = data.ruleIds
        ? mockComplianceRules.filter(r => data.ruleIds!.includes(r.id))
        : mockComplianceRules;

      for (const rule of rulesToCheck) {
        const status: ComplianceCheckStatus = Math.random() > 0.3 ? ComplianceCheckStatus.COMPLIANT : ComplianceCheckStatus.NON_COMPLIANT;
        const severity: ComplianceSeverity = ComplianceSeverity.LOW;
        const checkDate = new Date().toISOString().split('T')[0] || new Date().toISOString();
        const newCheck: ComplianceCheckDTO = {
          id: Math.max(...mockComplianceChecks.map(c => c.id), 0) + newChecks.length + 1,
          organizationId: data.organizationId,
          ruleId: rule.id,
          checkDate,
          status,
          severity,
          resolved: false,
          createdAt: new Date().toISOString(),
          ...(data.employeeId && { employeeId: data.employeeId }),
          rule: {
            id: rule.id,
            jurisdictionId: rule.jurisdictionId,
            ruleCategory: rule.ruleCategory,
            ruleName: rule.ruleName,
            isActive: rule.isActive,
            createdAt: rule.createdAt,
            updatedAt: rule.updatedAt,
            ...(rule.description && { description: rule.description })
          }
        };
        mockComplianceChecks.push(newCheck);
        newChecks.push(newCheck);
      }

      return newChecks;
    }

    return apiClient.post<ComplianceCheckDTO[]>(this.ENDPOINTS.CHECKS.RUN, {
      organizationId: data.organizationId,
      employeeId: data.employeeId,
      // Backend only accepts single ruleId — send first one or null for all rules
      ruleId: data.ruleIds && data.ruleIds.length > 0 ? data.ruleIds[0] : undefined
    });
  }

  async resolveViolation(id: number, data: ComplianceCheckResolveRequest): Promise<ComplianceCheckDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceChecks } = await import('./mockData');
      const index = mockComplianceChecks.findIndex(c => c.id === id);
      if (index === -1) {
        throw new Error(`Compliance check with id ${id} not found`);
      }
      mockComplianceChecks[index] = {
        ...mockComplianceChecks[index],
        resolved: true,
        resolvedAt: new Date().toISOString(),
        resolvedBy: 1, // Mock user ID
        resolutionNotes: data.resolutionNotes
      };
      return mockComplianceChecks[index];
    }

    return apiClient.put<ComplianceCheckDTO>(this.ENDPOINTS.CHECKS.RESOLVE(id), {
      resolvedBy: 'admin',  // backend requires resolvedBy as string
      resolutionNotes: data.resolutionNotes
    });
  }

  async getEmployeeChecks(
    employeeId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<ComplianceCheckDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceChecks } = await import('./mockData');
      const filtered = mockComplianceChecks.filter(c => c.employeeId === employeeId);
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<ComplianceCheckDTO>>(
      `${this.ENDPOINTS.CHECKS.BY_EMPLOYEE(employeeId)}?${queryParams}`
    );
  }

  async getUnresolvedViolations(
    organizationId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<ComplianceCheckDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceChecks } = await import('./mockData');
      const filtered = mockComplianceChecks.filter(c =>
        c.organizationId === organizationId &&
        !c.resolved &&
        c.status === 'NON_COMPLIANT'
      );
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    try {
      const searchParams = { ...params, organizationId, resolved: false };
      const queryParams = this.buildQueryParams(searchParams);
      return await apiClient.get<PaginatedResponse<ComplianceCheckDTO>>(
        `${this.ENDPOINTS.CHECKS.UNRESOLVED}?${queryParams}`
      );
    } catch {
      return { content: [], totalElements: 0, totalPages: 0, size: params.size ?? 10, number: 0, first: true, last: true };
    }
  }

  // Dashboard and reporting methods
  async getComplianceOverview(organizationId: number): Promise<ComplianceOverviewResponse> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockComplianceChecks } = await import('./mockData');

      const orgChecks = mockComplianceChecks.filter(c => c.organizationId === organizationId);

      const overview: ComplianceOverviewResponse = {
        totalChecks: orgChecks.length,
        compliantChecks: orgChecks.filter(c => c.status === 'COMPLIANT').length,
        nonCompliantChecks: orgChecks.filter(c => c.status === 'NON_COMPLIANT').length,
        warningChecks: orgChecks.filter(c => c.status === 'WARNING').length,
        reviewRequiredChecks: orgChecks.filter(c => c.status === 'REVIEW_REQUIRED').length,
        unresolvedViolations: orgChecks.filter(c => !c.resolved && c.status === 'NON_COMPLIANT').length,
        criticalViolations: orgChecks.filter(c => c.severity === 'CRITICAL').length,
        highViolations: orgChecks.filter(c => c.severity === 'HIGH').length,
        mediumViolations: orgChecks.filter(c => c.severity === 'MEDIUM').length,
        lowViolations: orgChecks.filter(c => c.severity === 'LOW').length
      };

      return overview;
    }

    return apiClient.get<ComplianceOverviewResponse>(
      `${this.ENDPOINTS.OVERVIEW}?organizationId=${organizationId}`
    ).catch(() => ({
      totalChecks: 0, compliantChecks: 0, nonCompliantChecks: 0,
      warningChecks: 0, reviewRequiredChecks: 0, unresolvedViolations: 0,
      criticalViolations: 0, highViolations: 0, mediumViolations: 0, lowViolations: 0
    }));
  }

  async exportComplianceReport(params: ComplianceCheckSearchParams): Promise<Blob> {
    if (USE_MOCK) {
      await simulateDelay();
      // Create a mock CSV blob
      const csvContent = "ID,Employee,Rule,Status,Severity,Date\n1,John Doe,Minimum Wage,COMPLIANT,LOW,2024-01-15";
      return new Blob([csvContent], { type: 'text/csv' });
    }

    const queryParams = this.buildQueryParams(params);
    const response = await apiClient.getAxiosInstance().get(
      `${this.ENDPOINTS.EXPORT}?${queryParams}`,
      { responseType: 'blob' }
    );
    return response.data;
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
const complianceApi = new ComplianceApiClientImpl();

export default complianceApi;

// Export the class for testing purposes
export { ComplianceApiClientImpl };