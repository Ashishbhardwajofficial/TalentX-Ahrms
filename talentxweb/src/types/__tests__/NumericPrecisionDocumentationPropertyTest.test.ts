/**
 * Property-Based Test for Numeric Precision Documentation
 * **Feature: database-frontend-type-alignment, Property 10: Numeric Precision Documentation**
 * **Validates: Requirements 12.1, 12.2, 12.3, 12.4, 12.5**
 */

import * as fc from 'fast-check';
import * as fs from 'fs';
import * as path from 'path';

describe('Numeric Precision Documentation Property Tests', () => {
  describe('Property 10: Numeric Precision Documentation', () => {
    // Read the types file to check JSDoc comments
    const typesFilePath = path.join(__dirname, '../index.ts');
    let typesFileContent: string;

    beforeAll(() => {
      typesFileContent = fs.readFileSync(typesFilePath, 'utf-8');
    });

    // Fields that should have @precision documentation with their expected precision
    const fieldsWithPrecision = [
      // Employee financial fields - decimal(15,2)
      { interface: 'Employee', field: 'salaryAmount', precision: '2 decimal places', dbType: 'decimal(15,2)' },

      // PayrollRun financial fields - decimal(15,2)
      { interface: 'PayrollRun', field: 'totalGross', precision: '2 decimal places', dbType: 'decimal(15,2)' },
      { interface: 'PayrollRun', field: 'totalDeductions', precision: '2 decimal places', dbType: 'decimal(15,2)' },
      { interface: 'PayrollRun', field: 'totalNet', precision: '2 decimal places', dbType: 'decimal(15,2)' },
      { interface: 'PayrollRun', field: 'totalGrossPay', precision: '2 decimal places', dbType: 'decimal(15,2)' },
      { interface: 'PayrollRun', field: 'totalNetPay', precision: '2 decimal places', dbType: 'decimal(15,2)' },
      { interface: 'PayrollRun', field: 'totalTaxes', precision: '2 decimal places', dbType: 'decimal(15,2)' },

      // BenefitPlan cost fields - decimal(10,2)
      { interface: 'BenefitPlan', field: 'employeeCost', precision: '2 decimal places', dbType: 'decimal(10,2)' },
      { interface: 'BenefitPlan', field: 'employerCost', precision: '2 decimal places', dbType: 'decimal(10,2)' },

      // Expense amount field - decimal(15,2)
      { interface: 'Expense', field: 'amount', precision: '2 decimal places', dbType: 'decimal(15,2)' },

      // Attendance time fields - decimal(5,2)
      { interface: 'AttendanceRecord', field: 'totalHours', precision: '2 decimal places', dbType: 'decimal(5,2)' },
      { interface: 'AttendanceRecord', field: 'overtimeHours', precision: '2 decimal places', dbType: 'decimal(5,2)' },
      { interface: 'AttendanceRecord', field: 'breakHours', precision: '2 decimal places', dbType: 'decimal(5,2)' },

      // LeaveRequest totalDays field - decimal(5,2)
      { interface: 'LeaveRequest', field: 'totalDays', precision: '2 decimal places', dbType: 'decimal(5,2)' },

      // PerformanceReview rating field - decimal(3,2)
      { interface: 'PerformanceReview', field: 'overallRating', precision: '2 decimal places', dbType: 'decimal(3,2)' }
    ];

    it('should have @precision JSDoc comments for all decimal database columns', () => {
      fieldsWithPrecision.forEach(({ interface: interfaceName, field, precision, dbType }) => {
        // Find the interface definition
        const interfaceRegex = new RegExp(`export interface ${interfaceName}\\s*{[\\s\\S]*?}`, 'g');
        const interfaceMatch = typesFileContent.match(interfaceRegex);

        expect(interfaceMatch).toBeTruthy();
        expect(interfaceMatch!.length).toBeGreaterThan(0);

        const interfaceContent = interfaceMatch![0];

        // Check if the field has @precision documentation
        const precisionRegex = new RegExp(`@precision\\s+${precision}[\\s\\S]*?${field}\\??:\\s*number`, 'i');
        const hasPrecisionDoc = precisionRegex.test(interfaceContent);

        expect(hasPrecisionDoc).toBe(true);
      });
    });

    it('should document database type mapping for precision fields', () => {
      fieldsWithPrecision.forEach(({ interface: interfaceName, field, dbType }) => {
        // Find the interface definition
        const interfaceRegex = new RegExp(`export interface ${interfaceName}\\s*{[\\s\\S]*?}`, 'g');
        const interfaceMatch = typesFileContent.match(interfaceRegex);

        expect(interfaceMatch).toBeTruthy();

        const interfaceContent = interfaceMatch![0];

        // Check if the field has @database documentation with the correct type
        const databaseRegex = new RegExp(`@database[\\s\\S]*?${dbType.replace(/[()]/g, '\\$&')}[\\s\\S]*?${field}\\??:\\s*number`, 'i');
        const hasDatabaseDoc = databaseRegex.test(interfaceContent);

        expect(hasDatabaseDoc).toBe(true);
      });
    });

    it('should verify precision values match database definitions', () => {
      fc.assert(fc.property(
        fc.constantFrom(...fieldsWithPrecision),
        (fieldInfo) => {
          const { interface: interfaceName, field, precision, dbType } = fieldInfo;

          // Extract precision from dbType (e.g., "decimal(15,2)" -> 2)
          const precisionMatch = dbType.match(/decimal\(\d+,(\d+)\)/);
          expect(precisionMatch).toBeTruthy();

          if (precisionMatch) {
            const expectedPrecision = parseInt(precisionMatch[1], 10);

            // Verify the precision in the comment matches the database precision
            expect(precision).toContain(`${expectedPrecision} decimal places`);
          }
        }
      ), { numRuns: 100 });
    });

    it('should verify all documented precision fields are number type', () => {
      fc.assert(fc.property(
        fc.constantFrom(...fieldsWithPrecision),
        (fieldInfo) => {
          const { interface: interfaceName, field } = fieldInfo;

          // Find the interface definition
          const interfaceRegex = new RegExp(`export interface ${interfaceName}\\s*{[\\s\\S]*?}`, 'g');
          const interfaceMatch = typesFileContent.match(interfaceRegex);

          expect(interfaceMatch).toBeTruthy();

          const interfaceContent = interfaceMatch![0];

          // Verify the field is typed as number (or number | undefined)
          const fieldTypeRegex = new RegExp(`${field}\\??:\\s*number`, 'i');
          const hasNumberType = fieldTypeRegex.test(interfaceContent);

          expect(hasNumberType).toBe(true);
        }
      ), { numRuns: 100 });
    });

    it('should verify precision documentation format is consistent', () => {
      fieldsWithPrecision.forEach(({ interface: interfaceName, field }) => {
        // Find the interface definition
        const interfaceRegex = new RegExp(`export interface ${interfaceName}\\s*{[\\s\\S]*?}`, 'g');
        const interfaceMatch = typesFileContent.match(interfaceRegex);

        expect(interfaceMatch).toBeTruthy();

        const interfaceContent = interfaceMatch![0];

        // Check for consistent format: @precision X decimal places (matches database decimal(Y,X))
        const formatRegex = new RegExp(
          `@precision\\s+\\d+\\s+decimal\\s+places\\s+\\(matches\\s+database\\s+decimal\\(\\d+,\\d+\\)\\)`,
          'i'
        );

        // Extract the JSDoc comment for this field
        const fieldCommentRegex = new RegExp(`/\\*\\*[\\s\\S]*?@precision[\\s\\S]*?\\*/[\\s\\S]*?${field}\\??:\\s*number`, 'i');
        const fieldCommentMatch = interfaceContent.match(fieldCommentRegex);

        if (fieldCommentMatch) {
          const hasConsistentFormat = formatRegex.test(fieldCommentMatch[0]);
          expect(hasConsistentFormat).toBe(true);
        }
      });
    });

    it('should verify Employee.salaryAmount has correct precision documentation', () => {
      const employeeRegex = /export interface Employee\s*{[\s\S]*?}/g;
      const employeeMatch = typesFileContent.match(employeeRegex);

      expect(employeeMatch).toBeTruthy();

      const employeeContent = employeeMatch![0];

      // Check for salaryAmount with @precision and decimal(15,2)
      expect(employeeContent).toMatch(/@precision\s+2\s+decimal\s+places/i);
      expect(employeeContent).toMatch(/decimal\(15,2\)/i);
      expect(employeeContent).toMatch(/salaryAmount\?:\s*number/);
    });

    it('should verify BenefitPlan cost fields have correct precision documentation', () => {
      const benefitPlanRegex = /export interface BenefitPlan\s*{[\s\S]*?}/g;
      const benefitPlanMatch = typesFileContent.match(benefitPlanRegex);

      expect(benefitPlanMatch).toBeTruthy();

      const benefitPlanContent = benefitPlanMatch![0];

      // Check for employeeCost with @precision and decimal(10,2)
      const employeeCostRegex = /@precision\s+2\s+decimal\s+places[\s\S]*?decimal\(10,2\)[\s\S]*?employeeCost\?:\s*number/i;
      expect(benefitPlanContent).toMatch(employeeCostRegex);

      // Check for employerCost with @precision and decimal(10,2)
      const employerCostRegex = /@precision\s+2\s+decimal\s+places[\s\S]*?decimal\(10,2\)[\s\S]*?employerCost\?:\s*number/i;
      expect(benefitPlanContent).toMatch(employerCostRegex);
    });

    it('should verify AttendanceRecord time fields have correct precision documentation', () => {
      const attendanceRegex = /export interface AttendanceRecord\s*{[\s\S]*?}/g;
      const attendanceMatch = typesFileContent.match(attendanceRegex);

      expect(attendanceMatch).toBeTruthy();

      const attendanceContent = attendanceMatch![0];

      // Check for totalHours, overtimeHours, breakHours with @precision and decimal(5,2)
      const timeFields = ['totalHours', 'overtimeHours', 'breakHours'];
      timeFields.forEach(field => {
        const fieldRegex = new RegExp(`@precision\\s+2\\s+decimal\\s+places[\\s\\S]*?decimal\\(5,2\\)[\\s\\S]*?${field}\\?:\\s*number`, 'i');
        expect(attendanceContent).toMatch(fieldRegex);
      });
    });

    it('should verify LeaveRequest.totalDays has correct precision documentation', () => {
      const leaveRequestRegex = /export interface LeaveRequest\s*{[\s\S]*?}/g;
      const leaveRequestMatch = typesFileContent.match(leaveRequestRegex);

      expect(leaveRequestMatch).toBeTruthy();

      const leaveRequestContent = leaveRequestMatch![0];

      // Check for totalDays with @precision and decimal(5,2)
      const totalDaysRegex = /@precision\s+2\s+decimal\s+places[\s\S]*?decimal\(5,2\)[\s\S]*?totalDays:\s*number/i;
      expect(leaveRequestContent).toMatch(totalDaysRegex);
    });

    it('should verify PerformanceReview.overallRating has correct precision documentation', () => {
      const performanceReviewRegex = /export interface PerformanceReview\s*{[\s\S]*?}/g;
      const performanceReviewMatch = typesFileContent.match(performanceReviewRegex);

      expect(performanceReviewMatch).toBeTruthy();

      const performanceReviewContent = performanceReviewMatch![0];

      // Check for overallRating with @precision and decimal(3,2)
      const overallRatingRegex = /@precision\s+2\s+decimal\s+places[\s\S]*?decimal\(3,2\)[\s\S]*?overallRating\?:\s*number/i;
      expect(performanceReviewContent).toMatch(overallRatingRegex);
    });
  });
});
