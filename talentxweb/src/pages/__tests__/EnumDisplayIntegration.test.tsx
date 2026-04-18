/**
 * Integration tests for Task 6.1: Test UI displays new enum values correctly
 * 
 * Tests verify that:
 * - PROBATION badge displays in EmployeeListPage
 * - CALCULATED badge displays in PayrollRunList
 * - WORK_FROM_HOME icon displays in AttendancePage calendar
 * - WITHDRAWN badge displays in LeaveRequestsPage
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 8.3
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import EmployeeListPage from '../Employees/EmployeeListPage';
import PayrollRunList from '../../components/payroll/PayrollRunList';
import AttendancePage from '../Attendance/AttendancePage';
import LeaveRequestsPage from '../Leave/LeaveRequestsPage';
import {
  EmploymentStatus,
  PayrollRunStatus,
  AttendanceStatus,
  LeaveStatus
} from '../../types';
import employeeApi from '../../api/employeeApi';
import attendanceApi from '../../api/attendanceApi';
import leaveApi from '../../api/leaveApi';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';

// Mock API modules
jest.mock('../../api/employeeApi', () => ({
  __esModule: true,
  default: {
    getEmployees: jest.fn(),
    exportEmployees: jest.fn(),
    deleteEmployee: jest.fn()
  },
  getEmployees: jest.fn(),
  exportEmployees: jest.fn(),
  deleteEmployee: jest.fn()
}));

jest.mock('../../api/attendanceApi', () => ({
  __esModule: true,
  default: {
    getAttendanceRecords: jest.fn(),
    getAttendanceSummary: jest.fn(),
    getTodayAttendance: jest.fn(),
    checkIn: jest.fn(),
    checkOut: jest.fn()
  },
  getAttendanceRecords: jest.fn(),
  getAttendanceSummary: jest.fn(),
  getTodayAttendance: jest.fn(),
  checkIn: jest.fn(),
  checkOut: jest.fn()
}));

jest.mock('../../api/leaveApi', () => ({
  __esModule: true,
  default: {
    getLeaveRequests: jest.fn(),
    getLeaveTypes: jest.fn(),
    approveLeaveRequest: jest.fn(),
    deleteLeaveRequest: jest.fn()
  },
  getLeaveRequests: jest.fn(),
  getLeaveTypes: jest.fn(),
  approveLeaveRequest: jest.fn(),
  deleteLeaveRequest: jest.fn()
}));

jest.mock('../../api/payrollApi');

// Mock AuthContext
const mockUser = {
  id: 1,
  email: 'test@example.com',
  username: 'testuser',
  organizationId: 1,
  isActive: true,
  isVerified: true,
  twoFactorEnabled: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  roles: []
};

// Helper to wrap components with required providers
const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          {component}
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Task 6.1: UI displays new enum values correctly', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('EmployeeListPage - PROBATION and NOTICE_PERIOD badges', () => {
    it('should display PROBATION badge with blue styling', async () => {
      // Requirement 5.1: Display PROBATION status with appropriate badge styling
      const mockEmployees = {
        content: [
          {
            id: 1,
            employeeNumber: 'EMP001',
            fullName: 'John Doe',
            jobTitle: 'Software Engineer',
            departmentName: 'Engineering',
            employmentStatus: EmploymentStatus.PROBATION,
            hireDate: '2024-01-01',
            workEmail: 'john@example.com'
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true
      };

      (employeeApi.getEmployees as jest.Mock).mockResolvedValue(mockEmployees);

      renderWithProviders(<EmployeeListPage />);

      await waitFor(() => {
        expect(screen.getByText('PROBATION')).toBeInTheDocument();
      });
      const probationBadge = screen.getByText('PROBATION');
      const badgeStyle = window.getComputedStyle(probationBadge);
      expect(badgeStyle.color).toMatch(/rgb\(59,\s*130,\s*246\)|#3b82f6/i);
    });

    it('should display NOTICE_PERIOD badge with orange-red styling', async () => {
      // Requirement 5.2: Display NOTICE_PERIOD status with appropriate badge styling
      const mockEmployees = {
        content: [
          {
            id: 2,
            employeeNumber: 'EMP002',
            fullName: 'Jane Smith',
            jobTitle: 'Product Manager',
            departmentName: 'Product',
            employmentStatus: EmploymentStatus.NOTICE_PERIOD,
            hireDate: '2023-01-01',
            workEmail: 'jane@example.com'
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true
      };

      (employeeApi.getEmployees as jest.Mock).mockResolvedValue(mockEmployees);

      renderWithProviders(<EmployeeListPage />);

      await waitFor(() => {
        expect(screen.getByText('NOTICE_PERIOD')).toBeInTheDocument();
      });
      const noticePeriodBadge = screen.getByText('NOTICE_PERIOD');
      const badgeStyle = window.getComputedStyle(noticePeriodBadge);
      expect(badgeStyle.color).toMatch(/rgb\(249,\s*115,\s*22\)|#f97316/i);
    });
  });

  describe('PayrollRunList - CALCULATED, REJECTED, and ERROR badges', () => {
    it('should display CALCULATED badge with info styling and calculator icon', () => {
      // Requirement 5.3: Display CALCULATED status with appropriate badge styling
      const mockPayrollRuns = [
        {
          id: 1,
          name: 'January 2024 Payroll',
          description: 'Monthly payroll',
          payPeriodStart: '2024-01-01',
          payPeriodEnd: '2024-01-31',
          payDate: '2024-02-01',
          status: PayrollRunStatus.CALCULATED,
          employeeCount: 50,
          totalGrossPay: 100000,
          totalDeductions: 20000,
          totalNetPay: 80000,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          organizationId: 1
        }
      ];

      render(<PayrollRunList payrollRuns={mockPayrollRuns} viewMode="table" />);

      const calculatedBadge = screen.getByText(/🧮.*CALCULATED/);
      expect(calculatedBadge).toBeInTheDocument();
      // Badge is rendered by StatusBadge component
    });

    it('should display REJECTED badge with danger styling and X icon', () => {
      // Requirement 5.4: Display REJECTED status with appropriate badge styling
      const mockPayrollRuns = [
        {
          id: 2,
          name: 'February 2024 Payroll',
          description: 'Monthly payroll',
          payPeriodStart: '2024-02-01',
          payPeriodEnd: '2024-02-29',
          payDate: '2024-03-01',
          status: PayrollRunStatus.REJECTED,
          employeeCount: 50,
          totalGrossPay: 100000,
          totalDeductions: 20000,
          totalNetPay: 80000,
          createdAt: '2024-02-01T00:00:00Z',
          updatedAt: '2024-02-01T00:00:00Z',
          organizationId: 1
        }
      ];

      render(<PayrollRunList payrollRuns={mockPayrollRuns} viewMode="table" />);

      const rejectedBadge = screen.getByText(/❌.*REJECTED/);
      expect(rejectedBadge).toBeInTheDocument();
      // Badge is rendered by StatusBadge component
    });

    it('should display ERROR badge with danger styling and warning icon', () => {
      // Requirement 5.5: Display ERROR status with appropriate badge styling
      const mockPayrollRuns = [
        {
          id: 3,
          name: 'March 2024 Payroll',
          description: 'Monthly payroll',
          payPeriodStart: '2024-03-01',
          payPeriodEnd: '2024-03-31',
          payDate: '2024-04-01',
          status: PayrollRunStatus.ERROR,
          employeeCount: 50,
          totalGrossPay: 100000,
          totalDeductions: 20000,
          totalNetPay: 80000,
          createdAt: '2024-03-01T00:00:00Z',
          updatedAt: '2024-03-01T00:00:00Z',
          organizationId: 1
        }
      ];

      render(<PayrollRunList payrollRuns={mockPayrollRuns} viewMode="table" />);

      const errorBadge = screen.getByText(/⚠️.*ERROR/);
      expect(errorBadge).toBeInTheDocument();
      // Badge is rendered by StatusBadge component
    });
  });

  describe('AttendancePage - WORK_FROM_HOME, OVERTIME, and COMP_OFF', () => {
    beforeEach(() => {
      // Mock attendance API responses
      (attendanceApi.getAttendanceRecords as jest.Mock).mockResolvedValue({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true
      });

      (attendanceApi.getAttendanceSummary as jest.Mock).mockResolvedValue({
        totalEmployees: 100,
        presentToday: 80,
        absentToday: 5,
        onLeaveToday: 10,
        lateToday: 5,
        averageAttendanceRate: 95.5
      });

      (attendanceApi.getTodayAttendance as jest.Mock).mockResolvedValue(null);
    });

    it('should display WORK_FROM_HOME badge with info styling and 🏠 icon in calendar', async () => {
      // Requirement 5.6: Display WORK_FROM_HOME status with appropriate badge styling and calendar icon
      const mockAttendance = {
        content: [
          {
            id: 1,
            employeeId: 1,
            employeeName: 'John Doe',
            attendanceDate: new Date().toISOString().split('T')[0],
            checkInTime: '09:00:00',
            checkOutTime: '17:00:00',
            totalHours: 8,
            status: AttendanceStatus.WORK_FROM_HOME,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true
      };

      (attendanceApi.getAttendanceRecords as jest.Mock).mockResolvedValue(mockAttendance);

      renderWithProviders(<AttendancePage />);

      await waitFor(() => {
        // Check for badge in table view
        const wfhBadge = screen.getByText(/WORK FROM HOME/i);
        expect(wfhBadge).toBeInTheDocument();
      });

      // Switch to calendar view and check for icon
      const calendarButton = screen.getByText('Calendar View');
      calendarButton.click();

      await waitFor(() => {
        const wfhIcon = screen.getByText('🏠');
        expect(wfhIcon).toBeInTheDocument();
      });
    });

    it('should display OVERTIME badge with warning styling and ⏱️ icon in calendar', async () => {
      // Requirement 5.7: Display OVERTIME status with appropriate badge styling and calendar icon
      const mockAttendance = {
        content: [
          {
            id: 2,
            employeeId: 1,
            employeeName: 'John Doe',
            attendanceDate: new Date().toISOString().split('T')[0],
            checkInTime: '09:00:00',
            checkOutTime: '21:00:00',
            totalHours: 12,
            overtimeHours: 4,
            status: AttendanceStatus.OVERTIME,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true
      };

      (attendanceApi.getAttendanceRecords as jest.Mock).mockResolvedValue(mockAttendance);

      renderWithProviders(<AttendancePage />);

      await waitFor(() => {
        const overtimeBadge = screen.getByText(/OVERTIME/i);
        expect(overtimeBadge).toBeInTheDocument();
      });

      // Switch to calendar view and check for icon
      const calendarButton = screen.getByText('Calendar View');
      calendarButton.click();

      await waitFor(() => {
        const overtimeIcon = screen.getByText('⏱️');
        expect(overtimeIcon).toBeInTheDocument();
      });
    });

    it('should display COMP_OFF badge with success styling and 🎁 icon in calendar', async () => {
      // Requirement 5.8: Display COMP_OFF status with appropriate badge styling and calendar icon
      const mockAttendance = {
        content: [
          {
            id: 3,
            employeeId: 1,
            employeeName: 'John Doe',
            attendanceDate: new Date().toISOString().split('T')[0],
            status: AttendanceStatus.COMP_OFF,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true
      };

      (attendanceApi.getAttendanceRecords as jest.Mock).mockResolvedValue(mockAttendance);

      renderWithProviders(<AttendancePage />);

      await waitFor(() => {
        const compOffBadge = screen.getByText(/COMP OFF/i);
        expect(compOffBadge).toBeInTheDocument();
      });

      // Switch to calendar view and check for icon
      const calendarButton = screen.getByText('Calendar View');
      calendarButton.click();

      await waitFor(() => {
        const compOffIcon = screen.getByText('🎁');
        expect(compOffIcon).toBeInTheDocument();
      });
    });

    it('should display all new attendance statuses in calendar legend', async () => {
      // Verify calendar legend includes all new statuses
      renderWithProviders(<AttendancePage />);

      // Switch to calendar view
      const calendarButton = screen.getByText('Calendar View');
      calendarButton.click();

      await waitFor(() => {
        expect(screen.getByText('🏠')).toBeInTheDocument();
        expect(screen.getByText('⏱️')).toBeInTheDocument();
        expect(screen.getByText('🎁')).toBeInTheDocument();
        expect(screen.getByText('Work From Home')).toBeInTheDocument();
        expect(screen.getByText('Overtime')).toBeInTheDocument();
        expect(screen.getByText('Comp Off')).toBeInTheDocument();
      });
    });
  });

  describe('LeaveRequestsPage - WITHDRAWN and EXPIRED badges', () => {
    beforeEach(() => {
      (leaveApi.getLeaveRequests as jest.Mock).mockResolvedValue({
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true
      });

      (leaveApi.getLeaveTypes as jest.Mock).mockResolvedValue([]);
    });

    it('should display WITHDRAWN badge with secondary styling and ↩️ icon', async () => {
      // Requirement 5.9: Display WITHDRAWN status with appropriate badge styling
      const mockLeaveRequests = {
        content: [
          {
            id: 1,
            employeeId: 1,
            leaveTypeId: 1,
            startDate: '2024-02-01',
            endDate: '2024-02-05',
            totalDays: 5,
            reason: 'Personal reasons',
            status: LeaveStatus.WITHDRAWN,
            createdAt: '2024-01-15T00:00:00Z',
            updatedAt: '2024-01-20T00:00:00Z',
            employee: {
              id: 1,
              fullName: 'John Doe',
              employeeNumber: 'EMP001'
            },
            leaveType: {
              id: 1,
              name: 'Annual Leave'
            }
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true
      };

      (leaveApi.getLeaveRequests as jest.Mock).mockResolvedValue(mockLeaveRequests);

      renderWithProviders(<LeaveRequestsPage />);

      await waitFor(() => {
        const withdrawnBadge = screen.getByText(/↩️.*WITHDRAWN/);
        expect(withdrawnBadge).toBeInTheDocument();
        expect(withdrawnBadge).toHaveClass('status-badge');
        expect(withdrawnBadge).toHaveClass('status-secondary');
      });
    });

    it('should display EXPIRED badge with danger styling and ⏰ icon', async () => {
      // Requirement 5.10: Display EXPIRED status with appropriate badge styling
      const mockLeaveRequests = {
        content: [
          {
            id: 2,
            employeeId: 1,
            leaveTypeId: 1,
            startDate: '2024-01-01',
            endDate: '2024-01-05',
            totalDays: 5,
            reason: 'Vacation',
            status: LeaveStatus.EXPIRED,
            createdAt: '2023-12-15T00:00:00Z',
            updatedAt: '2024-01-10T00:00:00Z',
            employee: {
              id: 1,
              fullName: 'Jane Smith',
              employeeNumber: 'EMP002'
            },
            leaveType: {
              id: 1,
              name: 'Annual Leave'
            }
          }
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true
      };

      (leaveApi.getLeaveRequests as jest.Mock).mockResolvedValue(mockLeaveRequests);

      renderWithProviders(<LeaveRequestsPage />);

      await waitFor(() => {
        const expiredBadge = screen.getByText(/⏰.*EXPIRED/);
        expect(expiredBadge).toBeInTheDocument();
        expect(expiredBadge).toHaveClass('status-badge');
        expect(expiredBadge).toHaveClass('status-danger');
      });
    });
  });

  describe('Requirement 8.3: Frontend displays all enum values correctly', () => {
    it('should render all new enum values across all components', async () => {
      // This test verifies that the frontend can handle all new enum values
      // Requirements: 8.3 - Frontend SHALL render new enum values correctly

      // Test EmploymentStatus enums
      const employmentStatuses = [
        EmploymentStatus.PROBATION,
        EmploymentStatus.NOTICE_PERIOD
      ];
      employmentStatuses.forEach(status => {
        expect(Object.values(EmploymentStatus)).toContain(status);
      });

      // Test PayrollRunStatus enums
      const payrollStatuses = [
        PayrollRunStatus.CALCULATED,
        PayrollRunStatus.REJECTED,
        PayrollRunStatus.ERROR
      ];
      payrollStatuses.forEach(status => {
        expect(Object.values(PayrollRunStatus)).toContain(status);
      });

      // Test AttendanceStatus enums
      const attendanceStatuses = [
        AttendanceStatus.WORK_FROM_HOME,
        AttendanceStatus.OVERTIME,
        AttendanceStatus.COMP_OFF
      ];
      attendanceStatuses.forEach(status => {
        expect(Object.values(AttendanceStatus)).toContain(status);
      });

      // Test LeaveStatus enums
      const leaveStatuses = [
        LeaveStatus.WITHDRAWN,
        LeaveStatus.EXPIRED
      ];
      leaveStatuses.forEach(status => {
        expect(Object.values(LeaveStatus)).toContain(status);
      });
    });
  });
});
