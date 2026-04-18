import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Plus,
  Eye,
  Check,
  X,
  AlertCircle,
  FileText,
  User,
  History,
  Trash2,
  Download,
  MoreVertical
} from 'lucide-react';
import leaveApi, {
  LeaveRequestResponseDTO,
  LeaveSearchParams,
  LeaveApprovalDTO
} from '../../api/leaveApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import EnhancedStatCard from '../../components/cards/EnhancedStatCard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import SideDrawer from '../../components/common/SideDrawer';
import LeaveRequestForm from '../../components/leave/LeaveRequestForm';
import LeaveBalance from '../../components/leave/LeaveBalance';
import AuditInfo from '../../components/common/AuditInfo';
import { LeaveStatus, LeaveType } from '../../types';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import PageTransition from '../../components/common/PageTransition';
import Breadcrumb from '../../components/common/Breadcrumb';

const LeaveRequestsPage: React.FC = () => {
  const { user } = useAuthContext();
  const { success: showSuccess, error: showError } = useToast();

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequestResponseDTO[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestResponseDTO | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewComments, setReviewComments] = useState('');

  const [filters, setFilters] = useState<LeaveSearchParams>({
    page: 0,
    size: 10
  });

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  
  useEffect(() => {
    loadLeaveRequests();
    loadLeaveTypes();
  }, [filters]);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await leaveApi.getLeaveRequests(filters);
      setLeaveRequests(response.content);
      setPagination({
        page: response.number + 1,
        size: response.size,
        total: response.totalElements
      });

      // In a real app, these would come from an aggregation API
      const allRequests = response.content;
      setStats({
        total: response.totalElements,
        pending: allRequests.filter(r => r.status === LeaveStatus.PENDING).length,
        approved: allRequests.filter(r => r.status === LeaveStatus.APPROVED).length,
        rejected: allRequests.filter(r => r.status === LeaveStatus.REJECTED).length
      });
    } catch (err: any) {
      showError(err.message || 'Failed to load leave requests', { description: 'Loading Error' });
    } finally {
      setLoading(false);
    }
  };

  const loadLeaveTypes = async () => {
    try {
      const types = await leaveApi.getLeaveTypes();
      setLeaveTypes(types);
    } catch (err: any) {
      console.error('Error loading leave types:', err);
    }
  };

  const handleCreateRequest = () => setShowRequestModal(true);

  const handleRequestSubmitted = () => {
    setShowRequestModal(false);
    loadLeaveRequests();
    showSuccess('Leave request submitted successfully');
  };

  const handleViewDetails = (request: LeaveRequestResponseDTO) => {
    setSelectedRequest(request);
    setIsDetailDrawerOpen(true);
  };

  const handleApprovalSubmit = async () => {
    if (!selectedRequest || !approvalAction) return;

    try {
      const approvalData: LeaveApprovalDTO = {
        id: selectedRequest.id,
        status: approvalAction === 'approve' ? LeaveStatus.APPROVED : LeaveStatus.REJECTED,
        ...(reviewComments && { reviewComments })
      };

      await leaveApi.approveLeaveRequest(approvalData);
      setShowApprovalModal(false);
      setIsDetailDrawerOpen(false);
      setSelectedRequest(null);
      setApprovalAction(null);
      setReviewComments('');
      loadLeaveRequests();
      showSuccess(`Leave request ${approvalAction}d successfully`);
    } catch (err: any) {
      showError(err.message || 'Failed to process leave request', { description: 'Error' });
    }
  };

  const handleDeleteRequest = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;
    try {
      await leaveApi.deleteLeaveRequest(id);
      loadLeaveRequests();
      showSuccess('Leave request deleted successfully');
    } catch (err: any) {
      showError(err.message || 'Failed to delete leave request', { description: 'Error' });
    }
  };

  const getStatusConfig = (status: LeaveStatus) => {
    switch (status) {
      case LeaveStatus.PENDING: return { color: 'warning', icon: <Clock className="w-3.5 h-3.5" />, label: 'Reviewing' };
      case LeaveStatus.APPROVED: return { color: 'success', icon: <CheckCircle2 className="w-3.5 h-3.5" />, label: 'Approved' };
      case LeaveStatus.REJECTED: return { color: 'danger', icon: <XCircle className="w-3.5 h-3.5" />, label: 'Rejected' };
      default: return { color: 'secondary', icon: <History className="w-3.5 h-3.5" />, label: status };
    }
  };

  const columns: ColumnDefinition<LeaveRequestResponseDTO>[] = [
    {
      key: 'employee',
      header: 'Employee',
      sortable: true,
      render: (value, request) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary-100 dark:bg-secondary-800 center text-secondary-600 font-bold text-xs uppercase">
            {request.employee?.fullName?.split(' ').map(n => n[0]).join('') || '?'}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-secondary-900 dark:text-white truncate max-w-[150px] tracking-tight">{request.employee?.fullName || 'Unknown'}</span>
            <span className="text-[10px] text-secondary-500 font-medium uppercase tracking-widest">{request.employee?.employeeNumber || 'ID Missing'}</span>
          </div>
        </div>
      )
    },
    {
      key: 'leaveType',
      header: 'Type',
      sortable: true,
      render: (value, request) => (
        <div className="flex flex-col">
          <span className="text-secondary-700 dark:text-secondary-300 font-bold text-xs">{request.leaveType?.name || 'Standard'}</span>
          {request.isHalfDay && <span className="text-[10px] text-primary-500 font-black uppercase tracking-widest">Half Day</span>}
        </div>
      )
    },
    {
      key: 'startDate',
      header: 'Duration',
      render: (value, request) => (
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-xs font-bold text-secondary-900 dark:text-white">{new Date(request.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <span className="text-[10px] text-secondary-400 font-medium italic">Start</span>
          </div>
          <div className="w-6 h-[2px] bg-secondary-100 dark:bg-secondary-800 rounded-full" />
          <div className="flex flex-col items-start">
            <span className="text-xs font-bold text-secondary-900 dark:text-white">{new Date(request.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
            <span className="text-[10px] text-secondary-400 font-medium italic">End</span>
          </div>
        </div>
      )
    },
    {
      key: 'totalDays',
      header: 'Days',
      sortable: true,
      render: (value, request) => (
        <div className="center h-10 w-10 bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl border border-secondary-100 dark:border-secondary-700/50">
          <span className="text-sm font-black text-secondary-900 dark:text-white">{request.totalDays}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value, request) => {
        const config = getStatusConfig(request.status);
        return (
          <div className="space-y-1.5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-current transition-all duration-300 ${config.color === 'success' ? 'bg-success-50 text-success-600 dark:bg-success-900/20' :
              config.color === 'warning' ? 'bg-warning-50 text-warning-600 dark:bg-warning-900/20' :
                config.color === 'danger' ? 'bg-danger-50 text-danger-600 dark:bg-danger-900/20' :
                  'bg-secondary-50 text-secondary-600 dark:bg-secondary-800'
              }`}>
              {config.icon}
              {config.label}
            </span>
            {request.isEmergency && (
              <div className="flex items-center gap-1 text-[9px] text-danger-500 font-black uppercase tracking-tight animate-pulse">
                <AlertCircle className="w-3 h-3" />
                Emergency
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions' as any,
      header: 'Actions',
      render: (value, request) => (
        <div className="flex items-center gap-1">
          <Button variant="glass" size="xs" onClick={() => handleViewDetails(request)} icon={<Eye className="w-3.5 h-3.5" />} />
          {request.status === LeaveStatus.PENDING && (
            <>
              <Button variant="glass" size="xs" className="text-success-600 hover:bg-success-50" onClick={() => { setSelectedRequest(request); setApprovalAction('approve'); setShowApprovalModal(true); }} icon={<Check className="w-3.5 h-3.5" />} />
              <Button variant="glass" size="xs" className="text-danger-600 hover:bg-danger-50" onClick={() => { setSelectedRequest(request); setApprovalAction('reject'); setShowApprovalModal(true); }} icon={<X className="w-3.5 h-3.5" />} />
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Leave Center', path: '/leave' }]} />
            <h1 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tight leading-none">Leave Center</h1>
            <p className="text-secondary-500 font-medium italic">Balanced work, blissful life. Track and manage time away.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" icon={<Download className="w-4 h-4" />}>Reports</Button>
            <Button variant="gradient" icon={<Plus className="w-4 h-4" />} onClick={handleCreateRequest}>Request Leave</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedStatCard
            title="Total Requests"
            value={stats.total}
            icon={<FileText />}
            status="info"
            trend={{ direction: 'neutral', value: 0 }}
            context="Lifetime requests"
          />
          <EnhancedStatCard
            title="Under Review"
            value={stats.pending}
            icon={<Clock />}
            status="warning"
            trend={{ direction: 'up', value: 5 }}
            context="Awaiting response"
          />
          <EnhancedStatCard
            title="Approved"
            value={stats.approved}
            icon={<CheckCircle2 />}
            status="success"
            trend={{ direction: 'up', value: 12 }}
            context="Active/Past leaves"
          />
          <EnhancedStatCard
            title="Rejected"
            value={stats.rejected}
            icon={<XCircle />}
            status="danger"
            trend={{ direction: 'down', value: 2 }}
            context="Review feedback"
          />
        </div>

        {/* Filters */}
        <div className="premium-card p-6 flex flex-col xl:flex-row gap-4 items-center bg-white/50 dark:bg-secondary-900/50 backdrop-blur-md">
          <div className="flex flex-wrap gap-4 flex-1 w-full">
            <div className="relative group min-w-[200px] flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full pl-12 pr-4 py-3 bg-secondary-50/50 dark:bg-secondary-800/50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white dark:focus:bg-secondary-800 transition-all rounded-2xl outline-none text-sm font-medium dark:text-white"
                onChange={(e) => setFilters(p => ({ ...p, search: e.target.value, page: 0 }))}
              />
            </div>
            <select
              className="w-full sm:w-48 px-4 py-3 bg-secondary-50/50 dark:bg-secondary-800/50 rounded-2xl border-2 border-transparent focus:border-primary-500/20 outline-none text-xs font-bold uppercase tracking-widest dark:text-white"
              value={filters.status || ''}
              onChange={(e) => setFilters(p => ({ ...p, status: e.target.value as LeaveStatus || undefined, page: 0 }))}
            >
              <option value="">All Statuses</option>
              {Object.values(LeaveStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              className="w-full sm:w-48 px-4 py-3 bg-secondary-50/50 dark:bg-secondary-800/50 rounded-2xl border-2 border-transparent focus:border-primary-500/20 outline-none text-xs font-bold uppercase tracking-widest dark:text-white"
              value={filters.leaveTypeId || ''}
              onChange={(e) => setFilters(p => ({ ...p, leaveTypeId: e.target.value ? Number(e.target.value) : undefined as any, page: 0 }))}
            >
              <option value="">All Leave Types</option>
              {leaveTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <Button variant="secondary" icon={<Filter className="w-4 h-4" />} onClick={() => setFilters({ page: 0, size: 10 })}>Reset</Button>
        </div>

        {/* Leave Balance for Current User */}
        {user && (
          <div className="animate-slide-up animation-delay-300">
            <LeaveBalance employeeId={user.id} />
          </div>
        )}

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={leaveRequests}
          loading={loading}
          pagination={pagination}
          onPageChange={(p) => setFilters(prev => ({ ...prev, page: p - 1 }))}
          onPageSizeChange={(s) => setFilters(prev => ({ ...prev, size: s, page: 0 }))}
        />

        {/* New Request Modal */}
        <Modal
          isOpen={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          title="Elevate Leave Request"
          subtitle="Prepare your time away with ease."
          size="lg"
        >
          <LeaveRequestForm
            onSubmit={handleRequestSubmitted}
            onCancel={() => setShowRequestModal(false)}
          />
        </Modal>

        {/* Detail SideDrawer */}
        <SideDrawer
          isOpen={isDetailDrawerOpen}
          onClose={() => { setIsDetailDrawerOpen(false); setSelectedRequest(null); }}
          title="Request Insights"
          subtitle={selectedRequest?.employee?.fullName}
          size="md"
          footer={
            selectedRequest?.status === LeaveStatus.PENDING ? (
              <div className="flex gap-3">
                <Button variant="success" fullWidth onClick={() => { setApprovalAction('approve'); setShowApprovalModal(true); }}>Approve</Button>
                <Button variant="danger" fullWidth onClick={() => { setApprovalAction('reject'); setShowApprovalModal(true); }}>Reject</Button>
              </div>
            ) : (
              <Button variant="glass" fullWidth onClick={() => setIsDetailDrawerOpen(false)}>Close Insights</Button>
            )
          }
        >
          {selectedRequest && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center gap-4 p-4 rounded-3xl bg-primary-50/50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-900/20">
                <div className="w-12 h-12 rounded-2xl bg-gradient-primary center text-white text-lg font-black shadow-glow">
                  {selectedRequest.totalDays}
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">Total Duration</span>
                  <span className="text-xl font-black text-secondary-900 dark:text-white tracking-tight">Days Requested</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400 block mb-1">Starts On</span>
                  <span className="text-sm font-bold text-secondary-900 dark:text-white">{new Date(selectedRequest.startDate).toLocaleDateString()}</span>
                </div>
                <div className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700/50">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400 block mb-1">Ends On</span>
                  <span className="text-sm font-bold text-secondary-900 dark:text-white">{new Date(selectedRequest.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400">Reasoning</span>
                  <div className="p-4 rounded-2xl bg-white dark:bg-secondary-800 border-2 border-secondary-50 dark:border-secondary-700 italic text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed shadow-soft">
                    "{selectedRequest.reason || 'No detailed reason provided.'}"
                  </div>
                </div>

                {selectedRequest.isHalfDay && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-900/30">
                    <Clock className="w-4 h-4" />
                    Part-time request: {selectedRequest.halfDayPeriod}
                  </div>
                )}
              </div>

              <AuditInfo
                createdAt={selectedRequest.createdAt}
                createdBy={selectedRequest.createdBy ?? 'System'}
                updatedAt={selectedRequest.updatedAt}
                updatedBy={selectedRequest.updatedBy ?? 'System'}
                version={selectedRequest.version ?? 1}
                active={selectedRequest.active ?? true}
              />
            </div>
          )}
        </SideDrawer>

        {/* Approval Modal */}
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title={approvalAction === 'approve' ? 'Verify Approval' : 'Confirm Rejection'}
          size="sm"
        >
          <div className="space-y-6">
            <p className="text-secondary-600 dark:text-secondary-400 text-sm leading-relaxed">
              You are about to <strong>{approvalAction}</strong> the leave request from <strong>{selectedRequest?.employee?.fullName}</strong>.
            </p>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-secondary-400">Decision Feedback (Optional)</label>
              <textarea
                className="w-full px-4 py-3 bg-secondary-50 dark:bg-secondary-800 rounded-2xl border-2 border-transparent focus:border-primary-500/20 outline-none text-sm dark:text-white transition-all"
                placeholder="Add a reason for the record..."
                rows={4}
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant={approvalAction === 'approve' ? 'success' : 'danger'}
                fullWidth
                onClick={handleApprovalSubmit}
              >
                Confirm {approvalAction}
              </Button>
              <Button variant="glass" fullWidth onClick={() => setShowApprovalModal(false)}>Cancel</Button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default LeaveRequestsPage;
