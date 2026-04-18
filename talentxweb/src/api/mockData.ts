// frontend/src/api/mockData.ts
// Mock data for frontend development when backend is unavailable

// ✅ Import DTOs from their actual sources
import { EmployeeResponse } from "./employeeApi";
import { AssetDTO, AssetAssignmentDTO } from "./assetApi";
import { ShiftDTO, EmployeeShiftDTO } from "./shiftApi";
import { DepartmentDTO } from "./departmentApi";
import { LocationDTO } from "./locationApi";
import { HolidayDTO } from "./holidayApi";
import { OrganizationDTO } from "./organizationApi";
import { RoleDTO } from "./roleApi";
import { UserDTO } from "./userApi";
import { LeaveRequestResponseDTO, LeaveBalanceDTO } from "./leaveApi";
import { AttendanceRecordDTO } from "./attendanceApi";

import {
  EmploymentStatus,
  EmploymentType,
  Gender,
  MaritalStatus,
  PayFrequency,
  AssetType,
  AssetStatus,
  PaginatedResponse,
  LeaveStatus,
  AttendanceStatus,
  LeaveType
} from "../types";

// --------------------
// Mock Employees
// --------------------
export const mockEmployees: EmployeeResponse[] = [
  {
    id: 1,
    organizationId: 1,
    employeeNumber: "EMP001",
    firstName: "Ashish",
    lastName: "Kumar Ray",
    fullName: "Ashish Kumar Ray",
    workEmail: "ashish.ray@company.com",
    phoneNumber: "+91-9876543210",
    employmentStatus: "ACTIVE" as EmploymentStatus,
    employmentType: "FULL_TIME" as EmploymentType,
    departmentId: 1,
    departmentName: "Engineering",
    departmentCode: "ENG",
    jobTitle: "Senior Software Engineer",
    jobLevel: "L5",
    salaryAmount: 1800000,
    salaryCurrency: "INR",
    payFrequency: "MONTHLY" as PayFrequency,
    hireDate: "2020-01-15",
    dateOfBirth: "1990-05-20",
    gender: "MALE" as Gender,
    nationality: "IN",
    maritalStatus: "MARRIED" as MaritalStatus,
    locationId: 1,
    locationName: "Pune Office",
    profilePictureUrl: "https://i.pravatar.cc/150?img=1",
    createdAt: "2020-01-15T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    email: "ashish.ray@company.com",
    phone: "+91-9876543210",
    salary: 1800000
  },
  {
    id: 2,
    organizationId: 1,
    employeeNumber: "EMP002",
    firstName: "Priya",
    lastName: "Sharma",
    fullName: "Priya Sharma",
    workEmail: "priya.sharma@company.com",
    phoneNumber: "+91-9876543211",
    employmentStatus: "ACTIVE" as EmploymentStatus,
    employmentType: "FULL_TIME" as EmploymentType,
    departmentId: 2,
    departmentName: "Human Resources",
    departmentCode: "HR",
    managerId: 1,
    managerName: "Ashish Kumar Ray",
    jobTitle: "HR Manager",
    jobLevel: "L4",
    salaryAmount: 1400000,
    salaryCurrency: "INR",
    payFrequency: "MONTHLY" as PayFrequency,
    hireDate: "2019-03-10",
    dateOfBirth: "1988-08-15",
    gender: "FEMALE" as Gender,
    nationality: "IN",
    maritalStatus: "SINGLE" as MaritalStatus,
    locationId: 1,
    locationName: "Pune Office",
    profilePictureUrl: "https://i.pravatar.cc/150?img=5",
    createdAt: "2019-03-10T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    email: "priya.sharma@company.com",
    phone: "+91-9876543211",
    salary: 1400000
  },
  {
    id: 3,
    organizationId: 1,
    employeeNumber: "EMP003",
    firstName: "Rajesh",
    lastName: "Patel",
    fullName: "Rajesh Patel",
    workEmail: "rajesh.patel@company.com",
    phoneNumber: "+91-9876543212",
    employmentStatus: "SUSPENDED" as EmploymentStatus,
    employmentType: "FULL_TIME" as EmploymentType,
    departmentId: 1,
    departmentName: "Engineering",
    departmentCode: "ENG",
    managerId: 1,
    managerName: "Ashish Kumar Ray",
    jobTitle: "Software Engineer",
    jobLevel: "L3",
    salaryAmount: 1200000,
    salaryCurrency: "INR",
    payFrequency: "MONTHLY" as PayFrequency,
    hireDate: "2021-06-01",
    dateOfBirth: "1992-03-10",
    gender: "MALE" as Gender,
    nationality: "IN",
    maritalStatus: "SINGLE" as MaritalStatus,
    locationId: 1,
    locationName: "Pune Office",
    profilePictureUrl: "https://i.pravatar.cc/150?img=3",
    createdAt: "2021-06-01T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    email: "rajesh.patel@company.com",
    phone: "+91-9876543212",
    salary: 1200000
  }
];

// --------------------
// Mock Assets
// --------------------
export const mockAssets: AssetDTO[] = [
  {
    id: 1,
    organizationId: 1,
    assetType: "LAPTOP" as AssetType,
    assetTag: "LAP-001",
    serialNumber: "SN123456789",
    status: "ASSIGNED" as AssetStatus,
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z"
  },
  {
    id: 2,
    organizationId: 1,
    assetType: "MONITOR" as AssetType,
    assetTag: "MON-001",
    serialNumber: "SN987654321",
    status: "AVAILABLE" as AssetStatus,
    createdAt: "2023-01-15T10:00:00Z",
    updatedAt: "2023-01-15T10:00:00Z"
  }
];

// --------------------
// Mock Asset Assignments
// --------------------
export const mockAssetAssignments: AssetAssignmentDTO[] = [
  {
    id: 1,
    assetId: 1,
    employeeId: 1,
    assignedDate: "2023-01-20"
  },
  {
    id: 2,
    assetId: 3,
    employeeId: 2,
    assignedDate: "2023-02-05"
  }
];

// --------------------
// Mock Shifts
// --------------------
export const mockShifts: ShiftDTO[] = [
  {
    id: 1,
    organizationId: 1,
    name: "Morning Shift",
    startTime: "09:00",
    endTime: "17:00",
    breakMinutes: 60,
    isNightShift: false,
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    organizationId: 1,
    name: "Evening Shift",
    startTime: "14:00",
    endTime: "22:00",
    breakMinutes: 60,
    isNightShift: false,
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 3,
    organizationId: 1,
    name: "Night Shift",
    startTime: "22:00",
    endTime: "06:00",
    breakMinutes: 60,
    isNightShift: true,
    createdAt: "2024-01-01T10:00:00Z"
  }
];

// --------------------
// Mock Employee Shifts
// --------------------
export const mockEmployeeShifts: EmployeeShiftDTO[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: "Ashish Kumar Ray",
    shiftId: 1,
    effectiveFrom: "2024-01-01",
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: "Priya Sharma",
    shiftId: 2,
    effectiveFrom: "2024-01-01",
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  }
];

