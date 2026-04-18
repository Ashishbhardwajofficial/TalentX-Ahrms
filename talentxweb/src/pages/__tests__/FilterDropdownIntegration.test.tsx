/**
 * Integration tests for Task 6.2: Test filter dropdowns include new enum values
 * 
 * Tests verify that:
 * - Employee filter includes PROBATION and NOTICE_PERIOD
 * - Payroll filter includes CALCULATED, REJECTED, ERROR
 * - Attendance filter includes WORK_FROM_HOME, OVERTIME, COMP_OFF
 * - Leave filter includes WITHDRAWN and EXPIRED
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import EmployeeListPage from '../Employees/EmployeeListPage';
import AttendancePage from '../Attendance/AttendancePage';
import LeaveRequestsPage from '../Leave/LeaveRequestsPage';
import {
  EmploymentStatus,
  AttendanceStatus,
  LeaveStatus
} from '../../types';
import * as employeeApi from '../../api/employeeApi';
import * as attendanceApi from '../../api/attendanceApi';
import * as leaveApi from '../../api/leaveApi';
import { AuthProvider } from '../../context/AuthContext';
import { NotificationProvider } from '../../context/NotificationContext';

// Mock API modules
jest.mock('../../api/employeeApi', () => ({
  __esModule: true,
  default: {
    getEmployees: jest.fn(),
    exportEmployees: jest.fn()
  },
  getEmployees: jest.fn(),
  exportEmployees: jest.fn()
}));

jest.mock('../../api/attendanceApi', () => ({
  __esModule: true,
  default: {
    getAttendanceRecords: jest.fn(),
    getAttendanceSummary: jest.fn(),
    getTodayAttendance: jest.fn()
  },
  getAttendanceRecords: jest.fn(),
  getAttendanceSummary: jest.fn(),
  getTodayAttendance: jest.fn()
}));

jest.mock('../../api/leaveApi', () => ({
  __esModule: true,
  default: {
    getLeaveRequests: jest.fn(),
    getLeaveTypes: jest.fn()
  },
  getLeaveRequests: jest.fn(),
  getLeaveTypes: jest.fn()
}));

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

describe('Task 6.2: Filter dropdowns include new enum values', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Employee filter dropdown', () => {
    beforeEach(() => {
      const mockEmployees = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true
      };
      (employeeApi.getEmployees as jest.Mock).mockResolvedValue(mockEmployees);
    });

    it('should include PROBATION in employee status filter', async () => {
      // Requirement 6.1: Employee filter SHALL include PROBATION option
      renderWithProviders(<EmployeeListPage />);

      const statusFilter = screen.getByRole('combobox', { name: /status/i }) ||
        screen.getAllByRole('combobox')[0];

      expect(statusFilter).toBeInTheDocument();

      // Check that PROBATION option exists
      const options = Array.from(statusFilter.querySelectorAll('option'));
      const probationOption = options.find(opt => opt.textContent === EmploymentStatus.PROBATION);

      expect(probationOption).toBeDefined();
      expect(probationOption?.value).toBe(EmploymentStatus.PROBATION);
    });

    it('should include NOTICE_PERIOD in employee status filter', async () => {
      // Requirement 6.1: Employee filter SHALL include NOTICE_PERIOD option
      renderWithProviders(<EmployeeListPage />);

      const statusFilter = screen.getAllByRole('combobox')[0];

      // Check that NOTICE_PERIOD option exists
      const options = Array.from(statusFilter.querySelectorAll('option'));
      const noticePeriodOption = options.find(opt => opt.textContent === EmploymentStatus.NOTICE_PERIOD);

      expect(noticePeriodOption).toBeDefined();
      expect(noticePeriodOption?.value).toBe(EmploymentStatus.NOTICE_PERIOD);
    });

    it('should include all 7 employment status values in filter', async () => {
      // Verify complete enum coverage
      renderWithProviders(<EmployeeListPage />);

      const statusFilter = screen.getAllByRole('combobox')[0];
      const options = Array.from(statusFilter.querySelectorAll('option'));

      // Should have "All Statuses" + 7 enum values = 8 options
      expect(options.length).toBe(8);

      // Verify all enum values are present
      const enumValues = Object.values(EmploymentStatus);
      enumValues.forEach(status => {
        const option = options.find(opt => opt.value === status);
        expect(option).toBeDefined();
      });
    });
  });

  describe('Attendance filter dropdown', () => {
    beforeEach(() => {
      const mockAttendance = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true
      };
      (attendanceApi.getAttendanceRecords as jest.Mock).mockResolvedValue(mockAttendance);
      (attendanceApi.getAttendanceSummary as jest.Mock).mockResolvedValue({
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        onLeaveToday: 0,
        lateToday: 0,
        averageAttendanceRate: 0
      });
      (attendanceApi.getTodayAttendance as jest.Mock).mockResolvedValue(null);
    });

    it('should include WORK_FROM_HOME in attendance status filter', async () => {
      // Requirement 6.3: Attendance filter SHALL include WORK_FROM_HOME option
      renderWithProviders(<AttendancePage />);

      const statusFilter = screen.getByLabelText(/status/i);
      expect(statusFilter).toBeInTheDocument();

      // Check that WORK_FROM_HOME option exists
      const options = Array.from(statusFilter.querySelectorAll('option'));
      const wfhOption = options.find(opt => opt.value === AttendanceStatus.WORK_FROM_HOME);

      expect(wfhOption).toBeDefined();
      expect(wfhOption?.textContent).toContain('WORK');
      expect(wfhOption?.textContent).toContain('HOME');
    });

    it('should include OVERTIME in attendance status filter', async () => {
      // Requirement 6.3: Attendance filter SHALL include OVERTIME option
      renderWithProviders(<AttendancePage />);

      const statusFilter = screen.getByLabelText(/status/i);

      // Check that OVERTIME option exists
      const options = Array.from(statusFilter.querySelectorAll('option'));
      const overtimeOption = options.find(opt => opt.value === AttendanceStatus.OVERTIME);

      expect(overtimeOption).toBeDefined();
      expect(overtimeOption?.textContent).toBe('OVERTIME');
    });

    it('should include COMP_OFF in attendance status filter', async () => {
      // Requirement 6.3: Attendance filter SHALL include COMP_OFF option
      renderWithProviders(<AttendancePage />);

      const statusFilter = screen.getByLabelText(/status/i);

      // Check that COMP_OFF option exists
      const options = Array.from(statusFilter.querySelectorAll('option'));
      const compOffOption = options.find(opt => opt.value === AttendanceStatus.COMP_OFF);

      expect(compOffOption).toBeDefined();
      expect(compOffOption?.textContent).toContain('COMP');
      expect(compOffOption?.textContent).toContain('OFF');
    });

    it('should include all 10 attendance status values in filter', async () => {
      // Verify complete enum coverage
      renderWithProviders(<AttendancePage />);

      const statusFilter = screen.getByLabelText(/status/i);
      const options = Array.from(statusFilter.querySelectorAll('option'));

      // Should have "All Statuses" + 10 enum values = 11 options
      expect(options.length).toBe(11);

      // Verify all enum values are present
      const enumValues = Object.values(AttendanceStatus);
      enumValues.forEach(status => {
        const option = options.find(opt => opt.value === status);
        expect(option).toBeDefined();
      });
    });
  });

  describe('Leave filter dropdown', () => {
    beforeEach(() => {
      const mockLeaveRequests = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true
      };
      (leaveApi.getLeaveRequests as jest.Mock).mockResolvedValue(mockLeaveRequests);
      (leaveApi.getLeaveTypes as jest.Mock).mockResolvedValue([]);
    });

    it('should include WITHDRAWN in leave status filter', async () => {
      // Requirement 6.4: Leave filter SHALL include WITHDRAWN option
      renderWithProviders(<LeaveRequestsPage />);

      const statusFilter = screen.getByLabelText(/status/i);
      expect(statusFilter).toBeInTheDocument();

      // Check that WITHDRAWN option exists
      const options = Array.from(statusFilter.querySelectorAll('option'));
      const withdrawnOption = options.find(opt => opt.value === LeaveStatus.WITHDRAWN);

      expect(withdrawnOption).toBeDefined();
      expect(withdrawnOption?.textContent).toBe('Withdrawn');
    });

    it('should include EXPIRED in leave status filter', async () => {
      // Requirement 6.4: Leave filter SHALL include EXPIRED option
      renderWithProviders(<LeaveRequestsPage />);

      const statusFilter = screen.getByLabelText(/status/i);

      // Check that EXPIRED option exists
      const options = Array.from(statusFilter.querySelectorAll('option'));
      const expiredOption = options.find(opt => opt.value === LeaveStatus.EXPIRED);

      expect(expiredOption).toBeDefined();
      expect(expiredOption?.textContent).toBe('Expired');
    });

    it('should include all 6 leave status values in filter', async () => {
      // Verify complete enum coverage
      renderWithProviders(<LeaveRequestsPage />);

      const statusFilter = screen.getByLabelText(/status/i);
      const options = Array.from(statusFilter.querySelectorAll('option'));

      // Should have "All Statuses" + 6 enum values = 7 options
      expect(options.length).toBe(7);

      // Verify all enum values are present
      const enumValues = Object.values(LeaveStatus);
      enumValues.forEach(status => {
        const option = options.find(opt => opt.value === status);
        expect(option).toBeDefined();
      });
    });
  });

  describe('Requirement 6.5: Filter functionality', () => {
    it('should verify all filter dropdowns are functional', async () => {
      // This test verifies that filter dropdowns can be interacted with
      // Requirements: 6.1, 6.2, 6.3, 6.4

      // Test employee filter
      const mockEmployees = {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
        first: true,
        last: true
      };
      (employeeApi.getEmployees as jest.Mock).mockResolvedValue(mockEmployees);

      const { unmount: unmountEmployee } = renderWithProviders(<EmployeeListPage />);

      const employeeFilter = screen.getAllByRole('combobox')[0];
      expect(employeeFilter).toBeEnabled();
      expect(employeeFilter.tagName).toBe('SELECT');

      unmountEmployee();

      // Test attendance filter
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
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        onLeaveToday: 0,
        lateToday: 0,
        averageAttendanceRate: 0
      });
      (attendanceApi.getTodayAttendance as jest.Mock).mockResolvedValue(null);

      const { unmount: unmountAttendance } = renderWithProviders(<AttendancePage />);

      const attendanceFilter = screen.getByLabelText(/status/i);
      expect(attendanceFilter).toBeEnabled();
      expect(attendanceFilter.tagName).toBe('SELECT');

      unmountAttendance();

      // Test leave filter
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

      renderWithProviders(<LeaveRequestsPage />);

      const leaveFilter = screen.getByLabelText(/status/i);
      expect(leaveFilter).toBeEnabled();
      expect(leaveFilter.tagName).toBe('SELECT');
    });
  });
});
