// ============================================================================
// CORE ENTITY TYPES
// ============================================================================

export interface Employee {
  id: number;
  employeeNumber: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  fullName: string;
  dateOfBirth?: string;
  gender?: Gender;
  nationality?: string;
  maritalStatus?: MaritalStatus;
  personalEmail?: string;
  workEmail?: string;
  phoneNumber?: string;
  mobileNumber?: string;
  panNumber?: string;
  aadhaarNumber?: string;
  uanNumber?: string;
  esicNumber?: string;
  pfNumber?: string;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  hireDate: string;
  terminationDate?: string;
  probationEndDate?: string;
  jobTitle?: string;
  jobLevel?: string;
  /**
   * Salary amount in the specified currency
   * @precision 2 decimal places (matches database decimal(15,2))
   * @database salary_amount (decimal(15,2))
   */
  salaryAmount?: number;
  salaryCurrency?: string;
  payFrequency?: PayFrequency;
  profilePictureUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;

  // Organization details
  organizationId: number;
  organizationName?: string;

  // Department details
  departmentId?: number;
  departmentName?: string;
  departmentCode?: string;

  // Location details
  locationId?: number;
  locationName?: string;

  // Manager details
  managerId?: number;
  managerName?: string;
  managerEmployeeNumber?: string;

  // User account details
  userId?: number;
  username?: string;

  /**
   * Computed email field (frontend-only)
   * @database Not a database column - computed from workEmail or personalEmail
   */
  email?: string;

  /**
   * Phone number alias (frontend-only)
   * @database Not a database column - alias for phoneNumber
   */
  phone?: string;

  /**
   * Mobile number alias (frontend-only)
   * @database Not a database column - alias for mobileNumber
   */
  mobile?: string;

  /**
   * Salary alias (frontend-only)
   * @database Not a database column - alias for salaryAmount
   */
  salary?: number;
}

// ============================================================================
// ORGANIZATION DOMAIN
// ============================================================================

export interface Organization {
  id: number;
  name: string;
  legalName?: string;
  taxId?: string;
  industry?: string;
  companySize?: CompanySize;
  headquartersCountry?: string;
  logoUrl?: string;
  website?: string;
  isActive: boolean;
  subscriptionTier?: SubscriptionTier;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;

  /**
   * Active status alias (frontend-only)
   * @database Not a database column - alias for isActive
   */
  active?: boolean;
}

export interface Department {
  id: number;
  organizationId: number;
  name: string;
  code?: string;
  description?: string;
  parentDepartmentId?: number;
  managerId?: number;
  costCenter?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: number;
  organizationId: number;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  timezone?: string;
  isHeadquarters: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ACCESS CONTROL DOMAIN (RBAC)
// ============================================================================

export interface User {
  id: number;
  organizationId: number;
  email: string;
  username?: string;
  isActive: boolean;
  isVerified: boolean;
  lastLoginAt?: string;
  failedLoginAttempts?: number;
  lockedUntil?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  organizationName?: string;
  roles: RoleInfo[];

  // Spring Security fields (aligned with backend User entity)
  accountExpired?: boolean;
  accountLocked?: boolean;
  credentialsExpired?: boolean;
  mustChangePassword?: boolean;
  passwordChangedAt?: string;

  /**
   * Active status alias (frontend-only)
   * @database Not a database column - alias for isActive
   */
  active?: boolean;

  /**
   * Email verified alias (frontend-only)
   * @database Not a database column - alias for isVerified
   */
  emailVerified?: boolean;
}

export interface RoleInfo {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
  assignedAt: string;
}

export interface Role {
  id: number;
  organizationId: number;
  name: string;
  code: string;
  description?: string;
  isSystemRole: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[];
}

export interface Permission {
  id: number;
  name: string;
  code: string;
  category?: string;
  description?: string;
  createdAt: string;
}

export interface UserRole {
  id: number;
  userId: number;
  roleId: number;
  assignedBy?: string;
  assignedAt: string;
  active?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  version?: number;
  expiresAt?: string;
  isPrimaryRole?: boolean;
}

export interface RolePermission {
  id: number;
  roleId: number;
  permissionId: number;
  grantedAt: string;
  grantedBy?: string;
  active?: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
  version?: number;
  expiresAt?: string;
}

// ============================================================================
// ATTENDANCE DOMAIN
// ============================================================================

export interface AttendanceRecord {
  id: number;
  employeeId: number;
  attendanceDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  /**
   * Total hours worked
   * @precision 2 decimal places (matches database decimal(5,2))
   * @database total_hours (decimal(5,2))
   */
  totalHours?: number;
  /**
   * Overtime hours worked
   * @precision 2 decimal places (matches database decimal(5,2))
   * @database overtime_hours (decimal(5,2))
   */
  overtimeHours?: number;
  /**
   * Break hours taken
   * @precision 2 decimal places (matches database decimal(5,2))
   * @database break_hours (decimal(5,2))
   */
  breakHours?: number;
  status: AttendanceStatus;
  locationId?: number;
  checkInLocation?: string;
  checkOutLocation?: string;
  notes?: string;
  approvedBy?: number;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;

