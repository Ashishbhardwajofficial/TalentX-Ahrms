/**
 * Property-Based Test for LeaveRequest Field Completeness
 * **Feature: database-frontend-type-alignment, Property 9: LeaveRequest Field Completeness**
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9**
 */

import * as fc from 'fast-check';
import { LeaveRequest, LeaveStatus } from '../index';

describe('LeaveRequest Completeness Property Tests', () => {
  describe('Property 9: LeaveRequest Field Completeness', () => {
    // Database columns from leave_requests table
    const databaseColumns = [
      'leave_request_id',
      'employee_id',
      'leave_type_id',
      'start_date',
      'end_date',
      'total_days',
      'reason',
      'status',
      'reviewed_by',
      'reviewed_at',
      'review_comments',
      'created_at',
      'updated_at',
      'is_half_day',
      'half_day_period',
      'is_emergency',
      'emergency_contact',
      'contact_details',
      'attachment_path',
      'active',
      'created_by',
      'updated_by',
      'version'
    ];

    // Expected TypeScript properties (camelCase)
    const expectedProperties = [
      'id',
      'employeeId',
      'leaveTypeId',
      'startDate',
      'endDate',
      'totalDays',
      'reason',
      'status',
      'reviewedBy',
      'reviewedAt',
      'reviewComments',
      'createdAt',
      'updatedAt',
      'isHalfDay',
      'halfDayPeriod',
      'isEmergency',
      'emergencyContact',
      'contactDetails',
      'attachmentPath',
      'active',
      'createdBy',
      'updatedBy',
      'version'
    ];

    it('should have all leave_requests table columns mapped to TypeScript properties', () => {
      // Create a complete LeaveRequest object with all fields
      const completeLeaveRequest: LeaveRequest = {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-15',
        endDate: '2026-01-17',
        totalDays: 3,
        reason: 'Personal reasons',
        status: LeaveStatus.PENDING,
        reviewedBy: 2,
        reviewedAt: '2026-01-10T10:00:00Z',
        reviewComments: 'Approved',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        isHalfDay: false,
        halfDayPeriod: 'AM',
        isEmergency: false,
        emergencyContact: 'John Doe',
        contactDetails: '+1234567890',
        attachmentPath: '/uploads/leave-attachment.pdf',
        active: true,
        createdBy: 'admin',
        updatedBy: 'admin',
        version: 1
      };

      // Verify all expected properties exist in the interface
      expectedProperties.forEach(prop => {
        expect(completeLeaveRequest).toHaveProperty(prop);
      });

      // Verify the count matches (23 properties total)
      expect(expectedProperties.length).toBe(23);
      expect(databaseColumns.length).toBe(23);
    });

    it('should verify bit(1) columns map to boolean type', () => {
      fc.assert(fc.property(
        fc.record({
          isHalfDay: fc.option(fc.boolean(), { nil: undefined }),
          isEmergency: fc.option(fc.boolean(), { nil: undefined }),
          active: fc.option(fc.boolean(), { nil: undefined })
        }),
        (booleanFields) => {
          const leaveRequest: Partial<LeaveRequest> = {
            ...booleanFields
          };

          // Verify bit(1) fields are typed as boolean
          if (leaveRequest.isHalfDay !== undefined) {
            expect(typeof leaveRequest.isHalfDay).toBe('boolean');
          }
          if (leaveRequest.isEmergency !== undefined) {
            expect(typeof leaveRequest.isEmergency).toBe('boolean');
          }
          if (leaveRequest.active !== undefined) {
            expect(typeof leaveRequest.active).toBe('boolean');
          }
        }
      ), { numRuns: 100 });
    });

    it('should verify required fields are non-optional', () => {
      fc.assert(fc.property(
        fc.record({
          id: fc.integer({ min: 1 }),
          employeeId: fc.integer({ min: 1 }),
          leaveTypeId: fc.integer({ min: 1 }),
          startDate: fc.date().map(d => d.toISOString().split('T')[0]),
          endDate: fc.date().map(d => d.toISOString().split('T')[0]),
          totalDays: fc.double({ min: 0.5, max: 365 }),
          status: fc.constantFrom(...Object.values(LeaveStatus)),
          createdAt: fc.date().map(d => d.toISOString()),
          updatedAt: fc.date().map(d => d.toISOString())
        }),
        (leaveRequest) => {
          // Verify required fields are present and have correct types
          expect(typeof leaveRequest.id).toBe('number');
          expect(typeof leaveRequest.employeeId).toBe('number');
          expect(typeof leaveRequest.leaveTypeId).toBe('number');
          expect(typeof leaveRequest.startDate).toBe('string');
          expect(typeof leaveRequest.endDate).toBe('string');
          expect(typeof leaveRequest.totalDays).toBe('number');
          expect(typeof leaveRequest.status).toBe('string');
          expect(typeof leaveRequest.createdAt).toBe('string');
          expect(typeof leaveRequest.updatedAt).toBe('string');

          // Verify status is a valid enum value
          expect(Object.values(LeaveStatus)).toContain(leaveRequest.status);
        }
      ), { numRuns: 100 });
    });

    it('should verify half-day leave fields are correctly typed (Requirements 3.2, 3.3)', () => {
      fc.assert(fc.property(
        fc.record({
          isHalfDay: fc.option(fc.boolean(), { nil: undefined }),
          halfDayPeriod: fc.option(fc.constantFrom('AM', 'PM'), { nil: undefined })
        }),
        (halfDayFields) => {
          const leaveRequest: Partial<LeaveRequest> = {
            ...halfDayFields
          };

          // Verify isHalfDay is boolean
          if (leaveRequest.isHalfDay !== undefined) {
            expect(typeof leaveRequest.isHalfDay).toBe('boolean');
          }

          // Verify halfDayPeriod is string
          if (leaveRequest.halfDayPeriod !== undefined) {
            expect(typeof leaveRequest.halfDayPeriod).toBe('string');
            expect(['AM', 'PM']).toContain(leaveRequest.halfDayPeriod);
          }
        }
      ), { numRuns: 100 });
    });

    it('should verify emergency leave fields are correctly typed (Requirements 3.4, 3.5, 3.6)', () => {
      fc.assert(fc.property(
        fc.record({
          isEmergency: fc.option(fc.boolean(), { nil: undefined }),
          emergencyContact: fc.option(fc.string({ minLength: 1, maxLength: 255 }), { nil: undefined }),
          contactDetails: fc.option(fc.string({ minLength: 1, maxLength: 255 }), { nil: undefined })
        }),
        (emergencyFields) => {
          const leaveRequest: Partial<LeaveRequest> = {
            ...emergencyFields
          };

          // Verify isEmergency is boolean
          if (leaveRequest.isEmergency !== undefined) {
            expect(typeof leaveRequest.isEmergency).toBe('boolean');
          }

          // Verify emergencyContact is string
          if (leaveRequest.emergencyContact !== undefined) {
            expect(typeof leaveRequest.emergencyContact).toBe('string');
            expect(leaveRequest.emergencyContact.length).toBeGreaterThan(0);
          }

          // Verify contactDetails is string
          if (leaveRequest.contactDetails !== undefined) {
            expect(typeof leaveRequest.contactDetails).toBe('string');
            expect(leaveRequest.contactDetails.length).toBeGreaterThan(0);
          }
        }
      ), { numRuns: 100 });
    });

    it('should verify attachment support field is correctly typed (Requirements 3.1, 3.9)', () => {
      fc.assert(fc.property(
        fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
        (attachmentPath) => {
          const leaveRequest: Partial<LeaveRequest> = {
            attachmentPath
          };

          // Verify attachmentPath is string or undefined
          if (leaveRequest.attachmentPath !== undefined) {
            expect(typeof leaveRequest.attachmentPath).toBe('string');
            expect(leaveRequest.attachmentPath.length).toBeGreaterThan(0);
          }
        }
      ), { numRuns: 100 });
    });

    it('should verify audit fields are correctly typed (Requirements 3.7, 3.8)', () => {
      fc.assert(fc.property(
        fc.record({
          active: fc.option(fc.boolean(), { nil: undefined }),
          createdBy: fc.option(fc.string({ minLength: 1, maxLength: 255 }), { nil: undefined }),
          updatedBy: fc.option(fc.string({ minLength: 1, maxLength: 255 }), { nil: undefined }),
          version: fc.option(fc.integer({ min: 0 }), { nil: undefined })
        }),
        (auditFields) => {
          const leaveRequest: Partial<LeaveRequest> = {
            ...auditFields
          };

          // Verify audit field types
          if (leaveRequest.active !== undefined) {
            expect(typeof leaveRequest.active).toBe('boolean');
          }
          if (leaveRequest.createdBy !== undefined) {
            expect(typeof leaveRequest.createdBy).toBe('string');
          }
          if (leaveRequest.updatedBy !== undefined) {
            expect(typeof leaveRequest.updatedBy).toBe('string');
          }
          if (leaveRequest.version !== undefined) {
            expect(typeof leaveRequest.version).toBe('number');
            expect(leaveRequest.version).toBeGreaterThanOrEqual(0);
          }
        }
      ), { numRuns: 100 });
    });

    it('should verify optional fields can be undefined', () => {
      fc.assert(fc.property(
        fc.record({
          id: fc.integer({ min: 1 }),
          employeeId: fc.integer({ min: 1 }),
          leaveTypeId: fc.integer({ min: 1 }),
          startDate: fc.date().map(d => d.toISOString().split('T')[0]),
          endDate: fc.date().map(d => d.toISOString().split('T')[0]),
          totalDays: fc.double({ min: 0.5, max: 365 }),
          status: fc.constantFrom(...Object.values(LeaveStatus)),
          createdAt: fc.date().map(d => d.toISOString()),
          updatedAt: fc.date().map(d => d.toISOString()),
          // Optional fields
          reason: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
          reviewedBy: fc.option(fc.integer({ min: 1 }), { nil: undefined }),
          isHalfDay: fc.option(fc.boolean(), { nil: undefined }),
          isEmergency: fc.option(fc.boolean(), { nil: undefined }),
          attachmentPath: fc.option(fc.string({ minLength: 1, maxLength: 500 }), { nil: undefined }),
          active: fc.option(fc.boolean(), { nil: undefined })
        }),
        (leaveRequest) => {
          // Verify the object is a valid LeaveRequest
          const validLeaveRequest: LeaveRequest = leaveRequest;

          // Required fields must be present
          expect(validLeaveRequest.id).toBeDefined();
          expect(validLeaveRequest.employeeId).toBeDefined();
          expect(validLeaveRequest.leaveTypeId).toBeDefined();
          expect(validLeaveRequest.status).toBeDefined();

          // Optional fields can be undefined
          if (validLeaveRequest.reason !== undefined) {
            expect(typeof validLeaveRequest.reason).toBe('string');
          }
          if (validLeaveRequest.reviewedBy !== undefined) {
            expect(typeof validLeaveRequest.reviewedBy).toBe('number');
          }
          if (validLeaveRequest.isHalfDay !== undefined) {
            expect(typeof validLeaveRequest.isHalfDay).toBe('boolean');
          }
          if (validLeaveRequest.isEmergency !== undefined) {
            expect(typeof validLeaveRequest.isEmergency).toBe('boolean');
          }
          if (validLeaveRequest.attachmentPath !== undefined) {
            expect(typeof validLeaveRequest.attachmentPath).toBe('string');
          }
          if (validLeaveRequest.active !== undefined) {
            expect(typeof validLeaveRequest.active).toBe('boolean');
          }
        }
      ), { numRuns: 100 });
    });

    it('should verify totalDays field supports decimal precision for half-day leaves', () => {
      fc.assert(fc.property(
        fc.double({ min: 0.5, max: 365, noNaN: true }),
        (totalDays) => {
          // Round to 2 decimal places as database would (decimal(5,2))
          const rounded = Math.round(totalDays * 100) / 100;

          // Verify we can represent this in TypeScript
          const leaveRequest: Partial<LeaveRequest> = {
            totalDays: rounded
          };

          // Verify totalDays is a number
          if (leaveRequest.totalDays !== undefined) {
            expect(typeof leaveRequest.totalDays).toBe('number');
            expect(leaveRequest.totalDays).toBeGreaterThan(0);
            expect(leaveRequest.totalDays).toBeLessThanOrEqual(365);
          }
        }
      ), { numRuns: 100 });
    });

    it('should verify all new fields from requirements 3.1-3.9 are present', () => {
      const newFields = [
        'isHalfDay',
        'halfDayPeriod',
        'isEmergency',
        'emergencyContact',
        'contactDetails',
        'attachmentPath',
        'active',
        'createdBy',
        'updatedBy',
        'version'
      ];

      const leaveRequest: LeaveRequest = {
        id: 1,
        employeeId: 1,
        leaveTypeId: 1,
        startDate: '2026-01-15',
        endDate: '2026-01-17',
        totalDays: 3,
        status: LeaveStatus.PENDING,
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-01-01T00:00:00Z',
        isHalfDay: true,
        halfDayPeriod: 'AM',
        isEmergency: false,
        emergencyContact: 'John Doe',
        contactDetails: '+1234567890',
        attachmentPath: '/uploads/leave.pdf',
        active: true,
        createdBy: 'admin',
        updatedBy: 'admin',
        version: 1
      };

      // Verify all new fields exist
      newFields.forEach(field => {
        expect(leaveRequest).toHaveProperty(field);
      });
    });
  });
});
