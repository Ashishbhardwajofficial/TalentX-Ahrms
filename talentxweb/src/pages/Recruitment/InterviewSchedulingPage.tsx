import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Plus,
  Monitor,
  Layout,
  History,
  Activity,
  ChevronRight,
  Info,
  ExternalLink,
  Target,
  Settings2,
  XCircle
} from 'lucide-react';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import SideDrawer from '../../components/common/SideDrawer';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import PageTransition from '../../components/common/PageTransition';
import Breadcrumb from '../../components/common/Breadcrumb';
import EnhancedStatCard from '../../components/cards/EnhancedStatCard';
import recruitmentApi, {
  InterviewDTO,
  InterviewCreateDTO,
  InterviewType,
  InterviewStatus,
  ApplicationDTO,
  ApplicationStatus,
  InterviewSearchParams
} from '../../api/recruitmentApi';
import { PaginatedResponse } from '../../types';
import { useToast } from '../../hooks/useToast';

const InterviewSchedulingPage: React.FC = () => {
  const toast = useToast();
  const [interviews, setInterviews] = useState<InterviewDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  const [isScheduleDrawerOpen, setIsScheduleDrawerOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [isFeedbackDrawerOpen, setIsFeedbackDrawerOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState<InterviewDTO | null>(null);

  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<InterviewCreateDTO>>({
    type: InterviewType.PHONE_SCREENING,
    duration: 60,
    additionalInterviewerIds: []
  });

  const [feedbackData, setFeedbackData] = useState({
    feedback: '',
    rating: 0
  });

  
  useEffect(() => {
    loadInterviews();
    loadPendingApplications();
  }, [pagination.page, pagination.size]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const params: InterviewSearchParams = {
        page: pagination.page - 1,
        size: pagination.size
      };
      const response: PaginatedResponse<InterviewDTO> = await recruitmentApi.getInterviews(params);
      setInterviews(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (error) {
      toast.error('Failed to synchronize schedule');
    } finally {
      setLoading(false);
    }
  };

  const loadPendingApplications = async () => {
    setApplicationsLoading(true);
    try {
      const response: PaginatedResponse<ApplicationDTO> = await recruitmentApi.getApplications({
        status: ApplicationStatus.SCREENING,
        page: 0,
        size: 100
      });
      setApplications(response.content);
    } catch (error) {
      toast.error('Failed to load screening items');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleScheduleInterview = async () => {
    const toastId = toast.loading('Synchronizing calendars...');
    try {
      await recruitmentApi.scheduleInterview(formData as InterviewCreateDTO);
      setIsScheduleDrawerOpen(false);
      resetForm();
      toast.success('Interview successfully indexed');
      loadInterviews();
      loadPendingApplications();
    } catch (error) {
      toast.error('Scheduling conflict or protocol failure');
    }
  };

  const handleUpdateInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    const toastId = toast.loading('Synchronizing schedule logic...');
    try {
      await recruitmentApi.updateInterview(selectedInterview.id, formData);
      setIsScheduleDrawerOpen(false);
      resetForm();
      toast.success('Schedule optimized');
      loadInterviews();
    } catch (error) {
      toast.error('Update operation failed');
    } finally {
      toast.removeToast(toastId);
    }
  };

  const handleCancelInterview = async (id: number) => {
    if (window.confirm('PROTOCOL ALERT: Confirm interview decommissioning?')) {
      const reason = window.prompt('Provide rationale for cancellation:');
      if (!reason) return;
      const toastId = toast.loading('Revoking engagement...');
      try {
        await recruitmentApi.cancelInterview(id, reason);
        toast.success('Interview revoked');
        loadInterviews();
      } catch (error) {
        toast.error('Protocol failure');
      } finally {
        toast.removeToast(toastId);
      }
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInterview) return;
    const toastId = toast.loading('Persisting qualitative metrics...');
    try {
      await recruitmentApi.completeInterview(
        selectedInterview.id,
        feedbackData.feedback,
        feedbackData.rating || undefined
      );
      setIsFeedbackDrawerOpen(false);
      setFeedbackData({ feedback: '', rating: 0 });
      setSelectedInterview(null);
      toast.success('Feedback lifecycle complete');
      loadInterviews();
    } catch (error) {
      toast.error('Persistence failed');
    } finally {
      toast.removeToast(toastId);
    }
  };

  const openScheduleDrawer = (interview?: InterviewDTO) => {
    if (interview) {
      setSelectedInterview(interview);
      setFormData({
        applicationId: interview.application.id,
        type: interview.type,
        scheduledAt: interview.scheduledAt,
        duration: interview.duration,
        interviewerId: interview.interviewer.id,
        additionalInterviewerIds: interview.additionalInterviewers.map(i => i.id),
        location: interview.location,
        meetingLink: interview.meetingLink,
        notes: interview.notes
      });
    } else {
      resetForm();
    }
    setIsScheduleDrawerOpen(true);
  };

  const resetForm = () => {
    setFormData({
      type: InterviewType.PHONE_SCREENING,
      duration: 60,
      additionalInterviewerIds: []
    });
    setSelectedInterview(null);
  };

  const getStatusConfig = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.SCHEDULED:
        return { label: 'Planned', color: 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800', icon: <Calendar /> };
      case InterviewStatus.CONFIRMED:
        return { label: 'Locked', color: 'bg-success-50 text-success-600 border-success-200 dark:bg-success-900/20 dark:border-success-800', icon: <CheckCircle2 /> };
      case InterviewStatus.IN_PROGRESS:
        return { label: 'Live Now', color: 'bg-warning-50 text-warning-600 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800', icon: <Activity className="animate-pulse" /> };
      case InterviewStatus.COMPLETED:
        return { label: 'Lifecycle End', color: 'bg-secondary-100 text-secondary-500 border-transparent', icon: <History /> };
      case InterviewStatus.CANCELLED:
      case InterviewStatus.NO_SHOW:
        return { label: 'Revoked', color: 'bg-danger-50 text-danger-600 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800', icon: <XCircle /> };
      default:
        return { label: status, color: 'bg-secondary-50 text-secondary-500 border-secondary-200', icon: <Calendar /> };
    }
  };

  const columns: ColumnDefinition<InterviewDTO>[] = [
    {
      key: 'application',
      header: 'Prospect Profile',
      render: (value, item) => (
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => { setSelectedInterview(item); setIsViewDrawerOpen(true); }}>
          <div className="w-10 h-10 rounded-2xl bg-secondary-900 border-2 border-secondary-800 center text-white text-base font-black group-hover:bg-primary-600 transition-all duration-500">
            {value.candidate.fullName.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-secondary-900 dark:text-white tracking-tighter truncate group-hover:text-primary-600 transition-colors uppercase">{value.candidate.fullName}</span>
            <span className="text-[10px] font-black text-secondary-400 flex items-center gap-1 uppercase tracking-widest leading-none"><Target className="w-2.5 h-2.5" /> {value.jobPosting.title}</span>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Protocol',
      render: (value) => (
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase text-secondary-900 dark:text-white tracking-tighter leading-none italic">{value.replace(/_/g, ' ')}</span>
          <span className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest mt-1">Personnel Interaction</span>
        </div>
      )
    },
    {
      key: 'scheduledAt',
      header: 'Time Domain',
      render: (value, item) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-secondary-900 dark:text-white tracking-tight">{new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          <span className="text-[10px] font-bold text-primary-500 flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} — ({item.duration}m)</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Sync State',
      render: (value) => {
        const config = getStatusConfig(value as InterviewStatus);
        return (
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border flex items-center gap-1.5 w-fit ${config.color}`}>
            {React.cloneElement(config.icon as React.ReactElement, { className: 'w-3 h-3' })}
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'id',
      header: 'Operations',
      render: (_, item) => (
        <div className="flex items-center gap-2 justify-end">
          {(item.status === InterviewStatus.SCHEDULED || item.status === InterviewStatus.CONFIRMED) && (
            <>
              <Button variant="glass" size="xs" onClick={() => openScheduleDrawer(item)} icon={<Settings2 className="w-3.5 h-3.5" />} />
              <Button variant="outline" size="xs" className="text-danger-500" onClick={() => handleCancelInterview(item.id)} icon={<XCircle className="w-3.5 h-3.5" />} />
            </>
          )}
          {item.status === InterviewStatus.COMPLETED && !item.feedback && (
            <Button variant="primary" size="xs" onClick={() => { setSelectedInterview(item); setFeedbackData({ feedback: '', rating: 0 }); setIsFeedbackDrawerOpen(true); }}>Index Feedback</Button>
          )}
          {item.feedback && (
            <Button variant="secondary" size="xs" onClick={() => { setSelectedInterview(item); setIsViewDrawerOpen(true); }} icon={<Info className="w-3.5 h-3.5" />} />
          )}
        </div>
      )
    }
  ];

  const appColumns: ColumnDefinition<ApplicationDTO>[] = [
    {
      key: 'candidate',
      header: 'Prospect',
      render: (val) => <span className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-tighter">{val.fullName}</span>
    },
    {
      key: 'jobPosting',
      header: 'Position Target',
      render: (val) => <span className="text-xs font-bold text-secondary-500 uppercase tracking-widest">{val.title}</span>
    },
    {
      key: 'id',
      header: 'Interaction',
      render: (_, item) => (
        <Button
          variant="glass"
          size="xs"
          className="text-primary-600"
          onClick={() => {
            setFormData(prev => ({ ...prev, applicationId: item.id }));
            setIsScheduleDrawerOpen(true);
          }}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Initialize Schedule
        </Button>
      )
    }
  ];

  const metrics = [
    { title: 'Total Cycles', value: interviews.length, icon: <Activity />, status: 'info' as const },
    { title: 'Scheduled Engagements', value: interviews.filter(i => i.status === InterviewStatus.SCHEDULED).length, icon: <Calendar />, status: 'info' as const },
    { title: 'Conversion Rate', value: '68%', icon: <Activity />, status: 'info' as const, trend: { direction: 'up', value: 12, label: 'MoM' } as const },
    { title: 'Avg Feedback Rank', value: '4.8/5', icon: <Info />, status: 'success' as const }
  ];

  return (
    <PageTransition>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Personnel Strategy', path: '/recruitment' }, { label: 'Interview Control', path: '/recruitment/interviews' }]} />
            <h1 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tight">Personnel Interaction Control</h1>
            <p className="text-secondary-500 font-medium italic">Synchronizing tactical evaluations with global personnel strategy.</p>
          </div>
          <Button
            variant="gradient"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => openScheduleDrawer()}
            className="shadow-glow"
          >
            Tactical Meeting
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <EnhancedStatCard key={i} {...m} isLoading={loading} />
          ))}
        </div>

        {/* Filters/Actions Bar */}
        <div className="premium-card p-6 flex flex-col md:flex-row gap-4 items-center bg-white/50 dark:bg-secondary-900/50 backdrop-blur-md transition-all hover:shadow-premium">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by prospect name, position, or interviewer..."
              className="w-full pl-12 pr-4 py-3 bg-secondary-50/50 dark:bg-secondary-800/50 rounded-2xl border-2 border-transparent focus:border-primary-500/20 outline-none text-sm font-bold placeholder:text-secondary-400 dark:text-white transition-all appearance-none"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="glass" icon={<Filter className="w-4 h-4" />}>Logistics Shift</Button>
            <Button variant="secondary" icon={<Monitor className="w-4 h-4" />}>Interviewer Load</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Primary Schedule Table */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400">Tactical Schedule</h2>
              <span className="text-[10px] font-bold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">{interviews.length} Recorded Cycles</span>
            </div>
            <div className="premium-card overflow-hidden">
              <DataTable
                data={interviews}
                columns={columns}
                loading={loading}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
              />
            </div>
          </div>

          {/* Pending Screening Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400">Screening Pipeline</h2>
              <Activity className="w-3 h-3 text-secondary-300 animate-pulse" />
            </div>
            <div className="premium-card overflow-hidden bg-secondary-50/50 dark:bg-secondary-900/30">
              <DataTable
                data={applications}
                columns={appColumns}
                loading={applicationsLoading}
              />
            </div>
            <div className="p-4 rounded-2xl bg-primary-900 text-white italic text-[10px] font-medium opacity-60 flex gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 text-primary-500" />
              <span>Prospects in the 'Screening' phase require a tactical meeting to progress to technical evaluations.</span>
            </div>
          </div>
        </div>

        {/* --- SideDrawers Modernized --- */}

        {/* Schedule Drawer */}
        <SideDrawer
          isOpen={isScheduleDrawerOpen}
          onClose={() => setIsScheduleDrawerOpen(false)}
          title={selectedInterview ? "Optimize Interaction Logistics" : "Synchronize Personnel Meeting"}
          subtitle="Configure temporal and environmental parameters for interaction"
          size="lg"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="ghost" onClick={() => setIsScheduleDrawerOpen(false)}>Abort</Button>
              <Button variant="primary" onClick={selectedInterview ? handleUpdateInterview : handleScheduleInterview} isLoading={loading}>
                {selectedInterview ? "Persist Logistical Shift" : "Synchronize & Invite"}
              </Button>
            </div>
          }
        >
          <div className="space-y-10 py-6">
            {!selectedInterview && (
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Target Prospect
                </h4>
                <FormField
                  label="Application Domain"
                  name="applicationId"
                  type="select"
                  options={applications.map(app => ({ label: `${app.candidate.fullName} — ${app.jobPosting.title}`, value: app.id.toString() }))}
                  value={formData.applicationId?.toString()}
                  onChange={(val) => setFormData({ ...formData, applicationId: parseInt(val) })}
                  required
                />
              </div>
            )}

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Protocol Metrics
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  label="Interaction Type"
                  name="type"
                  type="select"
                  options={Object.values(InterviewType).map(v => ({ label: v.replace(/_/g, ' '), value: v }))}
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val as InterviewType })}
                />
                <FormField
                  label="Target Duration (Min)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(val) => setFormData({ ...formData, duration: parseInt(val) })}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Temporal Plane
              </h4>
              <FormField
                label="Scheduled Start (Local Time)"
                name="scheduledAt"
                type="date"
                value={formData.scheduledAt?.slice(0, 10)}
                onChange={(val) => setFormData({ ...formData, scheduledAt: val })}
                required
              />
              <div className="p-4 rounded-2xl bg-secondary-900 text-secondary-400 text-[10px] font-bold uppercase tracking-widest center gap-2 italic">
                <Clock className="w-3.5 h-3.5 text-primary-500" /> Automated invitation will be dispatched to all parties upon synchronization.
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Personnel Assignment
              </h4>
              <FormField
                label="Primary Tactical Evaluator (Employee ID)"
                name="interviewerId"
                type="number"
                placeholder="Enter ID for automatic resolution..."
                value={formData.interviewerId}
                onChange={(val) => setFormData({ ...formData, interviewerId: parseInt(val) })}
                required
              />
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Environmental Logistics
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  label="Physical Locus (Office/Room)"
                  name="location"
                  placeholder="e.g. Nexus-7 or Remote-0"
                  value={formData.location}
                  onChange={(val) => setFormData({ ...formData, location: val })}
                />
                <FormField
                  label="Digital Hub (Meeting Link)"
                  name="meetingLink"
                  placeholder="HTTPS protocol preferred"
                  value={formData.meetingLink}
                  onChange={(val) => setFormData({ ...formData, meetingLink: val })}
                />
              </div>
              <FormField
                label="Strategic Narrative (Internal Notes)"
                name="notes"
                type="textarea"
                rows={3}
                placeholder="Candidate trajectory, specific focus areas, or required resources..."
                value={formData.notes}
                onChange={(val) => setFormData({ ...formData, notes: val })}
              />
            </div>
          </div>
        </SideDrawer>

        {/* View Drawer */}
        <SideDrawer
          isOpen={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          title="Interaction Intelligence"
          subtitle="Tactical record of personnel interaction event"
          size="lg"
        >
          {selectedInterview && (
            <div className="space-y-12 py-8 group/view">
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-6 flex-1">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const config = getStatusConfig(selectedInterview.status);
                      return (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border center gap-1.5 ${config.color}`}>
                          {React.cloneElement(config.icon as React.ReactElement, { className: 'w-3 h-3' })}
                          {config.label}
                        </span>
                      );
                    })()}
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary-500 bg-primary-50 dark:bg-primary-900/10 px-3 py-1 rounded-full">{selectedInterview.type.replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tighter leading-tight italic uppercase">{selectedInterview.application.candidate.fullName}</h2>
                    <p className="text-sm font-bold text-secondary-500 uppercase tracking-widest mt-1">Strategic Prospect for {selectedInterview.application.jobPosting.title}</p>
                  </div>
                  <div className="flex gap-4 pt-2">
                    <Button variant="outline" size="sm" icon={<ExternalLink className="w-4 h-4" />}>Contact Prospect</Button>
                    <Button variant="secondary" size="sm" icon={<Layout className="w-4 h-4" />}>Pipeline Journey</Button>
                  </div>
                </div>

                <div className="premium-card bg-secondary-900 border-primary-500/20 text-white p-6 min-w-[280px] space-y-6 relative overflow-hidden group/box">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl opacity-50 group-hover/box:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-center relative z-10 border-b border-secondary-800 pb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary-500 italic">Temporal Plane</span>
                    <Calendar className="w-4 h-4 text-primary-500" />
                  </div>
                  <div className="space-y-2 relative z-10">
                    <div className="text-2xl font-black italic tracking-tighter text-print-text">{new Date(selectedInterview.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                    <div className="text-5xl font-black tracking-tighter text-primary-500 drop-shadow-glow">
                      {new Date(selectedInterview.scheduledAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-secondary-800 relative z-10 text-[10px] font-black uppercase tracking-widest text-secondary-400 italic">
                    <Clock className="w-3.5 h-3.5" /> Allocated Duration: {selectedInterview.duration}m
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-secondary-100 dark:border-secondary-800 py-10">
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400 flex items-center gap-2">
                    <Monitor className="w-3 h-3 text-primary-500" /> Assigned Evaluators
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700">
                      <div className="w-10 h-10 rounded-xl bg-secondary-900 center text-white text-sm font-black italic border-2 border-secondary-800">LEAD</div>
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-tighter italic">{selectedInterview.interviewer.fullName}</span>
                        <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest">Primary Decision Maker</span>
                      </div>
                    </div>
                    {selectedInterview.additionalInterviewers.map(i => (
                      <div key={i.id} className="flex items-center gap-4 px-4 py-3 rounded-xl bg-white dark:bg-secondary-900 border border-secondary-100 dark:border-secondary-800">
                        <div className="w-8 h-8 rounded-lg bg-secondary-100 dark:bg-secondary-800 center text-xs font-black text-secondary-500 italic">SYNC</div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-secondary-900 dark:text-white">{i.fullName}</span>
                          <span className="text-[9px] font-medium text-secondary-400 uppercase tracking-[0.1em]">Supplementary Evaluator</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-primary-500" /> Environmental Access
                  </h3>
                  <div className="space-y-4">
                    <div className="premium-card p-6 space-y-4 bg-secondary-900 text-white relative h-full">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-secondary-500">Environmental Locus</span>
                        <span className="text-sm font-bold">{selectedInterview.location || 'Distributed Global Cloud'}</span>
                      </div>
                      <div className="w-full h-px bg-secondary-800" />
                      <div className="flex flex-col space-y-2">
                        <span className="text-[9px] font-black uppercase tracking-widest text-secondary-500 italic">Digital Interaction Hub</span>
                        {selectedInterview.meetingLink ? (
                          <a
                            href={selectedInterview.meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 rounded-xl bg-primary-600/20 border border-primary-500/30 text-primary-500 group/link transition-all hover:bg-primary-600 hover:text-white"
                          >
                            <div className="flex items-center gap-2">
                              <Video className="w-4 h-4" />
                              <span className="text-xs font-black uppercase italic tracking-tighter">Enter Interaction Plane</span>
                            </div>
                            <ChevronRight className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                          </a>
                        ) : (
                          <div className="p-3 rounded-xl bg-secondary-800/50 border border-secondary-700 text-secondary-500 opacity-50 italic text-[10px] font-medium">Link not synchronized for this session.</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedInterview.notes && (
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400">Strategic Internal Narrative</h3>
                  <div className="p-6 rounded-3xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700 text-sm font-medium italic text-secondary-600 dark:text-secondary-400 leading-relaxed indent-8">
                    {selectedInterview.notes}
                  </div>
                </div>
              )}

              {selectedInterview.feedback && (
                <div className="space-y-6 pt-10 border-t-2 border-dashed border-secondary-100 dark:border-secondary-800">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary-500">Qualitative Evaluation Asset</h3>
                    <div className="flex gap-1.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Info key={i} className={`w-3.5 h-3.5 ${i < (selectedInterview.rating || 0) ? 'text-primary-500 fill-primary-500 shadow-glow' : 'text-secondary-200 dark:text-secondary-700'}`} />
                      ))}
                    </div>
                  </div>
                  <div className="premium-card p-10 bg-white dark:bg-secondary-900 shadow-2xl space-y-6 relative border-t-4 border-t-primary-600">
                    <Info className="absolute top-8 right-8 w-12 h-12 text-primary-500/5 -rotate-12" />
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-secondary-400 italic">Evaluator Transcript</span>
                    </div>
                    <p className="text-base text-secondary-900 dark:text-white leading-relaxed font-bold tracking-tight italic indent-12">
                      "{selectedInterview.feedback}"
                    </p>
                    <div className="flex items-center gap-3 justify-end pt-4 opacity-40">
                      <span className="text-[9px] font-black uppercase tracking-widest">Authorized by Hiring Lead</span>
                      <Monitor className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              )}

              {!selectedInterview.feedback && selectedInterview.status === InterviewStatus.COMPLETED && (
                <div className="p-12 rounded-3xl bg-primary-50/50 dark:bg-primary-900/10 border-2 border-dashed border-primary-500/30 center flex-col text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-primary-600 text-white center shadow-glow animate-bounce-slow">
                    <Info className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-secondary-900 dark:text-white tracking-tighter">Evaluation Required</h3>
                    <p className="text-xs font-medium text-secondary-500 italic max-w-xs mx-auto">This interaction cycle has concluded. Index the evaluator feedback to advance the prospect through the pipeline.</p>
                  </div>
                  <Button variant="primary" onClick={() => { setIsViewDrawerOpen(false); setFeedbackData({ feedback: '', rating: 0 }); setIsFeedbackDrawerOpen(true); }} className="px-12">Index Feedback Now</Button>
                </div>
              )}
            </div>
          )}
        </SideDrawer>

        {/* Feedback Drawer */}
        <SideDrawer
          isOpen={isFeedbackDrawerOpen}
          onClose={() => setIsFeedbackDrawerOpen(false)}
          title="Index Qualitative Evaluation"
          subtitle="Persist interaction feedback and prospect tactical rating"
          size="md"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="ghost" onClick={() => setIsFeedbackDrawerOpen(false)}>Discard</Button>
              <Button variant="primary" onClick={handleSubmitFeedback} isLoading={loading}>Persist Evaluation Asset</Button>
            </div>
          }
        >
          <div className="space-y-10 py-6">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Tactical Rating
              </h4>
              <div className="flex items-center justify-between p-6 rounded-3xl bg-secondary-900 shadow-premium group/stars">
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button
                      key={r}
                      onClick={() => setFeedbackData(prev => ({ ...prev, rating: r }))}
                      className="group/star relative transition-all active:scale-90"
                    >
                      <Info className={`w-10 h-10 transition-all duration-300 ${feedbackData.rating >= r ? 'text-primary-500 fill-primary-500 drop-shadow-glow' : 'text-secondary-800'}`} />
                      <span className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black italic tracking-tighter transition-all duration-500 ${feedbackData.rating === r ? 'text-white opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                        {['Minimal', 'Baseline', 'Qualified', 'Superior', 'Elite'][r - 1]}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="w-12 h-12 rounded-full border border-secondary-800 center text-xl font-black italic text-primary-500 group-hover/stars:scale-110 transition-transform">
                  {feedbackData.rating || '-'}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Evaluator Narrative
              </h4>
              <FormField
                label="Detailed Qualitative Analysis"
                name="feedback"
                type="textarea"
                rows={8}
                placeholder="Provide comprehensive performance metrics, domain proficiency analysis, and cultural alignment notes..."
                value={feedbackData.feedback}
                onChange={(val) => setFeedbackData({ ...feedbackData, feedback: val })}
                required
              />
              <div className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700 text-[10px] font-medium text-secondary-400 italic flex gap-3">
                <AlertCircle className="w-4 h-4 shrink-0 text-primary-500" />
                <span>Feedback is critical for final board approval. Provide concrete examples and specific focus points for downstream evaluators.</span>
              </div>
            </div>
          </div>
        </SideDrawer>
      </div>
    </PageTransition>
  );
};

export default InterviewSchedulingPage;
