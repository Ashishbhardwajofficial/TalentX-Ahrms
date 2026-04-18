// frontend/src/api/expenseApi.ts
import apiClient from "./axiosClient";
import {
  ExpenseType,
  ExpenseStatus,
  PaginationParams,
  PaginatedResponse
} from "../types";
import { createPaginatedResponse, simulateDelay } from "./mockData";

const USE_MOCK = process.env.REACT_APP_USE_MOCK === 'true';

// ============================================================================
// EXPENSE DTOs
// ============================================================================

export interface ExpenseDTO {
  id: number;
  employeeId: number;
  employeeName?: string;
  employeeNumber?: string;
  organizationId?: number;
  expenseType: ExpenseType;
  amount: number;
  currency?: string;
  expenseDate: string;
  description?: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  approvedById?: number;
  approvedByName?: string;
  approvedAt?: string;
  rejectionReason?: string;
  paymentDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCreateDTO {
  employeeId: number;
  expenseType: ExpenseType;
  amount: number;
  currency?: string | undefined;
  expenseDate: string;
  description?: string | undefined;
  receiptUrl?: string | undefined;
}

export interface ExpenseUpdateDTO {
  expenseType?: ExpenseType | undefined;
  amount?: number | undefined;
  currency?: string | undefined;
  expenseDate?: string | undefined;
  description?: string | undefined;
  receiptUrl?: string | undefined;
}

export interface ExpenseSearchParams extends PaginationParams {
  employeeId?: number;
  expenseType?: ExpenseType;
  status?: ExpenseStatus;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  search?: string;
}

export interface ExpenseApprovalDTO {
  approvedBy: number;
  rejectionReason?: string;
}

export interface ExpenseSummaryDTO {
  totalExpenses: number;
  totalAmount: number;
  byStatus: Record<ExpenseStatus, number>;
  byType: Record<ExpenseType, number>;
}

export interface ExpenseRejectDTO {
  rejectedBy: number;
  rejectionComments: string;
}

export interface ExpenseApproveDTO {
  approvedBy: number;
  approvalComments?: string;
}

export interface ExpensePaymentDTO {
  paymentMethod: string;
  paymentDate?: string;
  transactionId?: string;
  paidBy?: number;
}

// ============================================================================
// EXPENSE API CLIENT INTERFACE
// ============================================================================

export interface ExpenseApiClient {
  // Expense management
  getExpenses(params: ExpenseSearchParams): Promise<PaginatedResponse<ExpenseDTO>>;
  getExpense(id: number): Promise<ExpenseDTO>;
  createExpense(data: ExpenseCreateDTO): Promise<ExpenseDTO>;
  updateExpense(id: number, data: ExpenseUpdateDTO): Promise<ExpenseDTO>;
  deleteExpense(id: number): Promise<void>;
  getExpensesByEmployee(employeeId: number, params?: PaginationParams): Promise<PaginatedResponse<ExpenseDTO>>;

  // Expense approval workflow
  approveExpense(id: number, data: ExpenseApproveDTO): Promise<ExpenseDTO>;
  rejectExpense(id: number, data: ExpenseRejectDTO): Promise<ExpenseDTO>;
  markExpenseAsPaid(id: number): Promise<ExpenseDTO>;

  // Expense reporting
  getExpenseSummary(params: ExpenseSearchParams): Promise<ExpenseSummaryDTO>;

  // File upload
  uploadReceipt(file: File): Promise<{ url: string }>;

  // Payment tracking
  markAsPaid(id: number, data: ExpensePaymentDTO): Promise<ExpenseDTO>;
}

// ============================================================================
// EXPENSE API CLIENT IMPLEMENTATION
// ============================================================================

class ExpenseApiClientImpl implements ExpenseApiClient {
  private readonly ENDPOINTS = {
    EXPENSES: '/expenses',
    EXPENSE_BY_ID: (id: number) => `/expenses/${id}`,
    EXPENSES_BY_EMPLOYEE: (employeeId: number) => `/expenses/employee/${employeeId}`,
    APPROVE_EXPENSE: (id: number) => `/expenses/${id}/approve`,
    REJECT_EXPENSE: (id: number) => `/expenses/${id}/reject`,
    MARK_PAID: (id: number) => `/expenses/${id}/pay`,
    EXPENSE_SUMMARY: '/expenses/statistics',
  } as const;

  async getExpenses(params: ExpenseSearchParams): Promise<PaginatedResponse<ExpenseDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockExpenses } = await import('./mockData');

      let filtered = [...mockExpenses];

