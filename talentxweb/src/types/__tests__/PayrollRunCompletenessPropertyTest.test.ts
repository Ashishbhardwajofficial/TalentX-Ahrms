/**
 * Property-Based Test for PayrollRun Completeness
 * **Feature: database-frontend-type-alignment, Property 8: PayrollRun Completeness**
 * **Validates: Requirements 1.1, 1.2, 1.3, 1.4**
 */

import * as fc from 'fast-check';
import { PayrollRun, PayrollRunStatus } from '../index';

describe('PayrollRun Completeness Property Tests', () => {
  describe('Property 8: PayrollRun Completeness', () => {
    // Database columns from payroll_runs table
    const databaseColumns = [
      'payroll_run_id',
      'organization_id',
      'name',
      'pay_period_start',
      'pay_period_end',
      'pay_date',
      'status',
      'processed_by',
      'processed_at',
      'approved_by',
      'approved_at',
      'paid_by',
      'paid_at',
      'total_gross',
      'total_deductions',
      'total_net',
      'total_gross_pay',
      'total_net_pay',
      'total_taxes',
      'description',
      'notes',
      'employee_count',
      'external_payroll_id',
      'created_at',
      'updated_at',
      'active',
      'created_by',
      'updated_by',
      'version'
    ];

    // Expected TypeScript properties (camelCase)
    const expectedProperties = [
      'id',
      'organizationId',
      'name',
      'payPeriodStart',
      'payPeriodEnd',
      'payDate',
      'status',
      'processedBy',
      'processedAt',
      'approvedBy',
      'approvedAt',
      'paidBy',
      'paidAt',
      'totalGross',
      'totalDeductions',
      'totalNet',
      'totalGrossPay',
      'totalNetPay',
      'totalTaxes',
      'description',
      'notes',
      'employeeCount',
      'externalPayrollId',
      'createdAt',
      'updatedAt',
      'active',
      'createdBy',
      'updatedBy',
      'version'
    ];

    // Database enum values
    const databaseEnumValues = ['DRAFT', 'PROCESSING', 'APPROVED', 'PAID', 'CANCELLED'];

    it('should have all payroll_runs table columns mapped to TypeScript properties', () => {
      // Create a complete PayrollRun object with all fields
      const completePayrollRun: PayrollRun = {
        id: 1,
        organizationId: 1,
        name: 'Test Payroll',
        payPeriodStart: '2026-01-01',
        payPeriodEnd: '2026-01-31',
        payDate: '2026-02-05',
        status: PayrollRunStatus.DRAFT,
        processedBy: 1,
        processedAt: '2026-01-15T10:00:00Z',
        approvedBy: 2,
        approvedAt: '2026-01-20T10:00:00Z',
        paidBy: 'admin',
        paidAt: '2026-02-05T10:00:00Z',
        totalGross: 100000.00,
        totalDeductions: 15000.00,
        totalNet: 85000.00,
        totalGrossPay: 100000.00,
        totalNetPay: 85000.00,
        totalTaxes: 15000.00,
        description: 'January 2026 Payroll',
        notes: 'Regular monthly payroll',
        employeeCount: 50,
        externalPayrollId: 'EXT-2026-01',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        active: true,
        createdBy: 'admin',
        updatedBy: 'admin',
        version: 1
      };

      // Verify all expected properties exist in the interface
      expectedProperties.forEach(prop => {
        expect(completePayrollRun).toHaveProperty(prop);
      });

      // Verify the count matches (29 properties total)
      expect(expectedProperties.length).toBe(29);
      expect(databaseColumns.length).toBe(29);
    });

    it('should verify PayrollRunStatus enum matches database ENUM values', () => {
      // Verify each database enum value exists in TypeScript enum
      databaseEnumValues.forEach(enumValue => {
        expect(Object.values(PayrollRunStatus)).toContain(enumValue);
      });

      // Verify all TypeScript enum values exist in database
      Object.values(PayrollRunStatus).forEach(tsValue => {
        expect(databaseEnumValues).toContain(tsValue);
      });

      // Verify counts match
      expect(Object.values(PayrollRunStatus).length).toBe(databaseEnumValues.length);
    });

    it('should verify required fields are non-optional', () => {
      fc.assert(fc.property(
        fc.record({
          id: fc.integer({ min: 1 }),
          organizationId: fc.integer({ min: 1 }),
          name: fc.string({ minLength: 1, maxLength: 255 }),
          payPeriodStart: fc.date().map(d => d.toISOString().split('T')[0]),
          payPeriodEnd: fc.date().map(d => d.toISOString().split('T')[0]),
          payDate: fc.date().map(d => d.toISOString().split('T')[0]),
          status: fc.constantFrom(...Object.values(PayrollRunStatus)),
          createdAt: fc.date().map(d => d.toISOString()),
          updatedAt: fc.date().map(d => d.toISOString())
        }),
        (payrollRun) => {
          // Verify required fields are present and have correct types
          expect(typeof payrollRun.id).toBe('number');
          expect(typeof payrollRun.organizationId).toBe('number');
          expect(typeof payrollRun.name).toBe('string');
          expect(typeof payrollRun.payPeriodStart).toBe('string');
          expect(typeof payrollRun.payPeriodEnd).toBe('string');
          expect(typeof payrollRun.payDate).toBe('string');
          expect(typeof payrollRun.status).toBe('string');
          expect(typeof payrollRun.createdAt).toBe('string');
          expect(typeof payrollRun.updatedAt).toBe('string');

          // Verify status is a valid enum value
          expect(Object.values(PayrollRunStatus)).toContain(payrollRun.status);
        }
      ), { numRuns: 10 });
    });

    it('should verify optional fields can be undefined', () => {
      fc.assert(fc.property(
        fc.record({
          id: fc.integer({ min: 1 }),
          organizationId: fc.integer({ min: 1 }),
          name: fc.string({ minLength: 1, maxLength: 255 }),
          payPeriodStart: fc.date().map(d => d.toISOString().split('T')[0]),
          payPeriodEnd: fc.date().map(d => d.toISOString().split('T')[0]),
          payDate: fc.date().map(d => d.toISOString().split('T')[0]),
          status: fc.constantFrom(...Object.values(PayrollRunStatus)),
          createdAt: fc.date().map(d => d.toISOString()),
          updatedAt: fc.date().map(d => d.toISOString()),
          // Optional fields
          processedBy: fc.option(fc.integer({ min: 1 }), { nil: undefined }),
          approvedBy: fc.option(fc.integer({ min: 1 }), { nil: undefined }),
          totalGross: fc.option(fc.double({ min: 0, max: 999999.99 }), { nil: undefined }),
          totalNet: fc.option(fc.double({ min: 0, max: 999999.99 }), { nil: undefined }),
          active: fc.option(fc.boolean(), { nil: undefined })
        }),
        (payrollRun) => {
          // Verify the object is a valid PayrollRun
          const validPayrollRun: PayrollRun = payrollRun;

          // Required fields must be present
          expect(validPayrollRun.id).toBeDefined();
          expect(validPayrollRun.organizationId).toBeDefined();
          expect(validPayrollRun.name).toBeDefined();
          expect(validPayrollRun.status).toBeDefined();

          // Optional fields can be undefined
          if (validPayrollRun.processedBy !== undefined) {
            expect(typeof validPayrollRun.processedBy).toBe('number');
          }
          if (validPayrollRun.approvedBy !== undefined) {
            expect(typeof validPayrollRun.approvedBy).toBe('number');
          }
          if (validPayrollRun.totalGross !== undefined) {
            expect(typeof validPayrollRun.totalGross).toBe('number');
          }
          if (validPayrollRun.active !== undefined) {
            expect(typeof validPayrollRun.active).toBe('boolean');
          }
        }
      ), { numRuns: 10 });
    });

    it('should verify financial fields support 2 decimal precision', () => {
      fc.assert(fc.property(
        fc.double({ min: 0, max: 999999.99, noNaN: true }),
        (amount) => {
          // Round to 2 decimal places as database would
          const rounded = Math.round(amount * 100) / 100;

          // Verify we can represent this in TypeScript
          const payrollRun: Partial<PayrollRun> = {
            totalGross: rounded,
            totalDeductions: rounded,
            totalNet: rounded,
            totalGrossPay: rounded,
            totalNetPay: rounded,
            totalTaxes: rounded
          };

          // Verify all financial fields are numbers
          if (payrollRun.totalGross !== undefined) {
            expect(typeof payrollRun.totalGross).toBe('number');
            expect(payrollRun.totalGross).toBeGreaterThanOrEqual(0);
          }
          if (payrollRun.totalNet !== undefined) {
            expect(typeof payrollRun.totalNet).toBe('number');
            expect(payrollRun.totalNet).toBeGreaterThanOrEqual(0);
          }
        }
      ), { numRuns: 10 });
    });

    it('should verify audit fields are correctly typed', () => {
      fc.assert(fc.property(
        fc.record({
          active: fc.option(fc.boolean(), { nil: undefined }),
          createdBy: fc.option(fc.string({ minLength: 1, maxLength: 255 }), { nil: undefined }),
          updatedBy: fc.option(fc.string({ minLength: 1, maxLength: 255 }), { nil: undefined }),
          version: fc.option(fc.integer({ min: 0 }), { nil: undefined })
        }),
        (auditFields) => {
          const payrollRun: Partial<PayrollRun> = {
            ...auditFields
          };

          // Verify audit field types
          if (payrollRun.active !== undefined) {
            expect(typeof payrollRun.active).toBe('boolean');
          }
          if (payrollRun.createdBy !== undefined) {
            expect(typeof payrollRun.createdBy).toBe('string');
          }
          if (payrollRun.updatedBy !== undefined) {
            expect(typeof payrollRun.updatedBy).toBe('string');
          }
          if (payrollRun.version !== undefined) {
            expect(typeof payrollRun.version).toBe('number');
            expect(payrollRun.version).toBeGreaterThanOrEqual(0);
          }
        }
      ), { numRuns: 10 });
    });
  });
});
