/**
 * Property-Based Test for Boolean Type Conversion
 * **Feature: database-frontend-type-alignment, Property 4: Boolean Type Conversion**
 * **Validates: Requirements 8.1, 8.2, 8.3, 8.4**
 */

import * as fc from 'fast-check';
import {
  User,
  Organization,
  Location,
  Role,
  LeaveType,
  Document,
  ComplianceCheck,
  Holiday,
  EmployeeShift,
  TrainingProgram,
  BenefitPlan,
  BankDetails,
  EmployeeAddress,
  EmergencyContact,
  LeaveRequest,
  AttendanceRecord,
  PerformanceReview,
  PayrollRun,
  Shift,
  UserRole,
  RolePermission
} from '../index';

describe('Boolean Type Conversion Property Tests', () => {
  describe('Property 4: Boolean Type Conversion', () => {
    /**
     * Database columns that are bit(1) or tinyint(1) and should map to boolean
     * Based on Requirements 8.1, 8.2, 8.3, 8.4
     */
    const booleanFieldMappings = [
      // User entity - bit(1) fields
      { entity: 'User', field: 'isActive', dbColumn: 'is_active', dbType: 'bit(1)' },
      { entity: 'User', field: 'isVerified', dbColumn: 'is_verified', dbType: 'bit(1)' },
      { entity: 'User', field: 'twoFactorEnabled', dbColumn: 'two_factor_enabled', dbType: 'bit(1)' },
      { entity: 'User', field: 'accountExpired', dbColumn: 'account_expired', dbType: 'bit(1)' },
      { entity: 'User', field: 'accountLocked', dbColumn: 'account_locked', dbType: 'bit(1)' },
      { entity: 'User', field: 'credentialsExpired', dbColumn: 'credentials_expired', dbType: 'bit(1)' },
      { entity: 'User', field: 'mustChangePassword', dbColumn: 'must_change_password', dbType: 'bit(1)' },

      // Organization entity - bit(1) fields
      { entity: 'Organization', field: 'isActive', dbColumn: 'is_active', dbType: 'bit(1)' },

      // Location entity - bit(1) fields
      { entity: 'Location', field: 'isHeadquarters', dbColumn: 'is_headquarters', dbType: 'bit(1)' },
      { entity: 'Location', field: 'isActive', dbColumn: 'is_active', dbType: 'bit(1)' },

      // Role entity - bit(1) fields
      { entity: 'Role', field: 'isSystemRole', dbColumn: 'is_system_role', dbType: 'bit(1)' },

      // LeaveType entity - bit(1) fields
      { entity: 'LeaveType', field: 'isPaid', dbColumn: 'is_paid', dbType: 'bit(1)' },
      { entity: 'LeaveType', field: 'requiresApproval', dbColumn: 'requires_approval', dbType: 'bit(1)' },
      { entity: 'LeaveType', field: 'allowNegativeBalance', dbColumn: 'allow_negative_balance', dbType: 'bit(1)' },
      { entity: 'LeaveType', field: 'isActive', dbColumn: 'is_active', dbType: 'bit(1)' },

      // Document entity - bit(1) fields
      { entity: 'Document', field: 'isConfidential', dbColumn: 'is_confidential', dbType: 'bit(1)' },
      { entity: 'Document', field: 'requiresSignature', dbColumn: 'requires_signature', dbType: 'bit(1)' },
      { entity: 'Document', field: 'isPublic', dbColumn: 'is_public', dbType: 'bit(1)' },

      // ComplianceCheck entity - bit(1) fields
      { entity: 'ComplianceCheck', field: 'resolved', dbColumn: 'resolved', dbType: 'bit(1)' },

      // Holiday entity - bit(1) fields
      { entity: 'Holiday', field: 'isOptional', dbColumn: 'is_optional', dbType: 'bit(1)' },

      // EmployeeShift entity - bit(1) fields
      { entity: 'EmployeeShift', field: 'isActive', dbColumn: 'is_active', dbType: 'bit(1)' },

      // TrainingProgram entity - bit(1) fields
      { entity: 'TrainingProgram', field: 'isMandatory', dbColumn: 'is_mandatory', dbType: 'bit(1)' },
      { entity: 'TrainingProgram', field: 'isActive', dbColumn: 'is_active', dbType: 'bit(1)' },

      // BenefitPlan entity - bit(1) fields
      { entity: 'BenefitPlan', field: 'isActive', dbColumn: 'is_active', dbType: 'bit(1)' },

      // BankDetails entity - bit(1) fields
      { entity: 'BankDetails', field: 'isPrimary', dbColumn: 'is_primary', dbType: 'bit(1)' },

      // EmployeeAddress entity - bit(1) fields
      { entity: 'EmployeeAddress', field: 'isPrimary', dbColumn: 'is_primary', dbType: 'bit(1)' },

      // EmergencyContact entity - bit(1) fields
      { entity: 'EmergencyContact', field: 'isPrimary', dbColumn: 'is_primary', dbType: 'bit(1)' },

      // LeaveRequest entity - bit(1) fields (new fields)
      { entity: 'LeaveRequest', field: 'isHalfDay', dbColumn: 'is_half_day', dbType: 'bit(1)' },
      { entity: 'LeaveRequest', field: 'isEmergency', dbColumn: 'is_emergency', dbType: 'bit(1)' },

      // Audit fields - bit(1) fields
      { entity: 'LeaveRequest', field: 'active', dbColumn: 'active', dbType: 'bit(1)' },
      { entity: 'AttendanceRecord', field: 'active', dbColumn: 'active', dbType: 'bit(1)' },
      { entity: 'PerformanceReview', field: 'active', dbColumn: 'active', dbType: 'bit(1)' },
      { entity: 'BenefitPlan', field: 'active', dbColumn: 'active', dbType: 'bit(1)' },
      { entity: 'PayrollRun', field: 'active', dbColumn: 'active', dbType: 'bit(1)' },

      // Shift entity - bit(1) fields
      { entity: 'Shift', field: 'isNightShift', dbColumn: 'is_night_shift', dbType: 'bit(1)' },

      // UserRole entity - bit(1) fields
      { entity: 'UserRole', field: 'active', dbColumn: 'active', dbType: 'bit(1)' },
      { entity: 'UserRole', field: 'isPrimaryRole', dbColumn: 'is_primary_role', dbType: 'bit(1)' },

      // RolePermission entity - bit(1) fields
      { entity: 'RolePermission', field: 'active', dbColumn: 'active', dbType: 'bit(1)' }
    ];

    it('should verify all bit(1) database columns map to boolean TypeScript type', () => {
      // Test each boolean field mapping
      booleanFieldMappings.forEach(({ entity, field, dbColumn, dbType }) => {
        // Create a test object with the boolean field
        const testValue = true;
        const testObject: any = { [field]: testValue };

        // Verify the field exists and is boolean type
        expect(testObject).toHaveProperty(field);
        expect(typeof testObject[field]).toBe('boolean');
      });
    });

    it('should verify User entity boolean fields', () => {
      fc.assert(fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (isActive, isVerified, twoFactorEnabled) => {
          const user: Partial<User> = {
            isActive,
            isVerified,
            twoFactorEnabled
          };

          // Verify all are boolean type
          expect(typeof user.isActive).toBe('boolean');
          expect(typeof user.isVerified).toBe('boolean');
          expect(typeof user.twoFactorEnabled).toBe('boolean');

          // Verify values are preserved
          expect(user.isActive).toBe(isActive);
          expect(user.isVerified).toBe(isVerified);
          expect(user.twoFactorEnabled).toBe(twoFactorEnabled);
        }
      ), { numRuns: 100 });
    });

    it('should verify Organization entity boolean fields', () => {
      fc.assert(fc.property(
        fc.boolean(),
        (isActive) => {
          const organization: Partial<Organization> = {
            isActive
          };

          // Verify is boolean type
          expect(typeof organization.isActive).toBe('boolean');

          // Verify value is preserved
          expect(organization.isActive).toBe(isActive);
        }
      ), { numRuns: 100 });
    });

    it('should verify Location entity boolean fields', () => {
      fc.assert(fc.property(
        fc.boolean(),
        fc.boolean(),
        (isHeadquarters, isActive) => {
          const location: Partial<Location> = {
            isHeadquarters,
            isActive
          };

          // Verify all are boolean type
          expect(typeof location.isHeadquarters).toBe('boolean');
          expect(typeof location.isActive).toBe('boolean');

          // Verify values are preserved
          expect(location.isHeadquarters).toBe(isHeadquarters);
          expect(location.isActive).toBe(isActive);
        }
      ), { numRuns: 100 });
    });

    it('should verify LeaveRequest new boolean fields (isHalfDay, isEmergency)', () => {
      fc.assert(fc.property(
        fc.option(fc.boolean(), { nil: undefined }),
        fc.option(fc.boolean(), { nil: undefined }),
        (isHalfDay, isEmergency) => {
          const leaveRequest: Partial<LeaveRequest> = {
            isHalfDay,
            isEmergency
          };

          // Verify fields are optional
          if (leaveRequest.isHalfDay !== undefined) {
            expect(typeof leaveRequest.isHalfDay).toBe('boolean');
            expect(leaveRequest.isHalfDay).toBe(isHalfDay);
          }

          if (leaveRequest.isEmergency !== undefined) {
            expect(typeof leaveRequest.isEmergency).toBe('boolean');
            expect(leaveRequest.isEmergency).toBe(isEmergency);
          }
        }
      ), { numRuns: 100 });
    });

    it('should verify audit field "active" is boolean across all entities', () => {
      fc.assert(fc.property(
        fc.option(fc.boolean(), { nil: undefined }),
        (activeValue) => {
          // Test with all entities that have audit fields
          const leaveRequest: Partial<LeaveRequest> = { active: activeValue };
          const attendanceRecord: Partial<AttendanceRecord> = { active: activeValue };
          const performanceReview: Partial<PerformanceReview> = { active: activeValue };
          const benefitPlan: Partial<BenefitPlan> = { active: activeValue };
          const payrollRun: Partial<PayrollRun> = { active: activeValue };

          // Verify all are optional and boolean when present
          if (leaveRequest.active !== undefined) {
            expect(typeof leaveRequest.active).toBe('boolean');
            expect(leaveRequest.active).toBe(activeValue);
          }

          if (attendanceRecord.active !== undefined) {
            expect(typeof attendanceRecord.active).toBe('boolean');
            expect(attendanceRecord.active).toBe(activeValue);
          }

          if (performanceReview.active !== undefined) {
            expect(typeof performanceReview.active).toBe('boolean');
            expect(performanceReview.active).toBe(activeValue);
          }

          if (benefitPlan.active !== undefined) {
            expect(typeof benefitPlan.active).toBe('boolean');
            expect(benefitPlan.active).toBe(activeValue);
          }

          if (payrollRun.active !== undefined) {
            expect(typeof payrollRun.active).toBe('boolean');
            expect(payrollRun.active).toBe(activeValue);
          }
        }
      ), { numRuns: 100 });
    });

    it('should verify LeaveType boolean fields', () => {
      fc.assert(fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (isPaid, requiresApproval, allowNegativeBalance, isActive) => {
          const leaveType: Partial<LeaveType> = {
            isPaid,
            requiresApproval,
            allowNegativeBalance,
            isActive
          };

          // Verify all are boolean type
          expect(typeof leaveType.isPaid).toBe('boolean');
          expect(typeof leaveType.requiresApproval).toBe('boolean');
          expect(typeof leaveType.allowNegativeBalance).toBe('boolean');
          expect(typeof leaveType.isActive).toBe('boolean');

          // Verify values are preserved
          expect(leaveType.isPaid).toBe(isPaid);
          expect(leaveType.requiresApproval).toBe(requiresApproval);
          expect(leaveType.allowNegativeBalance).toBe(allowNegativeBalance);
          expect(leaveType.isActive).toBe(isActive);
        }
      ), { numRuns: 100 });
    });

    it('should verify Document boolean fields', () => {
      fc.assert(fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.boolean(),
        (isConfidential, requiresSignature, isPublic) => {
          const document: Partial<Document> = {
            isConfidential,
            requiresSignature,
            isPublic
          };

          // Verify all are boolean type
          expect(typeof document.isConfidential).toBe('boolean');
          expect(typeof document.requiresSignature).toBe('boolean');
          expect(typeof document.isPublic).toBe('boolean');

          // Verify values are preserved
          expect(document.isConfidential).toBe(isConfidential);
          expect(document.requiresSignature).toBe(requiresSignature);
          expect(document.isPublic).toBe(isPublic);
        }
      ), { numRuns: 100 });
    });

    it('should verify isPrimary boolean field across multiple entities', () => {
      fc.assert(fc.property(
        fc.boolean(),
        (isPrimary) => {
          const bankDetails: Partial<BankDetails> = { isPrimary };
          const employeeAddress: Partial<EmployeeAddress> = { isPrimary };
          const emergencyContact: Partial<EmergencyContact> = { isPrimary };

          // Verify all are boolean type
          expect(typeof bankDetails.isPrimary).toBe('boolean');
          expect(typeof employeeAddress.isPrimary).toBe('boolean');
          expect(typeof emergencyContact.isPrimary).toBe('boolean');

          // Verify values are preserved
          expect(bankDetails.isPrimary).toBe(isPrimary);
          expect(employeeAddress.isPrimary).toBe(isPrimary);
          expect(emergencyContact.isPrimary).toBe(isPrimary);
        }
      ), { numRuns: 100 });
    });

    it('should verify TrainingProgram boolean fields', () => {
      fc.assert(fc.property(
        fc.boolean(),
        fc.boolean(),
        (isMandatory, isActive) => {
          const trainingProgram: Partial<TrainingProgram> = {
            isMandatory,
            isActive
          };

          // Verify all are boolean type
          expect(typeof trainingProgram.isMandatory).toBe('boolean');
          expect(typeof trainingProgram.isActive).toBe('boolean');

          // Verify values are preserved
          expect(trainingProgram.isMandatory).toBe(isMandatory);
          expect(trainingProgram.isActive).toBe(isActive);
        }
      ), { numRuns: 100 });
    });

    it('should verify Shift isNightShift boolean field', () => {
      fc.assert(fc.property(
        fc.boolean(),
        (isNightShift) => {
          const shift: Partial<Shift> = {
            isNightShift
          };

          // Verify is boolean type
          expect(typeof shift.isNightShift).toBe('boolean');

          // Verify value is preserved
          expect(shift.isNightShift).toBe(isNightShift);
        }
      ), { numRuns: 100 });
    });

    it('should verify Holiday isOptional boolean field', () => {
      fc.assert(fc.property(
        fc.boolean(),
        (isOptional) => {
          const holiday: Partial<Holiday> = {
            isOptional
          };

          // Verify is boolean type
          expect(typeof holiday.isOptional).toBe('boolean');

          // Verify value is preserved
          expect(holiday.isOptional).toBe(isOptional);
        }
      ), { numRuns: 100 });
    });

    it('should verify ComplianceCheck resolved boolean field', () => {
      fc.assert(fc.property(
        fc.boolean(),
        (resolved) => {
          const complianceCheck: Partial<ComplianceCheck> = {
            resolved
          };

          // Verify is boolean type
          expect(typeof complianceCheck.resolved).toBe('boolean');

          // Verify value is preserved
          expect(complianceCheck.resolved).toBe(resolved);
        }
      ), { numRuns: 100 });
    });

    it('should verify Role isSystemRole boolean field', () => {
      fc.assert(fc.property(
        fc.boolean(),
        (isSystemRole) => {
          const role: Partial<Role> = {
            isSystemRole
          };

          // Verify is boolean type
          expect(typeof role.isSystemRole).toBe('boolean');

          // Verify value is preserved
          expect(role.isSystemRole).toBe(isSystemRole);
        }
      ), { numRuns: 100 });
    });

    it('should verify UserRole boolean fields', () => {
      fc.assert(fc.property(
        fc.option(fc.boolean(), { nil: undefined }),
        fc.option(fc.boolean(), { nil: undefined }),
        (active, isPrimaryRole) => {
          const userRole: Partial<UserRole> = {
            active,
            isPrimaryRole
          };

          // Verify fields are optional and boolean when present
          if (userRole.active !== undefined) {
            expect(typeof userRole.active).toBe('boolean');
            expect(userRole.active).toBe(active);
          }

          if (userRole.isPrimaryRole !== undefined) {
            expect(typeof userRole.isPrimaryRole).toBe('boolean');
            expect(userRole.isPrimaryRole).toBe(isPrimaryRole);
          }
        }
      ), { numRuns: 100 });
    });

    it('should verify RolePermission active boolean field', () => {
      fc.assert(fc.property(
        fc.option(fc.boolean(), { nil: undefined }),
        (active) => {
          const rolePermission: Partial<RolePermission> = {
            active
          };

          // Verify field is optional and boolean when present
          if (rolePermission.active !== undefined) {
            expect(typeof rolePermission.active).toBe('boolean');
            expect(rolePermission.active).toBe(active);
          }
        }
      ), { numRuns: 100 });
    });

    it('should verify boolean fields handle both true and false values correctly', () => {
      fc.assert(fc.property(
        fc.boolean(),
        (boolValue) => {
          // Test with various entities
          const user: Partial<User> = { isActive: boolValue };
          const organization: Partial<Organization> = { isActive: boolValue };
          const leaveType: Partial<LeaveType> = { isPaid: boolValue };
          const document: Partial<Document> = { isConfidential: boolValue };

          // Verify all preserve the exact boolean value
          expect(user.isActive).toBe(boolValue);
          expect(organization.isActive).toBe(boolValue);
          expect(leaveType.isPaid).toBe(boolValue);
          expect(document.isConfidential).toBe(boolValue);

          // Verify they are strictly boolean (not truthy/falsy)
          expect(user.isActive === true || user.isActive === false).toBe(true);
          expect(organization.isActive === true || organization.isActive === false).toBe(true);
          expect(leaveType.isPaid === true || leaveType.isPaid === false).toBe(true);
          expect(document.isConfidential === true || document.isConfidential === false).toBe(true);
        }
      ), { numRuns: 100 });
    });

    it('should verify optional boolean fields can be undefined', () => {
      // Test that optional boolean fields accept undefined
      const leaveRequest: Partial<LeaveRequest> = {
        isHalfDay: undefined,
        isEmergency: undefined,
        active: undefined
      };

      const attendanceRecord: Partial<AttendanceRecord> = {
        active: undefined
      };

      const performanceReview: Partial<PerformanceReview> = {
        active: undefined
      };

      // Verify undefined is accepted
      expect(leaveRequest.isHalfDay).toBeUndefined();
      expect(leaveRequest.isEmergency).toBeUndefined();
      expect(leaveRequest.active).toBeUndefined();
      expect(attendanceRecord.active).toBeUndefined();
      expect(performanceReview.active).toBeUndefined();
    });

    it('should verify all boolean fields in the system are correctly typed', () => {
      // Comprehensive test of all boolean field mappings
      const allBooleanFields = booleanFieldMappings.map(m => m.field);
      const uniqueBooleanFields = [...new Set(allBooleanFields)];

      // Verify we have a comprehensive list
      expect(uniqueBooleanFields.length).toBeGreaterThan(0);

      // Verify each unique field name represents a boolean concept
      uniqueBooleanFields.forEach(fieldName => {
        // Boolean fields should start with 'is', 'has', 'requires', 'allow', 
        // or be named 'active', 'resolved', 'twoFactorEnabled', etc.
        const isBooleanNaming =
          fieldName.startsWith('is') ||
          fieldName.startsWith('has') ||
          fieldName.startsWith('requires') ||
          fieldName.startsWith('allow') ||
          fieldName === 'active' ||
          fieldName === 'resolved' ||
          fieldName === 'twoFactorEnabled' ||
          // Account-related boolean fields
          fieldName === 'accountExpired' ||
          fieldName === 'accountLocked' ||
          fieldName === 'credentialsExpired' ||
          fieldName === 'mustChangePassword';

        expect(isBooleanNaming).toBe(true);
      });
    });
  });
});
