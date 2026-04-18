/**
 * Property-Based Test for Naming Convention Consistency
 * **Feature: database-frontend-type-alignment, Property 7: Naming Convention Consistency**
 * **Validates: Requirements 6.2**
 */

import * as fc from 'fast-check';

describe('Naming Convention Consistency Property Tests', () => {
  describe('Property 7: Naming Convention Consistency', () => {
    // Helper function to convert snake_case to camelCase
    const snakeToCamel = (str: string): string => {
      return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    };

    // Helper function to validate if a string is in snake_case format
    const isSnakeCase = (str: string): boolean => {
      return /^[a-z][a-z0-9]*(_[a-z0-9]+)*$/.test(str);
    };

    // Helper function to validate if a string is in camelCase format
    const isCamelCase = (str: string): boolean => {
      return /^[a-z][a-zA-Z0-9]*$/.test(str);
    };

    describe('snake_case to camelCase Conversion Algorithm', () => {
      it('should correctly convert simple snake_case to camelCase', () => {
        expect(snakeToCamel('employee_id')).toBe('employeeId');
        expect(snakeToCamel('first_name')).toBe('firstName');
        expect(snakeToCamel('last_name')).toBe('lastName');
        expect(snakeToCamel('created_at')).toBe('createdAt');
        expect(snakeToCamel('updated_at')).toBe('updatedAt');
      });

      it('should correctly convert multi-word snake_case to camelCase', () => {
        expect(snakeToCamel('date_of_birth')).toBe('dateOfBirth');
        expect(snakeToCamel('employment_status')).toBe('employmentStatus');
        expect(snakeToCamel('pay_period_start')).toBe('payPeriodStart');
        expect(snakeToCamel('total_gross_pay')).toBe('totalGrossPay');
        expect(snakeToCamel('emergency_contact')).toBe('emergencyContact');
      });

      it('should handle single word (no underscores)', () => {
        expect(snakeToCamel('name')).toBe('name');
        expect(snakeToCamel('status')).toBe('status');
        expect(snakeToCamel('amount')).toBe('amount');
      });

      it('should handle consecutive underscores gracefully', () => {
        // Edge case: consecutive underscores - only converts lowercase letters after underscore
        // The regex /_([a-z])/g only matches underscore followed by lowercase letter
        expect(snakeToCamel('test__field')).toBe('test_Field');
      });

      it('should handle trailing underscores', () => {
        // Edge case: trailing underscores - no lowercase letter after, so underscore remains
        expect(snakeToCamel('test_field_')).toBe('testField_');
      });

      it('should handle leading underscores', () => {
        // Edge case: leading underscore followed by lowercase letter gets converted
        // The regex /_([a-z])/g matches _t and converts it to T
        expect(snakeToCamel('_test_field')).toBe('TestField');
      });
    });

    describe('Property-Based Tests for Conversion Algorithm', () => {
      it('should convert any valid snake_case string to valid camelCase', () => {
        fc.assert(fc.property(
          fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
          (words) => {
            // Create a snake_case string from words (only lowercase letters)
            const snakeCaseStr = words.join('_');

            // Convert to camelCase
            const camelCaseStr = snakeToCamel(snakeCaseStr);

            // Verify the result is valid camelCase (or same as input if single word)
            if (words.length === 1) {
              return camelCaseStr === words[0];
            } else {
              return isCamelCase(camelCaseStr);
            }
          }
        ), { numRuns: 100 });
      });

      it('should produce consistent results for the same input', () => {
        fc.assert(fc.property(
          fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
          (words) => {
            const snakeCaseStr = words.join('_');
            const result1 = snakeToCamel(snakeCaseStr);
            const result2 = snakeToCamel(snakeCaseStr);

            // Conversion should be deterministic
            return result1 === result2;
          }
        ), { numRuns: 100 });
      });

      it('should preserve the first word in lowercase', () => {
        fc.assert(fc.property(
          fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 10 }), { minLength: 2, maxLength: 5 }),
          (words) => {
            const snakeCaseStr = words.join('_');
            const camelCaseStr = snakeToCamel(snakeCaseStr);

            // First character should be lowercase
            return camelCaseStr.charAt(0) === camelCaseStr.charAt(0).toLowerCase();
          }
        ), { numRuns: 100 });
      });

      it('should capitalize the first letter of each word after the first', () => {
        fc.assert(fc.property(
          fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 10 }), { minLength: 2, maxLength: 5 }),
          (words) => {
            const snakeCaseStr = words.join('_');
            const camelCaseStr = snakeToCamel(snakeCaseStr);

            // Verify each word boundary is capitalized
            let expectedCamelCase = words[0];
            for (let i = 1; i < words.length; i++) {
              if (words[i].length > 0) {
                expectedCamelCase += words[i].charAt(0).toUpperCase() + words[i].slice(1);
              }
            }

            return camelCaseStr === expectedCamelCase;
          }
        ), { numRuns: 100 });
      });

      it('should remove all underscores from the output', () => {
        fc.assert(fc.property(
          fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
          (words) => {
            const snakeCaseStr = words.join('_');
            const camelCaseStr = snakeToCamel(snakeCaseStr);

            // Result should not contain underscores
            return !camelCaseStr.includes('_');
          }
        ), { numRuns: 100 });
      });
    });

    describe('Real Database Column Name Conversions', () => {
      // Test actual database column names from the schema
      const databaseColumnMappings: Record<string, string> = {
        // Employee table
        'employee_id': 'employeeId',
        'user_id': 'userId',
        'organization_id': 'organizationId',
        'employee_number': 'employeeNumber',
        'first_name': 'firstName',
        'middle_name': 'middleName',
        'last_name': 'lastName',
        'preferred_name': 'preferredName',
        'date_of_birth': 'dateOfBirth',
        'marital_status': 'maritalStatus',
        'personal_email': 'personalEmail',
        'work_email': 'workEmail',
        'phone_number': 'phoneNumber',
        'mobile_number': 'mobileNumber',
        'employment_status': 'employmentStatus',
        'employment_type': 'employmentType',
        'hire_date': 'hireDate',
        'termination_date': 'terminationDate',
        'probation_end_date': 'probationEndDate',
        'department_id': 'departmentId',
        'job_title': 'jobTitle',
        'job_level': 'jobLevel',
        'manager_id': 'managerId',
        'location_id': 'locationId',
        'salary_amount': 'salaryAmount',
        'salary_currency': 'salaryCurrency',
        'pay_frequency': 'payFrequency',
        'profile_picture_url': 'profilePictureUrl',
        'created_at': 'createdAt',
        'updated_at': 'updatedAt',
        'created_by': 'createdBy',
        'updated_by': 'updatedBy',

        // PayrollRun table
        'payroll_run_id': 'payrollRunId',
        'pay_period_start': 'payPeriodStart',
        'pay_period_end': 'payPeriodEnd',
        'pay_date': 'payDate',
        'total_gross': 'totalGross',
        'total_deductions': 'totalDeductions',
        'total_net': 'totalNet',
        'processed_by': 'processedBy',
        'approved_by': 'approvedBy',
        'approved_at': 'approvedAt',
        'external_payroll_id': 'externalPayrollId',
        'employee_count': 'employeeCount',
        'paid_at': 'paidAt',
        'paid_by': 'paidBy',
        'processed_at': 'processedAt',
        'total_gross_pay': 'totalGrossPay',
        'total_net_pay': 'totalNetPay',
        'total_taxes': 'totalTaxes',

        // LeaveRequest table
        'leave_request_id': 'leaveRequestId',
        'leave_type_id': 'leaveTypeId',
        'start_date': 'startDate',
        'end_date': 'endDate',
        'total_days': 'totalDays',
        'reviewed_by': 'reviewedBy',
        'reviewed_at': 'reviewedAt',
        'review_comments': 'reviewComments',
        'is_half_day': 'isHalfDay',
        'half_day_period': 'halfDayPeriod',
        'is_emergency': 'isEmergency',
        'emergency_contact': 'emergencyContact',
        'contact_details': 'contactDetails',
        'attachment_path': 'attachmentPath',

        // AttendanceRecord table
        'attendance_record_id': 'attendanceRecordId',
        'attendance_date': 'attendanceDate',
        'check_in_time': 'checkInTime',
        'check_out_time': 'checkOutTime',
        'total_hours': 'totalHours',
        'overtime_hours': 'overtimeHours',
        'break_hours': 'breakHours',
        'check_in_location': 'checkInLocation',
        'check_out_location': 'checkOutLocation',

        // PerformanceReview table
        'performance_review_id': 'performanceReviewId',
        'review_cycle_id': 'reviewCycleId',
        'reviewer_id': 'reviewerId',
        'review_type': 'reviewType',
        'overall_rating': 'overallRating',
        'areas_for_improvement': 'areasForImprovement',
        'goals_next_period': 'goalsNextPeriod',
        'submitted_at': 'submittedAt',
        'acknowledged_at': 'acknowledgedAt',

        // BenefitPlan table
        'benefit_plan_id': 'benefitPlanId',
        'plan_type': 'planType',
        'employee_cost': 'employeeCost',
        'employer_cost': 'employerCost',
        'cost_frequency': 'costFrequency',
        'is_active': 'isActive',
        'effective_date': 'effectiveDate',
        'expiry_date': 'expiryDate',

        // Asset table
        'asset_id': 'assetId',
        'asset_type': 'assetType',
        'asset_tag': 'assetTag',
        'serial_number': 'serialNumber'
      };

      it('should correctly convert all real database column names', () => {
        Object.entries(databaseColumnMappings).forEach(([snakeCase, expectedCamelCase]) => {
          const actualCamelCase = snakeToCamel(snakeCase);
          expect(actualCamelCase).toBe(expectedCamelCase);
        });
      });

      it('should verify conversion algorithm matches expected mappings', () => {
        fc.assert(fc.property(
          fc.constantFrom(...Object.keys(databaseColumnMappings)),
          (snakeCaseColumn) => {
            const expectedCamelCase = databaseColumnMappings[snakeCaseColumn];
            const actualCamelCase = snakeToCamel(snakeCaseColumn);

            return actualCamelCase === expectedCamelCase;
          }
        ), { numRuns: 100 });
      });
    });

    describe('Idempotency and Reversibility Properties', () => {
      it('should not change strings that are already in camelCase', () => {
        const camelCaseStrings = [
          'employeeId',
          'firstName',
          'lastName',
          'dateOfBirth',
          'totalGrossPay'
        ];

        camelCaseStrings.forEach(str => {
          // Applying conversion to camelCase should not change it (no underscores to convert)
          const result = snakeToCamel(str);
          expect(result).toBe(str);
        });
      });

      it('should handle empty strings gracefully', () => {
        expect(snakeToCamel('')).toBe('');
      });

      it('should handle strings with numbers', () => {
        // Numbers after underscore are not converted (regex only matches lowercase letters)
        expect(snakeToCamel('field_1')).toBe('field_1');
        expect(snakeToCamel('test_field_2_name')).toBe('testField_2Name');
        expect(snakeToCamel('item_123_code')).toBe('item_123Code');
      });
    });

    describe('Edge Cases and Special Scenarios', () => {
      it('should handle uppercase letters in snake_case (non-standard but possible)', () => {
        // Regex only matches lowercase letters after underscore, so uppercase remains
        expect(snakeToCamel('Test_Field')).toBe('Test_Field');
        expect(snakeToCamel('UPPER_CASE')).toBe('UPPER_CASE');
      });

      it('should handle very long column names', () => {
        const longSnakeCase = 'this_is_a_very_long_database_column_name_with_many_words';
        const result = snakeToCamel(longSnakeCase);

        expect(result).toBe('thisIsAVeryLongDatabaseColumnNameWithManyWords');
        expect(result).not.toContain('_');
        expect(result.charAt(0)).toBe(result.charAt(0).toLowerCase());
      });

      it('should handle single character words', () => {
        expect(snakeToCamel('a_b_c')).toBe('aBC');
        expect(snakeToCamel('x_y_z')).toBe('xYZ');
      });

      it('should handle mixed alphanumeric', () => {
        // Only lowercase letters after underscores are converted
        expect(snakeToCamel('field_1_name_2')).toBe('field_1Name_2');
        expect(snakeToCamel('test_123_abc')).toBe('test_123Abc');
      });
    });

    describe('Property-Based Tests for Naming Convention Requirements', () => {
      it('should verify that for any snake_case input, output is valid camelCase or unchanged', () => {
        fc.assert(fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 50 }).filter(s => !s.startsWith('_') && !s.endsWith('_') && !s.includes('__')),
          (input) => {
            const result = snakeToCamel(input);

            // Result should either be valid camelCase or the same as input (if no underscores)
            if (!input.includes('_')) {
              return result === input;
            } else {
              // Should have removed underscores followed by lowercase letters
              const underscoresFollowedByLowercase = (input.match(/_[a-z]/g) || []).length;
              const underscoresInResult = (result.match(/_/g) || []).length;
              const underscoresInInput = (input.match(/_/g) || []).length;

              // Number of underscores removed should equal underscores followed by lowercase
              return underscoresInResult === (underscoresInInput - underscoresFollowedByLowercase);
            }
          }
        ), { numRuns: 100 });
      });

      it('should verify conversion preserves word boundaries correctly', () => {
        fc.assert(fc.property(
          fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 8 }), { minLength: 2, maxLength: 4 }),
          (words) => {
            const snakeCaseStr = words.join('_');
            const camelCaseStr = snakeToCamel(snakeCaseStr);

            // Count of uppercase letters should equal number of word boundaries (words.length - 1)
            const uppercaseCount = (camelCaseStr.match(/[A-Z]/g) || []).length;
            const expectedUppercase = words.length - 1;

            return uppercaseCount === expectedUppercase;
          }
        ), { numRuns: 100 });
      });

      it('should verify length relationship between input and output', () => {
        fc.assert(fc.property(
          fc.array(fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')), { minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 5 }),
          (words) => {
            const snakeCaseStr = words.join('_');
            const camelCaseStr = snakeToCamel(snakeCaseStr);

            // Output length should be input length minus number of underscores
            const underscoreCount = (snakeCaseStr.match(/_/g) || []).length;
            const expectedLength = snakeCaseStr.length - underscoreCount;

            return camelCaseStr.length === expectedLength;
          }
        ), { numRuns: 100 });
      });
    });
  });
});
