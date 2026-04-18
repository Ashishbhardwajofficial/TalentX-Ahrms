import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import performanceApi, {
  PerformanceReviewCycleDTO,
  PerformanceReviewDTO,
  PerformanceReviewCycleCreateDTO,
  PerformanceReviewCreateDTO,
  PerformanceReviewSubmitDTO,
  PerformanceReviewCycleSearchParams,
  PerformanceReviewSearchParams
} from '../../api/performanceApi';
import {
  ReviewType,
  ReviewCycleStatus,
  PerformanceReviewType,
  PerformanceReviewStatus,
  PaginatedResponse
} from '../../types';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Form from '../../components/common/Form';
import FormField from '../../components/common/FormField';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../hooks/useAuth';
import {
  ClipboardCheck,
  Repeat,
  History,
  Plus,
  Edit3,
  CheckCircle2,
  TrendingUp,
  FileText,
  ShieldCheck,
  AlertCircle,
  Calendar,
  User,
  Zap,
  Star,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Activity
} from 'lucide-react';

interface TabState {
  activeTab: 'cycles' | 'reviews' | 'history';
}

const PerformanceReviewPage: React.FC = () => {
  const [tabState, setTabState] = useState<TabState>({ activeTab: 'cycles' });
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Review Cycles State
  const [reviewCycles, setReviewCycles] = useState<PaginatedResponse<PerformanceReviewCycleDTO>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true
  });
  const [cycleSearchParams, setCycleSearchParams] = useState<PerformanceReviewCycleSearchParams>(() => {
    const params: PerformanceReviewCycleSearchParams = {
      page: 0,
      size: 10
    };

    if (user?.organizationId) {
      params.organizationId = user.organizationId;
    }

    return params;
  });

  // Performance Reviews State
  const [performanceReviews, setPerformanceReviews] = useState<PaginatedResponse<PerformanceReviewDTO>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true
  });
  const [reviewSearchParams, setReviewSearchParams] = useState<PerformanceReviewSearchParams>({
    page: 0,
    size: 10
  });

  // Modal States
  const [showCycleModal, setShowCycleModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [editingCycle, setEditingCycle] = useState<PerformanceReviewCycleDTO | null>(null);
  const [editingReview, setEditingReview] = useState<PerformanceReviewDTO | null>(null);
  const [submittingReview, setSubmittingReview] = useState<PerformanceReviewDTO | null>(null);

  const loadReviewCycles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceApi.getReviewCycles(cycleSearchParams);
      setReviewCycles(data);
    } catch (err: any) {
      console.error('Error loading review cycles:', err);
      setError(err.message || 'Failed to load review cycles');
    } finally {
      setLoading(false);
    }
  }, [cycleSearchParams]);

  const loadPerformanceReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceApi.getReviews(reviewSearchParams);
      setPerformanceReviews(data);
    } catch (err: any) {
      console.error('Error loading performance reviews:', err);
      setError(err.message || 'Failed to load performance reviews');
    } finally {
      setLoading(false);
    }
  }, [reviewSearchParams]);

  useEffect(() => {
    if (tabState.activeTab === 'cycles') {
      loadReviewCycles();
    } else if (tabState.activeTab === 'reviews') {
      loadPerformanceReviews();
    }
  }, [tabState.activeTab, loadReviewCycles, loadPerformanceReviews]);

  const handleCreateCycle = () => {
    setEditingCycle(null);
    setShowCycleModal(true);
  };

  const handleEditCycle = (cycle: PerformanceReviewCycleDTO) => {
    setEditingCycle(cycle);
    setShowCycleModal(true);
  };

  const handleSaveCycle = async (formData: Record<string, any>) => {
    try {
      if (editingCycle) {
        await performanceApi.updateReviewCycle(editingCycle.id, formData);
      } else {
        const createData: PerformanceReviewCycleCreateDTO = {
          organizationId: user?.organizationId || 1,
          name: formData.name,
          reviewType: formData.reviewType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          selfReviewDeadline: formData.selfReviewDeadline,
          managerReviewDeadline: formData.managerReviewDeadline
        };
        await performanceApi.createReviewCycle(createData);
      }
      setShowCycleModal(false);
      loadReviewCycles();
    } catch (err: any) {
      console.error('Error saving review cycle:', err);
      throw err;
    }
  };

  // Performance Review Handlers
  const handleCreateReview = () => {
    setEditingReview(null);
    setShowReviewModal(true);
  };

  const handleEditReview = (review: PerformanceReviewDTO) => {
    setEditingReview(review);
    setShowReviewModal(true);
  };

  const handleSaveReview = async (formData: Record<string, any>) => {
    try {
      if (editingReview) {
        await performanceApi.updateReview(editingReview.id, formData);
      } else {
        const createData: PerformanceReviewCreateDTO = {
          reviewCycleId: formData.reviewCycleId,
          employeeId: formData.employeeId,
          reviewerId: formData.reviewerId,
          reviewType: formData.reviewType,
          overallRating: formData.overallRating,
          strengths: formData.strengths,
          areasForImprovement: formData.areasForImprovement,
          achievements: formData.achievements,
          goalsNextPeriod: formData.goalsNextPeriod
        };
        await performanceApi.createReview(createData);
      }
      setShowReviewModal(false);
      loadPerformanceReviews();
    } catch (err: any) {
      console.error('Error saving performance review:', err);
      throw err;
    }
  };

  const handleSubmitReview = (review: PerformanceReviewDTO) => {
    setSubmittingReview(review);
    setShowSubmitModal(true);
  };

  const handleConfirmSubmit = async (formData: Record<string, any>) => {
    if (!submittingReview) return;

    try {
      const submitData: PerformanceReviewSubmitDTO = {
        overallRating: formData.overallRating,
        strengths: formData.strengths,
        areasForImprovement: formData.areasForImprovement,
        achievements: formData.achievements,
        goalsNextPeriod: formData.goalsNextPeriod
      };
      await performanceApi.submitReview(submittingReview.id, submitData);
      setShowSubmitModal(false);
      setSubmittingReview(null);
      loadPerformanceReviews();
    } catch (err: any) {
      console.error('Error submitting review:', err);
      throw err;
    }
  };

  const handleAcknowledgeReview = async (reviewId: number) => {
    try {
      await performanceApi.acknowledgeReview(reviewId);
      loadPerformanceReviews();
    } catch (err: any) {
      console.error('Error acknowledging review:', err);
      setError(err.message || 'Failed to acknowledge review');
    }
  };

  // Status Styling Configs
  const getCycleStatusConfig = (status: ReviewCycleStatus) => {
    const config: Record<ReviewCycleStatus, { color: string, icon: React.ReactNode, label: string }> = {
      [ReviewCycleStatus.DRAFT]: { color: 'text-secondary-400 bg-secondary-400/10 border-secondary-400/20', icon: <Calendar className="w-3 h-3" />, label: 'Upcoming' },
      [ReviewCycleStatus.ACTIVE]: { color: 'text-primary-400 bg-primary-400/10 border-primary-400/20 shadow-glow-sm', icon: <Activity className="w-3 h-3 animate-pulse" />, label: 'Active Cycle' },
      [ReviewCycleStatus.COMPLETED]: { color: 'text-success-400 bg-success-400/10 border-success-400/20', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Archived' },
      [ReviewCycleStatus.CANCELLED]: { color: 'text-danger-400 bg-danger-400/10 border-danger-400/20', icon: <AlertCircle className="w-3 h-3" />, label: 'Terminated' }
    };
    return config[status] || config[ReviewCycleStatus.DRAFT];
  };

  const getReviewStatusConfig = (status: PerformanceReviewStatus) => {
    const config: Record<PerformanceReviewStatus, { color: string, icon: React.ReactNode, label: string }> = {
      [PerformanceReviewStatus.NOT_STARTED]: { color: 'text-secondary-400 bg-secondary-400/10 border-secondary-400/20', icon: <Edit3 className="w-3 h-3" />, label: 'Draft' },
      [PerformanceReviewStatus.IN_PROGRESS]: { color: 'text-primary-400 bg-primary-400/10 border-primary-400/20', icon: <TrendingUp className="w-3 h-3" />, label: 'Reviewing' },
      [PerformanceReviewStatus.SUBMITTED]: { color: 'text-info-400 bg-info-400/10 border-info-400/20', icon: <ShieldCheck className="w-3 h-3" />, label: 'Submitted' },
      [PerformanceReviewStatus.ACKNOWLEDGED]: { color: 'text-success-400 bg-success-400/10 border-success-400/20', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Acknowledge' }
    };
    return config[status] || config[PerformanceReviewStatus.NOT_STARTED];
  };

  // Table Columns
  const cycleColumns: ColumnDefinition<PerformanceReviewCycleDTO>[] = [
    {
      key: 'name',
      header: 'Cycle Registry',
      sortable: true,
      render: (value, cycle) => (
        <div className="flex flex-col">
          <span className="font-black italic uppercase tracking-tighter text-white text-sm leading-none mb-1">
            {value}
          </span>
          <div className="flex items-center gap-1.5">
            <Repeat className="w-2.5 h-2.5 text-secondary-500" />
            <span className="text-[10px] text-secondary-500 font-bold uppercase tracking-widest leading-none">
              {cycle.reviewType?.replace('_', ' ')} Frequency
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'startDate',
      header: 'Operational Window',
      sortable: true,
      render: (value, cycle) => (
        <div className="flex items-center gap-2 text-[11px] font-bold text-secondary-400">
          <Calendar className="w-3 h-3 text-secondary-500" />
          <span>{new Date(value).toLocaleDateString()}</span>
          <ArrowRight className="w-2.5 h-2.5" />
          <span>{new Date(cycle.endDate).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'selfReviewDeadline',
      header: 'Deadlines',
      render: (_, cycle) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-secondary-500">
            <User className="w-2.5 h-2.5" /> Self: {cycle.selfReviewDeadline ? new Date(cycle.selfReviewDeadline).toLocaleDateString() : 'N/A'}
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-secondary-500">
            <ShieldCheck className="w-2.5 h-2.5" /> MGR: {cycle.managerReviewDeadline ? new Date(cycle.managerReviewDeadline).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'System State',
      sortable: true,
      render: (value) => {
        const config = getCycleStatusConfig(value as ReviewCycleStatus);
        return (
          <div className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${config.color}`}>
            {config.icon}
            {config.label}
          </div>
        );
      }
    },
    {
      key: 'actions' as keyof PerformanceReviewCycleDTO,
      header: 'Tactical Options',
      render: (_, cycle) => (
        <button
          onClick={() => handleEditCycle(cycle)}
          className="w-8 h-8 rounded-lg bg-secondary-800 border border-white/5 center text-secondary-400 hover:text-white"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      )
    }
  ];

  const reviewColumns: ColumnDefinition<PerformanceReviewDTO>[] = [
    {
      key: 'employeeName',
      header: 'Subjective Asset',
      sortable: true,
      render: (value, review) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-secondary-800 border border-white/5 center">
            <User className="w-4 h-4 text-primary-500" />
          </div>
          <div className="flex flex-col">
            <span className="font-black italic uppercase tracking-tighter text-white text-xs">{value}</span>
            <span className="text-[9px] text-secondary-500 font-bold tracking-widest uppercase">ID: {review.employeeId}</span>
          </div>
        </div>
      )
    },
    {
      key: 'reviewerName',
      header: 'Validation Officer',
      sortable: true,
      render: (value) => (
        <span className="text-[11px] font-black uppercase tracking-wider text-secondary-300 italic">{value}</span>
      )
    },
    {
      key: 'overallRating',
      header: 'Tactical Core',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map(star => (
              <Star
                key={star}
                className={`w-2.5 h-2.5 ${value && value >= star ? 'text-primary-500 fill-primary-500' : 'text-secondary-700'}`}
              />
            ))}
          </div>
          <span className="text-[10px] font-black text-white">{value ? `${value}/5` : '0/5'}</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Review Protocol',
      sortable: true,
      render: (value) => {
        const config = getReviewStatusConfig(value as PerformanceReviewStatus);
        return (
          <div className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${config.color}`}>
            {config.icon}
            {config.label}
          </div>
        );
      }
    },
    {
      key: 'actions' as keyof PerformanceReviewDTO,
      header: 'Registry Controls',
      render: (_, review) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditReview(review)}
            className="w-8 h-8 rounded-lg bg-secondary-800 border border-white/5 center text-secondary-400 hover:text-white"
            disabled={review.status === PerformanceReviewStatus.SUBMITTED}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          {review.status === PerformanceReviewStatus.IN_PROGRESS && (
            <button
              onClick={() => handleSubmitReview(review)}
              className="px-3 py-1.5 rounded-lg bg-primary-600/10 border border-primary-500/20 text-[10px] font-black uppercase tracking-widest text-primary-400"
            >
              Finalize
            </button>
          )}
          {review.status === PerformanceReviewStatus.SUBMITTED && (
            <button
              onClick={() => handleAcknowledgeReview(review.id)}
              className="px-3 py-1.5 rounded-lg bg-success-500/10 border border-success-500/20 text-[10px] font-black uppercase tracking-widest text-success-400"
            >
              Verify
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in p-0 lg:p-4">
      {/* Tactical Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-primary-600 center shadow-glow transform rotate-3">
              <ClipboardCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">Review Matrix</h1>
              <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest mt-1">Lifecycle performance assessment & validation</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {tabState.activeTab === 'cycles' && (
            <Button
              variant="primary"
              onClick={handleCreateCycle}
              icon={<Plus className="w-4 h-4" />}
              className="shadow-glow-primary border-primary-400/50"
            >
              GENERATE CYCLE
            </Button>
          )}
          {tabState.activeTab === 'reviews' && (
            <Button
              variant="primary"
              onClick={handleCreateReview}
              icon={<Plus className="w-4 h-4" />}
              className="shadow-glow-primary border-primary-400/50"
            >
              INITIATE ASSESSMENT
            </Button>
          )}
        </div>
      </div>

      {/* Modern Tab System */}
      <div className="flex items-center p-1 bg-secondary-900/50 border border-white/5 rounded-2xl w-fit">
        <button
          onClick={() => setTabState({ activeTab: 'cycles' })}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tabState.activeTab === 'cycles' ? 'bg-primary-600 text-white shadow-glow-primary' : 'text-secondary-500 hover:text-secondary-300'
            }`}
        >
          Operational Cycles
        </button>
        <button
          onClick={() => setTabState({ activeTab: 'reviews' })}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tabState.activeTab === 'reviews' ? 'bg-primary-600 text-white shadow-glow-primary' : 'text-secondary-500 hover:text-secondary-300'
            }`}
        >
          Performance Logs
        </button>
        <button
          onClick={() => setTabState({ activeTab: 'history' })}
          className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tabState.activeTab === 'history' ? 'bg-primary-600 text-white shadow-glow-primary' : 'text-secondary-500 hover:text-secondary-300'
            }`}
        >
          Strategic History
        </button>
      </div>

      {/* Tab Context Metrics */}
      {tabState.activeTab === 'cycles' && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Registry Total"
            value={reviewCycles.totalElements}
            icon={<Repeat className="w-5 h-5" />}
            color="primary"
          />
          <StatCard
            title="Operational"
            value={reviewCycles.content.filter(c => c.status === ReviewCycleStatus.ACTIVE).length}
            icon={<Zap className="w-5 h-5" />}
            color="success"
          />
          <StatCard
            title="Upcoming"
            value={reviewCycles.content.filter(c => c.status === ReviewCycleStatus.DRAFT).length}
            icon={<Calendar className="w-5 h-5" />}
            color="info"
          />
          <StatCard
            title="Completion Factor"
            value="94%"
            icon={<BarChart3 className="w-5 h-5" />}
            color="primary"
          />
        </div>
      )}

      {/* Main Registry View */}
      <div className="glass-card overflow-hidden">
        {tabState.activeTab === 'cycles' && (
          <DataTable
            data={reviewCycles.content}
            columns={cycleColumns}
            loading={loading}
            pagination={{
              page: reviewCycles.number + 1,
              size: reviewCycles.size,
              total: reviewCycles.totalElements
            }}
            onPageChange={(page) => setCycleSearchParams(prev => ({ ...prev, page: page - 1 }))}
            onPageSizeChange={(size) => setCycleSearchParams(prev => ({ ...prev, size, page: 0 }))}
          />
        )}

        {tabState.activeTab === 'reviews' && (
          <DataTable
            data={performanceReviews.content}
            columns={reviewColumns}
            loading={loading}
            pagination={{
              page: performanceReviews.number + 1,
              size: performanceReviews.size,
              total: performanceReviews.totalElements
            }}
            onPageChange={(page) => setReviewSearchParams(prev => ({ ...prev, page: page - 1 }))}
            onPageSizeChange={(size) => setReviewSearchParams(prev => ({ ...prev, size, page: 0 }))}
          />
        )}

        {tabState.activeTab === 'history' && (
          <div className="p-20 center flex-col gap-6 bg-secondary-900/10">
            <div className="w-20 h-20 rounded-[32px] bg-secondary-800 center border border-white/5 shadow-inner opacity-20 transform -rotate-6">
              <History className="w-10 h-10 text-white" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-black italic uppercase tracking-tighter text-white opacity-40">Archive Sequence Offline</h3>
              <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest mt-1">Historical assessment vectors will be available in the next operational patch</p>
            </div>
          </div>
        )}
      </div>

      {/* Strategic Modals */}
      <Modal
        isOpen={showCycleModal}
        onClose={() => setShowCycleModal(false)}
        title={editingCycle ? 'RECONFIGURE OPERATIONAL CYCLE' : 'GENERATE STRATEGIC CYCLE'}
        size="md"
      >
        <div className="p-1">
          <Form
            onSubmit={handleSaveCycle}
            initialData={editingCycle || {}}
            submitButtonText={editingCycle ? 'UPDATE REGISTRY' : 'DEPLOY CYCLE'}
            onCancel={() => setShowCycleModal(false)}
          >
            <div className="grid grid-cols-1 gap-4">
              <FormField
                name="name"
                label="Protocol Designation"
                type="text"
                required
                placeholder="CYCLE NAME..."
              />
              <FormField
                name="reviewType"
                label="Assessment Frequency"
                type="select"
                required
                options={Object.values(ReviewType).map(t => ({ value: t, label: t.replace('_', ' ') }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="startDate"
                  label="Commencement"
                  type="date"
                  required
                />
                <FormField
                  name="endDate"
                  label="Termination"
                  type="date"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="selfReviewDeadline"
                  label="Self-Auth Deadline"
                  type="date"
                />
                <FormField
                  name="managerReviewDeadline"
                  label="MGR-Auth Deadline"
                  type="date"
                />
              </div>
            </div>
          </Form>
        </div>
      </Modal>

      <Modal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        title={editingReview ? 'REDACT ASSESSMENT LOG' : 'INITIATE PERFORMANCE VERIFICATION'}
        size="lg"
      >
        <div className="p-1">
          <Form
            onSubmit={handleSaveReview}
            initialData={editingReview || {}}
            submitButtonText={editingReview ? 'SYNC DATA' : 'INITIATE LOG'}
            onCancel={() => setShowReviewModal(false)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <FormField
                name="reviewCycleId"
                label="Assign to Cycle"
                type="select"
                required
                options={reviewCycles.content.map(cycle => ({ value: cycle.id, label: cycle.name }))}
              />
              <FormField
                name="reviewType"
                label="Assessment Vector"
                type="select"
                required
                options={Object.values(PerformanceReviewType).map(t => ({ value: t, label: t.replace('_', ' ') }))}
              />
              <FormField
                name="employeeId"
                label="Subject Asset ID"
                type="number"
                required
              />
              <FormField
                name="reviewerId"
                label="Validation Officer ID"
                type="number"
                required
              />
              <FormField
                name="overallRating"
                label="Tactical Multiplier (1-5)"
                type="number"
                min={1}
                max={5}
              />
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  name="strengths"
                  label="Operational Strengths"
                  type="textarea"
                  placeholder="OBSERVED PROFICIENCY..."
                />
                <FormField
                  name="areasForImprovement"
                  label="Vector Corrections"
                  type="textarea"
                  placeholder="REMEDIAL REQUIREMENTS..."
                />
                <FormField
                  name="achievements"
                  label="Critical Milestones"
                  type="textarea"
                  placeholder="VALIDATED ACHIEVEMENTS..."
                />
                <FormField
                  name="goalsNextPeriod"
                  label="Future Vectors"
                  type="textarea"
                  placeholder="OBJECTIVES FOR NEXT CYCLE..."
                />
              </div>
            </div>
          </Form>
        </div>
      </Modal>

      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title="LEGALIZE PERFORMANCE ASSESSMENT"
        size="lg"
      >
        <div className="p-1">
          <div className="mb-6 p-4 bg-primary-600/5 border border-primary-500/20 rounded-2xl flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-primary-500" />
            <p className="text-[10px] font-black uppercase text-secondary-300 tracking-widest">Verified submission sequence initiated. All assessment parameters will be locked upon validation.</p>
          </div>

          <Form
            onSubmit={handleConfirmSubmit}
            initialData={submittingReview || {}}
            submitButtonText="LOCK & SUBMIT"
            onCancel={() => setShowSubmitModal(false)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="md:col-span-2">
                <FormField
                  name="overallRating"
                  label="Final Validation Multiplier (1-5)"
                  type="number"
                  min={1}
                  max={5}
                  required
                />
              </div>
              <FormField
                name="strengths"
                label="Final Strength Assessment"
                type="textarea"
              />
              <FormField
                name="areasForImprovement"
                label="Final Core Corrections"
                type="textarea"
              />
              <FormField
                name="achievements"
                label="Validated Achievements"
                type="textarea"
              />
              <FormField
                name="goalsNextPeriod"
                label="Future Strategic Vectors"
                type="textarea"
              />
            </div>
          </Form>
        </div>
      </Modal>

      {loading && <LoadingSpinner message="SYNCHRONIZING REVIEW REGISTRY..." overlay />}
    </div>
  );
};

export default PerformanceReviewPage;