      if (params.employeeId) {
        filtered = filtered.filter(e => e.employeeId === params.employeeId);
      }
      if (params.expenseType) {
        filtered = filtered.filter(e => e.expenseType === params.expenseType);
      }
      if (params.status) {
        filtered = filtered.filter(e => e.status === params.status);
      }
      if (params.startDate) {
        filtered = filtered.filter(e => e.expenseDate >= params.startDate!);
      }
      if (params.endDate) {
        filtered = filtered.filter(e => e.expenseDate <= params.endDate!);
      }
      if (params.minAmount !== undefined) {
        filtered = filtered.filter(e => e.amount >= params.minAmount!);
      }
      if (params.maxAmount !== undefined) {
        filtered = filtered.filter(e => e.amount <= params.maxAmount!);
      }
      if (params.search) {
        const search = params.search.toLowerCase();
        filtered = filtered.filter(e =>
          e.description?.toLowerCase().includes(search) ||
          e.employeeName?.toLowerCase().includes(search)
        );
      }

      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<ExpenseDTO>>(
      `${this.ENDPOINTS.EXPENSES}?${queryParams}`
    );
  }

  async getExpense(id: number): Promise<ExpenseDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockExpenses } = await import('./mockData');
      const expense = mockExpenses.find(e => e.id === id);
      if (!expense) {
        throw new Error(`Expense with id ${id} not found`);
      }
      return expense;
    }

    return apiClient.get<ExpenseDTO>(this.ENDPOINTS.EXPENSE_BY_ID(id));
  }

  async createExpense(data: ExpenseCreateDTO): Promise<ExpenseDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockExpenses, mockEmployees } = await import('./mockData');
      const employee = mockEmployees.find(e => e.id === data.employeeId);
      const status: ExpenseStatus = ExpenseStatus.SUBMITTED;
      const newExpense: ExpenseDTO = {
        id: Math.max(...mockExpenses.map(e => e.id), 0) + 1,
        ...data,
        currency: data.currency || 'USD',
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(employee && { employeeName: employee.fullName })
      };
      mockExpenses.push(newExpense);
      return newExpense;
    }

    return apiClient.post<ExpenseDTO>(this.ENDPOINTS.EXPENSES, {
      ...data,
      currency: data.currency || 'USD'
    });
  }

  async updateExpense(id: number, data: ExpenseUpdateDTO): Promise<ExpenseDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockExpenses } = await import('./mockData');
      const index = mockExpenses.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Expense with id ${id} not found`);
      }
      mockExpenses[index] = {
        ...mockExpenses[index],
        ...data,
        updatedAt: new Date().toISOString()
      };
      return mockExpenses[index];
    }

    return apiClient.put<ExpenseDTO>(this.ENDPOINTS.EXPENSE_BY_ID(id), data);
  }

  async deleteExpense(id: number): Promise<void> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockExpenses } = await import('./mockData');
      const index = mockExpenses.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Expense with id ${id} not found`);
      }
      mockExpenses.splice(index, 1);
      return;
    }

    return apiClient.delete<void>(this.ENDPOINTS.EXPENSE_BY_ID(id));
  }

  async getExpensesByEmployee(
    employeeId: number,
    params: PaginationParams = { page: 0, size: 10 }
  ): Promise<PaginatedResponse<ExpenseDTO>> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockExpenses } = await import('./mockData');
      const filtered = mockExpenses.filter(e => e.employeeId === employeeId);
      return createPaginatedResponse(filtered, params.page, params.size);
    }

    const queryParams = this.buildQueryParams(params);
    return apiClient.get<PaginatedResponse<ExpenseDTO>>(
      `${this.ENDPOINTS.EXPENSES_BY_EMPLOYEE(employeeId)}?${queryParams}`
    );
  }

  // ============================================================================
  // EXPENSE APPROVAL WORKFLOW METHODS
  // ============================================================================

  async approveExpense(id: number, data: ExpenseApproveDTO): Promise<ExpenseDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockExpenses, mockEmployees } = await import('./mockData');
      const index = mockExpenses.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Expense with id ${id} not found`);
      }
      const approver = mockEmployees.find(e => e.id === data.approvedBy);
      const status: ExpenseStatus = ExpenseStatus.APPROVED;
      mockExpenses[index] = {
        ...mockExpenses[index],
        status,
        approvedBy: data.approvedBy,
        approvedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...(approver && { approverName: approver.fullName })
      };
      return mockExpenses[index];
    }

    return apiClient.put<ExpenseDTO>(this.ENDPOINTS.APPROVE_EXPENSE(id), {
      approverId: data.approvedBy
    });
  }

  async rejectExpense(id: number, data: ExpenseRejectDTO): Promise<ExpenseDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockExpenses, mockEmployees } = await import('./mockData');
      const index = mockExpenses.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Expense with id ${id} not found`);
      }
      const approver = mockEmployees.find(e => e.id === data.rejectedBy);
      const status: ExpenseStatus = ExpenseStatus.REJECTED;
      mockExpenses[index] = {
        ...mockExpenses[index],
        status,
        approvedBy: data.rejectedBy,
        approvedAt: new Date().toISOString(),
        rejectionReason: data.rejectionComments,
        updatedAt: new Date().toISOString(),
        ...(approver && { approverName: approver.fullName })
      };
      return mockExpenses[index];
    }

    return apiClient.put<ExpenseDTO>(this.ENDPOINTS.REJECT_EXPENSE(id), {
      approverId: data.rejectedBy,
      rejectionReason: data.rejectionComments
    });
  }

  async markExpenseAsPaid(id: number): Promise<ExpenseDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockExpenses } = await import('./mockData');
      const index = mockExpenses.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Expense with id ${id} not found`);
      }
      const status: ExpenseStatus = ExpenseStatus.PAID;
      mockExpenses[index] = {
        ...mockExpenses[index],
        status,
        paidAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return mockExpenses[index];
    }

    return apiClient.put<ExpenseDTO>(this.ENDPOINTS.MARK_PAID(id), {
      paymentDate: new Date().toISOString().slice(0, 10)
    });
  }

  // ============================================================================
  // EXPENSE REPORTING METHODS
  // ============================================================================

  async getExpenseSummary(params: ExpenseSearchParams): Promise<ExpenseSummaryDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockExpenses } = await import('./mockData');

      let filtered = [...mockExpenses];

      if (params.employeeId) {
        filtered = filtered.filter(e => e.employeeId === params.employeeId);
      }
      if (params.startDate) {
        filtered = filtered.filter(e => e.expenseDate >= params.startDate!);
      }
      if (params.endDate) {
        filtered = filtered.filter(e => e.expenseDate <= params.endDate!);
      }

      const byStatus: Record<string, number> = {};
      const byType: Record<string, number> = {};

      filtered.forEach(expense => {
        byStatus[expense.status] = (byStatus[expense.status] || 0) + expense.amount;
        byType[expense.expenseType] = (byType[expense.expenseType] || 0) + expense.amount;
      });

      return {
        totalExpenses: filtered.length,
        totalAmount: filtered.reduce((sum, e) => sum + e.amount, 0),
        byStatus: byStatus as Record<ExpenseStatus, number>,
        byType: byType as Record<ExpenseType, number>
      };
    }

    const statistics = await apiClient.get<any>(this.ENDPOINTS.EXPENSE_SUMMARY);
    return {
      totalExpenses: statistics.totalExpenses || 0,
      totalAmount: statistics.totalAmount || 0,
      byStatus: {
        [ExpenseStatus.SUBMITTED]: statistics.submittedExpenses || 0,
        [ExpenseStatus.APPROVED]: statistics.approvedExpenses || 0,
        [ExpenseStatus.REJECTED]: statistics.rejectedExpenses || 0,
        [ExpenseStatus.PAID]: statistics.paidExpenses || 0
      },
      byType: {} as Record<ExpenseType, number>
    };
  }

  // ============================================================================
  // FILE UPLOAD METHODS
  // ============================================================================

  async uploadReceipt(file: File): Promise<{ url: string }> {
    if (USE_MOCK) {
      await simulateDelay();
      // Simulate file upload and return a mock URL
      const mockUrl = `https://storage.example.com/receipts/${Date.now()}-${file.name}`;
      return { url: mockUrl };
    }

    // The backend does not expose receipt upload yet, so keep the UX working
    // by using a browser-local object URL that can be submitted as receiptUrl.
    return { url: URL.createObjectURL(file) };
  }

  // ============================================================================
  // PAYMENT TRACKING METHODS
  // ============================================================================

  async markAsPaid(id: number, data: ExpensePaymentDTO): Promise<ExpenseDTO> {
    if (USE_MOCK) {
      await simulateDelay();
      const { mockExpenses } = await import('./mockData');
      const index = mockExpenses.findIndex(e => e.id === id);
      if (index === -1) {
        throw new Error(`Expense with id ${id} not found`);
      }
      const status: ExpenseStatus = ExpenseStatus.PAID;
      mockExpenses[index] = {
        ...mockExpenses[index],
        status,
        paidAt: data.paymentDate || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return mockExpenses[index];
    }

    return apiClient.put<ExpenseDTO>(this.ENDPOINTS.MARK_PAID(id), {
      paymentDate: data.paymentDate || new Date().toISOString().slice(0, 10)
    });
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

const expenseApi = new ExpenseApiClientImpl();

export default expenseApi;

export { ExpenseApiClientImpl };
