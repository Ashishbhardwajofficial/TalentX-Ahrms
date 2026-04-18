// Reporting API client for generating and exporting reports
import apiClient from "./axiosClient";
import leaveApi from "./leaveApi";
import payrollApi from "./payrollApi";

// Report types
export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  category: ReportCategory;
  parameters: ReportParameter[];
}

export enum ReportCategory {
  EMPLOYEE = 'EMPLOYEE',
  LEAVE = 'LEAVE',
  PAYROLL = 'PAYROLL',
  RECRUITMENT = 'RECRUITMENT',
  ATTENDANCE = 'ATTENDANCE',
  COMPLIANCE = 'COMPLIANCE'
}

export interface ReportParameter {
  name: string;
  label: string;
  type: 'date' | 'dateRange' | 'select' | 'multiSelect' | 'number' | 'text';
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  defaultValue?: any;
}

export interface ReportRequest {
  reportId: string;
  parameters: Record<string, any>;
  format: ReportFormat;
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  CSV = 'CSV',
  JSON = 'JSON'
}

export interface ReportResult {
  reportId: string;
  reportName: string;
  generatedAt: string;
  format: ReportFormat;
  data?: any;
  downloadUrl?: string;
}

// Reporting API client interface
export interface ReportingApiClient {
  getAvailableReports(): Promise<ReportDefinition[]>;
  generateReport(request: ReportRequest): Promise<ReportResult>;
  downloadReport(reportId: string, format: ReportFormat): Promise<Blob>;
  exportEmployees(filters?: any): Promise<Blob>;
  exportLeaveRequests(filters?: any): Promise<Blob>;
  exportPayrollData(filters?: any): Promise<Blob>;
}

// Implementation of reporting API client
class ReportingApiClientImpl implements ReportingApiClient {
  private readonly REPORTING_ENDPOINTS = {
    REPORTS: '/reports',
    GENERATE: '/reports/generate',
    DOWNLOAD: (reportId: string) => `/reports/${reportId}/download`,
    EXPORT_EMPLOYEES: '/employees/export',
    EXPORT_LEAVES: '/leaves/export',
    EXPORT_PAYROLL: '/payroll/export'
  } as const;

  /**
   * Get list of available reports
   */
  async getAvailableReports(): Promise<ReportDefinition[]> {
    // Return predefined reports since backend might not have this endpoint yet
    return this.getPredefinedReports();
  }

  /**
   * Generate a report with specified parameters
   */
  async generateReport(request: ReportRequest): Promise<ReportResult> {
    try {
      return await apiClient.post<ReportResult>(
        this.REPORTING_ENDPOINTS.GENERATE,
        request
      );
    } catch (error) {
      const exportBlob = await this.buildFallbackReport(request);
      return {
        reportId: request.reportId,
        reportName: request.reportId,
        generatedAt: new Date().toISOString(),
        format: request.format,
        downloadUrl: URL.createObjectURL(exportBlob)
      };
    }
  }

