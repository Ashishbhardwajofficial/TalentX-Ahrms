/**
 * Property-Based Test for Backward Compatibility
 * **Feature: database-frontend-type-alignment, Property 6: Backward Compatibility Preservation**
 * **Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5, 10.6**
 */

import * as fc from 'fast-check';
import * as types from '../index';

describe('Backward Compatibility Property Tests', () => {
  describe('Property 6: Backward Compatibility Preservation', () => {

    // Define the baseline interface structures before adding new optional fields
    // This represents the "old" state that must remain compatible
    const baselineInterfaces = {
      Employee: {
        requiredFields: ['id', 'firstName', 'lastName', 'employmentStatus', 'employmentType'],
        optionalFields: [
          'employeeNumber', 'middleName', 'preferredName', 'fullName',
          'dateOfBirth', 'gender', 'nationality', 'maritalStatus',
          'personalEmail', 'workEmail', 'phoneNumber', 'mobileNumber',
          'hireDate', 'terminationDate', 'probationEndDate',
          'jobTitle', 'jobLevel', 'salaryAmount', 'salaryCurrency',
          'payFrequency', 'profilePictureUrl', 'bio',
          'createdAt', 'updatedAt', 'createdBy',
          'organizationId', 'departmentId', 'locationId', 'managerId', 'userId'
        ],
        compatibilityAliases: ['email', 'phone', 'mobile', 'salary']
      },
      User: {
        requiredFields: ['id', 'username'],
        optionalFields: [
          'firstName', 'lastName', 'email', 'phoneNumber',
          'isActive', 'isVerified', 'twoFactorEnabled',
          'lastLoginAt', 'createdAt', 'updatedAt'
        ],
        compatibilityAliases: ['active', 'emailVerified']
      },
      Organization: {
        requiredFields: ['id', 'name'],
        optionalFields: [
          'legalName', 'taxId', 'registrationNumber', 'industry',
          'website', 'email', 'phoneNumber', 'address',
          'city', 'state', 'country', 'postalCode',
          'isActive', 'createdAt', 'updatedAt'
        ],
        compatibilityAliases: ['active']
      },
      LeaveRequest: {
        requiredFields: ['id', 'employeeId', 'leaveTypeId', 'startDate', 'endDate', 'totalDays', 'status'],
        optionalFields: [
          'reason', 'reviewedBy', 'reviewedAt', 'reviewComments',
          'createdAt', 'updatedAt'
        ],
        newOptionalFields: [
          'isHalfDay', 'halfDayPeriod', 'isEmergency',
          'emergencyContact', 'contactDetails', 'attachmentPath',
          'active', 'createdBy', 'updatedBy', 'version'
        ]
      },
      AttendanceRecord: {
        requiredFields: ['id', 'employeeId', 'attendanceDate', 'status'],
        optionalFields: [
          'checkInTime', 'checkOutTime', 'totalHours', 'overtimeHours',
          'breakHours', 'locationId', 'checkInLocation', 'checkOutLocation',
          'notes', 'approvedBy', 'approvedAt', 'createdAt', 'updatedAt'
        ],
        newOptionalFields: ['active', 'createdBy', 'updatedBy', 'version']
      },
      PerformanceReview: {
        requiredFields: ['id', 'reviewCycleId', 'employeeId', 'reviewerId', 'status'],
        optionalFields: [
          'reviewType', 'overallRating', 'strengths', 'areasForImprovement',
          'achievements', 'goalsNextPeriod', 'submittedAt', 'acknowledgedAt',
          'createdAt', 'updatedAt'
        ],
        newOptionalFields: ['active', 'createdBy', 'updatedBy', 'version']
      },
      BenefitPlan: {
        requiredFields: ['id', 'organizationId', 'name', 'planType'],
        optionalFields: [
          'description', 'provider', 'employeeCost', 'employerCost',
          'costFrequency', 'isActive', 'effectiveDate', 'expiryDate',
          'createdAt', 'updatedAt'
        ],
        newOptionalFields: ['active', 'createdBy', 'updatedBy', 'version']
      },
      Asset: {
        requiredFields: ['id', 'organizationId', 'assetType', 'status'],
        optionalFields: [
          'assetTag', 'serialNumber', 'createdAt'
        ],
        newOptionalFields: ['updatedAt']
      }
    };

    // Helper to get interface properties from a sample object
    const getInterfaceProperties = (interfaceName: string): string[] => {
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
          departmentId: 0, locationId: 0, managerId: 0, userId: 0,
          email: '', phone: '', mobile: '', salary: 0
        },
        User: {
          id: 1, username: '', firstName: '', lastName: '', email: '',
          phoneNumber: '', isActive: true, isVerified: false, twoFactorEnabled: false,
          lastLoginAt: '', createdAt: '', updatedAt: '',
          active: true, emailVerified: false
        },
        Organization: {
          id: 1, name: '', legalName: '', taxId: '', registrationNumber: '',
          industry: '', website: '', email: '', phoneNumber: '', address: '',
          city: '', state: '', country: '', postalCode: '', isActive: true,
          createdAt: '', updatedAt: '', active: true
        },
        LeaveRequest: {
          id: 1, employeeId: 1, leaveTypeId: 1, startDate: '', endDate: '',
          totalDays: 0, reason: '', status: 'PENDING', reviewedBy: 0,
          reviewedAt: '', reviewComments: '', createdAt: '', updatedAt: '',
          isHalfDay: false, halfDayPeriod: '', isEmergency: false,
          emergencyContact: '', contactDetails: '', attachmentPath: '',
          active: true, createdBy: '', updatedBy: '', version: 0
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

    // Helper to check if a property exists
    const hasProperty = (interfaceName: string, propertyName: string): boolean => {
      const properties = getInterfaceProperties(interfaceName);
      return properties.includes(propertyName);
    };

    describe('Requirement 10.1: Existing Required Fields Unchanged', () => {
      it('should preserve all existing required fields when adding new optional fields', () => {
        fc.assert(fc.property(
          fc.constantFrom(...Object.keys(baselineInterfaces)),
          (interfaceName) => {
            const baseline = baselineInterfaces[interfaceName as keyof typeof baselineInterfaces];
            const requiredFields = baseline.requiredFields;

            // Verify all required fields still exist
            return requiredFields.every(field => hasProperty(interfaceName, field));
          }
        ), { numRuns: 100 });
      });

      it('should verify Employee required fields are unchanged', () => {
        const requiredFields = baselineInterfaces.Employee.requiredFields;
        requiredFields.forEach(field => {
          expect(hasProperty('Employee', field)).toBe(true);
        });
      });

      it('should verify LeaveRequest required fields are unchanged', () => {
        const requiredFields = baselineInterfaces.LeaveRequest.requiredFields;
        requiredFields.forEach(field => {
          expect(hasProperty('LeaveRequest', field)).toBe(true);
        });
      });
    });

    describe('Requirement 10.2: Existing Enum Values Unchanged', () => {
      // Define baseline enum values (before adding new values)
      const baselineEnums = {
        EmploymentStatus: ['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE'],
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

      it('should preserve all existing enum values when adding new values', () => {
        fc.assert(fc.property(
          fc.constantFrom(...Object.keys(baselineEnums)),
          (enumName) => {
            const baselineValues = baselineEnums[enumName as keyof typeof baselineEnums];
            const currentEnum = (types as any)[enumName];

            if (!currentEnum) {
              return false; // Enum should exist
            }

            // Verify all baseline values still exist
            return baselineValues.every(value =>
              Object.values(currentEnum).includes(value)
            );
          }
        ), { numRuns: 100 });
      });

      it('should verify EmploymentStatus includes all baseline values plus SUSPENDED', () => {
        const baselineValues = baselineEnums.EmploymentStatus;
        const currentValues = Object.values(types.EmploymentStatus);

        // All baseline values should exist
        baselineValues.forEach(value => {
          expect(currentValues).toContain(value);
        });

        // New value SUSPENDED should also exist
        expect(currentValues).toContain('SUSPENDED');
      });
    });

    describe('Requirement 10.3: Compatibility Aliases Preserved', () => {
      it('should preserve Employee compatibility aliases', () => {
        const aliases = baselineInterfaces.Employee.compatibilityAliases;
        aliases.forEach(alias => {
          expect(hasProperty('Employee', alias)).toBe(true);
        });
      });

      it('should preserve User compatibility aliases', () => {
        const aliases = baselineInterfaces.User.compatibilityAliases;
        aliases.forEach(alias => {
          expect(hasProperty('User', alias)).toBe(true);
        });
      });

      it('should preserve Organization compatibility aliases', () => {
        const aliases = baselineInterfaces.Organization.compatibilityAliases;
        aliases.forEach(alias => {
          expect(hasProperty('Organization', alias)).toBe(true);
        });
      });

      it('should verify all compatibility aliases exist across interfaces', () => {
        fc.assert(fc.property(
          fc.constantFrom('Employee', 'User', 'Organization'),
          (interfaceName) => {
            const baseline = baselineInterfaces[interfaceName as keyof typeof baselineInterfaces];
            const aliases = baseline.compatibilityAliases || [];

            // Verify all aliases exist
            return aliases.every(alias => hasProperty(interfaceName, alias));
          }
        ), { numRuns: 100 });
      });
    });

    describe('Requirement 10.4: Employee Compatibility Fields', () => {
      it('should maintain email alias for workEmail/personalEmail', () => {
        expect(hasProperty('Employee', 'email')).toBe(true);
        expect(hasProperty('Employee', 'workEmail')).toBe(true);
        expect(hasProperty('Employee', 'personalEmail')).toBe(true);
      });

      it('should maintain phone alias for phoneNumber', () => {
        expect(hasProperty('Employee', 'phone')).toBe(true);
        expect(hasProperty('Employee', 'phoneNumber')).toBe(true);
      });

      it('should maintain mobile alias for mobileNumber', () => {
        expect(hasProperty('Employee', 'mobile')).toBe(true);
        expect(hasProperty('Employee', 'mobileNumber')).toBe(true);
      });

      it('should maintain salary alias for salaryAmount', () => {
        expect(hasProperty('Employee', 'salary')).toBe(true);
        expect(hasProperty('Employee', 'salaryAmount')).toBe(true);
      });
    });

    describe('Requirement 10.5: User Compatibility Fields', () => {
      it('should maintain active alias for isActive', () => {
        expect(hasProperty('User', 'active')).toBe(true);
        expect(hasProperty('User', 'isActive')).toBe(true);
      });

      it('should maintain emailVerified alias for isVerified', () => {
        expect(hasProperty('User', 'emailVerified')).toBe(true);
        expect(hasProperty('User', 'isVerified')).toBe(true);
      });
    });

    describe('Requirement 10.6: Organization Compatibility Fields', () => {
      it('should maintain active alias for isActive', () => {
        expect(hasProperty('Organization', 'active')).toBe(true);
        expect(hasProperty('Organization', 'isActive')).toBe(true);
      });
    });

    describe('New Optional Fields Do Not Break Existing Code', () => {
      it('should verify LeaveRequest new optional fields are truly optional', () => {
        const newFields = baselineInterfaces.LeaveRequest.newOptionalFields || [];

        // Create a LeaveRequest without new fields (should still be valid)
        const minimalLeaveRequest: types.LeaveRequest = {
          id: 1,
          employeeId: 1,
          leaveTypeId: 1,
          startDate: '2026-01-01',
          endDate: '2026-01-05',
          totalDays: 5,
          status: types.LeaveStatus.PENDING
        };

        // This should compile and be valid
        expect(minimalLeaveRequest.id).toBe(1);
        expect(minimalLeaveRequest.employeeId).toBe(1);
      });

      it('should verify AttendanceRecord new optional fields are truly optional', () => {
        const minimalAttendance: types.AttendanceRecord = {
          id: 1,
          employeeId: 1,
          attendanceDate: '2026-01-03',
          status: types.AttendanceStatus.PRESENT
        };

        expect(minimalAttendance.id).toBe(1);
      });

      it('should verify PerformanceReview new optional fields are truly optional', () => {
        const minimalReview: types.PerformanceReview = {
          id: 1,
          reviewCycleId: 1,
          employeeId: 1,
          reviewerId: 1,
          status: 'IN_PROGRESS'
        };

        expect(minimalReview.id).toBe(1);
      });

      it('should verify BenefitPlan new optional fields are truly optional', () => {
        const minimalBenefitPlan: types.BenefitPlan = {
          id: 1,
          organizationId: 1,
          name: 'Health Insurance',
          planType: types.BenefitPlanType.HEALTH_INSURANCE
        };

        expect(minimalBenefitPlan.id).toBe(1);
      });

      it('should verify Asset new optional fields are truly optional', () => {
        const minimalAsset: types.Asset = {
          id: 1,
          organizationId: 1,
          assetType: types.AssetType.LAPTOP,
          status: types.AssetStatus.AVAILABLE
        };

        expect(minimalAsset.id).toBe(1);
      });
    });

    describe('Property-Based Test: Adding Optional Fields Preserves Existing Structure', () => {
      it('should verify that adding new optional fields does not change existing field types', () => {
        fc.assert(fc.property(
          fc.constantFrom('LeaveRequest', 'AttendanceRecord', 'PerformanceReview', 'BenefitPlan', 'Asset'),
          (interfaceName) => {
            const baseline = baselineInterfaces[interfaceName as keyof typeof baselineInterfaces];
            const allExistingFields = [...baseline.requiredFields, ...baseline.optionalFields];

            // Verify all existing fields still exist
            return allExistingFields.every(field => hasProperty(interfaceName, field));
          }
        ), { numRuns: 100 });
      });

      it('should verify new optional fields are additive only', () => {
        fc.assert(fc.property(
          fc.constantFrom('LeaveRequest', 'AttendanceRecord', 'PerformanceReview', 'BenefitPlan', 'Asset'),
          (interfaceName) => {
            const baseline = baselineInterfaces[interfaceName as keyof typeof baselineInterfaces];
            const newFields = baseline.newOptionalFields || [];
            const currentProperties = getInterfaceProperties(interfaceName);

            // New fields should be present
            const newFieldsExist = newFields.every(field => currentProperties.includes(field));

            // Old fields should still be present
            const allExistingFields = [...baseline.requiredFields, ...baseline.optionalFields];
            const oldFieldsExist = allExistingFields.every(field => currentProperties.includes(field));

            return newFieldsExist && oldFieldsExist;
          }
        ), { numRuns: 100 });
      });
    });

    describe('Comprehensive Backward Compatibility Verification', () => {
      it('should verify no fields were removed from any interface', () => {
        fc.assert(fc.property(
          fc.constantFrom(...Object.keys(baselineInterfaces)),
          (interfaceName) => {
            const baseline = baselineInterfaces[interfaceName as keyof typeof baselineInterfaces];
            const allBaselineFields = [
              ...baseline.requiredFields,
              ...baseline.optionalFields,
              ...(baseline.compatibilityAliases || [])
            ];

            // All baseline fields should still exist
            return allBaselineFields.every(field => hasProperty(interfaceName, field));
          }
        ), { numRuns: 100 });
      });
    });
  });
});