// --------------------
// Mock Departments
// --------------------
export const mockDepartments: DepartmentDTO[] = [
  {
    id: 1,
    organizationId: 1,
    name: "Engineering",
    code: "ENG",
    description: "Software Engineering Department",
    managerId: 1,
    costCenter: "CC-ENG-001",
    location: "Pune Office",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    organizationId: 1,
    name: "Human Resources",
    code: "HR",
    description: "Human Resources Department",
    managerId: 2,
    costCenter: "CC-HR-001",
    location: "Pune Office",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 3,
    organizationId: 1,
    name: "Finance",
    code: "FIN",
    description: "Finance Department",
    costCenter: "CC-FIN-001",
    location: "Pune Office",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  }
];

// --------------------
// Mock Locations
// --------------------
export const mockLocations: LocationDTO[] = [
  {
    id: 1,
    organizationId: 1,
    name: "Pune Office",
    addressLine1: "Hinjewadi Phase 1",
    city: "Pune",
    stateProvince: "Maharashtra",
    postalCode: "411057",
    country: "IN",
    timezone: "Asia/Kolkata",
    isHeadquarters: true,
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    organizationId: 1,
    name: "Mumbai Office",
    addressLine1: "Bandra Kurla Complex",
    city: "Mumbai",
    stateProvince: "Maharashtra",
    postalCode: "400051",
    country: "IN",
    timezone: "Asia/Kolkata",
    isHeadquarters: false,
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  }
];

// --------------------
// Mock Holidays
// --------------------
export const mockHolidays: HolidayDTO[] = [
  {
    id: 1,
    organizationId: 1,
    name: "New Year's Day",
    holidayDate: "2024-01-01",
    holidayType: "NATIONAL" as any,
    isOptional: false,
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    organizationId: 1,
    name: "Independence Day",
    holidayDate: "2024-07-04",
    holidayType: "NATIONAL" as any,
    isOptional: false,
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 3,
    organizationId: 1,
    name: "Christmas Day",
    holidayDate: "2024-12-25",
    holidayType: "NATIONAL" as any,
    isOptional: false,
    createdAt: "2024-01-01T10:00:00Z"
  }
];

// --------------------
// Mock Organizations
// --------------------
export const mockOrganizations: OrganizationDTO[] = [
  {
    id: 1,
    name: "TalentX Corporation",
    legalName: "TalentX Corporation Private Limited",
    industry: "Technology",
    companySize: "MEDIUM" as any,
    website: "https://talentx.com",
    headquartersCountry: "IN",
    isActive: true,
    subscriptionTier: "PROFESSIONAL" as any,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  }
];

// --------------------
// Mock Roles
// --------------------
export const mockRoles: RoleDTO[] = [
  {
    id: 1,
    organizationId: 1,
    name: "Admin",
    code: "ADMIN",
    description: "System Administrator with full access",
    permissions: [] as any[],
    isSystemRole: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    organizationId: 1,
    name: "HR Manager",
    code: "HR_MANAGER",
    description: "Human Resources Manager",
    permissions: [] as any[],
    isSystemRole: false,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 3,
    organizationId: 1,
    name: "Employee",
    code: "EMPLOYEE",
    description: "Regular Employee",
    permissions: [] as any[],
    isSystemRole: false,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  }
];

// --------------------
// Mock Users
// --------------------
export const mockUsers: UserDTO[] = [
  {
    id: 1,
    organizationId: 1,
    username: "ashish.ray",
    email: "ashish.ray@company.com",
    isActive: true,
    isVerified: true,
    twoFactorEnabled: false,
    roles: [{ id: 1, name: "Admin", isActive: true, assignedAt: "2024-01-01T10:00:00Z" }],
    lastLoginAt: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    organizationId: 1,
    username: "priya.sharma",
    email: "priya.sharma@company.com",
    isActive: true,
    isVerified: true,
    twoFactorEnabled: false,
    roles: [{ id: 2, name: "HR Manager", isActive: true, assignedAt: "2024-01-01T10:00:00Z" }],
    lastLoginAt: "2024-01-14T10:00:00Z",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  }
];

// --------------------
// Mock Leave Types
// --------------------
export const mockLeaveTypes: LeaveType[] = [
  {
    id: 1,
    organizationId: 1,
    name: "Annual Leave",
    code: "ANNUAL",
    description: "Paid annual leave",
    isPaid: true,
    maxDaysPerYear: 20,
    requiresApproval: true,
    allowNegativeBalance: false,
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    organizationId: 1,
    name: "Sick Leave",
    code: "SICK",
    description: "Paid sick leave",
    isPaid: true,
    maxDaysPerYear: 10,
    requiresApproval: false,
    allowNegativeBalance: false,
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 3,
    organizationId: 1,
    name: "Unpaid Leave",
    code: "UNPAID",
    description: "Unpaid leave",
    isPaid: false,
    requiresApproval: true,
    allowNegativeBalance: true,
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  }
];