  /**
   * Download a generated report
   */
  async downloadReport(reportId: string, format: ReportFormat): Promise<Blob> {
    const response = await apiClient.getAxiosInstance().get(
      `${this.REPORTING_ENDPOINTS.DOWNLOAD(reportId)}?format=${format}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  /**
   * Export employees data
   */
  async exportEmployees(filters?: any): Promise<Blob> {
    const params = this.buildQueryParams(filters || {});
    const response = await apiClient.getAxiosInstance().get(
      `${this.REPORTING_ENDPOINTS.EXPORT_EMPLOYEES}?${params}`,
      { responseType: 'blob' }
    );
    return response.data;
  }

  /**
   * Export leave requests data
   */
  async exportLeaveRequests(filters?: any): Promise<Blob> {
    try {
      const params = this.buildQueryParams(filters || {});
      const response = await apiClient.getAxiosInstance().get(
        `${this.REPORTING_ENDPOINTS.EXPORT_LEAVES}?${params}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch {
      const result = await leaveApi.getLeaveRequests({
        page: 0,
        size: 1000,
        ...(filters || {})
      });
      const headers = ['ID', 'Employee', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Reason'];
      const rows = result.content.map(item => [
        item.id,
        item.employee?.fullName || '',
        item.leaveType?.name || '',
        item.startDate,
        item.endDate,
        item.totalDays,
        item.status,
        item.reason || ''
      ]);
      return this.rowsToCsvBlob(headers, rows);
    }
  }

  /**
   * Export payroll data
   */
  async exportPayrollData(filters?: any): Promise<Blob> {
    try {
      const params = this.buildQueryParams(filters || {});
      const response = await apiClient.getAxiosInstance().get(
        `${this.REPORTING_ENDPOINTS.EXPORT_PAYROLL}?${params}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch {
      const result = await payrollApi.getPayrollRuns({
        page: 0,
        size: 1000,
        ...(filters || {})
      });
      const headers = ['ID', 'Name', 'Pay Period Start', 'Pay Period End', 'Pay Date', 'Status', 'Employee Count', 'Total Net Pay'];
      const rows = result.content.map(item => [
        item.id,
        item.name || '',
        item.payPeriodStart,
        item.payPeriodEnd,
        item.payDate,
        item.status,
        item.employeeCount || 0,
        item.totalNetPay || item.totalNet || 0
      ]);
      return this.rowsToCsvBlob(headers, rows);
    }
  }

  private async buildFallbackReport(request: ReportRequest): Promise<Blob> {
    switch (request.reportId) {
      case 'leave-summary':
        return this.exportLeaveRequests(request.parameters);
      case 'payroll-summary':
        return this.exportPayrollData(request.parameters);
      default:
        return new Blob([JSON.stringify({
          reportId: request.reportId,
          parameters: request.parameters,
          generatedAt: new Date().toISOString()
        }, null, 2)], { type: 'application/json' });
    }
  }

  private rowsToCsvBlob(headers: Array<string | number>, rows: Array<Array<string | number>>): Blob {
    const escapeCell = (value: string | number) => {
      const text = String(value ?? '');
      if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const csv = [headers, ...rows]
      .map(row => row.map(escapeCell).join(','))
      .join('\n');

    return new Blob([csv], { type: 'text/csv' });
  }

  /**
   * Get predefined report definitions
   */
  private getPredefinedReports(): ReportDefinition[] {
    return [
      {
        id: 'employee-roster',
        name: 'Employee Roster',
        description: 'Complete list of all employees with their details',
        category: ReportCategory.EMPLOYEE,
        parameters: [
          {
            name: 'departmentId',
            label: 'Department',
            type: 'select',
            required: false,
            options: []
          },
          {
            name: 'employmentStatus',
            label: 'Employment Status',
            type: 'select',
            required: false,
            options: [
              { value: 'ACTIVE', label: 'Active' },
              { value: 'INACTIVE', label: 'Inactive' },
              { value: 'TERMINATED', label: 'Terminated' }
            ]
          }
        ]
      },
      {
        id: 'leave-summary',
        name: 'Leave Summary Report',
        description: 'Summary of leave requests and balances',
        category: ReportCategory.LEAVE,
        parameters: [
          {
            name: 'dateRange',
            label: 'Date Range',
            type: 'dateRange',
            required: true
          },
          {
            name: 'departmentId',
            label: 'Department',
            type: 'select',
            required: false,
            options: []
          }
        ]
      },
      {
        id: 'payroll-summary',
        name: 'Payroll Summary',
        description: 'Payroll summary for a specific period',
        category: ReportCategory.PAYROLL,
        parameters: [
          {
            name: 'year',
            label: 'Year',
            type: 'number',
            required: true,
            defaultValue: new Date().getFullYear()
          },
          {
            name: 'month',
            label: 'Month',
            type: 'select',
            required: true,
            options: [
              { value: '1', label: 'January' },
              { value: '2', label: 'February' },
              { value: '3', label: 'March' },
              { value: '4', label: 'April' },
              { value: '5', label: 'May' },
              { value: '6', label: 'June' },
              { value: '7', label: 'July' },
              { value: '8', label: 'August' },
              { value: '9', label: 'September' },
              { value: '10', label: 'October' },
              { value: '11', label: 'November' },
              { value: '12', label: 'December' }
            ]
          }
        ]
      },
      {
        id: 'recruitment-pipeline',
        name: 'Recruitment Pipeline',
        description: 'Overview of recruitment activities and candidate pipeline',
        category: ReportCategory.RECRUITMENT,
        parameters: [
          {
            name: 'dateRange',
            label: 'Date Range',
            type: 'dateRange',
            required: true
          }
        ]
      },
      {
        id: 'attendance-report',
        name: 'Attendance Report',
        description: 'Employee attendance records for a period',
        category: ReportCategory.ATTENDANCE,
        parameters: [
          {
            name: 'dateRange',
            label: 'Date Range',
            type: 'dateRange',
            required: true
          },
          {
            name: 'departmentId',
            label: 'Department',
            type: 'select',
            required: false,
            options: []
          }
        ]
      }
    ];
  }

  /**
   * Build query parameters string
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
const reportingApi = new ReportingApiClientImpl();

export default reportingApi;

// Export the class for testing purposes
export { ReportingApiClientImpl };
