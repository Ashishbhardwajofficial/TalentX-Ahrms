// frontend/src/api/payrollApi.ts
import apiClient from "./axiosClient";
import { PaginationParams, PaginatedResponse, PayrollRun, PayrollRunStatus } from "../types";
import { mockPayrollRuns, mockPayrollItems, createPaginatedResponse, simulateDelay } from "./mockData";

// Check if mock mode is enabled
const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// Payroll API request/response types
export interface PayrollRunDTO extends PayrollRun {
  // Additional fields for display purposes
  processedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
  };
  approvedByUser?: {
    id: number;
    firstName: string;
    lastName: string;
    fullName: string;
  };
}

export interface PayrollRunCreateDTO {
  organizationId: number;
  payPeriodStart: string;
  payPeriodEnd: string;
  payDate: string;
  employeeIds?: number[]; // Optional: specific employees, if not provided, all active employees
}

export interface PayrollItemDTO {
  id: number;
  payrollRunId: number;
  employee: {
    id: number;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    fullName: string;
    departmentName?: string;
  };
  baseSalary: number;
  overtimeHours: number;
  overtimeRate: number;
  overtimePay: number;
  bonuses: number;
  allowances: number;
  grossPay: number;
  taxDeductions: number;
  socialSecurityDeductions: number;
  healthInsuranceDeductions: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  hoursWorked: number;
  daysWorked: number;
  createdAt: string;
  updatedAt: string;
}

export interface PayslipDTO {
  id: number;
  payrollItemId: number;
  employee: {
    id: number;
    employeeNumber: string;
    firstName: string;
    lastName: string;
    fullName: string;
    departmentName?: string;
    jobTitle?: string;
  };
  payPeriod: {
    start: string;
    end: string;
  };
  payDate: string;
  earnings: {
    baseSalary: number;
    overtimePay: number;
    bonuses: number;
    allowances: number;
    grossPay: number;
  };
  deductions: {
    tax: number;
    socialSecurity: number;
    healthInsurance: number;
    other: number;
    total: number;
  };
  netPay: number;
  hoursWorked: number;
  daysWorked: number;
  generatedAt: string;
}

export interface PayrollSearchParams extends PaginationParams {
  organizationId?: number;
  status?: PayrollRunStatus;
  payPeriodStart?: string;
  payPeriodEnd?: string;
  payDateFrom?: string;
  payDateTo?: string;
  processedBy?: number;
}

export interface PayrollSummaryDTO {
  totalRuns: number;
  totalEmployees: number;
  totalGrossPay: number;
  totalDeductions: number;
  totalNetPay: number;
  averageNetPay: number;
  pendingRuns: number;
  completedRuns: number;
}

export enum PayrollStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  APPROVED = 'APPROVED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

// Re-export PayrollRunStatus from types for backward compatibility
export { PayrollRunStatus } from "../types";

// Payroll API client interface
export interface PayrollApiClient {
  getPayrollRuns(params: PayrollSearchParams): Promise<PaginatedResponse<PayrollRunDTO>>;
  getPayrollRun(id: number): Promise<PayrollRunDTO>;
  createPayrollRun(data: PayrollRunCreateDTO): Promise<PayrollRunDTO>;
  processPayrollRun(id: number): Promise<PayrollRunDTO>;
  approvePayrollRun(id: number, comments?: string): Promise<PayrollRunDTO>;
  cancelPayrollRun(id: number, reason: string): Promise<PayrollRunDTO>;
  getPayrollItems(payrollRunId: number, params?: PaginationParams): Promise<PaginatedResponse<PayrollItemDTO>>;
  getPayrollItem(id: number): Promise<PayrollItemDTO>;
  updatePayrollItem(id: number, data: Partial<PayrollItemDTO>): Promise<PayrollItemDTO>;
  getPayslip(payrollItemId: number): Promise<PayslipDTO>;
  getEmployeePayslips(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<PayslipDTO>>;
  downloadPayslip(payrollItemId: number): Promise<Blob>;
  downloadPayrollReport(payrollRunId: number): Promise<Blob>;
  getPayrollSummary(organizationId: number, year?: number): Promise<PayrollSummaryDTO>;
  bulkProcessPayroll(payrollRunIds: number[]): Promise<PayrollRunDTO[]>;
}

// Implementation of payroll API client
class PayrollApiClientImpl implements PayrollApiClient {
  private readonly PAYROLL_ENDPOINTS = {
    RUNS: '/payroll/runs',
    RUN_BY_ID: (id: number) => `/payroll/runs/${id}`,
    PROCESS_RUN: (id: number) => `/payroll/runs/${id}/process`,
    APPROVE_RUN: (id: number) => `/payroll/runs/${id}/approve`,
    REJECT_RUN: (id: number) => `/payroll/runs/${id}/reject`,
    DELETE_RUN: (id: number) => `/payroll/runs/${id}`,
    ITEMS: (payrollRunId: number) => `/payroll/runs/${payrollRunId}/items`,
    PAYSLIP: (id: number) => `/payroll/payslips/${id}`,
    EMPLOYEE_PAYSLIPS: (employeeId: number) => `/payroll/employee/${employeeId}/payslips`,
    DOWNLOAD_PAYSLIP: (id: number) => `/payroll/payslips/${id}/download`,
    DOWNLOAD_REPORT: (payrollRunId: number) => `/payroll/runs/${payrollRunId}/report`,
    SUMMARY: '/payroll/statistics',
    BULK_PROCESS: '/payroll/runs/pending'
  } as const;