  /**
   * Soft delete flag
   * @database active (bit(1)) - converted from bit(1) to boolean
   */
  active?: boolean | undefined;

  /**
   * User who created the record
   * @database created_by (varchar(255))
   */
  createdBy?: string | undefined;

  /**
   * User who last updated the record
   * @database updated_by (varchar(255))
   */
  updatedBy?: string | undefined;

  /**
   * Version number for optimistic locking
   * @database version (bigint)
   */
  version?: number | undefined;
}

export interface Shift {
  id: number;
  organizationId: number;
  name?: string;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  isNightShift: boolean;
  createdAt: string;
}

export interface Holiday {
  id: number;
  organizationId: number;
  holidayDate: string;
  name?: string;
  holidayType: HolidayType;
  isOptional: boolean;
  createdAt: string;
}

export interface EmployeeShift {
  id: number;
  employeeId: number;
  shiftId: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveCalendar {
  id: number;
  organizationId: number;
  calendarDate: string;
  dayType: DayType;
  holidayId?: number;
  createdAt: string;
}

// ============================================================================
// LEAVE MANAGEMENT DOMAIN
// ============================================================================

export interface LeaveRequest {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  /**
   * Total days of leave requested
   * @precision 2 decimal places (matches database decimal(5,2))
   * @database total_days (decimal(5,2))
   */
  totalDays: number;
  reason?: string;
  status: LeaveStatus;
  reviewedBy?: number;
  reviewedAt?: string;
  reviewComments?: string;
  createdAt: string;
  updatedAt: string;

  /**
   * Indicates if this is a half-day leave
   * @database is_half_day (bit(1)) - converted from bit(1) to boolean
   */
  isHalfDay?: boolean;

  /**
   * Specifies AM or PM for half-day leave
   * @database half_day_period (varchar(10))
   */
  halfDayPeriod?: string;

  /**
   * Indicates if this is an emergency leave
   * @database is_emergency (bit(1)) - converted from bit(1) to boolean
   */
  isEmergency?: boolean;

  /**
   * Emergency contact person name
   * @database emergency_contact (varchar(255))
   */
  emergencyContact?: string;

  /**
   * Contact details during leave
   * @database contact_details (varchar(255))
   */
  contactDetails?: string;

  /**
   * Path to attachment file
   * @database attachment_path (varchar(500))
   */
  attachmentPath?: string;

  /**
   * Soft delete flag
   * @database active (bit(1)) - converted from bit(1) to boolean
   */
  active?: boolean | undefined;

  /**
   * User who created the record
   * @database created_by (varchar(255))
   */
  createdBy?: string | undefined;

  /**
   * User who last updated the record
   * @database updated_by (varchar(255))
   */
  updatedBy?: string | undefined;

  /**
   * Version number for optimistic locking
   * @database version (bigint)
   */
  version?: number | undefined;

