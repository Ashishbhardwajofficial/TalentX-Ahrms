/**
 * Property-Based Test for Enum Value Alignment
 * **Feature: database-frontend-type-alignment, Property 2: Enum Value Alignment**
 * **Validates: Requirements 2.1, 2.2, 2.3, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11**
 */

import * as fc from 'fast-check';
import {
  EmploymentStatus,
  Gender,
  MaritalStatus,
  EmploymentType,
  PayFrequency,
  AttendanceStatus,
  LeaveStatus,
  AssetType,
  AssetStatus,
  BenefitPlanType,
  CostFrequency
} from '../index';

describe('Enum Alignment Property Tests', () => {
  describe('Property 2: Enum Value Alignment', () => {
    // Database ENUM definitions (from MySQL schema)
    const databaseEnums = {
      EmploymentStatus: ['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE', 'SUSPENDED'],
      Gender: ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY', 'OTHER'],
      MaritalStatus: ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED'],
      EmploymentType: ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY'],
      PayFrequency: ['HOURLY', 'DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'ANNUALLY'],
      AttendanceStatus: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEKEND'],
      LeaveStatus: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'],
      AssetType: ['LAPTOP', 'ID_CARD', 'MOBILE', 'OTHER'],
      AssetStatus: ['AVAILABLE', 'ASSIGNED', 'DAMAGED', 'RETIRED'],
      BenefitPlanType: ['HEALTH_INSURANCE', 'DENTAL', 'VISION', 'LIFE_INSURANCE', 'RETIREMENT', 'STOCK_OPTIONS', 'OTHER'],
      CostFrequency: ['MONTHLY', 'ANNUALLY', 'PER_PAY_PERIOD']
    };

    // TypeScript enums
    const typeScriptEnums = {
      EmploymentStatus,
      Gender,
      MaritalStatus,
      EmploymentType,
      PayFrequency,
      AttendanceStatus,
      LeaveStatus,
      AssetType,
      AssetStatus,
      BenefitPlanType,
      CostFrequency
    };

    describe('EmploymentStatus Enum (Requirements 2.1, 2.2, 2.3)', () => {
      it('should include SUSPENDED value', () => {
        expect(Object.values(EmploymentStatus)).toContain('SUSPENDED');
      });

      it('should contain exactly: ACTIVE, INACTIVE, TERMINATED, ON_LEAVE, SUSPENDED', () => {
        const expectedValues = ['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE', 'SUSPENDED'];
        const actualValues = Object.values(EmploymentStatus);

        expect(actualValues.sort()).toEqual(expectedValues.sort());
        expect(actualValues.length).toBe(5);
      });

      it('should match database ENUM values exactly', () => {
        const dbValues = databaseEnums.EmploymentStatus;
        const tsValues = Object.values(EmploymentStatus);

        // Every DB value must exist in TS
        dbValues.forEach(dbValue => {
          expect(tsValues).toContain(dbValue);
        });

        // Every TS value must exist in DB
        tsValues.forEach(tsValue => {
          expect(dbValues).toContain(tsValue);
        });

        // Counts must match
        expect(tsValues.length).toBe(dbValues.length);
      });
    });

    describe('All Enums Alignment (Requirements 7.1-7.11)', () => {
      it('should verify all TypeScript enums match database ENUM types exactly', () => {
        Object.keys(databaseEnums).forEach(enumName => {
          const dbValues = databaseEnums[enumName as keyof typeof databaseEnums];
          const tsEnum = typeScriptEnums[enumName as keyof typeof typeScriptEnums];
          const tsValues = Object.values(tsEnum);

          // Every DB value must exist in TS
          dbValues.forEach(dbValue => {
            expect(tsValues).toContain(dbValue);
          });

          // Every TS value must exist in DB
          tsValues.forEach(tsValue => {
            expect(dbValues).toContain(tsValue);
          });

          // Counts must match
          expect(tsValues.length).toBe(dbValues.length);
        });
      });

      it('should verify Gender enum matches database (Requirement 7.2)', () => {
        const expected = ['MALE', 'FEMALE', 'NON_BINARY', 'PREFER_NOT_TO_SAY', 'OTHER'];
        const actual = Object.values(Gender);

        expect(actual.sort()).toEqual(expected.sort());
      });

      it('should verify MaritalStatus enum matches database (Requirement 7.3)', () => {
        const expected = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED', 'SEPARATED'];
        const actual = Object.values(MaritalStatus);

        expect(actual.sort()).toEqual(expected.sort());
      });

      it('should verify EmploymentType enum matches database (Requirement 7.4)', () => {
        const expected = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'TEMPORARY'];
        const actual = Object.values(EmploymentType);

        expect(actual.sort()).toEqual(expected.sort());
      });

      it('should verify PayFrequency enum matches database (Requirement 7.5)', () => {
        const expected = ['HOURLY', 'DAILY', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY', 'ANNUALLY'];
        const actual = Object.values(PayFrequency);

        expect(actual.sort()).toEqual(expected.sort());
      });

      it('should verify AttendanceStatus enum matches database (Requirement 7.6)', () => {
        const expected = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEKEND'];
        const actual = Object.values(AttendanceStatus);

        expect(actual.sort()).toEqual(expected.sort());
      });

      it('should verify LeaveStatus enum matches database (Requirement 7.7)', () => {
        const expected = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
        const actual = Object.values(LeaveStatus);

        expect(actual.sort()).toEqual(expected.sort());
      });

      it('should verify AssetType enum matches database (Requirement 7.8)', () => {
        const expected = ['LAPTOP', 'ID_CARD', 'MOBILE', 'OTHER'];
        const actual = Object.values(AssetType);

        expect(actual.sort()).toEqual(expected.sort());
      });

      it('should verify AssetStatus enum matches database (Requirement 7.9)', () => {
        const expected = ['AVAILABLE', 'ASSIGNED', 'DAMAGED', 'RETIRED'];
        const actual = Object.values(AssetStatus);

        expect(actual.sort()).toEqual(expected.sort());
      });

      it('should verify BenefitPlanType enum matches database (Requirement 7.10)', () => {
        const expected = ['HEALTH_INSURANCE', 'DENTAL', 'VISION', 'LIFE_INSURANCE', 'RETIREMENT', 'STOCK_OPTIONS', 'OTHER'];
        const actual = Object.values(BenefitPlanType);

        expect(actual.sort()).toEqual(expected.sort());
      });

      it('should verify CostFrequency enum matches database (Requirement 7.11)', () => {
        const expected = ['MONTHLY', 'ANNUALLY', 'PER_PAY_PERIOD'];
        const actual = Object.values(CostFrequency);

        expect(actual.sort()).toEqual(expected.sort());
      });
    });

    describe('Property-Based Tests for Enum Alignment', () => {
      it('should verify that for any enum, all database values exist in TypeScript', () => {
        fc.assert(fc.property(
          fc.constantFrom(...Object.keys(databaseEnums)),
          (enumName) => {
            const dbValues = databaseEnums[enumName as keyof typeof databaseEnums];
            const tsEnum = typeScriptEnums[enumName as keyof typeof typeScriptEnums];
            const tsValues = Object.values(tsEnum);

            // For every database value, it must exist in TypeScript
            return dbValues.every(dbValue => tsValues.includes(dbValue));
          }
        ), { numRuns: 100 });
      });

      it('should verify that for any enum, all TypeScript values exist in database', () => {
        fc.assert(fc.property(
          fc.constantFrom(...Object.keys(databaseEnums)),
          (enumName) => {
            const dbValues = databaseEnums[enumName as keyof typeof databaseEnums];
            const tsEnum = typeScriptEnums[enumName as keyof typeof typeScriptEnums];
            const tsValues = Object.values(tsEnum);

            // For every TypeScript value, it must exist in database
            return tsValues.every(tsValue => dbValues.includes(tsValue as string));
          }
        ), { numRuns: 100 });
      });

      it('should verify that for any enum, the count of values matches', () => {
        fc.assert(fc.property(
          fc.constantFrom(...Object.keys(databaseEnums)),
          (enumName) => {
            const dbValues = databaseEnums[enumName as keyof typeof databaseEnums];
            const tsEnum = typeScriptEnums[enumName as keyof typeof typeScriptEnums];
            const tsValues = Object.values(tsEnum);

            // Counts must match exactly
            return tsValues.length === dbValues.length;
          }
        ), { numRuns: 100 });
      });

      it('should verify enum values are strings', () => {
        fc.assert(fc.property(
          fc.constantFrom(...Object.keys(typeScriptEnums)),
          (enumName) => {
            const tsEnum = typeScriptEnums[enumName as keyof typeof typeScriptEnums];
            const tsValues = Object.values(tsEnum);

            // All enum values must be strings
            return tsValues.every(value => typeof value === 'string');
          }
        ), { numRuns: 100 });
      });

      it('should verify enum values are uppercase with underscores', () => {
        fc.assert(fc.property(
          fc.constantFrom(...Object.keys(typeScriptEnums)),
          (enumName) => {
            const tsEnum = typeScriptEnums[enumName as keyof typeof typeScriptEnums];
            const tsValues = Object.values(tsEnum);

            // All enum values should match the pattern: UPPERCASE_WITH_UNDERSCORES
            const pattern = /^[A-Z0-9_]+$/;
            return tsValues.every(value => pattern.test(value as string));
          }
        ), { numRuns: 100 });
      });
    });
  });
});
