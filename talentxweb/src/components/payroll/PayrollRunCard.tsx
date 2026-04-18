import React from 'react';
import { PayrollRun, PayrollRunStatus } from '../../types';
import StatusBadge from '../common/StatusBadge';
import Button from '../common/Button';

export interface PayrollRunCardProps {
  payrollRun: PayrollRun;
  onView?: ((payrollRun: PayrollRun) => void) | undefined;
  onProcess?: ((payrollRun: PayrollRun) => void) | undefined;
  onApprove?: ((payrollRun: PayrollRun) => void) | undefined;
  onCancel?: ((payrollRun: PayrollRun) => void) | undefined;
}

const PayrollRunCard: React.FC<PayrollRunCardProps> = ({
  payrollRun,
  onView,
  onProcess,
  onApprove,
  onCancel
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

  return (
    <div className="payroll-run-card">
      <div className="payroll-run-card-header">
        <div className="payroll-run-card-title">
          <h3>{payrollRun.name}</h3>
          <StatusBadge
            status={getStatusVariant(payrollRun.status)}
            label={`${getStatusIcon(payrollRun.status)} ${payrollRun.status}`}
            showIcon={false}
          />
        </div>
        <div className="payroll-run-card-id">
          <span className="label">ID:</span> #{payrollRun.id}
        </div>
      </div>

      <div className="payroll-run-card-body">
        <div className="payroll-run-info-grid">
          <div className="info-item">
            <span className="label">Pay Period</span>
            <span className="value">
              {formatDate(payrollRun.payPeriodStart)} - {formatDate(payrollRun.payPeriodEnd)}
            </span>
          </div>

          <div className="info-item">
            <span className="label">Pay Date</span>
            <span className="value">{formatDate(payrollRun.payDate)}</span>
          </div>

          <div className="info-item">
            <span className="label">Employees</span>
            <span className="value">{payrollRun.employeeCount || 0}</span>
          </div>

          <div className="info-item">
            <span className="label">Total Gross</span>
            <span className="value amount">{formatCurrency(payrollRun.totalGross || payrollRun.totalGrossPay)}</span>
          </div>

          <div className="info-item">
            <span className="label">Total Deductions</span>
            <span className="value amount">{formatCurrency(payrollRun.totalDeductions)}</span>
          </div>

          <div className="info-item">
            <span className="label">Total Net</span>
            <span className="value amount highlight">{formatCurrency(payrollRun.totalNet || payrollRun.totalNetPay)}</span>
          </div>

          {payrollRun.totalTaxes !== undefined && (
            <div className="info-item">
              <span className="label">Total Taxes</span>
              <span className="value amount">{formatCurrency(payrollRun.totalTaxes)}</span>
            </div>
          )}
        </div>

        {payrollRun.description && (
          <div className="payroll-run-description">
            <span className="label">Description:</span>
            <p>{payrollRun.description}</p>
          </div>
        )}

        {payrollRun.notes && (
          <div className="payroll-run-notes">
            <span className="label">Notes:</span>
            <p>{payrollRun.notes}</p>
          </div>
        )}

        <div className="payroll-run-metadata">
          {payrollRun.processedBy && (
            <div className="metadata-item">
              <span className="label">Processed By:</span>
              <span className="value">User #{payrollRun.processedBy}</span>
              {payrollRun.processedAt && (
                <span className="timestamp"> on {formatDate(payrollRun.processedAt)}</span>
              )}
            </div>
          )}

          {payrollRun.approvedBy && (
            <div className="metadata-item">
              <span className="label">Approved By:</span>
              <span className="value">User #{payrollRun.approvedBy}</span>
              {payrollRun.approvedAt && (
                <span className="timestamp"> on {formatDate(payrollRun.approvedAt)}</span>
              )}
            </div>
          )}

          {payrollRun.paidBy && (
            <div className="metadata-item">
              <span className="label">Paid By:</span>
              <span className="value">{payrollRun.paidBy}</span>
              {payrollRun.paidAt && (
                <span className="timestamp"> on {formatDate(payrollRun.paidAt)}</span>
              )}
            </div>
          )}

          {payrollRun.externalPayrollId && (
            <div className="metadata-item">
              <span className="label">External ID:</span>
              <span className="value">{payrollRun.externalPayrollId}</span>
            </div>
          )}
        </div>
      </div>

      <div className="payroll-run-card-footer">
        <div className="action-buttons">
          {onView && (
            <Button variant="secondary" size="sm" onClick={() => onView(payrollRun)}>
              View Details
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

        <div className="payroll-run-timestamps">
          <span className="timestamp-item">
            Created: {formatDate(payrollRun.createdAt)}
          </span>
          <span className="timestamp-item">
            Updated: {formatDate(payrollRun.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PayrollRunCard;