  // Populated fields from relationships
  employee?: Employee;
  leaveType?: LeaveType;
  reviewer?: Employee;
}

export interface LeaveType {
  id: number;
  organizationId: number;
  name: string;
  code: string;
  description?: string;
  isPaid: boolean;
  maxDaysPerYear?: number;
  accrualRate?: number;
  requiresApproval: boolean;
  allowNegativeBalance: boolean;
  isActive: boolean;
  // DB columns: category, is_carry_forward, max_carry_forward_days
  category?: LeaveTypeCategory;
  isCarryForward?: boolean;
  maxCarryForwardDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  year: number;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number; // Computed field
  carriedForwardDays: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// DOCUMENT MANAGEMENT DOMAIN
// ============================================================================

export interface Document {
  id: number;
  organizationId: number;
  employeeId?: number;
  documentType: DocumentType;
  title: string;
  description?: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  fileUrl: string;
  storagePath?: string;
  version: number;
  isConfidential: boolean;
  requiresSignature: boolean;
  signedAt?: string;
  signedBy?: number;
  issueDate?: string;
  expiryDate?: string;
  isPublic: boolean;
  uploadedBy?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// COMPLIANCE DOMAIN
// ============================================================================

export interface ComplianceJurisdiction {
  id: number;
  countryCode: string;
  stateProvinceCode?: string;
  name: string;
  jurisdictionType: JurisdictionType;
  parentJurisdictionId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceRule {
  id: number;
  jurisdictionId: number;
  ruleCategory: ComplianceRuleCategory;
  ruleName: string;
  description?: string;
  ruleData?: any;
  effectiveDate?: string;
  expiryDate?: string;
  sourceUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceCheck {
  id: number;
  organizationId: number;
  employeeId?: number;
  ruleId: number;
  checkDate: string;
  status: ComplianceCheckStatus;
  violationDetails?: any;
  severity: ComplianceSeverity;
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: number;
  resolutionNotes?: string;
  createdAt: string;
}

// ============================================================================
// PERFORMANCE MANAGEMENT DOMAIN
// ============================================================================

export interface PerformanceReviewCycle {
  id: number;
  organizationId: number;
  name: string;
  reviewType: ReviewType;
  startDate: string;
  endDate: string;
  selfReviewDeadline?: string;
  managerReviewDeadline?: string;
  status: ReviewCycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceReview {
  id: number;
  reviewCycleId: number;
  employeeId: number;
  reviewerId: number;
  reviewType: PerformanceReviewType;
  /**
   * Overall performance rating
   * @precision 2 decimal places (matches database decimal(3,2))
   * @database overall_rating (decimal(3,2))
   */
  overallRating?: number;
  strengths?: string;
  areasForImprovement?: string;
  achievements?: string;
  goalsNextPeriod?: string;
  status: PerformanceReviewStatus;
  submittedAt?: string;
  acknowledgedAt?: string;
  createdAt: string;
  updatedAt: string;

  /**
   * Soft delete flag
   * @database active (bit(1)) - converted from bit(1) to boolean
   */
  active?: boolean | undefined;

  /**
   * User who created the record
   * @database created_by (varchar(255))
   */
  createdBy?: string | undefined;

  /**
   * User who last updated the record
   * @database updated_by (varchar(255))
   */
  updatedBy?: string | undefined;

  /**
   * Version number for optimistic locking
   * @database version (bigint)
   */
  version?: number | undefined;
}

export interface Goal {
  id: number;
  employeeId: number;
  title: string;
  description?: string;
  goalType: GoalType;
  category: GoalCategory;
  startDate?: string;
  targetDate?: string;
  completionDate?: string;
  progressPercentage: number;
  status: GoalStatus;
  weight?: number;
  measurementCriteria?: string;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// SKILLS & TRAINING DOMAIN
// ============================================================================

export interface Skill {
  id: number;
  name: string;
  category?: string;
  description?: string;
  createdAt: string;
}

export interface EmployeeSkill {
  id: number;
  employeeId: number;
  skillId: number;
  proficiencyLevel: ProficiencyLevel;
  yearsOfExperience?: number;
  lastUsedYear?: number;
  verifiedBy?: number;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingProgram {
  id: number;
  organizationId: number;
  title: string;
  description?: string;
  trainingType: TrainingType;
  deliveryMethod: DeliveryMethod;
  durationHours?: number;
  costPerParticipant?: number;
  maxParticipants?: number;
  provider?: string;
  externalUrl?: string;
  isMandatory: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrainingEnrollment {
  id: number;
  trainingProgramId: number;
  employeeId: number;
  enrolledDate: string;
  startDate?: string;
  completionDate?: string;
  dueDate?: string;
  status: TrainingEnrollmentStatus;
  score?: number;
  passingScore?: number;
  certificateUrl?: string;
  assignedBy?: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// BENEFITS ADMINISTRATION DOMAIN
// ============================================================================

export interface BenefitPlan {
  id: number;
  organizationId: number;
  name: string;
  planType: BenefitPlanType;
  description?: string;
  provider?: string;
  /**
   * Cost to employee per period
   * @precision 2 decimal places (matches database decimal(10,2))
   * @database employee_cost (decimal(10,2))
   */
  employeeCost?: number;
  /**
   * Cost to employer per period
   * @precision 2 decimal places (matches database decimal(10,2))
   * @database employer_cost (decimal(10,2))
   */
  employerCost?: number;
  costFrequency: CostFrequency;
  isActive: boolean;
  effectiveDate?: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;

  /**
   * Soft delete flag
   * @database active (bit(1)) - converted from bit(1) to boolean
   */
  active?: boolean | undefined;

  /**
   * User who created the record
   * @database created_by (varchar(255))
   */
  createdBy?: string | undefined;

  /**
   * User who last updated the record
   * @database updated_by (varchar(255))
   */
  updatedBy?: string | undefined;

  /**
   * Version number for optimistic locking
   * @database version (bigint)
   */
  version?: number | undefined;
}

export interface EmployeeBenefit {
  id: number;
  employeeId: number;
  benefitPlanId: number;
  enrollmentDate: string;
  effectiveDate: string;
  terminationDate?: string;
  status: BenefitStatus;
  coverageLevel: CoverageLevel;
  beneficiaries?: any;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ASSET MANAGEMENT DOMAIN
// ============================================================================

export interface Asset {
  id: number;
  organizationId: number;
  assetType: AssetType;
  assetTag?: string;
  serialNumber?: string;
  status: AssetStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface AssetAssignment {
  id: number;
  assetId: number;
  employeeId: number;
  assignedDate?: string;
  returnedDate?: string;
}

// ============================================================================
// FINANCE DOMAIN
// ============================================================================

export interface Expense {
  id: number;
  employeeId: number;
  expenseType: ExpenseType;
  /**
   * Expense amount
   * @precision 2 decimal places (matches database decimal(15,2))
   * @database amount (decimal(15,2))
   */
  amount?: number;
  expenseDate?: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  approvedBy?: number;
  createdAt: string;
}

export interface BankDetails {
  id: number;
  employeeId: number;
  bankName: string;
  accountNumber: string;
  ifscCode?: string;
  branchName?: string;
  accountType: BankAccountType;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payslip {
  id: number;
  payrollItemId: number;
  employeeId: number;
  payslipMonth: string;
  pdfUrl: string;
  generatedAt: string;
}

/**
 * Represents a payroll processing run
 * @database payroll_runs table
 */
export interface PayrollRun {
  /**
   * Unique identifier
   * @database payroll_run_id (bigint)
   */
  id: number;

  /**
   * Organization identifier
   * @database organization_id (bigint)
   */
  organizationId: number;

  /**
   * Payroll run name
   * @database name (varchar(255))
   */
  name: string;

  /**
   * Start date of the pay period
   * @database pay_period_start (date)
   */
  payPeriodStart: string;

  /**
   * End date of the pay period
   * @database pay_period_end (date)
   */
  payPeriodEnd: string;

  /**
   * Date when payment is made
   * @database pay_date (date)
   */
  payDate: string;

  /**
   * Current status of the payroll run
   * @database status (enum)
   */
  status: PayrollRunStatus;

  /**
   * Employee ID who processed the payroll
   * @database processed_by (bigint)
   */
  processedBy?: number;

  /**
   * Timestamp when payroll was processed
   * @database processed_at (datetime(6))
   */
  processedAt?: string;

  /**
   * Employee ID who approved the payroll
   * @database approved_by (bigint)
   */
  approvedBy?: number;

  /**
   * Timestamp when payroll was approved
   * @database approved_at (timestamp)
   */
  approvedAt?: string;

  /**
   * User who paid the payroll
   * @database paid_by (varchar(255))
   */
  paidBy?: string;

  /**
   * Timestamp when payroll was paid
   * @database paid_at (datetime(6))
   */
  paidAt?: string;

  /**
   * Total gross pay for all employees
   * @precision 2 decimal places (matches database decimal(15,2))
   * @database total_gross (decimal(15,2))
   */
  totalGross?: number;

  /**
   * Total deductions for all employees
   * @precision 2 decimal places (matches database decimal(15,2))
   * @database total_deductions (decimal(15,2))
   */
  totalDeductions?: number;

  /**
   * Total net pay for all employees
   * @precision 2 decimal places (matches database decimal(15,2))
   * @database total_net (decimal(15,2))
   */
  totalNet?: number;

  /**
   * Total gross pay (alias for totalGross)
   * @precision 2 decimal places (matches database decimal(15,2))
   * @database total_gross_pay (decimal(15,2))
   */
  totalGrossPay?: number;

  /**
   * Total net pay (alias for totalNet)
   * @precision 2 decimal places (matches database decimal(15,2))
   * @database total_net_pay (decimal(15,2))
   */
  totalNetPay?: number;

  /**
   * Total taxes for all employees
   * @precision 2 decimal places (matches database decimal(15,2))
   * @database total_taxes (decimal(15,2))
   */
  totalTaxes?: number;

  /**
   * Description of the payroll run
   * @database description (varchar(255))
   */
  description?: string;

  /**
   * Notes about the payroll run
   * @database notes (varchar(255))
   */
  notes?: string;

  /**
   * Number of employees in this payroll run
   * @database employee_count (int)
   */
  employeeCount?: number;

  /**
   * External payroll system identifier
   * @database external_payroll_id (varchar(255))
   */
  externalPayrollId?: string;

  /**
   * Timestamp when record was created
   * @database created_at (timestamp)
   */
  createdAt: string;

  /**
   * Timestamp when record was last updated
   * @database updated_at (timestamp)
   */
  updatedAt: string;

  /**
   * Soft delete flag
   * @database active (bit(1))
   */
  active?: boolean;

  /**
   * User who created the record
   * @database created_by (varchar(255))
   */
  createdBy?: string;

  /**
   * User who last updated the record
   * @database updated_by (varchar(255))
   */
  updatedBy?: string;

  /**
   * Version number for optimistic locking
   * @database version (bigint)
   */
  version?: number;
}

// ============================================================================
// EMPLOYEE PERSONAL INFORMATION DOMAIN
// ============================================================================

export interface EmployeeAddress {
  id: number;
  employeeId: number;
  addressType: AddressType;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum AddressType {
  HOME = 'HOME',
  WORK = 'WORK',
  MAILING = 'MAILING',
  OTHER = 'OTHER'
}

export interface EmergencyContact {
  id: number;
  employeeId: number;
  name: string;
  relationship?: string;
  phoneNumber: string;
  alternatePhone?: string;
  email?: string;
  address?: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// EMPLOYEE LIFECYCLE DOMAIN
// ============================================================================

export interface EmployeeExit {
  id: number;
  employeeId: number;
  resignationDate?: string;
  lastWorkingDay?: string;
  exitReason?: string;
  status: ExitStatus;
  approvedBy?: number;
  createdAt: string;
}

export interface EmploymentHistory {
  id: number;
  employeeId: number;
  departmentId?: number;
  jobTitle?: string;
  jobLevel?: string;
  managerId?: number;
  salaryAmount?: number;
  effectiveFrom: string;
  effectiveTo?: string;
  reason: EmploymentHistoryReason;
  createdAt: string;
}

// ============================================================================
// SYSTEM INFRASTRUCTURE DOMAIN
// ============================================================================

export interface AuditLog {
  id: number;
  organizationId: number;
  userId?: number;
  entityType: string;
  entityId: number;
  action: AuditAction;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

export interface SystemNotification {
  id: number;
  organizationId: number;
  userId?: number;
  notificationType: NotificationType;
  title: string;
  message: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: string;
  expiresAt?: string;
  createdAt: string;
}

// ============================================================================
// ENUMS
// ============================================================================

// Core Enums
export enum EmploymentStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  TERMINATED = 'TERMINATED',
  ON_LEAVE = 'ON_LEAVE',
  SUSPENDED = 'SUSPENDED',
  PROBATION = 'PROBATION',
  NOTICE_PERIOD = 'NOTICE_PERIOD'
}

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERN = 'INTERN',
  TEMPORARY = 'TEMPORARY'
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  NON_BINARY = 'NON_BINARY',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
  OTHER = 'OTHER'
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  MARRIED = 'MARRIED',
  DIVORCED = 'DIVORCED',
  WIDOWED = 'WIDOWED',
  SEPARATED = 'SEPARATED'
}

export enum PayFrequency {
  HOURLY = 'HOURLY',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  BI_WEEKLY = 'BI_WEEKLY',
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY'
}

export enum CompanySize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE'
}

export enum SubscriptionTier {
  STARTER = 'STARTER',
  PROFESSIONAL = 'PROFESSIONAL',
  ENTERPRISE = 'ENTERPRISE'
}

// Attendance Enums
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE',
  HOLIDAY = 'HOLIDAY',
  WEEKEND = 'WEEKEND',
  WORK_FROM_HOME = 'WORK_FROM_HOME',
  OVERTIME = 'OVERTIME',
  COMP_OFF = 'COMP_OFF'
}

export enum HolidayType {
  NATIONAL = 'NATIONAL',
  OPTIONAL = 'OPTIONAL',
  COMPANY = 'COMPANY'
}

export enum DayType {
  WORKING = 'WORKING',
  HOLIDAY = 'HOLIDAY',
  WEEKEND = 'WEEKEND'
}

// Leave Enums
export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  WITHDRAWN = 'WITHDRAWN',
  EXPIRED = 'EXPIRED'
}

export enum LeaveTypeCategory {
  ANNUAL = 'ANNUAL',
  BEREAVEMENT = 'BEREAVEMENT',
  COMPENSATORY = 'COMPENSATORY',
  EMERGENCY = 'EMERGENCY',
  MATERNITY = 'MATERNITY',
  PAID = 'PAID',
  PATERNITY = 'PATERNITY',
  PERSONAL = 'PERSONAL',
  SABBATICAL = 'SABBATICAL',
  SICK = 'SICK',
  STUDY = 'STUDY',
  UNPAID = 'UNPAID'
}

// Document Enums
export enum DocumentType {
  CONTRACT = 'CONTRACT',
  POLICY = 'POLICY',
  CERTIFICATE = 'CERTIFICATE',
  ID_PROOF = 'ID_PROOF',
  RESUME = 'RESUME',
  PERFORMANCE_REVIEW = 'PERFORMANCE_REVIEW',
  OTHER = 'OTHER'
}

// Compliance Enums
export enum JurisdictionType {
  COUNTRY = 'COUNTRY',
  STATE = 'STATE',
  PROVINCE = 'PROVINCE',
  REGION = 'REGION',
  CITY = 'CITY'
}

export enum ComplianceRuleCategory {
  WORKING_HOURS = 'WORKING_HOURS',
  OVERTIME = 'OVERTIME',
  MINIMUM_WAGE = 'MINIMUM_WAGE',
  LEAVE_ENTITLEMENT = 'LEAVE_ENTITLEMENT',
  SAFETY = 'SAFETY',
  DATA_PRIVACY = 'DATA_PRIVACY',
  DISCRIMINATION = 'DISCRIMINATION',
  OTHER = 'OTHER'
}

export enum ComplianceCheckStatus {
  COMPLIANT = 'COMPLIANT',
  NON_COMPLIANT = 'NON_COMPLIANT',
  WARNING = 'WARNING',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED'
}

export enum ComplianceSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

// Performance Enums
export enum ReviewType {
  ANNUAL = 'ANNUAL',
  SEMI_ANNUAL = 'SEMI_ANNUAL',
  QUARTERLY = 'QUARTERLY',
  PROBATION = 'PROBATION',
  PROJECT_BASED = 'PROJECT_BASED'
}

export enum ReviewCycleStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum PerformanceReviewType {
  SELF = 'SELF',
  MANAGER = 'MANAGER',
  PEER = 'PEER',
  THREE_SIXTY = '360'
}

export enum PerformanceReviewStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  ACKNOWLEDGED = 'ACKNOWLEDGED'
}

export enum GoalType {
  INDIVIDUAL = 'INDIVIDUAL',
  TEAM = 'TEAM',
  DEPARTMENTAL = 'DEPARTMENTAL',
  ORGANIZATIONAL = 'ORGANIZATIONAL'
}

export enum GoalCategory {
  PERFORMANCE = 'PERFORMANCE',
  DEVELOPMENT = 'DEVELOPMENT',
  BEHAVIORAL = 'BEHAVIORAL',
  PROJECT = 'PROJECT'
}

export enum GoalStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DEFERRED = 'DEFERRED'
}

// Skills & Training Enums
export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum TrainingType {
  ONBOARDING = 'ONBOARDING',
  COMPLIANCE = 'COMPLIANCE',
  TECHNICAL = 'TECHNICAL',
  SOFT_SKILLS = 'SOFT_SKILLS',
  LEADERSHIP = 'LEADERSHIP',
  SAFETY = 'SAFETY'
}

export enum DeliveryMethod {
  ONLINE = 'ONLINE',
  IN_PERSON = 'IN_PERSON',
  HYBRID = 'HYBRID',
  SELF_PACED = 'SELF_PACED'
}

export enum TrainingEnrollmentStatus {
  ENROLLED = 'ENROLLED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED'
}

// Benefits Enums
export enum BenefitPlanType {
  HEALTH_INSURANCE = 'HEALTH_INSURANCE',
  DENTAL = 'DENTAL',
  VISION = 'VISION',
  LIFE_INSURANCE = 'LIFE_INSURANCE',
  RETIREMENT = 'RETIREMENT',
  STOCK_OPTIONS = 'STOCK_OPTIONS',
  OTHER = 'OTHER'
}

export enum BenefitStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  TERMINATED = 'TERMINATED',
  SUSPENDED = 'SUSPENDED'
}

export enum CoverageLevel {
  EMPLOYEE_ONLY = 'EMPLOYEE_ONLY',
  EMPLOYEE_SPOUSE = 'EMPLOYEE_SPOUSE',
  EMPLOYEE_CHILDREN = 'EMPLOYEE_CHILDREN',
  FAMILY = 'FAMILY'
}

export enum CostFrequency {
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY',
  PER_PAY_PERIOD = 'PER_PAY_PERIOD'
}

// Asset Enums
export enum AssetType {
  LAPTOP = 'LAPTOP',
  ID_CARD = 'ID_CARD',
  MOBILE = 'MOBILE',
  OTHER = 'OTHER'
}

export enum AssetStatus {
  AVAILABLE = 'AVAILABLE',
  ASSIGNED = 'ASSIGNED',
  DAMAGED = 'DAMAGED',
  RETIRED = 'RETIRED'
}

// Finance Enums
export enum ExpenseType {
  TRAVEL = 'TRAVEL',
  FOOD = 'FOOD',
  ACCOMMODATION = 'ACCOMMODATION',
  OFFICE = 'OFFICE',
  OTHER = 'OTHER'
}

export enum ExpenseStatus {
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID'
}

export enum BankAccountType {
  SAVINGS = 'SAVINGS',
  CURRENT = 'CURRENT',
  SALARY = 'SALARY'
}

/**
 * Payroll run status values
 * @database Matches payroll_runs.status enum
 */
export enum PayrollRunStatus {
  DRAFT = 'DRAFT',
  PROCESSING = 'PROCESSING',
  PROCESSED = 'PROCESSED',
  CALCULATED = 'CALCULATED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED',
  ERROR = 'ERROR'
}

// Employee Lifecycle Enums
export enum ExitStatus {
  INITIATED = 'INITIATED',
  APPROVED = 'APPROVED',
  WITHDRAWN = 'WITHDRAWN',
  COMPLETED = 'COMPLETED'
}

export enum EmploymentHistoryReason {
  JOINING = 'JOINING',
  PROMOTION = 'PROMOTION',
  TRANSFER = 'TRANSFER',
  SALARY_REVISION = 'SALARY_REVISION',
  ROLE_CHANGE = 'ROLE_CHANGE'
}

// System Enums
export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  VIEW = 'VIEW',
  EXPORT = 'EXPORT',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT'
}

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  COMPLIANCE_ALERT = 'COMPLIANCE_ALERT',
  APPROVAL_REQUEST = 'APPROVAL_REQUEST'
}

// API types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: FieldError[];
  fieldErrors?: Record<string, string>;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  direction?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Authentication types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface JwtResponse {
  token: string;
  type: string;
  userId: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  expiresAt: string;
  organizationId: number;
  organizationName: string;
  refreshToken?: string;
}

// Form types
export interface EmployeeFormData {
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  departmentId?: number;
  jobTitle: string;
  employmentStatus: EmploymentStatus;
  employmentType: EmploymentType;
  hireDate: string;
  managerId?: number;
}

export interface LeaveRequestFormData {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
}