// --------------------
// Mock Leave Requests
// --------------------
export const mockLeaveRequests: LeaveRequestResponseDTO[] = [
  {
    id: 1,
    employeeId: 1,
    leaveTypeId: 1,
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    totalDays: 5,
    reason: "Family vacation",
    status: "APPROVED" as LeaveStatus,
    reviewedBy: 2,
    reviewedAt: "2024-01-20T10:00:00Z",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
    isHalfDay: false,
    isEmergency: false,
    active: true,
    createdBy: "system",
    updatedBy: "admin",
    version: 1,
    employee: {
      id: 1,
      employeeNumber: "EMP001",
      firstName: "Ashish",
      lastName: "Kumar Ray",
      fullName: "Ashish Kumar Ray",
      departmentName: "Engineering"
    },
    leaveType: {
      id: 1,
      organizationId: 1,
      name: "Annual Leave",
      code: "ANNUAL",
      isPaid: true,
      maxDaysPerYear: 20,
      requiresApproval: true,
      allowNegativeBalance: false,
      isActive: true
    }
  },
  {
    id: 2,
    employeeId: 2,
    leaveTypeId: 2,
    startDate: "2024-01-25",
    endDate: "2024-01-26",
    totalDays: 2,
    reason: "Medical appointment",
    status: "PENDING" as LeaveStatus,
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
    isHalfDay: false,
    isEmergency: false,
    active: true,
    createdBy: "system",
    updatedBy: "system",
    version: 1,
    employee: {
      id: 2,
      employeeNumber: "EMP002",
      firstName: "Priya",
      lastName: "Sharma",
      fullName: "Priya Sharma",
      departmentName: "Human Resources"
    },
    leaveType: {
      id: 2,
      organizationId: 1,
      name: "Sick Leave",
      code: "SICK",
      isPaid: true,
      maxDaysPerYear: 10,
      requiresApproval: false,
      allowNegativeBalance: false,
      isActive: true
    }
  },
  {
    id: 3,
    employeeId: 1,
    leaveTypeId: 1,
    startDate: "2024-03-15",
    endDate: "2024-03-15",
    totalDays: 0.5,
    reason: "Personal appointment",
    status: "APPROVED" as LeaveStatus,
    reviewedBy: 2,
    reviewedAt: "2024-03-10T10:00:00Z",
    createdAt: "2024-03-08T10:00:00Z",
    updatedAt: "2024-03-10T10:00:00Z",
    isHalfDay: true,
    halfDayPeriod: "AM",
    isEmergency: false,
    active: true,
    createdBy: "system",
    updatedBy: "admin",
    version: 1,
    employee: {
      id: 1,
      employeeNumber: "EMP001",
      firstName: "Ashish",
      lastName: "Kumar Ray",
      fullName: "Ashish Kumar Ray",
      departmentName: "Engineering"
    },
    leaveType: {
      id: 1,
      organizationId: 1,
      name: "Annual Leave",
      code: "ANNUAL",
      isPaid: true,
      maxDaysPerYear: 20,
      requiresApproval: true,
      allowNegativeBalance: false,
      isActive: true
    }
  },
  {
    id: 4,
    employeeId: 2,
    leaveTypeId: 3,
    startDate: "2024-02-20",
    endDate: "2024-02-21",
    totalDays: 2,
    reason: "Family emergency",
    status: "APPROVED" as LeaveStatus,
    reviewedBy: 1,
    reviewedAt: "2024-02-20T11:00:00Z",
    createdAt: "2024-02-20T09:00:00Z",
    updatedAt: "2024-02-20T11:00:00Z",
    isHalfDay: false,
    isEmergency: true,
    emergencyContact: "John Sharma",
    contactDetails: "+91-9876543210",
    attachmentPath: "/documents/medical-certificate-123.pdf",
    active: true,
    createdBy: "system",
    updatedBy: "admin",
    version: 1,
    employee: {
      id: 2,
      employeeNumber: "EMP002",
      firstName: "Priya",
      lastName: "Sharma",
      fullName: "Priya Sharma",
      departmentName: "Human Resources"
    },
    leaveType: {
      id: 3,
      organizationId: 1,
      name: "Emergency Leave",
      code: "EMERGENCY",
      isPaid: true,
      maxDaysPerYear: 5,
      requiresApproval: true,
      allowNegativeBalance: false,
      isActive: true
    }
  },
  {
    id: 5,
    employeeId: 1,
    leaveTypeId: 1,
    startDate: "2026-04-01",
    endDate: "2026-04-03",
    totalDays: 3,
    reason: "Vacation",
    status: "PENDING" as LeaveStatus,
    createdAt: "2026-03-25T00:00:00Z",
    updatedAt: "2026-03-25T00:00:00Z",
    employee: {
      id: 1,
      employeeNumber: "EMP001",
      firstName: "Ashish",
      lastName: "Kumar Ray",
      fullName: "Ashish Kumar Ray",
      departmentName: "Engineering"
    },
    leaveType: {
      id: 1,
      organizationId: 1,
      name: "Annual Leave",
      code: "ANNUAL",
      isPaid: true,
      maxDaysPerYear: 20,
      requiresApproval: true,
      allowNegativeBalance: false,
      isActive: true
    }
  }
];

// --------------------
// Mock Leave Balances
// --------------------
export const mockLeaveBalances: LeaveBalanceDTO[] = [
  {
    id: 1,
    employeeId: 1,
    leaveTypeId: 1,
    year: 2024,
    allocatedDays: 20,
    usedDays: 5,
    pendingDays: 0,
    availableDays: 15,
    carriedForwardDays: 0,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
    employee: {
      id: 1,
      employeeNumber: "EMP001",
      fullName: "Ashish Kumar Ray"
    },
    leaveType: {
      id: 1,
      name: "Annual Leave",
      maxDaysPerYear: 20
    }
  },
  {
    id: 2,
    employeeId: 1,
    leaveTypeId: 2,
    year: 2024,
    allocatedDays: 10,
    usedDays: 0,
    pendingDays: 0,
    availableDays: 10,
    carriedForwardDays: 0,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    employee: {
      id: 1,
      employeeNumber: "EMP001",
      fullName: "Ashish Kumar Ray"
    },
    leaveType: {
      id: 2,
      name: "Sick Leave",
      maxDaysPerYear: 10
    }
  }
];

// --------------------
// Mock Attendance Records
// --------------------
export const mockAttendanceRecords: AttendanceRecordDTO[] = [
  {
    id: 1,
    employeeId: 1,
    employeeName: "Ashish Kumar Ray",
    attendanceDate: "2024-01-15",
    checkInTime: "2024-01-15T09:00:00Z",
    checkOutTime: "2024-01-15T17:30:00Z",
    totalHours: 8,
    overtimeHours: 0,
    breakHours: 0.5,
    status: "PRESENT" as AttendanceStatus,
    locationId: 1,
    checkInLocation: "Pune Office",
    checkOutLocation: "Pune Office",
    createdAt: "2024-01-15T09:00:00Z",
    updatedAt: "2024-01-15T17:30:00Z"
  },
  {
    id: 2,
    employeeId: 2,
    employeeName: "Priya Sharma",
    attendanceDate: "2024-01-15",
    checkInTime: "2024-01-15T08:45:00Z",
    checkOutTime: "2024-01-15T17:00:00Z",
    totalHours: 8,
    overtimeHours: 0,
    breakHours: 0.25,
    status: "PRESENT" as AttendanceStatus,
    locationId: 1,
    checkInLocation: "Pune Office",
    checkOutLocation: "Pune Office",
    createdAt: "2024-01-15T08:45:00Z",
    updatedAt: "2024-01-15T17:00:00Z"
  },
  {
    id: 3,
    employeeId: 1,
    employeeName: "Ashish Kumar Ray",
    attendanceDate: "2024-01-16",
    checkInTime: "2024-01-16T09:15:00Z",
    status: "LATE" as AttendanceStatus,
    locationId: 1,
    checkInLocation: "Pune Office",
    createdAt: "2024-01-16T09:15:00Z",
    updatedAt: "2024-01-16T09:15:00Z"
  }
];

// --------------------
// Mock Payroll Data
// --------------------
export const mockPayrollRuns: any[] = [
  {
    id: 1,
    organizationId: 1,
    name: "January 2024 - First Half",
    payPeriodStart: "2024-01-01",
    payPeriodEnd: "2024-01-15",
    payDate: "2024-01-20",
    status: "APPROVED",
    totalGross: 215000,
    totalDeductions: 43000,
    totalNet: 172000,
    totalGrossPay: 215000,
    totalNetPay: 172000,
    totalTaxes: 38000,
    employeeCount: 2,
    processedBy: 2,
    processedByUser: {
      id: 2,
      firstName: "Priya",
      lastName: "Sharma",
      fullName: "Priya Sharma"
    },
    approvedBy: 1,
    approvedByUser: {
      id: 1,
      firstName: "Ashish",
      lastName: "Kumar Ray",
      fullName: "Ashish Kumar Ray"
    },
    processedAt: "2024-01-18T10:00:00Z",
    approvedAt: "2024-01-19T14:00:00Z",
    description: "Payroll for first half of January 2024",
    notes: "All employees included",
    active: true,
    createdAt: "2024-01-16T10:00:00Z",
    updatedAt: "2024-01-19T14:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    version: 1
  },
  {
    id: 2,
    organizationId: 1,
    name: "January 2024 - Second Half",
    payPeriodStart: "2024-01-16",
    payPeriodEnd: "2024-01-31",
    payDate: "2024-02-05",
    status: "PROCESSING",
    totalGross: 215000,
    totalDeductions: 43000,
    totalNet: 172000,
    totalGrossPay: 215000,
    totalNetPay: 172000,
    totalTaxes: 38000,
    employeeCount: 2,
    processedBy: 2,
    processedByUser: {
      id: 2,
      firstName: "Priya",
      lastName: "Sharma",
      fullName: "Priya Sharma"
    },
    processedAt: "2024-02-01T10:00:00Z",
    description: "Payroll for second half of January 2024",
    notes: "Processing in progress",
    active: true,
    createdAt: "2024-01-30T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z",
    createdBy: "admin",
    updatedBy: "admin",
    version: 1
  }
];

