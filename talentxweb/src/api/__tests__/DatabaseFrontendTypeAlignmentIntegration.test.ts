/**
 * Integration tests for Database-Frontend Type Alignment
 * Tests Requirements: 1.1-1.4, 2.1-2.3, 3.1-3.9, 4.1-4.6, 5.1-5.2
 * 
 * This test suite validates:
 * - PayrollRun API methods return correct types
 * - LeaveRequest API methods handle new fields (isHalfDay, isEmergency, attachmentPath)
 * - EmploymentStatus SUSPENDED is handled correctly
 * - Audit fields are returned from API calls
 */

import payrollApi from '../payrollApi';
import leaveApi from '../leaveApi';
import employeeApi from '../employeeApi';
import attendanceApi from '../attendanceApi';
import axiosClient from '../axiosClient';
import {
  PayrollRunStatus,
  LeaveStatus,
  EmploymentStatus,
  AttendanceStatus
} from '../../types';

// Mock axios client
jest.mock('../axiosClient');

describe('Database-Frontend Type Alignment Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('PayrollRun API Integration', () => {
    it('should return PayrollRun with all required fields including audit fields', async () => {
      const mockPayrollRun = {
        id: 1,
        organizationId: 1,
        name: 'January 2026 Payroll',
        payPeriodStart: '2026-01-01',
        payPeriodEnd: '2026-01-31',
        payDate: '2026-02-05',
        status: PayrollRunStatus.DRAFT,
        totalGross: 100000.50,
        totalDeductions: 15000.25,
        totalNet: 85000.25,
        totalGrossPay: 100000.50,
        totalNetPay: 85000.25,
        totalTaxes: 12000.00,
        employeeCount: 50,
        description: 'Monthly payroll for January',
        notes: 'All employees included',
        processedBy: 2,
        processedAt: '2026-02-01T10:00:00Z',
        approvedBy: 3,
        approvedAt: '2026-02-02T14:00:00Z',
        paidBy: 'admin',
        paidAt: '2026-02-05T09:00:00Z',
        externalPayrollId: 'EXT-PAY-001',
        createdAt: '2026-01-31T08:00:00Z',
        updatedAt: '2026-02-05T09:00:00Z',
        // Audit fields
        active: true,
        createdBy: 'system',
        updatedBy: 'admin',
        version: 1
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockPayrollRun);

      const result = await payrollApi.getPayrollRun(1);

      // Verify all required fields are present
      expect(result.id).toBe(1);
      expect(result.organizationId).toBe(1);
      expect(result.name).toBe('January 2026 Payroll');
      expect(result.status).toBe(PayrollRunStatus.DRAFT);

      // Verify financial fields with precision
      expect(result.totalGross).toBe(100000.50);
      expect(result.totalDeductions).toBe(15000.25);
      expect(result.totalNet).toBe(85000.25);
      expect(result.totalGrossPay).toBe(100000.50);
      expect(result.totalNetPay).toBe(85000.25);
      expect(result.totalTaxes).toBe(12000.00);

      // Verify audit fields are present
      expect(result.active).toBe(true);
      expect(result.createdBy).toBe('system');
      expect(result.updatedBy).toBe('admin');
      expect(result.version).toBe(1);
    });

    it('should create PayrollRun with correct status enum', async () => {
      const createData = {
        organizationId: 1,
        payPeriodStart: '2026-02-01',
        payPeriodEnd: '2026-02-28',
        payDate: '2026-03-05'
      };

      const mockResponse = {
        id: 2,
        ...createData,
        name: 'February 2026 Payroll',
        status: PayrollRunStatus.DRAFT,
        totalGross: 0,
        totalDeductions: 0,
        totalNet: 0,
        createdAt: '2026-02-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z',
        active: true,
        createdBy: 'system',
        version: 1
      };

      (axiosClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await payrollApi.createPayrollRun(createData);

      expect(result.status).toBe(PayrollRunStatus.DRAFT);
      expect(Object.values(PayrollRunStatus)).toContain(result.status);
    });

    it('should handle all PayrollRunStatus enum values', async () => {
      const statuses = [
        PayrollRunStatus.DRAFT,
        PayrollRunStatus.PROCESSING,
        PayrollRunStatus.APPROVED,
        PayrollRunStatus.PAID,
        PayrollRunStatus.CANCELLED
      ];

      for (const status of statuses) {
        const mockPayrollRun = {
          id: 1,
          organizationId: 1,
          name: 'Test Payroll',
          payPeriodStart: '2026-01-01',
          payPeriodEnd: '2026-01-31',
          payDate: '2026-02-05',
          status,
          createdAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-01-01T00:00:00Z'
        };

        (axiosClient.get as jest.Mock).mockResolvedValue(mockPayrollRun);
        const result = await payrollApi.getPayrollRun(1);

        expect(result.status).toBe(status);
        expect(Object.values(PayrollRunStatus)).toContain(result.status);
      }
    });
  });

  describe('LeaveRequest API Integration - New Fields', () => {
    it('should handle LeaveRequest with half-day leave fields', async () => {
      const mockLeaveRequest = {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-15',
        endDate: '2026-01-15',
        totalDays: 0.5,
        reason: 'Medical appointment',
        status: LeaveStatus.PENDING,
        // New half-day fields
        isHalfDay: true,
        halfDayPeriod: 'AM',
        createdAt: '2026-01-10T00:00:00Z',
        updatedAt: '2026-01-10T00:00:00Z'
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockLeaveRequest);

      const result = await leaveApi.getLeaveRequest(1);

      // Verify half-day fields are present and correctly typed
      expect(result.isHalfDay).toBe(true);
      expect(typeof result.isHalfDay).toBe('boolean');
      expect(result.halfDayPeriod).toBe('AM');
      expect(typeof result.halfDayPeriod).toBe('string');
      expect(result.totalDays).toBe(0.5);
    });

    it('should handle LeaveRequest with emergency leave fields', async () => {
      const mockLeaveRequest = {
        id: 2,
        employeeId: 2,
        leaveTypeId: 2,
        startDate: '2026-01-20',
        endDate: '2026-01-22',
        totalDays: 3,
        reason: 'Family emergency',
        status: LeaveStatus.APPROVED,
        // New emergency leave fields
        isEmergency: true,
        emergencyContact: 'John Doe',
        contactDetails: '+1-555-0123',
        createdAt: '2026-01-19T00:00:00Z',
        updatedAt: '2026-01-19T12:00:00Z'
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockLeaveRequest);

      const result = await leaveApi.getLeaveRequest(2);

      // Verify emergency leave fields are present and correctly typed
      expect(result.isEmergency).toBe(true);
      expect(typeof result.isEmergency).toBe('boolean');
      expect(result.emergencyContact).toBe('John Doe');
      expect(result.contactDetails).toBe('+1-555-0123');
    });

    it('should handle LeaveRequest with attachment field', async () => {
      const mockLeaveRequest = {
        id: 3,
        employeeId: 3,
        leaveTypeId: 1,
        startDate: '2026-02-01',
        endDate: '2026-02-05',
        totalDays: 5,
        reason: 'Medical leave',
        status: LeaveStatus.PENDING,
        // New attachment field
        attachmentPath: '/uploads/medical-certificate-123.pdf',
        createdAt: '2026-01-25T00:00:00Z',
        updatedAt: '2026-01-25T00:00:00Z'
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockLeaveRequest);

      const result = await leaveApi.getLeaveRequest(3);

      // Verify attachment field is present
      expect(result.attachmentPath).toBe('/uploads/medical-certificate-123.pdf');
      expect(typeof result.attachmentPath).toBe('string');
    });

    it('should handle LeaveRequest with all new fields combined', async () => {
      const mockLeaveRequest = {
        id: 4,
        employeeId: 4,
        leaveTypeId: 3,
        startDate: '2026-03-10',
        endDate: '2026-03-10',
        totalDays: 0.5,
        reason: 'Emergency medical appointment',
        status: LeaveStatus.APPROVED,
        // All new fields
        isHalfDay: true,
        halfDayPeriod: 'PM',
        isEmergency: true,
        emergencyContact: 'Jane Smith',
        contactDetails: 'jane.smith@example.com',
        attachmentPath: '/uploads/emergency-doc-456.pdf',
        // Audit fields
        active: true,
        createdBy: 'employee4',
        updatedBy: 'manager1',
        version: 2,
        createdAt: '2026-03-08T00:00:00Z',
        updatedAt: '2026-03-09T10:00:00Z'
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockLeaveRequest);

      const result = await leaveApi.getLeaveRequest(4);

      // Verify all new fields
      expect(result.isHalfDay).toBe(true);
      expect(result.halfDayPeriod).toBe('PM');
      expect(result.isEmergency).toBe(true);
      expect(result.emergencyContact).toBe('Jane Smith');
      expect(result.contactDetails).toBe('jane.smith@example.com');
      expect(result.attachmentPath).toBe('/uploads/emergency-doc-456.pdf');

      // Verify audit fields
      expect(result.active).toBe(true);
      expect(result.createdBy).toBe('employee4');
      expect(result.updatedBy).toBe('manager1');
      expect(result.version).toBe(2);
    });

    it('should handle LeaveRequest without optional new fields', async () => {
      const mockLeaveRequest = {
        id: 5,
        employeeId: 5,
        leaveTypeId: 1,
        startDate: '2026-04-01',
        endDate: '2026-04-03',
        totalDays: 3,
        reason: 'Vacation',
        status: LeaveStatus.PENDING,
        createdAt: '2026-03-25T00:00:00Z',
        updatedAt: '2026-03-25T00:00:00Z'
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockLeaveRequest);

      const result = await leaveApi.getLeaveRequest(5);

      // Verify optional fields are undefined
      expect(result.isHalfDay).toBeUndefined();
      expect(result.halfDayPeriod).toBeUndefined();
      expect(result.isEmergency).toBeUndefined();
      expect(result.emergencyContact).toBeUndefined();
      expect(result.contactDetails).toBeUndefined();
      expect(result.attachmentPath).toBeUndefined();
    });
  });

  describe('EmploymentStatus SUSPENDED Handling', () => {
    it('should handle employee with SUSPENDED status', async () => {
      const mockEmployee = {
        id: 1,
        organizationId: 1,
        employeeNumber: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        employmentStatus: EmploymentStatus.SUSPENDED,
        employmentType: 'FULL_TIME',
        hireDate: '2024-01-01',
        workEmail: 'john.doe@example.com',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2026-01-15T00:00:00Z'
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockEmployee);

      const result = await employeeApi.getEmployee(1);

      // Verify SUSPENDED status is correctly handled
      expect(result.employmentStatus).toBe(EmploymentStatus.SUSPENDED);
      expect(Object.values(EmploymentStatus)).toContain(result.employmentStatus);
    });

    it('should filter employees by SUSPENDED status', async () => {
      const mockResponse = {
        content: [
          {
            id: 1,
            employeeNumber: 'EMP001',
            fullName: 'John Doe',
            employmentStatus: EmploymentStatus.SUSPENDED
          },
          {
            id: 2,
            employeeNumber: 'EMP002',
            fullName: 'Jane Smith',
            employmentStatus: EmploymentStatus.SUSPENDED
          }
        ],
        totalElements: 2,
        totalPages: 1,
        size: 10,
        number: 0
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await employeeApi.getEmployees({
        employmentStatus: EmploymentStatus.SUSPENDED,
        page: 0,
        size: 10
      });

      expect(result.content).toHaveLength(2);
      result.content.forEach(employee => {
        expect(employee.employmentStatus).toBe(EmploymentStatus.SUSPENDED);
      });
    });

    it('should handle all EmploymentStatus enum values including SUSPENDED', async () => {
      const statuses = [
        EmploymentStatus.ACTIVE,
        EmploymentStatus.INACTIVE,
        EmploymentStatus.TERMINATED,
        EmploymentStatus.ON_LEAVE,
        EmploymentStatus.SUSPENDED
      ];

      for (const status of statuses) {
        const mockEmployee = {
          id: 1,
          organizationId: 1,
          employeeNumber: 'EMP001',
          firstName: 'Test',
          lastName: 'Employee',
          fullName: 'Test Employee',
          employmentStatus: status,
          employmentType: 'FULL_TIME',
          hireDate: '2024-01-01',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        };

        (axiosClient.get as jest.Mock).mockResolvedValue(mockEmployee);
        const result = await employeeApi.getEmployee(1);

        expect(result.employmentStatus).toBe(status);
        expect(Object.values(EmploymentStatus)).toContain(result.employmentStatus);
      }
    });
  });

  describe('Audit Fields in API Responses', () => {
    it('should return AttendanceRecord with audit fields', async () => {
      const mockAttendanceRecord = {
        id: 1,
        employeeId: 1,
        employeeName: 'John Doe',
        attendanceDate: '2026-01-15',
        checkInTime: '09:00:00',
        checkOutTime: '17:30:00',
        totalHours: 8.5,
        overtimeHours: 0.5,
        breakHours: 1.0,
        status: AttendanceStatus.PRESENT,
        createdAt: '2026-01-15T09:00:00Z',
        updatedAt: '2026-01-15T17:30:00Z',
        // Audit fields
        active: true,
        createdBy: 'system',
        updatedBy: 'employee1',
        version: 1
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockAttendanceRecord);

      const result = await attendanceApi.getAttendanceRecord(1);

      // Verify audit fields are present
      expect(result.active).toBe(true);
      expect(typeof result.active).toBe('boolean');
      expect(result.createdBy).toBe('system');
      expect(result.updatedBy).toBe('employee1');
      expect(result.version).toBe(1);
      expect(typeof result.version).toBe('number');
    });

    it('should return PayrollRun with audit fields from list endpoint', async () => {
      const mockResponse = {
        content: [
          {
            id: 1,
            organizationId: 1,
            name: 'January Payroll',
            payPeriodStart: '2026-01-01',
            payPeriodEnd: '2026-01-31',
            payDate: '2026-02-05',
            status: PayrollRunStatus.PAID,
            createdAt: '2026-01-31T00:00:00Z',
            updatedAt: '2026-02-05T00:00:00Z',
            active: true,
            createdBy: 'system',
            updatedBy: 'admin',
            version: 3
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await payrollApi.getPayrollRuns({ page: 0, size: 10 });

      expect(result.content).toHaveLength(1);
      const payrollRun = result.content[0];

      // Verify audit fields in list response
      expect(payrollRun?.active).toBe(true);
      expect(payrollRun?.createdBy).toBe('system');
      expect(payrollRun?.updatedBy).toBe('admin');
      expect(payrollRun?.version).toBe(3);
    });

    it('should handle audit fields in update operations', async () => {
      const updateData = {
        checkOutTime: '18:00:00',
        totalHours: 9.0,
        overtimeHours: 1.0
      };

      const mockUpdatedRecord = {
        id: 1,
        employeeId: 1,
        attendanceDate: '2026-01-15',
        checkInTime: '09:00:00',
        checkOutTime: '18:00:00',
        totalHours: 9.0,
        overtimeHours: 1.0,
        breakHours: 1.0,
        status: AttendanceStatus.PRESENT,
        createdAt: '2026-01-15T09:00:00Z',
        updatedAt: '2026-01-15T18:00:00Z',
        // Audit fields updated
        active: true,
        createdBy: 'system',
        updatedBy: 'manager1',
        version: 2
      };

      (axiosClient.put as jest.Mock).mockResolvedValue(mockUpdatedRecord);

      const result = await attendanceApi.updateAttendanceRecord(1, updateData);

      // Verify audit fields reflect the update
      expect(result.updatedBy).toBe('manager1');
      expect(result.version).toBe(2);
      expect(result.updatedAt).toBe('2026-01-15T18:00:00Z');
    });

    it('should handle missing optional audit fields gracefully', async () => {
      const mockRecord = {
        id: 1,
        employeeId: 1,
        attendanceDate: '2026-01-15',
        status: AttendanceStatus.PRESENT,
        createdAt: '2026-01-15T09:00:00Z',
        updatedAt: '2026-01-15T09:00:00Z'
        // No audit fields
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockRecord);

      const result = await attendanceApi.getAttendanceRecord(1);

      // Verify optional audit fields are undefined
      expect(result.active).toBeUndefined();
      expect(result.createdBy).toBeUndefined();
      expect(result.updatedBy).toBeUndefined();
      expect(result.version).toBeUndefined();
    });
  });

  describe('Type Safety and Validation', () => {
    it('should maintain type safety for boolean fields', async () => {
      const mockLeaveRequest = {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-15',
        endDate: '2026-01-15',
        totalDays: 0.5,
        reason: 'Test',
        status: LeaveStatus.PENDING,
        isHalfDay: true,
        isEmergency: false,
        active: true,
        createdAt: '2026-01-10T00:00:00Z',
        updatedAt: '2026-01-10T00:00:00Z'
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockLeaveRequest);

      const result = await leaveApi.getLeaveRequest(1);

      // Verify boolean types
      expect(typeof result.isHalfDay).toBe('boolean');
      expect(typeof result.isEmergency).toBe('boolean');
      expect(typeof result.active).toBe('boolean');
    });

    it('should maintain type safety for numeric precision fields', async () => {
      const mockPayrollRun = {
        id: 1,
        organizationId: 1,
        name: 'Test Payroll',
        payPeriodStart: '2026-01-01',
        payPeriodEnd: '2026-01-31',
        payDate: '2026-02-05',
        status: PayrollRunStatus.PAID,
        totalGross: 123456.78,
        totalDeductions: 23456.78,
        totalNet: 100000.00,
        totalTaxes: 20000.50,
        createdAt: '2026-01-31T00:00:00Z',
        updatedAt: '2026-02-05T00:00:00Z'
      };

      (axiosClient.get as jest.Mock).mockResolvedValue(mockPayrollRun);

      const result = await payrollApi.getPayrollRun(1);

      // Verify numeric types and precision
      expect(typeof result.totalGross).toBe('number');
      expect(typeof result.totalDeductions).toBe('number');
      expect(typeof result.totalNet).toBe('number');
      expect(typeof result.totalTaxes).toBe('number');

      // Verify values maintain precision
      expect(result.totalGross).toBe(123456.78);
      expect(result.totalDeductions).toBe(23456.78);
      expect(result.totalNet).toBe(100000.00);
      expect(result.totalTaxes).toBe(20000.50);
    });
  });
});
