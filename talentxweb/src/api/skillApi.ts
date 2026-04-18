// frontend/src/api/skillApi.ts
import apiClient from "./axiosClient";
import {
  Skill,
  EmployeeSkill,
  ProficiencyLevel,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { createPaginatedResponse, simulateDelay } from "./mockData";

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// ============================================================================
// SKILL DTOs
// ============================================================================

export interface SkillDTO {
  id: number;
  name: string;
  category?: string;
  description?: string;
  createdAt: string;
}

export interface SkillCreateDTO {
  name: string;
  category?: string;
  description?: string;
}

export interface SkillUpdateDTO {
  name?: string;
  category?: string;
  description?: string;
}

export interface SkillSearchParams extends PaginationParams {
  category?: string;
  search?: string;
}

// ============================================================================
// EMPLOYEE SKILL DTOs
// ============================================================================

export interface EmployeeSkillDTO {
  id: number;
  employeeId: number;
  skillId: number;
  proficiencyLevel: ProficiencyLevel;
  yearsOfExperience?: number;
  lastUsedYear?: number;
  verifiedBy?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields for display
  skillName?: string;
  employeeName?: string;
  verifiedByName?: string;
  skill?: SkillDTO;
}

export interface EmployeeSkillCreateDTO {
  employeeId: number;
  skillId: number;
  proficiencyLevel: ProficiencyLevel;
  yearsOfExperience?: number | undefined;
  lastUsedYear?: number | undefined;
}

export interface EmployeeSkillUpdateDTO {
  proficiencyLevel?: ProficiencyLevel | undefined;
  yearsOfExperience?: number | undefined;
  lastUsedYear?: number | undefined;
}

export interface EmployeeSkillVerifyDTO {
  verifiedBy: number;
}

export interface EmployeeSkillSearchParams extends PaginationParams {
  employeeId?: number;
  skillId?: number;
  proficiencyLevel?: ProficiencyLevel;
  verified?: boolean;
  search?: string;
}

export type SkillCategoryResponse = string[];

export interface SkillCategoryWithCount {
  category: string;
  count: number;
}

// ============================================================================
// SKILL API CLIENT INTERFACE
// ============================================================================

export interface SkillApiClient {
  // Skill management
  getSkills(params: SkillSearchParams): Promise<PaginatedResponse<SkillDTO>>;
  getSkill(id: number): Promise<SkillDTO>;
  createSkill(data: SkillCreateDTO): Promise<SkillDTO>;
  updateSkill(id: number, data: SkillUpdateDTO): Promise<SkillDTO>;
  deleteSkill(id: number): Promise<void>;
  getSkillCategories(): Promise<string[]>;

  // Employee skill management
  getEmployeeSkills(params: EmployeeSkillSearchParams): Promise<PaginatedResponse<EmployeeSkillDTO>>;
  getEmployeeSkill(id: number): Promise<EmployeeSkillDTO>;
  createEmployeeSkill(data: EmployeeSkillCreateDTO): Promise<EmployeeSkillDTO>;
  updateEmployeeSkill(id: number, data: EmployeeSkillUpdateDTO): Promise<EmployeeSkillDTO>;
  deleteEmployeeSkill(id: number): Promise<void>;
  verifyEmployeeSkill(id: number, data: EmployeeSkillVerifyDTO): Promise<EmployeeSkillDTO>;
  getSkillsByEmployee(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<EmployeeSkillDTO>>;

  // Aliases for consistency
  addEmployeeSkill(data: EmployeeSkillCreateDTO): Promise<EmployeeSkillDTO>;
}

// ============================================================================
// SKILL API CLIENT IMPLEMENTATION
// ============================================================================

class SkillApiClientImpl implements SkillApiClient {
  private readonly ENDPOINTS = {
    SKILLS: '/skills',
    SKILL_BY_ID: (id: number) => `/skills/${id}`,
    // Backend SkillController uses /api/skills/employee/* for employee skills
    EMPLOYEE_SKILLS: '/skills/employee',
    EMPLOYEE_SKILL_BY_ID: (id: number) => `/skills/employee/${id}`,
    EMPLOYEE_SKILL_VERIFY: (id: number) => `/skills/employee/${id}/verify`,
    SKILLS_BY_EMPLOYEE: (employeeId: number) => `/skills/employee/${employeeId}`,
  } as const;

  // ============================================================================
  // SKILL METHODS
  // ============================================================================

  async getSkills(params: SkillSearchParams): Promise<PaginatedResponse<SkillDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockSkills } = await import('./mockData');

      let filtered = [...mockSkills];

      if (params.category) {
        filtered = filtered.filter(s => s.category === params.category);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(s =>
          s.name.toLowerCase().includes(search) ||
          (s.description && s.description.toLowerCase().includes(search))
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<SkillDTO>>(
      `${this.ENDPOINTS.SKILLS}?${queryParams}`
    );
  }

  async getSkill(id: number): Promise<SkillDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockSkills } = await import('./mockData');
      const skill = mockSkills.find(s => s.id === id);
      if (!skill) {
        throw new Error(`Skill with id ${id} not found`);
      }
      return skill;
    }

    return apiClient.get<SkillDTO>(this.ENDPOINTS.SKILL_BY_ID(id));
  }

  async createSkill(data: SkillCreateDTO): Promise<SkillDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockSkills } = await import('./mockData');
      const newSkill: SkillDTO = {
        id: Math.max(...mockSkills.map(s => s.id), 0) + 1,
        ...data,
        createdAt: new Date().toISOString()
      };
      mockSkills.push(newSkill);
      return newSkill;
    }

    return apiClient.post<SkillDTO>(this.ENDPOINTS.SKILLS, data);
  }

  async updateSkill(id: number, data: SkillUpdateDTO): Promise<SkillDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockSkills } = await import('./mockData');
      const index = mockSkills.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error(`Skill with id ${id} not found`);
      }
      mockSkills[index] = {
        ...mockSkills[index],
        ...data
      };
      return mockSkills[index];
    }

    return apiClient.put<SkillDTO>(this.ENDPOINTS.SKILL_BY_ID(id), data);
  }

  async deleteSkill(id: number): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockSkills } = await import('./mockData');
      const index = mockSkills.findIndex(s => s.id === id);
      if (index === -1) {
        throw new Error(`Skill with id ${id} not found`);
      }
      mockSkills.splice(index, 1);
      return;
    }

    return apiClient.delete<void>(this.ENDPOINTS.SKILL_BY_ID(id));
  }

  async getSkillCategories(): Promise<string[]> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockSkills } = await import('./mockData');
      const categories = [...new Set(mockSkills.map(s => s.category).filter(Boolean))];
      return categories as string[];
    }

    return apiClient.get<string[]>('/skills/categories');
  }

  // ============================================================================
  // EMPLOYEE SKILL METHODS
  // ============================================================================

  async getEmployeeSkills(params: EmployeeSkillSearchParams): Promise<PaginatedResponse<EmployeeSkillDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeSkills } = await import('./mockData');

      let filtered = [...mockEmployeeSkills];

      if (params.employeeId) {
        filtered = filtered.filter(es => es.employeeId === params.employeeId);
      }
      if (params.skillId) {
        filtered = filtered.filter(es => es.skillId === params.skillId);
      }
      if (params.proficiencyLevel) {
        filtered = filtered.filter(es => es.proficiencyLevel === params.proficiencyLevel);
      }
      if (params.verified !== undefined) {
        filtered = filtered.filter(es => params.verified ? !!es.verifiedAt : !es.verifiedAt);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(es =>
          es.skillName?.toLowerCase().includes(search) ||
          es.employeeName?.toLowerCase().includes(search)
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<EmployeeSkillDTO>>(
      `${this.ENDPOINTS.EMPLOYEE_SKILLS}?${queryParams}`
    );
  }

  async getEmployeeSkill(id: number): Promise<EmployeeSkillDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeSkills } = await import('./mockData');
      const employeeSkill = mockEmployeeSkills.find(es => es.id === id);
      if (!employeeSkill) {
        throw new Error(`Employee skill with id ${id} not found`);
      }
      return employeeSkill;
    }

    return apiClient.get<EmployeeSkillDTO>(this.ENDPOINTS.EMPLOYEE_SKILL_BY_ID(id));
  }

  async createEmployeeSkill(data: EmployeeSkillCreateDTO): Promise<EmployeeSkillDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeSkills, mockSkills, mockEmployees } = await import('./mockData');
      const skill = mockSkills.find(s => s.id === data.skillId);
      const employee = mockEmployees.find(e => e.id === data.employeeId);
      const newEmployeeSkill: EmployeeSkillDTO = {
        id: Math.max(...mockEmployeeSkills.map(es => es.id), 0) + 1,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(skill && { skillName: skill.name, skill }),
        ...(employee && { employeeName: employee.fullName })
      };
      mockEmployeeSkills.push(newEmployeeSkill);
      return newEmployeeSkill;
    }

    return apiClient.post<EmployeeSkillDTO>(this.ENDPOINTS.EMPLOYEE_SKILLS, data);
  }

  async updateEmployeeSkill(id: number, data: EmployeeSkillUpdateDTO): Promise<EmployeeSkillDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeSkills } = await import('./mockData');
      const index = mockEmployeeSkills.findIndex(es => es.id === id);
      if (index === -1) {
        throw new Error(`Employee skill with id ${id} not found`);
      }
      mockEmployeeSkills[index] = {
        ...mockEmployeeSkills[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockEmployeeSkills[index];
    }

    return apiClient.put<EmployeeSkillDTO>(this.ENDPOINTS.EMPLOYEE_SKILL_BY_ID(id), data);
  }

  async deleteEmployeeSkill(id: number): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeSkills } = await import('./mockData');
      const index = mockEmployeeSkills.findIndex(es => es.id === id);
      if (index === -1) {
        throw new Error(`Employee skill with id ${id} not found`);
      }
      mockEmployeeSkills.splice(index, 1);
      return;
    }

    return apiClient.delete<void>(this.ENDPOINTS.EMPLOYEE_SKILL_BY_ID(id));
  }

  async verifyEmployeeSkill(id: number, data: EmployeeSkillVerifyDTO): Promise<EmployeeSkillDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeSkills } = await import('./mockData');
      const index = mockEmployeeSkills.findIndex(es => es.id === id);
      if (index === -1) {
        throw new Error(`Employee skill with id ${id} not found`);
      }
      mockEmployeeSkills[index] = {
        ...mockEmployeeSkills[index],
        verifiedBy: data.verifiedBy,
        verifiedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return mockEmployeeSkills[index];
    }

    return apiClient.put<EmployeeSkillDTO>(this.ENDPOINTS.EMPLOYEE_SKILL_VERIFY(id), data);
  }

  async getSkillsByEmployee(
    employeeId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<EmployeeSkillDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockEmployeeSkills } = await import('./mockData');
      const filtered = mockEmployeeSkills.filter(es => es.employeeId === employeeId);
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<EmployeeSkillDTO>>(
      `${this.ENDPOINTS.SKILLS_BY_EMPLOYEE(employeeId)}?${queryParams}`
    );
  }

  // ============================================================================
  // SKILL API ALIASES
  // ============================================================================

  async addEmployeeSkill(data: EmployeeSkillCreateDTO): Promise<EmployeeSkillDTO> {
    return this.createEmployeeSkill(data);
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

const skillApi = new SkillApiClientImpl();

export default skillApi;

export { SkillApiClientImpl };