export const mockPayrollItems: any[] = [
  {
    id: 1,
    payrollRunId: 1,
    employee: {
      id: 1,
      employeeNumber: "EMP001",
      firstName: "Ashish",
      lastName: "Kumar Ray",
      fullName: "Ashish Kumar Ray",
      departmentName: "Engineering"
    },
    basesalary: 1800000,
    overtimeHours: 10,
    overtimeRate: 75,
    overtimePay: 750,
    bonuses: 5000,
    allowances: 2000,
    grossPay: 127750,
    taxDeductions: 25550,
    socialSecurityDeductions: 7665,
    healthInsuranceDeductions: 500,
    otherDeductions: 0,
    totalDeductions: 33715,
    netPay: 94035,
    hoursWorked: 170,
    daysWorked: 15,
    createdAt: "2024-01-18T10:00:00Z",
    updatedAt: "2024-01-18T10:00:00Z"
  },
  {
    id: 2,
    payrollRunId: 1,
    employee: {
      id: 2,
      employeeNumber: "EMP002",
      firstName: "Priya",
      lastName: "Sharma",
      fullName: "Priya Sharma",
      departmentName: "Human Resources"
    },
    basesalary: 1400000,
    overtimeHours: 5,
    overtimeRate: 60,
    overtimePay: 300,
    bonuses: 3000,
    allowances: 1500,
    grossPay: 99800,
    taxDeductions: 19960,
    socialSecurityDeductions: 5988,
    healthInsuranceDeductions: 500,
    otherDeductions: 0,
    totalDeductions: 26448,
    netPay: 73352,
    hoursWorked: 165,
    daysWorked: 15,
    createdAt: "2024-01-18T10:00:00Z",
    updatedAt: "2024-01-18T10:00:00Z"
  }
];

// --------------------
// Mock Document Data
// --------------------
export const mockDocuments: any[] = [
  {
    id: 1,
    organizationId: 1,
    employeeId: 1,
    title: "Employment Contract",
    description: "Initial employment contract",
    category: "CONTRACT",
    fileUrl: "/documents/contract-emp001.pdf",
    fileName: "contract-emp001.pdf",
    fileSize: 245678,
    mimeType: "application/pdf",
    uploadedBy: 2,
    uploadedByName: "Priya Sharma",
    isConfidential: true,
    expiryDate: "2025-01-15",
    status: "ACTIVE",
    tags: ["contract", "employment"],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    organizationId: 1,
    employeeId: 1,
    title: "ID Proof",
    description: "Driver's license copy",
    category: "IDENTIFICATION",
    fileUrl: "/documents/id-emp001.pdf",
    fileName: "id-emp001.pdf",
    fileSize: 123456,
    mimeType: "application/pdf",
    uploadedBy: 1,
    uploadedByName: "Ashish Kumar Ray",
    isConfidential: true,
    status: "ACTIVE",
    tags: ["identification", "personal"],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  }
];

export const mockDocumentCategories: any[] = [
  { id: 1, name: "CONTRACT", description: "Employment contracts" },
  { id: 2, name: "IDENTIFICATION", description: "ID documents" },
  { id: 3, name: "CERTIFICATION", description: "Certificates and qualifications" },
  { id: 4, name: "POLICY", description: "Company policies" },
  { id: 5, name: "OTHER", description: "Other documents" }
];

// --------------------
// Mock Compliance Data
// --------------------
export const mockComplianceJurisdictions: any[] = [
  {
    id: 1,
    countryCode: "IN",
    name: "India",
    jurisdictionType: "COUNTRY",
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    countryCode: "IN",
    stateProvinceCode: "CA",
    name: "Maharashtra",
    jurisdictionType: "STATE",
    parentJurisdictionId: 1,
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 3,
    countryCode: "IN",
    stateProvinceCode: "NY",
    name: "Mumbai",
    jurisdictionType: "STATE",
    parentJurisdictionId: 1,
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  }
];

export const mockComplianceRules: any[] = [
  {
    id: 1,
    jurisdictionId: 2,
    ruleCategory: "LABOR_LAW",
    ruleName: "Maharashtra Minimum Wage",
    description: "Minimum wage requirements for Maharashtra",
    ruleData: { minimumWage: 16.00, effectiveYear: 2024 },
    effectiveDate: "2024-01-01",
    sourceUrl: "https://www.dir.ca.gov/dlse/faq_minimumwage.htm",
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    jurisdiction: {
      id: 2,
      countryCode: "IN",
      stateProvinceCode: "CA",
      name: "Maharashtra",
      jurisdictionType: "STATE",
      isActive: true
    }
  },
  {
    id: 2,
    jurisdictionId: 2,
    ruleCategory: "OVERTIME",
    ruleName: "Maharashtra Overtime Rules",
    description: "Overtime pay requirements for Maharashtra",
    ruleData: { overtimeThreshold: 8, overtimeRate: 1.5, doubleTimeThreshold: 12 },
    effectiveDate: "2024-01-01",
    sourceUrl: "https://www.dir.ca.gov/dlse/faq_overtime.htm",
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    jurisdiction: {
      id: 2,
      countryCode: "IN",
      stateProvinceCode: "CA",
      name: "Maharashtra",
      jurisdictionType: "STATE",
      isActive: true
    }
  },
  {
    id: 3,
    jurisdictionId: 1,
    ruleCategory: "TAX",
    ruleName: "Federal Income Tax Withholding",
    description: "Federal tax withholding requirements",
    ruleData: { taxYear: 2024 },
    effectiveDate: "2024-01-01",
    sourceUrl: "https://www.irs.gov/",
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    jurisdiction: {
      id: 1,
      countryCode: "IN",
      name: "India",
      jurisdictionType: "COUNTRY",
      isActive: true
    }
  }
];

