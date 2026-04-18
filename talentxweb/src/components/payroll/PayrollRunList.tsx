import React from 'react';
import { PayrollRun, PayrollRunStatus } from '../../types';
import PayrollRunCard from './PayrollRunCard';
import DataTable, { ColumnDefinition } from '../common/DataTable';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

export interface PayrollRunListProps {
  payrollRuns: PayrollRun[];
  loading?: boolean;
  viewMode?: 'card' | 'table';
  onView?: (payrollRun: PayrollRun) => void;
  onProcess?: (payrollRun: PayrollRun) => void;
  onApprove?: (payrollRun: PayrollRun) => void;
  onCancel?: (payrollRun: PayrollRun) => void;
  pagination?: {
    page: number;
    size: number;
    total: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
}

const PayrollRunList: React.FC<PayrollRunListProps> = ({
  payrollRuns,
  loading = false,
  viewMode = 'table',
  onView,
  onProcess,
  onApprove,
  onCancel,
  pagination,
  onPageChange,
  onPageSizeChange
}) => {
  const formatCurrency = (amount?: number): string => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: PayrollRunStatus): 'success' | 'warning' | 'danger' | 'info' | 'neutral' => {
    const statusMap: Record<PayrollRunStatus, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
      [PayrollRunStatus.DRAFT]: 'neutral',
      [PayrollRunStatus.PROCESSING]: 'warning',
      [PayrollRunStatus.PROCESSED]: 'info',
      [PayrollRunStatus.CALCULATED]: 'info',
      [PayrollRunStatus.APPROVED]: 'success',
      [PayrollRunStatus.REJECTED]: 'danger',
      [PayrollRunStatus.PAID]: 'success',
      [PayrollRunStatus.CANCELLED]: 'danger',
      [PayrollRunStatus.ERROR]: 'danger'
    };
    return statusMap[status] || 'neutral';
  };

  const getStatusIcon = (status: PayrollRunStatus): string => {
    const iconMap: Record<PayrollRunStatus, string> = {
      [PayrollRunStatus.DRAFT]: '📝',
      [PayrollRunStatus.PROCESSING]: '⚙️',
      [PayrollRunStatus.PROCESSED]: '⏳',
      [PayrollRunStatus.CALCULATED]: '🧮',
      [PayrollRunStatus.APPROVED]: '✅',
      [PayrollRunStatus.REJECTED]: '❌',
      [PayrollRunStatus.PAID]: '💰',
      [PayrollRunStatus.CANCELLED]: '🚫',
      [PayrollRunStatus.ERROR]: '⚠️'
    };
    return iconMap[status] || '📄';
  };

  // Card view rendering
  if (viewMode === 'card') {
    return (
      <div className="payroll-run-list-cards">
        {loading ? (
          <div className="loading-message">Loading payroll runs...</div>
        ) : payrollRuns.length === 0 ? (
          <div className="empty-message">No payroll runs found</div>
        ) : (
          <div className="payroll-run-cards-grid">
            {payrollRuns.map((payrollRun) => (
              <PayrollRunCard
                key={payrollRun.id}
                payrollRun={payrollRun}
                onView={onView}
                onProcess={onProcess}
                onApprove={onApprove}
                onCancel={onCancel}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Table view rendering
  const columns: ColumnDefinition<PayrollRun>[] = [
    {
      key: 'id',
      header: 'ID',
      sortable: true,
      render: (value) => `#${value}`
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (value, payrollRun) => (
        <div>
          <div style={{ fontWeight: 500 }}>{value}</div>
          {payrollRun.description && (
            <div style={{ fontSize: '12px', color: '#6c757d' }}>{payrollRun.description}</div>
          )}
        </div>
      )
    },
    {
      key: 'payPeriodStart',
      header: 'Pay Period',
      sortable: true,
      render: (value, payrollRun) => (
        <div>
          {formatDate(payrollRun.payPeriodStart)} - {formatDate(payrollRun.payPeriodEnd)}
        </div>
      )
    },
    {
      key: 'payDate',
      header: 'Pay Date',
      sortable: true,
      render: (value) => formatDate(value as string)
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value) => (
        <StatusBadge
          status={getStatusVariant(value as PayrollRunStatus)}
          label={`${getStatusIcon(value as PayrollRunStatus)} ${value}`}
          showIcon={false}
        />
      )
    },
    {
      key: 'employeeCount',
      header: 'Employees',
      sortable: true,
      render: (value) => value || 0
    },
    {
      key: 'totalGross',
      header: 'Gross Pay',
      sortable: true,
      render: (value, payrollRun) => (
        <span style={{ fontWeight: 500 }}>
          {formatCurrency((value as number) || payrollRun.totalGrossPay)}
        </span>
      )
    },
    {
      key: 'totalDeductions',
      header: 'Deductions',
      sortable: true,
      render: (value) => formatCurrency(value as number)
    },
    {
      key: 'totalNet',
      header: 'Net Pay',
      sortable: true,
      render: (value, payrollRun) => (
        <span style={{ fontWeight: 600, color: '#28a745' }}>
          {formatCurrency((value as number) || payrollRun.totalNetPay)}
        </span>
      )
    },
    {
      key: 'actions' as any,
      header: 'Actions',
      render: (value, payrollRun) => (
        <div className="action-buttons">
          {onView && (
            <Button variant="secondary" size="sm" onClick={() => onView(payrollRun)}>
              View
            </Button>
          )}

          {onProcess && payrollRun.status === PayrollRunStatus.DRAFT && (
            <Button variant="primary" size="sm" onClick={() => onProcess(payrollRun)}>
              Process
            </Button>
          )}

          {onApprove && payrollRun.status === PayrollRunStatus.PROCESSING && (
            <Button variant="success" size="sm" onClick={() => onApprove(payrollRun)}>
              Approve
            </Button>
          )}

          {onCancel && (payrollRun.status === PayrollRunStatus.DRAFT || payrollRun.status === PayrollRunStatus.PROCESSING) && (
            <Button variant="danger" size="sm" onClick={() => onCancel(payrollRun)}>
              Cancel
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="payroll-run-list-table">
      <DataTable
        data={payrollRuns}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};

export default PayrollRunList;
