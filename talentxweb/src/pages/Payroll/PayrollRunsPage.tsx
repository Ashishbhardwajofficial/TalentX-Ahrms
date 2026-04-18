import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Plus,
  Activity,
  Users,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Receipt,
  RotateCcw,
  Calendar,
  FileText
} from 'lucide-react';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import PageTransition from '../../components/common/PageTransition';
import Breadcrumb from '../../components/common/Breadcrumb';
import EnhancedStatCard from '../../components/cards/EnhancedStatCard';
import payrollApi, { PayrollRunDTO, PayrollRunCreateDTO } from '../../api/payrollApi';
import { PayrollRunStatus } from '../../types';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

const PayrollRunsPage: React.FC = () => {
  const { user } = useAuthContext();
  const toast = useToast();
  const [payrollRuns, setPayrollRuns] = useState<PayrollRunDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [selectedRun, setSelectedRun] = useState<PayrollRunDTO | null>(null);

  // Form states
  const [createForm, setCreateForm] = useState<PayrollRunCreateDTO>({
    organizationId: user?.organizationId ?? 1,
    payPeriodStart: '',
    payPeriodEnd: '',
    payDate: ''
  });
  const [approvalComments, setApprovalComments] = useState('');

  // Filters
  const [statusFilter, setStatusFilter] = useState<PayrollRunStatus | ''>('');


  useEffect(() => {
    loadPayrollRuns();
  }, [pagination.page, pagination.size, statusFilter]);

  const loadPayrollRuns = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: any = {
        page: pagination.page - 1,
        size: pagination.size
      };
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response = await payrollApi.getPayrollRuns(params);
      setPayrollRuns(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load payroll runs';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayrollRun = async () => {
    if (!createForm.payPeriodStart || !createForm.payPeriodEnd || !createForm.payDate) {
      toast.warning('Please fill in all required fields');
      return;
    }

    setLoading(true);
    const toastId = toast.loading('Initializing payroll cycle...');
    try {
      await payrollApi.createPayrollRun(createForm);
      setIsCreateModalOpen(false);
      setCreateForm({
        organizationId: user?.organizationId ?? 1,
        payPeriodStart: '',
        payPeriodEnd: '',
        payDate: ''
      });
      toast.success('Payroll cycle initialized successfully');
      await loadPayrollRuns();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create payroll run');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayrollRun = async () => {
    if (!selectedRun) return;

    setLoading(true);
    const toastId = toast.loading(`Calculating payroll for ${selectedRun.employeeCount} talents...`);
    try {
      await payrollApi.processPayrollRun(selectedRun.id);
      setIsProcessModalOpen(false);
      setSelectedRun(null);
      toast.success('Payroll calculation complete');
      await loadPayrollRuns();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to process payroll run');
    } finally {
      setLoading(false);
    }
  };

  const handleApprovePayrollRun = async () => {
    if (!selectedRun) return;

    setLoading(true);
    const toastId = toast.loading('Synchronizing approval with financial systems...');
    try {
      await payrollApi.approvePayrollRun(selectedRun.id, approvalComments);
      setIsApproveModalOpen(false);
      setSelectedRun(null);
      setApprovalComments('');
      toast.success('Payroll cycle approved and ready for disbursement');
      await loadPayrollRuns();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to approve payroll run');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayrollRun = async (run: PayrollRunDTO) => {
    const reason = window.prompt('Provide cancellation rationale for audit trail:');
    if (!reason) return;

    setLoading(true);
    const toastId = toast.loading('Revoking payroll cycle...');
    try {
      await payrollApi.cancelPayrollRun(run.id, reason);
      toast.success('Payroll cycle revoked');
      await loadPayrollRuns();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel payroll run');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusConfig = (status: PayrollRunStatus) => {
    switch (status) {
      case PayrollRunStatus.DRAFT:
        return { label: 'Draft', color: 'bg-secondary-100 text-secondary-600 border-secondary-200 dark:bg-secondary-800/50 dark:border-secondary-700', icon: <Clock /> };
      case PayrollRunStatus.PROCESSING:
        return { label: 'In Progress', color: 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800', icon: <Activity className="animate-pulse" /> };
      case PayrollRunStatus.PROCESSED:
        return { label: 'Calculated', color: 'bg-info-50 text-info-600 border-info-200 dark:bg-info-900/20 dark:border-info-800', icon: <TrendingUp /> };
      case PayrollRunStatus.APPROVED:
        return { label: 'Authorized', color: 'bg-success-50 text-success-600 border-success-200 dark:bg-success-900/20 dark:border-success-800', icon: <ShieldCheck /> };
      case PayrollRunStatus.PAID:
        return { label: 'Disbursed', color: 'bg-success-500 text-white border-transparent', icon: <CheckCircle2 /> };
      case PayrollRunStatus.CANCELLED:
        return { label: 'Revoked', color: 'bg-danger-50 text-danger-600 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800', icon: <XCircle /> };
      default:
        return { label: status, color: 'bg-secondary-50 text-secondary-500 border-secondary-200', icon: <AlertCircle /> };
    }
  };

  const columns: ColumnDefinition<PayrollRunDTO>[] = [
    {
      key: 'id',
      header: 'Cycle ID',
      render: (val) => <span className="font-mono text-xs font-bold text-secondary-400">#{val}</span>
    },
    {
      key: 'payPeriodStart',
      header: 'Operational Window',
      render: (_, run) => (
        <div className="flex flex-col">
          <span className="font-bold text-secondary-900 dark:text-white text-sm tracking-tight">{formatDate(run.payPeriodStart)} — {formatDate(run.payPeriodEnd)}</span>
          <span className="text-[10px] text-secondary-500 font-medium flex items-center gap-1"><Calendar className="w-3 h-3" /> Target Pay: {formatDate(run.payDate)}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const config = getStatusConfig(value as PayrollRunStatus);
        return (
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border center gap-1.5 ${config.color}`}>
            {React.cloneElement(config.icon as React.ReactElement, { className: 'w-3 h-3' })}
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'employeeCount',
      header: 'Headcount',
      render: (val) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-secondary-100 dark:bg-secondary-800 center border border-secondary-200 dark:border-secondary-700">
            <Users className="w-3.5 h-3.5 text-secondary-500" />
          </div>
          <span className="font-bold text-secondary-900 dark:text-white">{val}</span>
        </div>
      )
    },
    {
      key: 'totalNetPay',
      header: 'Total Disbursement',
      render: (value) => (
        <div className="flex flex-col items-end">
          <span className="font-black text-secondary-900 dark:text-white tracking-tighter text-base">{formatCurrency(value as number)}</span>
          <span className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest">Net Payable</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Operations',
      render: (_, run) => (
        <div className="flex items-center gap-2 justify-end">
          {run.status === PayrollRunStatus.DRAFT && (
            <Button
              variant="primary"
              size="xs"
              onClick={() => { setSelectedRun(run); setIsProcessModalOpen(true); }}
            >
              Calculate
            </Button>
          )}
          {run.status === PayrollRunStatus.PROCESSED && (
            <Button
              variant="success"
              size="xs"
              onClick={() => { setSelectedRun(run); setIsApproveModalOpen(true); }}
            >
              Authorize
            </Button>
          )}
          {run.status === PayrollRunStatus.DRAFT && (
            <Button
              variant="glass"
              size="xs"
              className="text-danger-500"
              onClick={() => handleCancelPayrollRun(run)}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
            />
          )}
        </div>
      )
    }
  ];

  const totalDisbursement = payrollRuns.reduce((acc, run) => acc + (run.totalNetPay || 0), 0);
  const activeCount = payrollRuns.filter(r => r.status === PayrollRunStatus.PROCESSING).length;
  const pendingApproval = payrollRuns.filter(r => r.status === PayrollRunStatus.PROCESSED).length;

  return (
    <PageTransition>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Financials', path: '/payroll' }, { label: 'Payroll Runs', path: '/payroll/runs' }]} />
            <h1 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tight">Financial Cycles</h1>
            <p className="text-secondary-500 font-medium italic">Precision management of organizational compensation cycles.</p>
          </div>
          <Button
            variant="gradient"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
            className="shadow-glow"
          >
            Initiate Cycle
          </Button>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <EnhancedStatCard
            title="Total Disbursement"
            value={formatCurrency(totalDisbursement)}
            icon={<DollarSign />}
            status="info"
            trend={{ value: 5.2, direction: 'up' }}
            context="Current Quarter"
            isLoading={loading}
          />
          <EnhancedStatCard
            title="Operational Load"
            value={activeCount}
            icon={<Activity />}
            status={activeCount > 0 ? "warning" : "success"}
            context="Active Calculations"
            isLoading={loading}
          />
          <EnhancedStatCard
            title="Pending Authorization"
            value={pendingApproval}
            icon={<ShieldCheck />}
            status={pendingApproval > 0 ? "warning" : "success"}
            context="Awaiting Board Approval"
            isLoading={loading}
          />
        </div>

        {/* Filters */}
        <div className="premium-card p-6 flex flex-col md:flex-row gap-4 items-center bg-white/50 dark:bg-secondary-900/50 backdrop-blur-md transition-all hover:shadow-premium">
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-1 group">
              <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
              <select
                className="w-full pl-12 pr-4 py-3 bg-secondary-50/50 dark:bg-secondary-800/50 rounded-2xl border-2 border-transparent focus:border-primary-500/20 outline-none text-xs font-bold uppercase tracking-widest dark:text-white transition-all appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PayrollRunStatus | '')}
              >
                <option value="">Cycle Status: All States</option>
                {Object.values(PayrollRunStatus).map(status => (
                  <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            <Button variant="primary" icon={<RotateCcw className="w-4 h-4" />} onClick={() => { setStatusFilter(''); loadPayrollRuns(); }}>Reset</Button>
          </div>
        </div>

        {/* Table */}
        <div className="premium-card overflow-hidden">
          <DataTable
            data={payrollRuns}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
          />
        </div>

        {/* --- Modals Modernized --- */}

        {/* Create Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Initiate Financial Cycle"
          subtitle="Define the operational window and disbursement targets"
        >
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-6">
              <FormField
                label="Operational Start"
                name="payPeriodStart"
                type="date"
                required
                value={createForm.payPeriodStart}
                onChange={(val) => setCreateForm({ ...createForm, payPeriodStart: val })}
              />
              <FormField
                label="Operational End"
                name="payPeriodEnd"
                type="date"
                required
                value={createForm.payPeriodEnd}
                onChange={(val) => setCreateForm({ ...createForm, payPeriodEnd: val })}
              />
            </div>
            <FormField
              label="Disbursement Date"
              name="payDate"
              type="date"
              required
              value={createForm.payDate}
              onChange={(val) => setCreateForm({ ...createForm, payDate: val })}
            />
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreatePayrollRun} isLoading={loading}>Initialize Cycle</Button>
            </div>
          </div>
        </Modal>

        {/* Process Modal */}
        <Modal
          isOpen={isProcessModalOpen}
          onClose={() => setIsProcessModalOpen(false)}
          title="Execute Compensation Calculation"
        >
          {selectedRun && (
            <div className="space-y-6 py-4">
              <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800/20 text-sm font-medium text-primary-900 dark:text-primary-100 italic">
                System will now aggregate all time-logs, adjustments, and statutory deductions for the specified window.
              </div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Headcount', value: selectedRun.employeeCount, icon: <Users /> },
                  { label: 'Target Date', value: formatDate(selectedRun.payDate), icon: <Calendar /> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700/50">
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-secondary-800 center text-secondary-400">
                      {React.cloneElement(item.icon as React.ReactElement, { className: 'w-4 h-4' })}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400">{item.label}</span>
                      <span className="text-sm font-bold text-secondary-900 dark:text-white uppercase tracking-tighter">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setIsProcessModalOpen(false)}>Abort</Button>
                <Button variant="primary" onClick={handleProcessPayrollRun} isLoading={loading}>Execute Calculation</Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Approve Modal */}
        <Modal
          isOpen={isApproveModalOpen}
          onClose={() => setIsApproveModalOpen(false)}
          title="Board Authorization"
        >
          {selectedRun && (
            <div className="space-y-6 py-4">
              <div className="premium-card p-6 bg-secondary-900 text-white space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-black tracking-widest text-secondary-400">Disbursement Total</span>
                  <Receipt className="w-5 h-5 text-primary-500" />
                </div>
                <div className="text-4xl font-black tracking-tighter">{formatCurrency(selectedRun.totalNetPay)}</div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-secondary-800 text-[11px] font-bold">
                  <div className="flex flex-col">
                    <span className="text-secondary-500 uppercase tracking-tighter">Gross Payable</span>
                    <span>{formatCurrency(selectedRun.totalGrossPay)}</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-secondary-500 uppercase tracking-tighter">Statutory Deductions</span>
                    <span className="text-danger-400">-{formatCurrency(selectedRun.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              <FormField
                label="Authorization Rationale"
                name="comments"
                type="textarea"
                placeholder="Include board resolution reference or supplementary notes..."
                value={approvalComments}
                onChange={(val) => setApprovalComments(val)}
              />

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="ghost" onClick={() => setIsApproveModalOpen(false)}>Cancel</Button>
                <Button variant="success" onClick={handleApprovePayrollRun} isLoading={loading}>Authorize Disbursement</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
};

export default PayrollRunsPage;