export const mockComplianceChecks: any[] = [
  {
    id: 1,
    organizationId: 1,
    employeeId: 1,
    ruleId: 1,
    checkDate: "2024-01-15",
    status: "COMPLIANT",
    severity: "LOW",
    resolved: true,
    createdAt: "2024-01-15T10:00:00Z",
    rule: {
      id: 1,
      jurisdictionId: 2,
      ruleCategory: "LABOR_LAW",
      ruleName: "Maharashtra Minimum Wage",
      description: "Minimum wage requirements for Maharashtra"
    },
    employeeName: "Ashish Kumar Ray"
  },
  {
    id: 2,
    organizationId: 1,
    employeeId: 1,
    ruleId: 2,
    checkDate: "2024-01-20",
    status: "NON_COMPLIANT",
    violationDetails: { hoursWorked: 10, overtimePaid: false },
    severity: "HIGH",
    resolved: false,
    createdAt: "2024-01-20T10:00:00Z",
    rule: {
      id: 2,
      jurisdictionId: 2,
      ruleCategory: "OVERTIME",
      ruleName: "Maharashtra Overtime Rules",
      description: "Overtime pay requirements for Maharashtra"
    },
    employeeName: "Ashish Kumar Ray"
  },
  {
    id: 3,
    organizationId: 1,
    employeeId: 2,
    ruleId: 3,
    checkDate: "2024-01-15",
    status: "COMPLIANT",
    severity: "LOW",
    resolved: true,
    createdAt: "2024-01-15T10:00:00Z",
    rule: {
      id: 3,
      jurisdictionId: 1,
      ruleCategory: "TAX",
      ruleName: "Federal Income Tax Withholding",
      description: "Federal tax withholding requirements"
    },
    employeeName: "Priya Sharma"
  }
];

// --------------------
// Mock Performance Data
// --------------------
export const mockPerformanceReviewCycles: any[] = [
  {
    id: 1,
    organizationId: 1,
    name: "2024 H1 Performance Review",
    reviewType: "ANNUAL",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    selfReviewDeadline: "2024-07-15",
    managerReviewDeadline: "2024-07-31",
    status: "ACTIVE",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    organizationId: 1,
    name: "2023 Annual Review",
    reviewType: "ANNUAL",
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    selfReviewDeadline: "2024-01-15",
    managerReviewDeadline: "2024-01-31",
    status: "COMPLETED",
    createdAt: "2023-01-01T10:00:00Z",
    updatedAt: "2024-02-01T10:00:00Z"
  }
];

export const mockPerformanceReviews: any[] = [
  {
    id: 1,
    reviewCycleId: 2,
    employeeId: 1,
    reviewerId: 2,
    reviewType: "MANAGER",
    overallRating: 4.5,
    strengths: "Excellent technical skills, great team player, strong problem-solving abilities",
    areasForImprovement: "Could improve time management and delegation skills",
    achievements: "Led successful migration to microservices, mentored 3 junior developers",
    goalsNextPeriod: "Lead a major project in Q2, obtain AWS certification",
    status: "COMPLETED",
    submittedAt: "2024-01-20T10:00:00Z",
    acknowledgedAt: "2024-01-22T10:00:00Z",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-22T10:00:00Z",
    active: true,
    createdBy: "system",
    updatedBy: "admin",
    version: 1,
    employeeName: "Ashish Kumar Ray",
    reviewerName: "Priya Sharma",
    reviewCycleName: "2023 Annual Review"
  },
  {
    id: 2,
    reviewCycleId: 2,
    employeeId: 2,
    reviewerId: 1,
    reviewType: "MANAGER",
    overallRating: 4.0,
    strengths: "Strong organizational skills, excellent with people, great communication",
    areasForImprovement: "Could be more proactive in decision making",
    achievements: "Implemented new onboarding process, reduced time-to-hire by 30%",
    goalsNextPeriod: "Implement new HR processes, complete SHRM certification",
    status: "COMPLETED",
    submittedAt: "2024-01-25T10:00:00Z",
    acknowledgedAt: "2024-01-26T10:00:00Z",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-26T10:00:00Z",
    active: true,
    createdBy: "system",
    updatedBy: "admin",
    version: 1,
    employeeName: "Priya Sharma",
    reviewerName: "Ashish Kumar Ray",
    reviewCycleName: "2023 Annual Review"
  },
  {
    id: 3,
    reviewCycleId: 1,
    employeeId: 1,
    reviewerId: 2,
    reviewType: "MANAGER",
    overallRating: 4.0,
    status: "IN_PROGRESS",
    createdAt: "2024-07-01T10:00:00Z",
    updatedAt: "2024-07-01T10:00:00Z",
    active: true,
    createdBy: "system",
    updatedBy: "system",
    version: 1,
    employeeName: "Ashish Kumar Ray",
    reviewerName: "Priya Sharma",
    reviewCycleName: "2024 H1 Performance Review"
  }
];

export const mockGoals: any[] = [
  {
    id: 1,
    employeeId: 1,
    title: "Complete AWS Solutions Architect Certification",
    description: "Obtain AWS Solutions Architect Professional certification to enhance cloud architecture skills",
    goalType: "INDIVIDUAL",
    category: "PROFESSIONAL_DEVELOPMENT",
    startDate: "2024-01-01",
    targetDate: "2024-06-30",
    progressPercentage: 60,
    status: "IN_PROGRESS",
    weight: 20,
    measurementCriteria: "Pass the AWS certification exam",
    createdBy: 1,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
    employeeName: "Ashish Kumar Ray",
    createdByName: "Ashish Kumar Ray"
  },
  {
    id: 2,
    employeeId: 1,
    title: "Lead Project Alpha Migration",
    description: "Successfully deliver Project Alpha migration to new infrastructure on time and within budget",
    goalType: "INDIVIDUAL",
    category: "PROJECT",
    startDate: "2024-01-05",
    targetDate: "2024-03-31",
    progressPercentage: 75,
    status: "IN_PROGRESS",
    weight: 40,
    measurementCriteria: "Complete migration with zero downtime, meet all acceptance criteria",
    createdBy: 2,
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z",
    employeeName: "Ashish Kumar Ray",
    createdByName: "Priya Sharma"
  },
  {
    id: 3,
    employeeId: 2,
    title: "Implement New Onboarding Process",
    description: "Design and implement improved employee onboarding process",
    goalType: "INDIVIDUAL",
    category: "PROCESS_IMPROVEMENT",
    startDate: "2024-01-01",
    targetDate: "2024-04-30",
    completionDate: "2024-03-15",
    progressPercentage: 100,
    status: "COMPLETED",
    weight: 30,
    measurementCriteria: "Reduce onboarding time by 25%, achieve 90% satisfaction rating",
    createdBy: 1,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-03-15T10:00:00Z",
    employeeName: "Priya Sharma",
    createdByName: "Ashish Kumar Ray"
  },
  {
    id: 4,
    employeeId: 2,
    title: "Complete SHRM-CP Certification",
    description: "Obtain SHRM Certified Professional certification",
    goalType: "INDIVIDUAL",
    category: "PROFESSIONAL_DEVELOPMENT",
    startDate: "2024-02-01",
    targetDate: "2024-08-31",
    progressPercentage: 30,
    status: "IN_PROGRESS",
    weight: 20,
    measurementCriteria: "Pass SHRM-CP exam",
    createdBy: 2,
    createdAt: "2024-02-01T10:00:00Z",
    updatedAt: "2024-02-15T10:00:00Z",
    employeeName: "Priya Sharma",
    createdByName: "Priya Sharma"
  }
];

