import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PayrollRunCard from '../payroll/PayrollRunCard';
import PayrollRunList from '../payroll/PayrollRunList';
import LeaveRequestForm from '../leave/LeaveRequestForm';
import AuditInfo from '../common/AuditInfo';
import StatusBadge from '../common/StatusBadge';
import { PayrollRun, PayrollRunStatus, EmploymentStatus } from '../../types';

// Mock the API modules
const mockGetLeaveTypes = jest.fn(() => Promise.resolve([
  { id: 1, name: 'Annual Leave', maxDaysPerYear: 20, code: 'AL', isPaid: true, requiresApproval: true, allowNegativeBalance: false, isActive: true, organizationId: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' },
  { id: 2, name: 'Sick Leave', maxDaysPerYear: 10, code: 'SL', isPaid: true, requiresApproval: true, allowNegativeBalance: false, isActive: true, organizationId: 1, createdAt: '2026-01-01', updatedAt: '2026-01-01' }
]));

const mockCreateLeaveRequest = jest.fn(() => Promise.resolve({ id: 1 }));

jest.mock('../../api/leaveApi', () => ({
  __esModule: true,
  default: {
    getLeaveTypes: mockGetLeaveTypes,
    createLeaveRequest: mockCreateLeaveRequest
  }
}));

jest.mock('../../services/notification', () => ({
  useNotifications: () => ({
    error: jest.fn(),
    success: jest.fn(),
    info: jest.fn(),
    warning: jest.fn()
  })
}));

jest.mock('../../context/AuthContext', () => ({
  useAuthContext: () => ({
    user: { id: 1, email: 'test@example.com' }
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

jest.mock('../../context/NotificationContext', () => ({
  NotificationProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}));

// Test wrapper with providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

describe('Database-Frontend Type Alignment Integration Tests', () => {
  describe('PayrollRun Components', () => {
    const mockPayrollRun: PayrollRun = {
      id: 1,
      organizationId: 1,
      name: 'January 2026 Payroll',
      payPeriodStart: '2026-01-01',
      payPeriodEnd: '2026-01-31',
      payDate: '2026-02-05',
      status: PayrollRunStatus.DRAFT,
      totalGross: 100000.50,
      totalDeductions: 15000.25,
      totalNet: 85000.25,
      totalGrossPay: 100000.50,
      totalNetPay: 85000.25,
      totalTaxes: 12000.00,
      employeeCount: 25,
      description: 'Monthly payroll for January',
      notes: 'All employees included',
      processedBy: 101,
      processedAt: '2026-02-01T10:00:00Z',
      approvedBy: 102,
      approvedAt: '2026-02-02T14:30:00Z',
      paidBy: 'admin@company.com',
      paidAt: '2026-02-05T09:00:00Z',
      externalPayrollId: 'EXT-2026-01',
      createdAt: '2026-01-25T08:00:00Z',
      updatedAt: '2026-02-05T09:00:00Z',
      active: true,
      createdBy: 'system',
      updatedBy: 'admin',
      version: 3
    };

    describe('PayrollRunCard', () => {
      it('renders all PayrollRun fields correctly', () => {
        render(<PayrollRunCard payrollRun={mockPayrollRun} />);

        // Check basic information
        expect(screen.getByText('January 2026 Payroll')).toBeInTheDocument();
        expect(screen.getByText('#1')).toBeInTheDocument();
        expect(screen.getByText(/DRAFT/)).toBeInTheDocument();

        // Check financial fields with 2 decimal precision
        expect(screen.getByText('$100,000.50')).toBeInTheDocument();
        expect(screen.getByText('$15,000.25')).toBeInTheDocument();
        expect(screen.getByText('$85,000.25')).toBeInTheDocument();
        expect(screen.getByText('$12,000.00')).toBeInTheDocument();

        // Check employee count
        expect(screen.getByText('25')).toBeInTheDocument();

        // Check description and notes
        expect(screen.getByText('Monthly payroll for January')).toBeInTheDocument();
        expect(screen.getByText('All employees included')).toBeInTheDocument();

        // Check metadata
        expect(screen.getByText(/User #101/)).toBeInTheDocument();
        expect(screen.getByText(/User #102/)).toBeInTheDocument();
        expect(screen.getByText(/admin@company.com/)).toBeInTheDocument();
        expect(screen.getByText(/EXT-2026-01/)).toBeInTheDocument();
      });

      it('displays correct status badge for each PayrollRunStatus', () => {
        const statuses: PayrollRunStatus[] = [
          PayrollRunStatus.DRAFT,
          PayrollRunStatus.PROCESSING,
          PayrollRunStatus.APPROVED,
          PayrollRunStatus.PAID,
          PayrollRunStatus.CANCELLED
        ];

        statuses.forEach(status => {
          const { unmount } = render(
            <PayrollRunCard payrollRun={{ ...mockPayrollRun, status }} />
          );
          expect(screen.getByText(new RegExp(status))).toBeInTheDocument();
          unmount();
        });
      });

      it('shows action buttons based on status', () => {
        const onProcess = jest.fn();
        const onApprove = jest.fn();
        const onCancel = jest.fn();

        // DRAFT status should show Process and Cancel buttons
        const { rerender } = render(
          <PayrollRunCard
            payrollRun={{ ...mockPayrollRun, status: PayrollRunStatus.DRAFT }}
            onProcess={onProcess}
            onApprove={onApprove}
            onCancel={onCancel}
          />
        );

        expect(screen.getByText('Process')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.queryByText('Approve')).not.toBeInTheDocument();

        // PROCESSING status should show Approve and Cancel buttons
        rerender(
          <PayrollRunCard
            payrollRun={{ ...mockPayrollRun, status: PayrollRunStatus.PROCESSING }}
            onProcess={onProcess}
            onApprove={onApprove}
            onCancel={onCancel}
          />
        );

        expect(screen.getByText('Approve')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.queryByText('Process')).not.toBeInTheDocument();
      });

      it('handles button clicks correctly', () => {
        const onView = jest.fn();
        const onProcess = jest.fn();

        render(
          <PayrollRunCard
            payrollRun={{ ...mockPayrollRun, status: PayrollRunStatus.DRAFT }}
            onView={onView}
            onProcess={onProcess}
          />
        );

        fireEvent.click(screen.getByText('View Details'));
        expect(onView).toHaveBeenCalledWith(mockPayrollRun);

        fireEvent.click(screen.getByText('Process'));
        expect(onProcess).toHaveBeenCalledWith(mockPayrollRun);
      });
    });

    describe('PayrollRunList', () => {
      const mockPayrollRuns: PayrollRun[] = [
        mockPayrollRun,
        {
          ...mockPayrollRun,
          id: 2,
          name: 'February 2026 Payroll',
          status: PayrollRunStatus.PROCESSING
        },
        {
          ...mockPayrollRun,
          id: 3,
          name: 'March 2026 Payroll',
          status: PayrollRunStatus.PAID
        }
      ];

      it('renders multiple payroll runs in card view', () => {
        render(
          <PayrollRunList
            payrollRuns={mockPayrollRuns}
            viewMode="card"
          />
        );

        expect(screen.getByText('January 2026 Payroll')).toBeInTheDocument();
        expect(screen.getByText('February 2026 Payroll')).toBeInTheDocument();
        expect(screen.getByText('March 2026 Payroll')).toBeInTheDocument();
      });

      it('renders multiple payroll runs in table view', () => {
        render(
          <PayrollRunList
            payrollRuns={mockPayrollRuns}
            viewMode="table"
          />
        );

        expect(screen.getByText('January 2026 Payroll')).toBeInTheDocument();
        expect(screen.getByText('February 2026 Payroll')).toBeInTheDocument();
        expect(screen.getByText('March 2026 Payroll')).toBeInTheDocument();
      });

      it('shows loading state', () => {
        render(
          <PayrollRunList
            payrollRuns={[]}
            loading={true}
            viewMode="card"
          />
        );

        expect(screen.getByText('Loading payroll runs...')).toBeInTheDocument();
      });

      it('shows empty state', () => {
        render(
          <PayrollRunList
            payrollRuns={[]}
            loading={false}
            viewMode="card"
          />
        );

        expect(screen.getByText('No payroll runs found')).toBeInTheDocument();
      });
    });
  });

  describe('LeaveRequest Form - Half-Day Leave', () => {
    it('shows half-day period dropdown when half-day checkbox is checked', async () => {
      render(
        <TestWrapper>
          <LeaveRequestForm onSubmit={jest.fn()} onCancel={jest.fn()} />
        </TestWrapper>
      );

      // Wait for leave types to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Leave Type/i)).toBeInTheDocument();
      });

      // Half-day period should not be visible initially
      expect(screen.queryByLabelText(/Half Day Period/i)).not.toBeInTheDocument();

      // Check the half-day checkbox
      const halfDayCheckbox = screen.getByLabelText(/Half Day Leave/i);
      fireEvent.click(halfDayCheckbox);

      // Half-day period dropdown should now be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/Half Day Period/i)).toBeInTheDocument();
      });

      // Check that AM and PM options are available
      const periodSelect = screen.getByLabelText(/Half Day Period/i);
      expect(periodSelect).toBeInTheDocument();
    });

    it('submits half-day leave request with correct data', async () => {
      const onSubmit = jest.fn();
      mockCreateLeaveRequest.mockClear();

      render(
        <TestWrapper>
          <LeaveRequestForm onSubmit={onSubmit} onCancel={jest.fn()} />
        </TestWrapper>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Leave Type/i)).toBeInTheDocument();
      });

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/Leave Type/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2026-02-01' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2026-02-01' } });
      fireEvent.change(screen.getByLabelText(/Reason/i), { target: { value: 'Personal appointment in the morning' } });

      // Check half-day
      fireEvent.click(screen.getByLabelText(/Half Day Leave/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/Half Day Period/i)).toBeInTheDocument();
      });

      // Select AM period
      fireEvent.change(screen.getByLabelText(/Half Day Period/i), { target: { value: 'AM' } });

      // Submit form
      const submitButton = screen.getByText(/Submit Request/i);
      fireEvent.click(submitButton);

      // Verify API was called with correct data
      await waitFor(() => {
        expect(mockCreateLeaveRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            isHalfDay: true,
            halfDayPeriod: 'AM'
          })
        );
      });
    });
  });

  describe('LeaveRequest Form - Emergency Leave', () => {
    it('shows emergency contact fields when emergency checkbox is checked', async () => {
      render(
        <TestWrapper>
          <LeaveRequestForm onSubmit={jest.fn()} onCancel={jest.fn()} />
        </TestWrapper>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Leave Type/i)).toBeInTheDocument();
      });

      // Emergency fields should not be visible initially
      expect(screen.queryByLabelText(/Emergency Contact Name/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/Contact Details/i)).not.toBeInTheDocument();

      // Check the emergency checkbox
      const emergencyCheckbox = screen.getByLabelText(/Emergency Leave/i);
      fireEvent.click(emergencyCheckbox);

      // Emergency fields should now be visible
      await waitFor(() => {
        expect(screen.getByLabelText(/Emergency Contact Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Contact Details/i)).toBeInTheDocument();
      });
    });

    it('submits emergency leave request with correct data', async () => {
      const onSubmit = jest.fn();
      mockCreateLeaveRequest.mockClear();

      render(
        <TestWrapper>
          <LeaveRequestForm onSubmit={onSubmit} onCancel={jest.fn()} />
        </TestWrapper>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Leave Type/i)).toBeInTheDocument();
      });

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/Leave Type/i), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2026-02-10' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2026-02-12' } });
      fireEvent.change(screen.getByLabelText(/Reason/i), { target: { value: 'Family emergency requiring immediate attention' } });

      // Check emergency
      fireEvent.click(screen.getByLabelText(/Emergency Leave/i));

      await waitFor(() => {
        expect(screen.getByLabelText(/Emergency Contact Name/i)).toBeInTheDocument();
      });

      // Fill emergency fields
      fireEvent.change(screen.getByLabelText(/Emergency Contact Name/i), { target: { value: 'John Doe' } });
      fireEvent.change(screen.getByLabelText(/Contact Details/i), { target: { value: '+1-555-0123, john@example.com' } });

      // Submit form
      const submitButton = screen.getByText(/Submit Request/i);
      fireEvent.click(submitButton);

      // Verify API was called with correct data
      await waitFor(() => {
        expect(mockCreateLeaveRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            isEmergency: true,
            emergencyContact: 'John Doe',
            contactDetails: '+1-555-0123, john@example.com'
          })
        );
      });
    });
  });

  describe('LeaveRequest Form - Attachment Upload', () => {
    it('shows attachment URL field', async () => {
      render(
        <TestWrapper>
          <LeaveRequestForm onSubmit={jest.fn()} onCancel={jest.fn()} />
        </TestWrapper>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Leave Type/i)).toBeInTheDocument();
      });

      // Attachment field should be visible
      expect(screen.getByLabelText(/Attachment URL/i)).toBeInTheDocument();
    });

    it('submits leave request with attachment URL', async () => {
      const onSubmit = jest.fn();
      mockCreateLeaveRequest.mockClear();

      render(
        <TestWrapper>
          <LeaveRequestForm onSubmit={onSubmit} onCancel={jest.fn()} />
        </TestWrapper>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Leave Type/i)).toBeInTheDocument();
      });

      // Fill in the form
      fireEvent.change(screen.getByLabelText(/Leave Type/i), { target: { value: '2' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2026-03-01' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2026-03-03' } });
      fireEvent.change(screen.getByLabelText(/Reason/i), { target: { value: 'Medical leave with doctor certificate' } });
      fireEvent.change(screen.getByLabelText(/Attachment URL/i), { target: { value: 'https://docs.company.com/medical-cert-123.pdf' } });

      // Submit form
      const submitButton = screen.getByText(/Submit Request/i);
      fireEvent.click(submitButton);

      // Verify API was called with attachment URL
      await waitFor(() => {
        expect(mockCreateLeaveRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            attachmentUrl: 'https://docs.company.com/medical-cert-123.pdf'
          })
        );
      });
    });
  });

  describe('SUSPENDED Status Display', () => {
    it('renders SUSPENDED status badge correctly', () => {
      render(
        <StatusBadge status="warning" label="⚠ SUSPENDED" />
      );

      expect(screen.getByText(/SUSPENDED/)).toBeInTheDocument();
    });

    it('displays SUSPENDED status with appropriate styling', () => {
      const { container } = render(
        <StatusBadge status="warning" label="SUSPENDED" />
      );

      const badge = container.querySelector('.status-badge-warning');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Audit Information Display', () => {
    const mockAuditData = {
      createdAt: '2026-01-15T10:30:00Z',
      createdBy: 'john.doe@company.com',
      updatedAt: '2026-01-20T14:45:00Z',
      updatedBy: 'jane.smith@company.com',
      version: 5,
      active: true
    };

    it('renders all audit fields in full mode', () => {
      render(<AuditInfo {...mockAuditData} compact={false} />);

      expect(screen.getByText(/Created:/)).toBeInTheDocument();
      expect(screen.getByText(/john.doe@company.com/)).toBeInTheDocument();
      expect(screen.getByText(/Last Modified:/)).toBeInTheDocument();
      expect(screen.getByText(/jane.smith@company.com/)).toBeInTheDocument();
      expect(screen.getByText(/Version:/)).toBeInTheDocument();
      expect(screen.getByText(/v5/)).toBeInTheDocument();
      expect(screen.getByText(/✓ Active/)).toBeInTheDocument();
    });

    it('renders audit fields in compact mode', () => {
      render(<AuditInfo {...mockAuditData} compact={true} />);

      expect(screen.getByText(/Modified by:/)).toBeInTheDocument();
      expect(screen.getByText(/jane.smith@company.com/)).toBeInTheDocument();
      expect(screen.getByText(/Version:/)).toBeInTheDocument();
      expect(screen.getByText(/v5/)).toBeInTheDocument();
      expect(screen.getByText(/✓ Active/)).toBeInTheDocument();
    });

    it('shows inactive status correctly', () => {
      render(<AuditInfo {...mockAuditData} active={false} compact={false} />);

      expect(screen.getByText(/✕ Inactive/)).toBeInTheDocument();
    });

    it('handles missing optional audit fields', () => {
      render(
        <AuditInfo
          createdAt="2026-01-15T10:30:00Z"
          updatedAt="2026-01-20T14:45:00Z"
          compact={false}
        />
      );

      expect(screen.getByText(/Created:/)).toBeInTheDocument();
      expect(screen.getByText(/Last Modified:/)).toBeInTheDocument();
      expect(screen.queryByText(/Version:/)).not.toBeInTheDocument();
    });

    it('displays version number for optimistic locking', () => {
      render(<AuditInfo version={10} compact={false} />);

      expect(screen.getByText(/v10/)).toBeInTheDocument();
      expect(screen.getByText(/optimistic locking/)).toBeInTheDocument();
    });
  });

  describe('Combined Features Integration', () => {
    const mockPayrollRun: PayrollRun = {
      id: 1,
      organizationId: 1,
      name: 'January 2026 Payroll',
      payPeriodStart: '2026-01-01',
      payPeriodEnd: '2026-01-31',
      payDate: '2026-02-05',
      status: PayrollRunStatus.DRAFT,
      totalGross: 100000.50,
      totalDeductions: 15000.25,
      totalNet: 85000.25,
      totalGrossPay: 100000.50,
      totalNetPay: 85000.25,
      totalTaxes: 12000.00,
      employeeCount: 25,
      description: 'Monthly payroll for January',
      notes: 'All employees included',
      processedBy: 101,
      processedAt: '2026-02-01T10:00:00Z',
      approvedBy: 102,
      approvedAt: '2026-02-02T14:30:00Z',
      paidBy: 'admin@company.com',
      paidAt: '2026-02-05T09:00:00Z',
      externalPayrollId: 'EXT-2026-01',
      createdAt: '2026-01-25T08:00:00Z',
      updatedAt: '2026-02-05T09:00:00Z',
      active: true,
      createdBy: 'system',
      updatedBy: 'admin',
      version: 3
    };

    it('submits leave request with all new fields combined', async () => {
      const onSubmit = jest.fn();
      mockCreateLeaveRequest.mockClear();

      render(
        <TestWrapper>
          <LeaveRequestForm onSubmit={onSubmit} onCancel={jest.fn()} />
        </TestWrapper>
      );

      // Wait for form to load
      await waitFor(() => {
        expect(screen.getByLabelText(/Leave Type/i)).toBeInTheDocument();
      });

      // Fill in basic fields
      fireEvent.change(screen.getByLabelText(/Leave Type/i), { target: { value: '1' } });
      fireEvent.change(screen.getByLabelText(/Start Date/i), { target: { value: '2026-04-01' } });
      fireEvent.change(screen.getByLabelText(/End Date/i), { target: { value: '2026-04-01' } });
      fireEvent.change(screen.getByLabelText(/Reason/i), { target: { value: 'Emergency half-day leave with documentation' } });

      // Enable half-day
      fireEvent.click(screen.getByLabelText(/Half Day Leave/i));
      await waitFor(() => {
        expect(screen.getByLabelText(/Half Day Period/i)).toBeInTheDocument();
      });
      fireEvent.change(screen.getByLabelText(/Half Day Period/i), { target: { value: 'PM' } });

      // Enable emergency
      fireEvent.click(screen.getByLabelText(/Emergency Leave/i));
      await waitFor(() => {
        expect(screen.getByLabelText(/Emergency Contact Name/i)).toBeInTheDocument();
      });
      fireEvent.change(screen.getByLabelText(/Emergency Contact Name/i), { target: { value: 'Emergency Contact' } });
      fireEvent.change(screen.getByLabelText(/Contact Details/i), { target: { value: '+1-555-9999' } });

      // Add attachment
      fireEvent.change(screen.getByLabelText(/Attachment URL/i), { target: { value: 'https://docs.company.com/emergency-doc.pdf' } });

      // Submit form
      const submitButton = screen.getByText(/Submit Request/i);
      fireEvent.click(submitButton);

      // Verify all fields are submitted
      await waitFor(() => {
        expect(mockCreateLeaveRequest).toHaveBeenCalledWith(
          expect.objectContaining({
            isHalfDay: true,
            halfDayPeriod: 'PM',
            isEmergency: true,
            emergencyContact: 'Emergency Contact',
            contactDetails: '+1-555-9999',
            attachmentUrl: 'https://docs.company.com/emergency-doc.pdf'
          })
        );
      });
    });

    it('displays PayrollRun with audit information', () => {
      render(
        <div>
          <PayrollRunCard payrollRun={mockPayrollRun} />
          <AuditInfo
            createdAt={mockPayrollRun.createdAt}
            createdBy={mockPayrollRun.createdBy}
            updatedAt={mockPayrollRun.updatedAt}
            updatedBy={mockPayrollRun.updatedBy}
            version={mockPayrollRun.version}
            active={mockPayrollRun.active}
            compact={false}
          />
        </div>
      );

      // Check PayrollRun is displayed
      expect(screen.getByText('January 2026 Payroll')).toBeInTheDocument();

      // Check audit info is displayed
      expect(screen.getByText(/system/)).toBeInTheDocument();
      expect(screen.getByText(/admin/)).toBeInTheDocument();
      expect(screen.getByText(/v3/)).toBeInTheDocument();
      expect(screen.getByText(/✓ Active/)).toBeInTheDocument();
    });
  });
});
