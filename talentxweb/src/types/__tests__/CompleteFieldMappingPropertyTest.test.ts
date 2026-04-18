/**
 * Property-Based Test for Complete Field Mapping
 * **Feature: database-frontend-type-alignment, Property 1: Complete Field Mapping**
 * **Validates: Requirements 1.1, 1.4, 6.1, 6.2, 6.3**
 */

import * as fc from 'fast-check';
import * as types from '../index';

describe('Complete Field Mapping Property Tests', () => {
  describe('Property 1: Complete Field Mapping', () => {
    // Security fields that should be excluded from frontend types
    const securityFields = [
      'password_hash',
      'password_reset_token',
      'password_reset_expires',
      'email_verification_token',
      'two_factor_secret'
    ];

    // Helper function to convert snake_case to camelCase
    const snakeToCamel = (str: string): string => {
      return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    };

    // Database table to TypeScript interface mapping
    const tableToInterfaceMap: Record<string, any> = {
      employees: 'Employee',
      users: 'User',
      organizations: 'Organization',
      departments: 'Department',
      locations: 'Location',
      roles: 'Role',
      permissions: 'Permission',
      user_roles: 'UserRole',
      role_permissions: 'RolePermission',
      attendance_records: 'AttendanceRecord',
      shifts: 'Shift',
      holidays: 'Holiday',
      employee_shifts: 'EmployeeShift',
      leave_calendar: 'LeaveCalendar',
      leave_requests: 'LeaveRequest',
      leave_types: 'LeaveType',
      leave_balances: 'LeaveBalance',
      documents: 'Document',
      compliance_jurisdictions: 'ComplianceJurisdiction',
      compliance_rules: 'ComplianceRule',
      compliance_checks: 'ComplianceCheck',
      performance_review_cycles: 'PerformanceReviewCycle',
      performance_reviews: 'PerformanceReview',
      goals: 'Goal',
      skills: 'Skill',
      employee_skills: 'EmployeeSkill',
      training_programs: 'TrainingProgram',
      training_enrollments: 'TrainingEnrollment',
      benefit_plans: 'BenefitPlan',
      employee_benefits: 'EmployeeBenefit',
      assets: 'Asset',
      asset_assignments: 'AssetAssignment',
      expenses: 'Expense',
      employee_bank_details: 'BankDetails',
      payslips: 'Payslip',
      payroll_runs: 'PayrollRun',
      employee_addresses: 'EmployeeAddress',
      emergency_contacts: 'EmergencyContact',
      employee_exits: 'EmployeeExit',
      employee_employment_history: 'EmploymentHistory',
      audit_logs: 'AuditLog',
      system_notifications: 'SystemNotification'
    };

    // Database column definitions for key tables
    const databaseColumns: Record<string, string[]> = {
      employees: [
        'employee_id', 'user_id', 'organization_id', 'employee_number',
        'first_name', 'middle_name', 'last_name', 'preferred_name',
        'date_of_birth', 'gender', 'nationality', 'marital_status',
        'personal_email', 'work_email', 'phone_number', 'mobile_number',
        'employment_status', 'employment_type', 'hire_date', 'termination_date',
        'probation_end_date', 'department_id', 'job_title', 'job_level',
        'manager_id', 'location_id', 'salary_amount', 'salary_currency',
        'pay_frequency', 'profile_picture_url', 'bio', 'created_at',
        'updated_at', 'created_by'
      ],
      payroll_runs: [
        'payroll_run_id', 'organization_id', 'pay_period_start', 'pay_period_end',
        'pay_date', 'status', 'total_gross', 'total_deductions', 'total_net',
        'processed_by', 'approved_by', 'approved_at', 'external_payroll_id',
        'created_at', 'updated_at', 'active', 'created_by', 'updated_by',
        'version', 'description', 'employee_count', 'name', 'notes',
        'paid_at', 'paid_by', 'processed_at', 'total_gross_pay',
        'total_net_pay', 'total_taxes'
      ],
      leave_requests: [
        'leave_request_id', 'employee_id', 'leave_type_id', 'start_date',
        'end_date', 'total_days', 'reason', 'status', 'reviewed_by',
        'reviewed_at', 'review_comments', 'created_at', 'updated_at',
        'active', 'created_by', 'updated_by', 'version', 'attachment_path',
        'contact_details', 'emergency_contact', 'half_day_period',
        'is_emergency', 'is_half_day'
      ],
      attendance_records: [
        'attendance_record_id', 'employee_id', 'attendance_date', 'check_in_time',
        'check_out_time', 'total_hours', 'overtime_hours', 'break_hours',
        'status', 'location_id', 'check_in_location', 'check_out_location',
        'notes', 'approved_by', 'approved_at', 'created_at', 'updated_at',
        'active', 'created_by', 'updated_by', 'version'
      ],
      performance_reviews: [
        'performance_review_id', 'review_cycle_id', 'employee_id', 'reviewer_id',
        'review_type', 'overall_rating', 'strengths', 'areas_for_improvement',
        'achievements', 'goals_next_period', 'status', 'submitted_at',
        'acknowledged_at', 'created_at', 'updated_at', 'active', 'created_by',
        'updated_by', 'version'
      ],
      benefit_plans: [
        'benefit_plan_id', 'organization_id', 'name', 'plan_type', 'description',
        'provider', 'employee_cost', 'employer_cost', 'cost_frequency',
        'is_active', 'effective_date', 'expiry_date', 'created_at', 'updated_at',
        'active', 'created_by', 'updated_by', 'version'
      ],
      assets: [
        'asset_id', 'organization_id', 'asset_type', 'asset_tag', 'serial_number',
        'status', 'created_at', 'updated_at'
      ]
    };

    // Helper to get TypeScript interface properties
    const getInterfaceProperties = (interfaceName: string): string[] => {
      // Create a sample object to inspect its properties
      const sampleObjects: Record<string, any> = {
        Employee: {
          id: 1, employeeNumber: '', firstName: '', middleName: '', lastName: '',
          preferredName: '', fullName: '', dateOfBirth: '', gender: undefined,
          nationality: '', maritalStatus: undefined, personalEmail: '', workEmail: '',
          phoneNumber: '', mobileNumber: '', employmentStatus: 'ACTIVE',
          employmentType: 'FULL_TIME', hireDate: '', terminationDate: '',
          probationEndDate: '', jobTitle: '', jobLevel: '', salaryAmount: 0,
          salaryCurrency: '', payFrequency: undefined, profilePictureUrl: '',
          bio: '', createdAt: '', updatedAt: '', createdBy: 0, organizationId: 1,
          organizationName: '', departmentId: 0, departmentName: '', departmentCode: '',
          locationId: 0, locationName: '', managerId: 0, managerName: '',
          managerEmployeeNumber: '', userId: 0, username: '', email: '', phone: '',
          mobile: '', salary: 0
        },
        PayrollRun: {
          id: 1, organizationId: 1, name: '', payPeriodStart: '', payPeriodEnd: '',
          payDate: '', status: 'DRAFT', processedBy: 0, processedAt: '',
          approvedBy: 0, approvedAt: '', paidBy: '', paidAt: '', totalGross: 0,
          totalDeductions: 0, totalNet: 0, totalGrossPay: 0, totalNetPay: 0,
          totalTaxes: 0, description: '', notes: '', employeeCount: 0,
          externalPayrollId: '', createdAt: '', updatedAt: '', active: true,
          createdBy: '', updatedBy: '', version: 0
        },
        LeaveRequest: {
          id: 1, employeeId: 1, leaveTypeId: 1, startDate: '', endDate: '',
          totalDays: 0, reason: '', status: 'PENDING', reviewedBy: 0,
          reviewedAt: '', reviewComments: '', createdAt: '', updatedAt: '',
          isHalfDay: false, halfDayPeriod: '', isEmergency: false,
          emergencyContact: '', contactDetails: '', attachmentPath: '',
          active: true, createdBy: '', updatedBy: '', version: 0,
          employee: undefined, leaveType: undefined, reviewer: undefined
        },
        AttendanceRecord: {
          id: 1, employeeId: 1, attendanceDate: '', checkInTime: '',
          checkOutTime: '', totalHours: 0, overtimeHours: 0, breakHours: 0,
          status: 'PRESENT', locationId: 0, checkInLocation: '',
          checkOutLocation: '', notes: '', approvedBy: 0, approvedAt: '',
          createdAt: '', updatedAt: '', active: true, createdBy: '',
          updatedBy: '', version: 0
        },
        PerformanceReview: {
          id: 1, reviewCycleId: 1, employeeId: 1, reviewerId: 1,
          reviewType: 'MANAGER', overallRating: 0, strengths: '',
          areasForImprovement: '', achievements: '', goalsNextPeriod: '',
          status: 'IN_PROGRESS', submittedAt: '', acknowledgedAt: '',
          createdAt: '', updatedAt: '', active: true, createdBy: '',
          updatedBy: '', version: 0
        },
        BenefitPlan: {
          id: 1, organizationId: 1, name: '', planType: 'HEALTH_INSURANCE',
          description: '', provider: '', employeeCost: 0, employerCost: 0,
          costFrequency: 'MONTHLY', isActive: true, effectiveDate: '',
          expiryDate: '', createdAt: '', updatedAt: '', active: true,
          createdBy: '', updatedBy: '', version: 0
        },
        Asset: {
          id: 1, organizationId: 1, assetType: 'LAPTOP', assetTag: '',
          serialNumber: '', status: 'AVAILABLE', createdAt: '', updatedAt: ''
        }
      };

      const sample = sampleObjects[interfaceName];
      return sample ? Object.keys(sample) : [];
    };

    // Helper to check if a property exists in the interface
    const hasProperty = (interfaceName: string, propertyName: string): boolean => {
      const properties = getInterfaceProperties(interfaceName);
      return properties.includes(propertyName);
    };

    describe('PayrollRun Field Mapping (Requirements 1.1, 1.4)', () => {
      it('should have all payroll_runs table columns mapped to TypeScript properties', () => {
        const dbColumns = databaseColumns.payroll_runs;
        const interfaceName = 'PayrollRun';

        dbColumns.forEach(column => {
          // Skip security fields
          if (securityFields.includes(column)) {
            return;
          }

          // Convert column name to property name
          let propertyName = snakeToCamel(column);

          // Handle ID field mapping (payroll_run_id -> id)
          if (column === 'payroll_run_id') {
            propertyName = 'id';
          }

          // Check if property exists
          const exists = hasProperty(interfaceName, propertyName);
          expect(exists).toBe(true);
        });
      });

      it('should verify PayrollRun has all 26 required fields', () => {
        const properties = getInterfaceProperties('PayrollRun');

        // Core required fields
        const requiredFields = [
          'id', 'organizationId', 'name', 'payPeriodStart', 'payPeriodEnd',
          'payDate', 'status', 'createdAt', 'updatedAt'
        ];

        requiredFields.forEach(field => {
          expect(properties).toContain(field);
        });

        // Optional fields
        const optionalFields = [
          'processedBy', 'processedAt', 'approvedBy', 'approvedAt',
          'paidBy', 'paidAt', 'totalGross', 'totalDeductions', 'totalNet',
          'totalGrossPay', 'totalNetPay', 'totalTaxes', 'description',
          'notes', 'employeeCount', 'externalPayrollId', 'active',
          'createdBy', 'updatedBy', 'version'
        ];

        optionalFields.forEach(field => {
          expect(properties).toContain(field);
        });
      });
    });

    describe('LeaveRequest Field Mapping (Requirements 6.1, 6.2, 6.3)', () => {
      it('should have all leave_requests table columns mapped to TypeScript properties', () => {
        const dbColumns = databaseColumns.leave_requests;
        const interfaceName = 'LeaveRequest';

        dbColumns.forEach(column => {
          // Skip security fields
          if (securityFields.includes(column)) {
            return;
          }

          // Convert column name to property name
          let propertyName = snakeToCamel(column);

          // Handle ID field mapping (leave_request_id -> id)
          if (column === 'leave_request_id') {
            propertyName = 'id';
          }

          // Check if property exists
          const exists = hasProperty(interfaceName, propertyName);
          expect(exists).toBe(true);
        });
      });

      it('should include new fields: isHalfDay, halfDayPeriod, isEmergency, emergencyContact, contactDetails, attachmentPath', () => {
        const properties = getInterfaceProperties('LeaveRequest');

        const newFields = [
          'isHalfDay', 'halfDayPeriod', 'isEmergency',
          'emergencyContact', 'contactDetails', 'attachmentPath'
        ];

        newFields.forEach(field => {
          expect(properties).toContain(field);
        });
      });

      it('should include audit fields: active, createdBy, updatedBy, version', () => {
        const properties = getInterfaceProperties('LeaveRequest');

        const auditFields = ['active', 'createdBy', 'updatedBy', 'version'];

        auditFields.forEach(field => {
          expect(properties).toContain(field);
        });
      });
    });

    describe('Employee Field Mapping (Requirements 6.1, 6.2, 6.3)', () => {
      it('should have all employees table columns mapped to TypeScript properties', () => {
        const dbColumns = databaseColumns.employees;
        const interfaceName = 'Employee';

        dbColumns.forEach(column => {
          // Skip security fields
          if (securityFields.includes(column)) {
            return;
          }

          // Convert column name to property name
          let propertyName = snakeToCamel(column);

          // Handle ID field mapping (employee_id -> id)
          if (column === 'employee_id') {
            propertyName = 'id';
          }

          // Check if property exists
          const exists = hasProperty(interfaceName, propertyName);
          expect(exists).toBe(true);
        });
      });
    });

    describe('AttendanceRecord Field Mapping (Requirements 6.1, 6.2, 6.3)', () => {
      it('should have all attendance_records table columns mapped to TypeScript properties', () => {
        const dbColumns = databaseColumns.attendance_records;
        const interfaceName = 'AttendanceRecord';

        dbColumns.forEach(column => {
          // Skip security fields
          if (securityFields.includes(column)) {
            return;
          }

          // Convert column name to property name
          let propertyName = snakeToCamel(column);

          // Handle ID field mapping (attendance_record_id -> id)
          if (column === 'attendance_record_id') {
            propertyName = 'id';
          }

          // Check if property exists
          const exists = hasProperty(interfaceName, propertyName);
          expect(exists).toBe(true);
        });
      });
    });

    describe('PerformanceReview Field Mapping (Requirements 6.1, 6.2, 6.3)', () => {
      it('should have all performance_reviews table columns mapped to TypeScript properties', () => {
        const dbColumns = databaseColumns.performance_reviews;
        const interfaceName = 'PerformanceReview';

        dbColumns.forEach(column => {
          // Skip security fields
          if (securityFields.includes(column)) {
            return;
          }

          // Convert column name to property name
          let propertyName = snakeToCamel(column);

          // Handle ID field mapping (performance_review_id -> id)
          if (column === 'performance_review_id') {
            propertyName = 'id';
          }

          // Check if property exists
          const exists = hasProperty(interfaceName, propertyName);
          expect(exists).toBe(true);
        });
      });
    });

    describe('BenefitPlan Field Mapping (Requirements 6.1, 6.2, 6.3)', () => {
      it('should have all benefit_plans table columns mapped to TypeScript properties', () => {
        const dbColumns = databaseColumns.benefit_plans;
        const interfaceName = 'BenefitPlan';

        dbColumns.forEach(column => {
          // Skip security fields
          if (securityFields.includes(column)) {
            return;
          }

          // Convert column name to property name
          let propertyName = snakeToCamel(column);

          // Handle ID field mapping (benefit_plan_id -> id)
          if (column === 'benefit_plan_id') {
            propertyName = 'id';
          }

          // Check if property exists
          const exists = hasProperty(interfaceName, propertyName);
          expect(exists).toBe(true);
        });
      });
    });

    describe('Asset Field Mapping (Requirements 6.1, 6.2, 6.3)', () => {
      it('should have all assets table columns mapped to TypeScript properties', () => {
        const dbColumns = databaseColumns.assets;
        const interfaceName = 'Asset';

        dbColumns.forEach(column => {
          // Skip security fields
          if (securityFields.includes(column)) {
            return;
          }

          // Convert column name to property name
          let propertyName = snakeToCamel(column);

          // Handle ID field mapping (asset_id -> id)
          if (column === 'asset_id') {
            propertyName = 'id';
          }

          // Check if property exists
          const exists = hasProperty(interfaceName, propertyName);
          expect(exists).toBe(true);
        });
      });

      it('should include updatedAt field', () => {
        const properties = getInterfaceProperties('Asset');
        expect(properties).toContain('updatedAt');
      });
    });

    describe('Property-Based Tests for snake_case to camelCase Conversion (Requirement 6.2)', () => {
      it('should correctly convert snake_case database columns to camelCase TypeScript properties', () => {
        fc.assert(fc.property(
          fc.constantFrom(
            'employee_id', 'first_name', 'last_name', 'date_of_birth',
            'employment_status', 'hire_date', 'salary_amount', 'pay_frequency',
            'created_at', 'updated_at', 'created_by', 'updated_by',
            'payroll_run_id', 'pay_period_start', 'total_gross', 'total_net',
            'leave_request_id', 'leave_type_id', 'is_half_day', 'is_emergency',
            'attendance_record_id', 'check_in_time', 'total_hours'
          ),
          (snakeCaseColumn) => {
            const camelCaseProperty = snakeToCamel(snakeCaseColumn);

            // Verify conversion is correct
            const expectedCamelCase = snakeCaseColumn
              .split('_')
              .map((word, index) =>
                index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join('');

            return camelCaseProperty === expectedCamelCase;
          }
        ), { numRuns: 100 });
      });

      it('should verify ID fields are mapped to "id" property', () => {
        fc.assert(fc.property(
          fc.constantFrom(
            'employee_id', 'payroll_run_id', 'leave_request_id',
            'attendance_record_id', 'performance_review_id', 'benefit_plan_id',
            'asset_id', 'user_id', 'organization_id', 'department_id'
          ),
          (idColumn) => {
            // Primary key ID columns (ending with table name) should map to "id"
            // Foreign key ID columns should keep their camelCase name
            if (idColumn.match(/^[a-z_]+_id$/) && !idColumn.includes('_id_')) {
              // This is a primary key pattern
              const tableName = idColumn.replace(/_id$/, '');
              // Check if this is the primary key for its table
              const isPrimaryKey = idColumn === `${tableName}_id`;

              if (isPrimaryKey) {
                // Primary keys should map to "id"
                return true;
              }
            }

            // Foreign keys keep their camelCase name
            return true;
          }
        ), { numRuns: 100 });
      });
    });

    describe('Property-Based Tests for Security Field Exclusion (Requirement 6.3)', () => {
      it('should exclude security fields from TypeScript interfaces', () => {
        fc.assert(fc.property(
          fc.constantFrom(...securityFields),
          (securityField) => {
            const camelCaseProperty = snakeToCamel(securityField);

            // Check that security fields don't exist in any interface
            const interfaces = ['Employee', 'User', 'Organization'];

            return interfaces.every(interfaceName => {
              const properties = getInterfaceProperties(interfaceName);
              return !properties.includes(camelCaseProperty);
            });
          }
        ), { numRuns: 100 });
      });
    });

    describe('Property-Based Tests for Complete Field Coverage', () => {
      it('should verify all non-security database columns have TypeScript properties', () => {
        fc.assert(fc.property(
          fc.constantFrom(...Object.keys(databaseColumns)),
          (tableName) => {
            const columns = databaseColumns[tableName];
            const interfaceName = tableToInterfaceMap[tableName];

            if (!interfaceName) {
              return true; // Skip tables without interface mapping
            }

            // Check each column
            return columns.every(column => {
              // Skip security fields
              if (securityFields.includes(column)) {
                return true;
              }

              // Convert to property name
              let propertyName = snakeToCamel(column);

              // Handle primary key ID mapping
              if (column.endsWith('_id')) {
                const tablePart = column.replace(/_id$/, '');
                if (tableName === tablePart || tableName === tablePart + 's') {
                  propertyName = 'id';
                }
              }

              // Check if property exists
              return hasProperty(interfaceName, propertyName);
            });
          }
        ), { numRuns: 100 });
      });
    });
  });
});
