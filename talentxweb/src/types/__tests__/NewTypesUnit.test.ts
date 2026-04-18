/**
 * Unit Tests for New Type Definitions
 * Tests for database-frontend type alignment changes
 */

import {
  PayrollRun,
  PayrollRunStatus,
  EmploymentStatus,
  LeaveRequest,
  AttendanceRecord,
  PerformanceReview,
  BenefitPlan,
  Asset,
  LeaveStatus
} from '../index';

describe('New Types Unit Tests', () => {
  describe('PayrollRun Interface', () => {
    it('should have all required fields', () => {
      const payrollRun: PayrollRun = {
        id: 1,
        organizationId: 1,
        name: 'January 2026 Payroll',
        payPeriodStart: '2026-01-01',
        payPeriodEnd: '2026-01-31',
        payDate: '2026-02-05',
        status: PayrollRunStatus.DRAFT,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      };

      expect(payrollRun.id).toBe(1);
      expect(payrollRun.organizationId).toBe(1);
      expect(payrollRun.name).toBe('January 2026 Payroll');
      expect(payrollRun.payPeriodStart).toBe('2026-01-01');
      expect(payrollRun.payPeriodEnd).toBe('2026-01-31');
      expect(payrollRun.payDate).toBe('2026-02-05');
      expect(payrollRun.status).toBe(PayrollRunStatus.DRAFT);
      expect(payrollRun.createdAt).toBe('2026-01-01T00:00:00Z');
      expect(payrollRun.updatedAt).toBe('2026-01-01T00:00:00Z');
    });

    it('should support optional financial fields', () => {
      const payrollRun: PayrollRun = {
        id: 1,
        organizationId: 1,
        name: 'Test Payroll',
        payPeriodStart: '2026-01-01',
        payPeriodEnd: '2026-01-31',
        payDate: '2026-02-05',
        status: PayrollRunStatus.APPROVED,
        totalGross: 100000.50,
        totalDeductions: 15000.25,
        totalNet: 85000.25,
        totalGrossPay: 100000.50,
        totalNetPay: 85000.25,
        totalTaxes: 15000.25,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      };

      expect(payrollRun.totalGross).toBe(100000.50);
      expect(payrollRun.totalDeductions).toBe(15000.25);
      expect(payrollRun.totalNet).toBe(85000.25);
      expect(payrollRun.totalGrossPay).toBe(100000.50);
      expect(payrollRun.totalNetPay).toBe(85000.25);
      expect(payrollRun.totalTaxes).toBe(15000.25);
    });

    it('should support optional workflow fields', () => {
      const payrollRun: PayrollRun = {
        id: 1,
        organizationId: 1,
        name: 'Test Payroll',
        payPeriodStart: '2026-01-01',
        payPeriodEnd: '2026-01-31',
        payDate: '2026-02-05',
        status: PayrollRunStatus.PAID,
        processedBy: 10,
        processedAt: '2026-01-15T10:00:00Z',
        approvedBy: 20,
        approvedAt: '2026-01-20T10:00:00Z',
        paidBy: 'admin',
        paidAt: '2026-02-05T10:00:00Z',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      };

      expect(payrollRun.processedBy).toBe(10);
      expect(payrollRun.processedAt).toBe('2026-01-15T10:00:00Z');
      expect(payrollRun.approvedBy).toBe(20);
      expect(payrollRun.approvedAt).toBe('2026-01-20T10:00:00Z');
      expect(payrollRun.paidBy).toBe('admin');
      expect(payrollRun.paidAt).toBe('2026-02-05T10:00:00Z');
    });

    it('should support optional metadata fields', () => {
      const payrollRun: PayrollRun = {
        id: 1,
        organizationId: 1,
        name: 'Test Payroll',
        payPeriodStart: '2026-01-01',
        payPeriodEnd: '2026-01-31',
        payDate: '2026-02-05',
        status: PayrollRunStatus.DRAFT,
        description: 'Monthly payroll for January',
        notes: 'Includes bonuses',
        employeeCount: 50,
        externalPayrollId: 'EXT-2026-01',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z'
      };

      expect(payrollRun.description).toBe('Monthly payroll for January');
      expect(payrollRun.notes).toBe('Includes bonuses');
      expect(payrollRun.employeeCount).toBe(50);
      expect(payrollRun.externalPayrollId).toBe('EXT-2026-01');
    });

    it('should support audit fields', () => {
      const payrollRun: PayrollRun = {
        id: 1,
        organizationId: 1,
        name: 'Test Payroll',
        payPeriodStart: '2026-01-01',
        payPeriodEnd: '2026-01-31',
        payDate: '2026-02-05',
        status: PayrollRunStatus.DRAFT,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        active: true,
        createdBy: 'admin',
        updatedBy: 'admin',
        version: 1
      };

      expect(payrollRun.active).toBe(true);
      expect(payrollRun.createdBy).toBe('admin');
      expect(payrollRun.updatedBy).toBe('admin');
      expect(payrollRun.version).toBe(1);
    });
  });

  describe('PayrollRunStatus Enum', () => {
    it('should have all required status values', () => {
      expect(PayrollRunStatus.DRAFT).toBe('DRAFT');
      expect(PayrollRunStatus.PROCESSING).toBe('PROCESSING');
      expect(PayrollRunStatus.APPROVED).toBe('APPROVED');
      expect(PayrollRunStatus.PAID).toBe('PAID');
      expect(PayrollRunStatus.CANCELLED).toBe('CANCELLED');
    });

    it('should have exactly 5 status values', () => {
      const statusValues = Object.values(PayrollRunStatus);
      expect(statusValues.length).toBe(5);
    });
  });

  describe('EmploymentStatus Enum', () => {
    it('should include SUSPENDED value', () => {
      expect(EmploymentStatus.SUSPENDED).toBe('SUSPENDED');
    });

    it('should have all required status values', () => {
      expect(EmploymentStatus.ACTIVE).toBe('ACTIVE');
      expect(EmploymentStatus.INACTIVE).toBe('INACTIVE');
      expect(EmploymentStatus.TERMINATED).toBe('TERMINATED');
      expect(EmploymentStatus.ON_LEAVE).toBe('ON_LEAVE');
      expect(EmploymentStatus.SUSPENDED).toBe('SUSPENDED');
    });

    it('should have exactly 5 status values', () => {
      const statusValues = Object.values(EmploymentStatus);
      expect(statusValues.length).toBe(5);
      expect(statusValues).toContain('ACTIVE');
      expect(statusValues).toContain('INACTIVE');
      expect(statusValues).toContain('TERMINATED');
      expect(statusValues).toContain('ON_LEAVE');
      expect(statusValues).toContain('SUSPENDED');
    });
  });

  describe('LeaveRequest Interface', () => {
    it('should have isHalfDay field', () => {
      const leaveRequest: LeaveRequest = {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-15',
        endDate: '2026-01-15',
        totalDays: 0.5,
        status: LeaveStatus.PENDING,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        isHalfDay: true
      };

      expect(leaveRequest.isHalfDay).toBe(true);
      expect(typeof leaveRequest.isHalfDay).toBe('boolean');
    });

    it('should have halfDayPeriod field', () => {
      const leaveRequest: LeaveRequest = {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-15',
        endDate: '2026-01-15',
        totalDays: 0.5,
        status: LeaveStatus.PENDING,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        isHalfDay: true,
        halfDayPeriod: 'AM'
      };

      expect(leaveRequest.halfDayPeriod).toBe('AM');
      expect(typeof leaveRequest.halfDayPeriod).toBe('string');
    });

    it('should have isEmergency field', () => {
      const leaveRequest: LeaveRequest = {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-15',
        endDate: '2026-01-16',
        totalDays: 2,
        status: LeaveStatus.PENDING,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        isEmergency: true
      };

      expect(leaveRequest.isEmergency).toBe(true);
      expect(typeof leaveRequest.isEmergency).toBe('boolean');
    });

    it('should have emergencyContact field', () => {
      const leaveRequest: LeaveRequest = {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-15',
        endDate: '2026-01-16',
        totalDays: 2,
        status: LeaveStatus.PENDING,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        isEmergency: true,
        emergencyContact: 'John Doe'
      };

      expect(leaveRequest.emergencyContact).toBe('John Doe');
      expect(typeof leaveRequest.emergencyContact).toBe('string');
    });

    it('should have contactDetails field', () => {
      const leaveRequest: LeaveRequest = {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-15',
        endDate: '2026-01-16',
        totalDays: 2,
        status: LeaveStatus.PENDING,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        contactDetails: '+1-555-0123'
      };

      expect(leaveRequest.contactDetails).toBe('+1-555-0123');
      expect(typeof leaveRequest.contactDetails).toBe('string');
    });

    it('should have attachmentPath field', () => {
      const leaveRequest: LeaveRequest = {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-15',
        endDate: '2026-01-16',
        totalDays: 2,
        status: LeaveStatus.PENDING,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        attachmentPath: '/uploads/leave/medical-certificate.pdf'
      };

      expect(leaveRequest.attachmentPath).toBe('/uploads/leave/medical-certificate.pdf');
      expect(typeof leaveRequest.attachmentPath).toBe('string');
    });

    it('should have audit fields', () => {
      const leaveRequest: LeaveRequest = {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-15',
        endDate: '2026-01-16',
        totalDays: 2,
        status: LeaveStatus.PENDING,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        active: true,
        createdBy: 'employee1',
        updatedBy: 'employee1',
        version: 1
      };

      expect(leaveRequest.active).toBe(true);
      expect(leaveRequest.createdBy).toBe('employee1');
      expect(leaveRequest.updatedBy).toBe('employee1');
      expect(leaveRequest.version).toBe(1);
    });

    it('should support all new fields together', () => {
      const leaveRequest: LeaveRequest = {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-15',
        endDate: '2026-01-15',
        totalDays: 0.5,
        status: LeaveStatus.PENDING,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        isHalfDay: true,
        halfDayPeriod: 'PM',
        isEmergency: true,
        emergencyContact: 'Jane Doe',
        contactDetails: '+1-555-9999',
        attachmentPath: '/uploads/leave/emergency-doc.pdf',
        active: true,
        createdBy: 'employee1',
        updatedBy: 'employee1',
        version: 1
      };

      expect(leaveRequest.isHalfDay).toBe(true);
      expect(leaveRequest.halfDayPeriod).toBe('PM');
      expect(leaveRequest.isEmergency).toBe(true);
      expect(leaveRequest.emergencyContact).toBe('Jane Doe');
      expect(leaveRequest.contactDetails).toBe('+1-555-9999');
      expect(leaveRequest.attachmentPath).toBe('/uploads/leave/emergency-doc.pdf');
      expect(leaveRequest.active).toBe(true);
      expect(leaveRequest.createdBy).toBe('employee1');
      expect(leaveRequest.updatedBy).toBe('employee1');
      expect(leaveRequest.version).toBe(1);
    });
  });

  describe('AttendanceRecord Interface', () => {
    it('should have audit fields', () => {
      const attendanceRecord: AttendanceRecord = {
        id: 1,
        employeeId: 1,
        attendanceDate: '2026-01-15',
        status: 'PRESENT' as any,
        createdAt: '2026-01-15T00:00:00Z',
        updatedAt: '2026-01-15T00:00:00Z',
        active: true,
        createdBy: 'system',
        updatedBy: 'manager1',
        version: 2
      };

      expect(attendanceRecord.active).toBe(true);
      expect(typeof attendanceRecord.active).toBe('boolean');
      expect(attendanceRecord.createdBy).toBe('system');
      expect(typeof attendanceRecord.createdBy).toBe('string');
      expect(attendanceRecord.updatedBy).toBe('manager1');
      expect(typeof attendanceRecord.updatedBy).toBe('string');
      expect(attendanceRecord.version).toBe(2);
      expect(typeof attendanceRecord.version).toBe('number');
    });

    it('should support audit fields as optional', () => {
      const attendanceRecord: AttendanceRecord = {
        id: 1,
        employeeId: 1,
        attendanceDate: '2026-01-15',
        status: 'PRESENT' as any,
        createdAt: '2026-01-15T00:00:00Z',
        updatedAt: '2026-01-15T00:00:00Z'
      };

      expect(attendanceRecord.active).toBeUndefined();
      expect(attendanceRecord.createdBy).toBeUndefined();
      expect(attendanceRecord.updatedBy).toBeUndefined();
      expect(attendanceRecord.version).toBeUndefined();
    });
  });

  describe('PerformanceReview Interface', () => {
    it('should have audit fields', () => {
      const performanceReview: PerformanceReview = {
        id: 1,
        reviewCycleId: 1,
        employeeId: 1,
        reviewerId: 2,
        reviewType: 'MANAGER' as any,
        status: 'SUBMITTED' as any,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-15T00:00:00Z',
        active: true,
        createdBy: 'hr_admin',
        updatedBy: 'manager2',
        version: 3
      };

      expect(performanceReview.active).toBe(true);
      expect(typeof performanceReview.active).toBe('boolean');
      expect(performanceReview.createdBy).toBe('hr_admin');
      expect(typeof performanceReview.createdBy).toBe('string');
      expect(performanceReview.updatedBy).toBe('manager2');
      expect(typeof performanceReview.updatedBy).toBe('string');
      expect(performanceReview.version).toBe(3);
      expect(typeof performanceReview.version).toBe('number');
    });

    it('should support audit fields as optional', () => {
      const performanceReview: PerformanceReview = {
        id: 1,
        reviewCycleId: 1,
        employeeId: 1,
        reviewerId: 2,
        reviewType: 'MANAGER' as any,
        status: 'SUBMITTED' as any,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-15T00:00:00Z'
      };

      expect(performanceReview.active).toBeUndefined();
      expect(performanceReview.createdBy).toBeUndefined();
      expect(performanceReview.updatedBy).toBeUndefined();
      expect(performanceReview.version).toBeUndefined();
    });
  });

  describe('BenefitPlan Interface', () => {
    it('should have audit fields', () => {
      const benefitPlan: BenefitPlan = {
        id: 1,
        organizationId: 1,
        name: 'Health Insurance Plan',
        planType: 'HEALTH_INSURANCE' as any,
        costFrequency: 'MONTHLY' as any,
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-15T00:00:00Z',
        active: true,
        createdBy: 'hr_admin',
        updatedBy: 'hr_admin',
        version: 1
      };

      expect(benefitPlan.active).toBe(true);
      expect(typeof benefitPlan.active).toBe('boolean');
      expect(benefitPlan.createdBy).toBe('hr_admin');
      expect(typeof benefitPlan.createdBy).toBe('string');
      expect(benefitPlan.updatedBy).toBe('hr_admin');
      expect(typeof benefitPlan.updatedBy).toBe('string');
      expect(benefitPlan.version).toBe(1);
      expect(typeof benefitPlan.version).toBe('number');
    });

    it('should support audit fields as optional', () => {
      const benefitPlan: BenefitPlan = {
        id: 1,
        organizationId: 1,
        name: 'Dental Plan',
        planType: 'DENTAL' as any,
        costFrequency: 'MONTHLY' as any,
        isActive: true,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-15T00:00:00Z'
      };

      expect(benefitPlan.active).toBeUndefined();
      expect(benefitPlan.createdBy).toBeUndefined();
      expect(benefitPlan.updatedBy).toBeUndefined();
      expect(benefitPlan.version).toBeUndefined();
    });
  });

  describe('Asset Interface', () => {
    it('should have updatedAt field', () => {
      const asset: Asset = {
        id: 1,
        organizationId: 1,
        assetType: 'LAPTOP' as any,
        status: 'AVAILABLE' as any,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-15T10:30:00Z'
      };

      expect(asset.updatedAt).toBe('2026-01-15T10:30:00Z');
      expect(typeof asset.updatedAt).toBe('string');
    });

    it('should support updatedAt as optional', () => {
      const asset: Asset = {
        id: 1,
        organizationId: 1,
        assetType: 'MOBILE' as any,
        status: 'ASSIGNED' as any,
        createdAt: '2026-01-01T00:00:00Z'
      };

      expect(asset.updatedAt).toBeUndefined();
    });

    it('should support all asset fields including updatedAt', () => {
      const asset: Asset = {
        id: 1,
        organizationId: 1,
        assetType: 'LAPTOP' as any,
        assetTag: 'LAP-001',
        serialNumber: 'SN123456',
        status: 'ASSIGNED' as any,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-15T10:30:00Z'
      };

      expect(asset.id).toBe(1);
      expect(asset.organizationId).toBe(1);
      expect(asset.assetType).toBe('LAPTOP');
      expect(asset.assetTag).toBe('LAP-001');
      expect(asset.serialNumber).toBe('SN123456');
      expect(asset.status).toBe('ASSIGNED');
      expect(asset.createdAt).toBe('2026-01-01T00:00:00Z');
      expect(asset.updatedAt).toBe('2026-01-15T10:30:00Z');
    });
  });
});