  async getPayrollRuns(params: PayrollSearchParams): Promise<PaginatedResponse<PayrollRunDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      let filtered = [...mockPayrollRuns];

      // Apply filters
      if (params.status) {
        filtered = filtered.filter(r => r.status === params.status);
      }
      if (params.payPeriodStart) {
        filtered = filtered.filter(r => new Date(r.payPeriodStart) >= new Date(params.payPeriodStart!));
      }
      if (params.payPeriodEnd) {
        filtered = filtered.filter(r => new Date(r.payPeriodEnd) <= new Date(params.payPeriodEnd!));
      }

      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<PayrollRunDTO>>(
      `${this.PAYROLL_ENDPOINTS.RUNS}?${queryParams}`
    );
  }

  async getPayrollRun(id: number): Promise<PayrollRunDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const run = mockPayrollRuns.find(r => r.id === id);
      if (!run) {
        throw new Error(`Payroll run with ID ${id} not found`);
      }
      return run;
    }

    // Real API call
    return apiClient.get<PayrollRunDTO>(this.PAYROLL_ENDPOINTS.RUN_BY_ID(id));
  }

  async createPayrollRun(data: PayrollRunCreateDTO): Promise<PayrollRunDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const newRun: PayrollRunDTO = {
        id: mockPayrollRuns.length + 1,
        organizationId: data.organizationId,
        name: `Payroll Run ${mockPayrollRuns.length + 1}`,
        payPeriodStart: data.payPeriodStart,
        payPeriodEnd: data.payPeriodEnd,
        payDate: data.payDate,
        status: PayrollRunStatus.DRAFT,
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        totalGrossPay: 0,
        totalNetPay: 0,
        totalTaxes: 0,
        employeeCount: data.employeeIds?.length || 0,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "system",
        version: 1
      };
      mockPayrollRuns.push(newRun);
      return newRun;
    }

    // Real API call — auto-generate name from description or period if not provided
    const payload = {
      ...data,
      name: (data as any).name || data.payPeriodStart
        ? `${new Date(data.payPeriodStart).toLocaleString('default', { month: 'long' })} ${new Date(data.payPeriodStart).getFullYear()} Payroll`
        : 'Payroll Run'
    };
    return apiClient.post<PayrollRunDTO>(this.PAYROLL_ENDPOINTS.RUNS, payload);
  }

  async processPayrollRun(id: number): Promise<PayrollRunDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockPayrollRuns.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Payroll run with ID ${id} not found`);
      }
      mockPayrollRuns[index] = {
        ...mockPayrollRuns[index],
        status: PayrollRunStatus.PROCESSING,
        processedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return mockPayrollRuns[index]!;
    }

    // Real API call
    return apiClient.post<PayrollRunDTO>(this.PAYROLL_ENDPOINTS.PROCESS_RUN(id), {});
  }

  async approvePayrollRun(id: number, comments?: string): Promise<PayrollRunDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockPayrollRuns.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Payroll run with ID ${id} not found`);
      }
      mockPayrollRuns[index] = {
        ...mockPayrollRuns[index],
        status: PayrollRunStatus.APPROVED,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return mockPayrollRuns[index]!;
    }

    // Real API call
    const query = comments ? `?comments=${encodeURIComponent(comments)}` : '';
    return apiClient.post<PayrollRunDTO>(`${this.PAYROLL_ENDPOINTS.APPROVE_RUN(id)}${query}`, {});
  }

  async cancelPayrollRun(id: number, reason: string): Promise<PayrollRunDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockPayrollRuns.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Payroll run with ID ${id} not found`);
      }
      mockPayrollRuns[index] = {
        ...mockPayrollRuns[index],
        status: PayrollRunStatus.CANCELLED,
        updatedAt: new Date().toISOString()
      };
      return mockPayrollRuns[index]!;
    }

    // Real API call
    await apiClient.delete<void>(this.PAYROLL_ENDPOINTS.DELETE_RUN(id));
    return {
      id,
      organizationId: 0,
      payPeriodStart: '',
      payPeriodEnd: '',
      payDate: '',
      status: PayrollRunStatus.CANCELLED,
      totalGrossPay: 0,
      totalDeductions: 0,
      totalNetPay: 0,
      totalTaxes: 0,
      employeeCount: 0
    } as PayrollRunDTO;
  }

  async getPayrollItems(payrollRunId: number, params: PaginationParams = { page: 0, size: 10 }): Promise<PaginatedResponse<PayrollItemDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const filtered = mockPayrollItems.filter(item => item.payrollRunId === payrollRunId);
      return createPaginatedResponse(filtered, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    const items = await apiClient.get<PayrollItemDTO[]>(
      `${this.PAYROLL_ENDPOINTS.ITEMS(payrollRunId)}?${queryParams}`
    );
    return createPaginatedResponse(items, params.page || 0, params.size || 10);
  }

  async getPayrollItem(id: number): Promise<PayrollItemDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const item = mockPayrollItems.find(i => i.id === id);
      if (!item) {
        throw new Error(`Payroll item with ID ${id} not found`);
      }
      return item;
    }

    // Real API call
    throw new Error('Single payroll item endpoint is not available in the backend');
  }

  async updatePayrollItem(id: number, data: Partial<PayrollItemDTO>): Promise<PayrollItemDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const index = mockPayrollItems.findIndex(i => i.id === id);
      if (index === -1) {
        throw new Error(`Payroll item with ID ${id} not found`);
      }
      mockPayrollItems[index] = {
        ...mockPayrollItems[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockPayrollItems[index]!;
    }

    // Real API call
    throw new Error('Payroll item updates are not supported by the backend');
  }

  async getPayslip(payrollItemId: number): Promise<PayslipDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const item = mockPayrollItems.find(i => i.id === payrollItemId);
      if (!item) {
        throw new Error(`Payroll item with ID ${payrollItemId} not found`);
      }

      const run = mockPayrollRuns.find(r => r.id === item.payrollRunId);
      const payslip: PayslipDTO = {
        id: payrollItemId,
        payrollItemId: payrollItemId,
        employee: item.employee,
        payPeriod: {
          start: run?.payPeriodStart || '',
          end: run?.payPeriodEnd || ''
        },
        payDate: run?.payDate || '',
        earnings: {
          baseSalary: item.baseSalary,
          overtimePay: item.overtimePay,
          bonuses: item.bonuses,
          allowances: item.allowances,
          grossPay: item.grossPay
        },
        deductions: {
          tax: item.taxDeductions,
          socialSecurity: item.socialSecurityDeductions,
          healthInsurance: item.healthInsuranceDeductions,
          other: item.otherDeductions,
          total: item.totalDeductions
        },
        netPay: item.netPay,
        hoursWorked: item.hoursWorked,
        daysWorked: item.daysWorked,
        generatedAt: new Date().toISOString()
      };
      return payslip;
    }

    // Real API call
    return apiClient.get<PayslipDTO>(this.PAYROLL_ENDPOINTS.PAYSLIP(payrollItemId));
  }

  async getEmployeePayslips(employeeId: number, params: PaginationParams = { page: 0, size: 10 }): Promise<PaginatedResponse<PayslipDTO>> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const items = mockPayrollItems.filter(i => i.employee.id === employeeId);
      const payslips: PayslipDTO[] = items.map(item => {
        const run = mockPayrollRuns.find(r => r.id === item.payrollRunId);
        return {
          id: item.id,
          payrollItemId: item.id,
          employee: item.employee,
          payPeriod: {
            start: run?.payPeriodStart || '',
            end: run?.payPeriodEnd || ''
          },
          payDate: run?.payDate || '',
          earnings: {
            baseSalary: item.baseSalary,
            overtimePay: item.overtimePay,
            bonuses: item.bonuses,
            allowances: item.allowances,
            grossPay: item.grossPay
          },
          deductions: {
            tax: item.taxDeductions,
            socialSecurity: item.socialSecurityDeductions,
            healthInsurance: item.healthInsuranceDeductions,
            other: item.otherDeductions,
            total: item.totalDeductions
          },
          netPay: item.netPay,
          hoursWorked: item.hoursWorked,
          daysWorked: item.daysWorked,
          generatedAt: new Date().toISOString()
        };
      });
      return createPaginatedResponse(payslips, params.page || 0, params.size || 10);
    }

    // Real API call
    const queryParams = this.buildQueryParams(params);
    const payslips = await apiClient.get<PayslipDTO[]>(
      `${this.PAYROLL_ENDPOINTS.EMPLOYEE_PAYSLIPS(employeeId)}?${queryParams}`
    );
    return createPaginatedResponse(payslips, params.page || 0, params.size || 10);
  }

  async downloadPayslip(payrollItemId: number): Promise<Blob> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      // Return a mock blob
      return new Blob(['Mock payslip PDF content'], { type: 'application/pdf' });
    }

    // Real API call
    const response = await apiClient.getAxiosInstance().get(
      this.PAYROLL_ENDPOINTS.DOWNLOAD_PAYSLIP(payrollItemId),
      { responseType: 'blob' }
    );
    return response.data;
  }

  async downloadPayrollReport(payrollRunId: number): Promise<Blob> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      // Return a mock blob
      return new Blob(['Mock payroll report PDF content'], { type: 'application/pdf' });
    }

    // Real API call
    const response = await apiClient.getAxiosInstance().get(
      this.PAYROLL_ENDPOINTS.DOWNLOAD_REPORT(payrollRunId),
      { responseType: 'blob' }
    );
    return response.data;
  }

  async getPayrollSummary(organizationId: number, year?: number): Promise<PayrollSummaryDTO> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const filtered = mockPayrollRuns.filter(r => r.organizationId === organizationId);

      const summary: PayrollSummaryDTO = {
        totalRuns: filtered.length,
        totalEmployees: filtered.reduce((sum, r) => sum + r.employeeCount, 0) / (filtered.length || 1),
        totalGrossPay: filtered.reduce((sum, r) => sum + (r.totalGrossPay || r.totalGross || 0), 0),
        totalDeductions: filtered.reduce((sum, r) => sum + (r.totalDeductions || 0), 0),
        totalNetPay: filtered.reduce((sum, r) => sum + (r.totalNetPay || r.totalNet || 0), 0),
        averageNetPay: filtered.reduce((sum, r) => sum + (r.totalNetPay || r.totalNet || 0), 0) / (filtered.length || 1),
        pendingRuns: filtered.filter(r => r.status === PayrollRunStatus.DRAFT || r.status === PayrollRunStatus.PROCESSING).length,
        completedRuns: filtered.filter(r => r.status === PayrollRunStatus.APPROVED || r.status === PayrollRunStatus.PAID).length
      };
      return summary;
    }

    // Real API call
    const params = new URLSearchParams();
    params.append('organizationId', organizationId.toString());
    if (year) {
      params.append('year', year.toString());
    }
    const stats = await apiClient.get<any>(`${this.PAYROLL_ENDPOINTS.SUMMARY}?${params}`);
    return {
      totalRuns: stats.totalRuns || 0,
      totalEmployees: stats.totalEmployees || 0,
      totalGrossPay: stats.totalGrossPay || 0,
      totalDeductions: stats.totalDeductions || 0,
      totalNetPay: stats.totalNetPay || 0,
      averageNetPay: stats.averageNetPay || 0,
      pendingRuns: stats.pendingRuns || 0,
      completedRuns: stats.completedRuns || 0
    };
  }

  async bulkProcessPayroll(payrollRunIds: number[]): Promise<PayrollRunDTO[]> {
    // Mock mode
    if (USE_MOCK) {
      await simulateDelay();
      const processed: PayrollRunDTO[] = [];

      payrollRunIds.forEach(id => {
        const index = mockPayrollRuns.findIndex(r => r.id === id);
        if (index !== -1) {
          mockPayrollRuns[index] = {
            ...mockPayrollRuns[index]!,
            status: PayrollRunStatus.PROCESSING,
            processedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          processed.push(mockPayrollRuns[index]!);
        }
      });

      return processed;
    }

    // Real API call
    return apiClient.get<PayrollRunDTO[]>(this.PAYROLL_ENDPOINTS.BULK_PROCESS);
  }

  private buildQueryParams(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    return searchParams.toString();
  }
}

// Create and export singleton instance
const payrollApi = new PayrollApiClientImpl();

export default payrollApi;

// Export the class for testing purposes
export { PayrollApiClientImpl };