// --------------------
// Mock Training Data
// --------------------
export const mockTrainingPrograms: any[] = [
  {
    id: 1,
    organizationId: 1,
    title: "New Employee Onboarding",
    description: "Comprehensive onboarding program for new hires",
    trainingType: "ONBOARDING",
    deliveryMethod: "HYBRID",
    durationHours: 16,
    costPerParticipant: 0,
    maxParticipants: 20,
    provider: "Internal HR",
    isMandatory: true,
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    organizationId: 1,
    title: "Information Security Awareness",
    description: "Annual security compliance training",
    trainingType: "COMPLIANCE",
    deliveryMethod: "ONLINE",
    durationHours: 2,
    costPerParticipant: 0,
    provider: "Security Team",
    isMandatory: true,
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 3,
    organizationId: 1,
    title: "Advanced React Development",
    description: "Deep dive into React hooks and performance optimization",
    trainingType: "TECHNICAL",
    deliveryMethod: "ONLINE",
    durationHours: 20,
    costPerParticipant: 500,
    maxParticipants: 15,
    provider: "Tech Academy",
    externalUrl: "https://techacademy.com/react-advanced",
    isMandatory: false,
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 4,
    organizationId: 1,
    title: "Leadership Fundamentals",
    description: "Essential leadership skills for new managers",
    trainingType: "LEADERSHIP",
    deliveryMethod: "IN_PERSON",
    durationHours: 24,
    costPerParticipant: 1200,
    maxParticipants: 12,
    provider: "Leadership Institute",
    isMandatory: false,
    isActive: true,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z"
  }
];

export const mockTrainingEnrollments: any[] = [
  {
    id: 1,
    trainingProgramId: 1,
    employeeId: 1,
    enrolledDate: "2024-01-15T10:00:00Z",
    startDate: "2024-01-20T10:00:00Z",
    completionDate: "2024-01-22T10:00:00Z",
    dueDate: "2024-01-31",
    status: "COMPLETED",
    score: 95,
    passingScore: 80,
    certificateUrl: "/certificates/emp001-onboarding.pdf",
    assignedBy: 2,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-22T10:00:00Z",
    trainingTitle: "New Employee Onboarding",
    employeeName: "Ashish Kumar Ray",
    assignedByName: "Priya Sharma"
  },
  {
    id: 2,
    trainingProgramId: 2,
    employeeId: 1,
    enrolledDate: "2024-01-10T10:00:00Z",
    startDate: "2024-01-12T10:00:00Z",
    dueDate: "2024-02-28",
    status: "IN_PROGRESS",
    passingScore: 80,
    assignedBy: 2,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-12T10:00:00Z",
    trainingTitle: "Information Security Awareness",
    employeeName: "Ashish Kumar Ray",
    assignedByName: "Priya Sharma"
  },
  {
    id: 3,
    trainingProgramId: 3,
    employeeId: 1,
    enrolledDate: "2024-01-05T10:00:00Z",
    dueDate: "2024-03-31",
    status: "ENROLLED",
    passingScore: 70,
    createdAt: "2024-01-05T10:00:00Z",
    updatedAt: "2024-01-05T10:00:00Z",
    trainingTitle: "Advanced React Development",
    employeeName: "Ashish Kumar Ray"
  },
  {
    id: 4,
    trainingProgramId: 2,
    employeeId: 2,
    enrolledDate: "2024-01-10T10:00:00Z",
    startDate: "2024-01-11T10:00:00Z",
    completionDate: "2024-01-11T12:00:00Z",
    dueDate: "2024-02-28",
    status: "COMPLETED",
    score: 100,
    passingScore: 80,
    certificateUrl: "/certificates/emp002-security.pdf",
    assignedBy: 1,
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-11T12:00:00Z",
    trainingTitle: "Information Security Awareness",
    employeeName: "Priya Sharma",
    assignedByName: "Ashish Kumar Ray"
  }
];

// --------------------
// Mock Benefits Data
// --------------------
export const mockBenefitPlans: any[] = [
  {
    id: 1,
    organizationId: 1,
    name: "Premium Health Insurance",
    planType: "HEALTH_INSURANCE",
    description: "Comprehensive health insurance with dental and vision",
    provider: "HealthCare Plus",
    employeeCost: 200,
    employerCost: 800,
    costFrequency: "MONTHLY",
    isActive: true,
    effectiveDate: "2024-01-01",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    active: true,
    createdBy: "admin",
    updatedBy: "admin",
    version: 1
  },
  {
    id: 2,
    organizationId: 1,
    name: "Basic Dental Plan",
    planType: "DENTAL",
    description: "Basic dental coverage including preventive care",
    provider: "DentalCare Inc",
    employeeCost: 50,
    employerCost: 100,
    costFrequency: "MONTHLY",
    isActive: true,
    effectiveDate: "2024-01-01",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    active: true,
    createdBy: "admin",
    updatedBy: "admin",
    version: 1
  },
  {
    id: 3,
    organizationId: 1,
    name: "Vision Care Plan",
    planType: "VISION",
    description: "Annual eye exams and prescription eyewear",
    provider: "VisionCare",
    employeeCost: 25,
    employerCost: 50,
    costFrequency: "MONTHLY",
    isActive: true,
    effectiveDate: "2024-01-01",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    active: true,
    createdBy: "admin",
    updatedBy: "admin",
    version: 1
  },
  {
    id: 4,
    organizationId: 1,
    name: "401(k) Retirement Plan",
    planType: "RETIREMENT",
    description: "Company-matched 401(k) retirement savings plan",
    provider: "Fidelity Investments",
    employeeCost: 0,
    employerCost: 0,
    costFrequency: "PER_PAY_PERIOD",
    isActive: true,
    effectiveDate: "2024-01-01",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    active: true,
    createdBy: "admin",
    updatedBy: "admin",
    version: 1
  },
  {
    id: 5,
    organizationId: 1,
    name: "Life Insurance",
    planType: "LIFE_INSURANCE",
    description: "Basic life insurance coverage",
    provider: "LifeSecure",
    employeeCost: 0,
    employerCost: 75,
    costFrequency: "MONTHLY",
    isActive: true,
    effectiveDate: "2024-01-01",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    active: true,
    createdBy: "admin",
    updatedBy: "admin",
    version: 1
  }
];

