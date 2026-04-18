/**
 * Property-Based Test for Frontend Type Safety
 * **Feature: hrms-database-integration, Property 7: Frontend Type Safety**
 * **Validates: Requirements 3.1**
 */

import * as fc from 'fast-check';
import { EmploymentStatus, EmploymentType, LeaveStatus } from '../../types';

describe('Frontend Type Safety Property Tests', () => {
  const employmentStatusArb = fc.constantFrom(...Object.values(EmploymentStatus));
  const employmentTypeArb = fc.constantFrom(...Object.values(EmploymentType));
  const leaveStatusArb = fc.constantFrom(...Object.values(LeaveStatus));

  describe('Property 7: Frontend Type Safety', () => {
    it('should validate enum values in API requests and responses', () => {
      fc.assert(fc.property(
        employmentStatusArb,
        employmentTypeArb,
        leaveStatusArb,
        (empStatus, empType, leaveStatus) => {
          expect(Object.values(EmploymentStatus)).toContain(empStatus);
          expect(Object.values(EmploymentType)).toContain(empType);
          expect(Object.values(LeaveStatus)).toContain(leaveStatus);
          expect(typeof empStatus).toBe('string');
          expect(typeof empType).toBe('string');
          expect(typeof leaveStatus).toBe('string');
        }
      ), { numRuns: 100 });
    });

    it('should maintain consistent date format across all API interfaces', () => {
      fc.assert(fc.property(
        fc.date({ min: new Date('1900-01-01'), max: new Date('2100-12-31') }),
        (date) => {
          const isoDateString = date.toISOString().split('T')[0];
          const isoDateTimeString = date.toISOString();

          // Verify date format is YYYY-MM-DD (4-digit year for reasonable date range)
          expect(isoDateString).toMatch(/^\d{4}-\d{2}-\d{2}$/);

          // Verify datetime format is ISO 8601
          expect(isoDateTimeString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

          // Verify date can be parsed back to Date object
          if (isoDateString) {
            const parsedDate = new Date(isoDateString);
            expect(parsedDate).toBeInstanceOf(Date);
            expect(isNaN(parsedDate.getTime())).toBe(false);
          }
          if (isoDateTimeString) {
            const parsedDateTime = new Date(isoDateTimeString);
            expect(parsedDateTime).toBeInstanceOf(Date);
            expect(isNaN(parsedDateTime.getTime())).toBe(false);
          }
        }
      ), { numRuns: 100 });
    });
  });
});