export const mockEmployeeBenefits: any[] = [
  {
    id: 1,
    employeeId: 1,
    benefitPlanId: 1,
    enrollmentDate: "2024-01-15",
    effectiveDate: "2024-02-01",
    status: "ACTIVE",
    coverageLevel: "FAMILY",
    beneficiaries: [
      { name: "Ananya Ray", relationship: "Spouse", percentage: 50 },
      { name: "Aarav Ray", relationship: "Child", percentage: 50 }
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    benefitPlanName: "Premium Health Insurance",
    employeeName: "Ashish Kumar Ray",
    planType: "HEALTH_INSURANCE"
  },
  {
    id: 2,
    employeeId: 1,
    benefitPlanId: 2,
    enrollmentDate: "2024-01-15",
    effectiveDate: "2024-02-01",
    status: "ACTIVE",
    coverageLevel: "EMPLOYEE_ONLY",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    benefitPlanName: "Basic Dental Plan",
    employeeName: "Ashish Kumar Ray",
    planType: "DENTAL"
  },
  {
    id: 3,
    employeeId: 1,
    benefitPlanId: 4,
    enrollmentDate: "2024-01-15",
    effectiveDate: "2024-02-01",
    status: "ACTIVE",
    coverageLevel: "EMPLOYEE_ONLY",
    beneficiaries: [
      { name: "Ananya Ray", relationship: "Spouse", percentage: 100 }
    ],
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    benefitPlanName: "401(k) Retirement Plan",
    employeeName: "Ashish Kumar Ray",
    planType: "RETIREMENT"
  },
  {
    id: 4,
    employeeId: 2,
    benefitPlanId: 1,
    enrollmentDate: "2024-01-10",
    effectiveDate: "2024-02-01",
    status: "ACTIVE",
    coverageLevel: "EMPLOYEE_ONLY",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
    benefitPlanName: "Premium Health Insurance",
    employeeName: "Priya Sharma",
    planType: "HEALTH_INSURANCE"
  },
  {
    id: 5,
    employeeId: 2,
    benefitPlanId: 3,
    enrollmentDate: "2024-01-10",
    effectiveDate: "2024-02-01",
    status: "ACTIVE",
    coverageLevel: "EMPLOYEE_ONLY",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
    benefitPlanName: "Vision Care Plan",
    employeeName: "Priya Sharma",
    planType: "VISION"
  },
  {
    id: 6,
    employeeId: 2,
    benefitPlanId: 5,
    enrollmentDate: "2024-01-10",
    effectiveDate: "2024-02-01",
    terminationDate: "2024-06-30",
    status: "TERMINATED",
    coverageLevel: "EMPLOYEE_ONLY",
    beneficiaries: [
      { name: "Ashish Kumar Ray", relationship: "Colleague", percentage: 100 }
    ],
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-06-30T10:00:00Z",
    benefitPlanName: "Life Insurance",
    employeeName: "Priya Sharma",
    planType: "LIFE_INSURANCE"
  }
];

// --------------------
// Mock Expense Data
// --------------------
export const mockExpenses: any[] = [
  {
    id: 1,
    employeeId: 1,
    expenseType: "TRAVEL",
    amount: 450.00,
    currency: "INR",
    expenseDate: "2024-01-15",
    description: "Flight to client meeting in Mumbai",
    receiptUrl: "/receipts/expense-001.pdf",
    status: "APPROVED",
    approvedBy: 2,
    approvedAt: "2024-01-16T10:00:00Z",
    createdAt: "2024-01-15T14:00:00Z",
    updatedAt: "2024-01-16T10:00:00Z",
    employeeName: "Ashish Kumar Ray",
    approverName: "Priya Sharma"
  },
  {
    id: 2,
    employeeId: 1,
    expenseType: "FOOD",
    amount: 85.50,
    currency: "INR",
    expenseDate: "2024-01-16",
    description: "Client dinner",
    receiptUrl: "/receipts/expense-002.pdf",
    status: "SUBMITTED",
    createdAt: "2024-01-17T09:00:00Z",
    updatedAt: "2024-01-17T09:00:00Z",
    employeeName: "Ashish Kumar Ray"
  },
  {
    id: 3,
    employeeId: 2,
    expenseType: "OFFICE",
    amount: 125.00,
    currency: "INR",
    expenseDate: "2024-01-10",
    description: "Office supplies for HR department",
    receiptUrl: "/receipts/expense-003.pdf",
    status: "PAID",
    approvedBy: 1,
    approvedAt: "2024-01-11T10:00:00Z",
    paidAt: "2024-01-12T10:00:00Z",
    createdAt: "2024-01-10T15:00:00Z",
    updatedAt: "2024-01-12T10:00:00Z",
    employeeName: "Priya Sharma",
    approverName: "Ashish Kumar Ray"
  },
  {
    id: 4,
    employeeId: 2,
    expenseType: "TRAVEL",
    amount: 320.00,
    currency: "INR",
    expenseDate: "2024-01-20",
    description: "Hotel accommodation for conference",
    receiptUrl: "/receipts/expense-004.pdf",
    status: "REJECTED",
    approvedBy: 1,
    approvedAt: "2024-01-21T10:00:00Z",
    rejectionReason: "Missing itemized receipt",
    createdAt: "2024-01-20T16:00:00Z",
    updatedAt: "2024-01-21T10:00:00Z",
    employeeName: "Priya Sharma",
    approverName: "Ashish Kumar Ray"
  }
];

// --------------------
// Mock Exit Data
// --------------------
export const mockEmployeeExits: any[] = [
  {
    id: 1,
    employeeId: 1,
    resignationDate: "2024-02-01",
    lastWorkingDay: "2024-02-28",
    exitReason: "Better opportunity",
    exitType: "RESIGNATION",
    status: "APPROVED",
    approvedBy: 2,
    approvedAt: "2024-02-02T10:00:00Z",
    exitInterviewCompleted: true,
    exitInterviewDate: "2024-02-15",
    exitInterviewNotes: "Positive feedback, seeking career growth",
    assetsReturned: true,
    clearanceCompleted: false,
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-15T14:00:00Z",
    employeeName: "Ashish Kumar Ray",
    employeeNumber: "EMP001",
    departmentName: "Engineering",
    approverName: "Priya Sharma"
  },
  {
    id: 2,
    employeeId: 2,
    resignationDate: "2024-03-01",
    lastWorkingDay: "2024-03-31",
    exitReason: "Relocation",
    exitType: "RESIGNATION",
    status: "INITIATED",
    exitInterviewCompleted: false,
    assetsReturned: false,
    clearanceCompleted: false,
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2024-03-01T10:00:00Z",
    employeeName: "Priya Sharma",
    employeeNumber: "EMP002",
    departmentName: "Human Resources"
  }
];

// --------------------
// Mock Audit Log Data
// --------------------
export const mockAuditLogs: any[] = [
  {
    id: 1,
    organizationId: 1,
    userId: 1,
    entityType: "Employee",
    entityId: 1,
    action: "UPDATE",
    oldValues: { jobTitle: "Software Engineer", salaryAmount: 110000 },
    newValues: { jobTitle: "Senior Software Engineer", salaryAmount: 1800000 },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0",
    timestamp: "2024-01-15T10:00:00Z",
    userName: "Ashish Kumar Ray",
    userEmail: "ashish.ray@company.com"
  },
  {
    id: 2,
    organizationId: 1,
    userId: 2,
    entityType: "LeaveRequest",
    entityId: 1,
    action: "CREATE",
    newValues: { leaveTypeId: 1, startDate: "2024-02-01", endDate: "2024-02-05" },
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0",
    timestamp: "2024-01-15T11:00:00Z",
    userName: "Priya Sharma",
    userEmail: "priya.sharma@company.com"
  },
  {
    id: 3,
    organizationId: 1,
    userId: 1,
    entityType: "LeaveRequest",
    entityId: 1,
    action: "UPDATE",
    oldValues: { status: "PENDING" },
    newValues: { status: "APPROVED" },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0",
    timestamp: "2024-01-20T10:00:00Z",
    userName: "Ashish Kumar Ray",
    userEmail: "ashish.ray@company.com"
  },
  {
    id: 4,
    organizationId: 1,
    userId: 2,
    entityType: "Employee",
    entityId: 2,
    action: "VIEW",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0",
    timestamp: "2024-01-20T14:00:00Z",
    userName: "Priya Sharma",
    userEmail: "priya.sharma@company.com"
  },
  {
    id: 5,
    organizationId: 1,
    userId: 1,
    entityType: "Payroll",
    entityId: 1,
    action: "EXPORT",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0",
    timestamp: "2024-01-18T16:00:00Z",
    userName: "Ashish Kumar Ray",
    userEmail: "ashish.ray@company.com"
  }
];

// --------------------
// Mock Recruitment Data
// --------------------
export const mockJobPostings: any[] = [
  {
    id: 1,
    organizationId: 1,
    title: "Senior Software Engineer",
    description: "We are looking for an experienced software engineer to join our team",
    requirements: "5+ years of experience in software development, strong knowledge of React and Node.js",
    department: {
      id: 1,
      name: "Engineering"
    },
    location: {
      id: 1,
      name: "Pune Office",
      city: "Pune",
      country: "IN"
    },
    employmentType: "FULL_TIME",
    salaryMin: 120000,
    salaryMax: 160000,
    currency: "INR",
    status: "PUBLISHED",
    postedBy: {
      id: 2,
      firstName: "Priya",
      lastName: "Sharma",
      fullName: "Priya Sharma"
    },
    applicationDeadline: "2024-03-31",
    startDate: "2024-04-15",
    isRemote: false,
    experienceLevel: "SENIOR_LEVEL",
    skillsRequired: ["JavaScript", "TypeScript", "React", "Node.js", "AWS"],
    benefitsOffered: ["Health Insurance", "401(k)", "Flexible Hours", "Remote Work"],
    applicationCount: 45,
    viewCount: 320,
    postedAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    organizationId: 1,
    title: "HR Coordinator",
    description: "Join our HR team to support employee relations and recruitment",
    requirements: "2+ years of HR experience, excellent communication skills",
    department: {
      id: 2,
      name: "Human Resources"
    },
    location: {
      id: 1,
      name: "Pune Office",
      city: "Pune",
      country: "IN"
    },
    employmentType: "FULL_TIME",
    salaryMin: 60000,
    salaryMax: 75000,
    currency: "INR",
    status: "PUBLISHED",
    postedBy: {
      id: 1,
      firstName: "Ashish",
      lastName: "Kumar Ray",
      fullName: "Ashish Kumar Ray"
    },
    applicationDeadline: "2024-02-28",
    startDate: "2024-03-15",
    isRemote: true,
    experienceLevel: "MID_LEVEL",
    skillsRequired: ["HR Management", "Recruitment", "Employee Relations"],
    benefitsOffered: ["Health Insurance", "Dental", "Vision", "PTO"],
    applicationCount: 28,
    viewCount: 180,
    postedAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z"
  },
  {
    id: 3,
    organizationId: 1,
    title: "Software Engineering Intern",
    description: "Summer internship program for computer science students",
    requirements: "Currently pursuing CS degree, knowledge of programming fundamentals",
    department: {
      id: 1,
      name: "Engineering"
    },
    location: {
      id: 1,
      name: "Pune Office",
      city: "Pune",
      country: "IN"
    },
    employmentType: "INTERN",
    salaryMin: 25,
    salaryMax: 35,
    currency: "INR",
    status: "DRAFT",
    postedBy: {
      id: 2,
      firstName: "Priya",
      lastName: "Sharma",
      fullName: "Priya Sharma"
    },
    startDate: "2024-06-01",
    isRemote: false,
    experienceLevel: "ENTRY_LEVEL",
    skillsRequired: ["Programming", "Problem Solving", "Teamwork"],
    benefitsOffered: ["Mentorship", "Learning Opportunities"],
    applicationCount: 0,
    viewCount: 0,
    postedAt: "2024-01-20T10:00:00Z",
    updatedAt: "2024-01-20T10:00:00Z"
  }
];

// --------------------
// Mock Skills Data
// --------------------
export const mockSkills: any[] = [
  {
    id: 1,
    name: "JavaScript",
    category: "Programming",
    description: "JavaScript programming language",
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 2,
    name: "TypeScript",
    category: "Programming",
    description: "TypeScript programming language",
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 3,
    name: "React",
    category: "Framework",
    description: "React JavaScript library",
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 4,
    name: "Project Management",
    category: "Management",
    description: "Project management and leadership",
    createdAt: "2024-01-01T10:00:00Z"
  },
  {
    id: 5,
    name: "Communication",
    category: "Soft Skills",
    description: "Effective communication skills",
    createdAt: "2024-01-01T10:00:00Z"
  }
];

export const mockEmployeeSkills: any[] = [
  {
    id: 1,
    employeeId: 1,
    skillId: 1,
    proficiencyLevel: "EXPERT",
    yearsOfExperience: 5,
    lastUsedYear: 2024,
    verifiedBy: 2,
    verifiedAt: "2024-01-15T10:00:00Z",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z",
    skillName: "JavaScript",
    employeeName: "Ashish Kumar Ray",
    verifiedByName: "Priya Sharma"
  },
  {
    id: 2,
    employeeId: 1,
    skillId: 2,
    proficiencyLevel: "ADVANCED",
    yearsOfExperience: 3,
    lastUsedYear: 2024,
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-01T10:00:00Z",
    skillName: "TypeScript",
    employeeName: "Ashish Kumar Ray"
  },
  {
    id: 3,
    employeeId: 2,
    skillId: 4,
    proficiencyLevel: "EXPERT",
    yearsOfExperience: 6,
    lastUsedYear: 2024,
    verifiedBy: 1,
    verifiedAt: "2024-01-10T10:00:00Z",
    createdAt: "2024-01-01T10:00:00Z",
    updatedAt: "2024-01-10T10:00:00Z",
    skillName: "Project Management",
    employeeName: "Priya Sharma",
    verifiedByName: "Ashish Kumar Ray"
  }
];

// --------------------
// Pagination Helper
// --------------------
export function createPaginatedResponse<T>(
  content: T[],
  page: number = 0,
  size: number = 10
): PaginatedResponse<T> {
  const start = page * size;
  const end = start + size;
  const paginatedContent = content.slice(start, end);

  return {
    content: paginatedContent,
    totalElements: content.length,
    totalPages: Math.ceil(content.length / size),
    size,
    number: page,
    first: page === 0,
    last: end >= content.length
  };
}

// --------------------
// Delay Helper
// --------------------
export function simulateDelay(ms: number = 500): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}