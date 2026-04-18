import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Activity,
  ChevronRight,
  MoreVertical,
  Info,
  Calendar,
  ClipboardList,
  User,
  Star,
  Download,
  ExternalLink,
  Briefcase,
  MapPin,
  GraduationCap,
  Zap,
  History,
  FileText,
  DollarSign,
  Trash2,
  Award,
  BadgeCheck,
  TrendingUp,
  Target,
  XCircle,
  UserCheck,
  Mail,
  Phone
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
  ApplicationDTO,
  ApplicationStatus,
  ApplicationSearchParams,
  CandidateDTO
} from '../../api/recruitmentApi';
import { PaginatedResponse } from '../../types';
import { useToast } from '../../hooks/useToast';

const CandidateEvaluationPage: React.FC = () => {
  const toast = useToast();
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [isEvaluationDrawerOpen, setIsEvaluationDrawerOpen] = useState(false);
  const [isHiringModalOpen, setIsHiringModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationDTO | null>(null);

  const [evaluationData, setEvaluationData] = useState({
    rating: 0,
    feedback: '',
    tags: [] as string[]
  });

  const [hiringData, setHiringData] = useState<{
    employeeNumber: string;
    departmentId: number;
    jobTitle: string;
    salary: number;
    hireDate: string;
  }>({
    employeeNumber: '',
    departmentId: 1,
    jobTitle: '',
    salary: 0,
    hireDate: new Date().toISOString().substring(0, 10)
  });

  const [filterStatus, setFilterStatus] = useState<ApplicationStatus | ''>('');

  
  useEffect(() => {
    loadApplications();
  }, [pagination.page, pagination.size, filterStatus]);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const params: ApplicationSearchParams = {
        page: pagination.page - 1,
        size: pagination.size,
        ...(filterStatus && { status: filterStatus })
      };
      const response: PaginatedResponse<ApplicationDTO> = await recruitmentApi.getApplications(params);
      setApplications(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (error) {
      toast.error('Failed to synchronize candidate registry');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId: number, status: ApplicationStatus, comments?: string) => {
    const toastId = toast.loading(`Transitioning lifecycle to ${status.replace(/_/g, ' ')}...`);
    try {
      await recruitmentApi.updateApplicationStatus(applicationId, status, comments);
      toast.success('Lifecycle transition successful');
      loadApplications();
    } catch (error) {
      toast.error('Protocol violation during transition');
    } finally {
      toast.removeToast(toastId);
    }
  };

  const handleUpdateEvaluation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;
    const toastId = toast.loading('Persisting qualitative evaluation...');
    try {
      await recruitmentApi.updateApplicationEvaluation(selectedApplication.id, evaluationData);
      setIsEvaluationDrawerOpen(false);
      resetEvaluationData();
      toast.success('Evaluation metrics updated');
      loadApplications();
    } catch (error) {
      toast.error('Evaluation persistence failed');
    } finally {
      toast.removeToast(toastId);
    }
  };

  const handleConvertHiring = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApplication) return;
    const toastId = toast.loading('Initiating personnel conversion protocol...');
    try {
      await recruitmentApi.convertApplicationToEmployee(selectedApplication.id, hiringData);
      setIsHiringModalOpen(false);
      resetHiringData();
      toast.success('PERSONNEL SECURED: Welcome to the organization', { duration: 5000 });
      loadApplications();
    } catch (error) {
      toast.error('Conversion protocol failure');
    } finally {
      toast.removeToast(toastId);
    }
  };

  const openEvaluationDrawer = (application: ApplicationDTO) => {
    setSelectedApplication(application);
    setEvaluationData({
      rating: application.rating || 0,
      feedback: application.reviewComments || '',
      tags: application.tags || []
    });
    setIsEvaluationDrawerOpen(true);
  };

  const resetEvaluationData = () => {
    setEvaluationData({
      rating: 0,
      feedback: '',
      tags: []
    });
    setSelectedApplication(null);
  };

  const resetHiringData = () => {
    setHiringData({
      employeeNumber: '',
      departmentId: 1,
      jobTitle: '',
      salary: 0,
      hireDate: new Date().toISOString().substring(0, 10)
    });
    setSelectedApplication(null);
  };

  const getStatusConfig = (status: ApplicationStatus) => {
    switch (status) {
      case ApplicationStatus.APPLIED:
        return { label: 'New Entry', color: 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800', icon: <Target /> };
      case ApplicationStatus.SCREENING:
      case ApplicationStatus.INTERVIEW_SCHEDULED:
      case ApplicationStatus.INTERVIEWED:
      case ApplicationStatus.UNDER_REVIEW:
        return { label: 'In Flow', color: 'bg-warning-50 text-warning-600 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800', icon: <History className="animate-pulse" /> };
      case ApplicationStatus.SHORTLISTED:
      case ApplicationStatus.OFFER_EXTENDED:
      case ApplicationStatus.OFFER_ACCEPTED:
        return { label: 'High Potential', color: 'bg-success-50 text-success-600 border-success-200 dark:bg-success-900/20 dark:border-success-800', icon: <BadgeCheck /> };
      case ApplicationStatus.REJECTED:
      case ApplicationStatus.OFFER_DECLINED:
      case ApplicationStatus.WITHDRAWN:
        return { label: 'Concluded', color: 'bg-secondary-100 text-secondary-500 border-transparent', icon: <XCircle /> };
      default:
        return { label: status, color: 'bg-secondary-50 text-secondary-500 border-secondary-200', icon: <Users /> };
    }
  };

  const statusWorkflow = [
    ApplicationStatus.APPLIED,
    ApplicationStatus.SCREENING,
    ApplicationStatus.INTERVIEW_SCHEDULED,
    ApplicationStatus.SHORTLISTED,
    ApplicationStatus.OFFER_EXTENDED,
    ApplicationStatus.OFFER_ACCEPTED
  ];

  const getNextStatuses = (current: ApplicationStatus) => {
    const flow: Record<string, ApplicationStatus[]> = {
      [ApplicationStatus.APPLIED]: [ApplicationStatus.SCREENING, ApplicationStatus.REJECTED],
      [ApplicationStatus.SCREENING]: [ApplicationStatus.INTERVIEW_SCHEDULED, ApplicationStatus.REJECTED],
      [ApplicationStatus.INTERVIEW_SCHEDULED]: [ApplicationStatus.INTERVIEWED, ApplicationStatus.REJECTED],
      [ApplicationStatus.INTERVIEWED]: [ApplicationStatus.UNDER_REVIEW, ApplicationStatus.REJECTED],
      [ApplicationStatus.UNDER_REVIEW]: [ApplicationStatus.SHORTLISTED, ApplicationStatus.REJECTED],
      [ApplicationStatus.SHORTLISTED]: [ApplicationStatus.OFFER_EXTENDED, ApplicationStatus.REJECTED],
      [ApplicationStatus.OFFER_EXTENDED]: [ApplicationStatus.OFFER_ACCEPTED, ApplicationStatus.OFFER_DECLINED],
    };
    return flow[current] || [];
  };

  const columns: ColumnDefinition<ApplicationDTO>[] = [
    {
      key: 'candidate',
      header: 'Talent Asset',
      render: (value, item) => (
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => { setSelectedApplication(item); setIsViewDrawerOpen(true); }}>
          <div className="w-10 h-10 rounded-2xl bg-secondary-100 dark:bg-secondary-800 border-2 border-secondary-200 dark:border-secondary-700 center text-secondary-900 dark:text-white text-base font-black group-hover:bg-primary-600 group-hover:text-white transition-all duration-500">
            {value.fullName.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-secondary-900 dark:text-white tracking-tighter truncate group-hover:text-primary-600 transition-colors uppercase">{value.fullName}</span>
            <span className="text-[10px] font-black text-secondary-400 flex items-center gap-1 uppercase tracking-widest leading-none truncate"><Briefcase className="w-2.5 h-2.5" /> {item.jobPosting.title}</span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Lifecycle State',
      render: (value) => {
        const config = getStatusConfig(value as ApplicationStatus);
        return (
          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-[0.1em] border flex items-center gap-1.5 w-fit ${config.color}`}>
            {React.cloneElement(config.icon as React.ReactElement, { className: 'w-3 h-3' })}
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'rating',
      header: 'Score',
      render: (val) => (
        <div className="flex flex-col items-center gap-1.5">
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className={`w-1.5 h-3 rounded-full ${i <= (val || 0) ? 'bg-primary-500 shadow-glow' : 'bg-secondary-200 dark:bg-secondary-700'}`} />
            ))}
          </div>
          <span className="text-[10px] font-black text-secondary-400 uppercase tracking-widest leading-none">{val ? `${val}/5` : 'UNSCORED'}</span>
        </div >
      )
    },
    {
      key: 'appliedAt',
      header: 'Acquisition Date',
      render: (val) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-secondary-900 dark:text-white tracking-tight">{new Date(val).toLocaleDateString()}</span>
          <span className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">{new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      key: 'id',
      header: 'Operations',
      render: (_, item) => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="glass" size="xs" onClick={() => openEvaluationDrawer(item)} icon={<Star className="w-3.5 h-3.5" />} />
          <div className="w-px h-6 bg-secondary-100 dark:bg-secondary-800 mx-1" />
          <div className="flex gap-1.5">
            {getNextStatuses(item.status).map(s => (
              <Button
                key={s}
                variant={s.includes('REJECT') || s.includes('DECLINED') ? 'glass' : 'primary'}
                size="xs"
                className={s.includes('REJECT') ? 'text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/10' : ''}
                onClick={() => handleUpdateStatus(item.id, s)}
              >
                {s.split('_').pop()}
              </Button>
            ))}
            {item.status === ApplicationStatus.OFFER_ACCEPTED && (
              <Button variant="success" size="xs" onClick={() => { setSelectedApplication(item); setIsHiringModalOpen(true); }} icon={<UserCheck className="w-3.5 h-3.5" />}>Secure Asset</Button>
            )}
          </div>
        </div>
      )
    }
  ];

  const metrics = [
    { title: 'Prospect Pool', value: pagination.total, icon: <Users />, status: 'info' as const },
    { title: 'Calibration Yield', value: '42%', icon: <Activity />, status: 'info' as const, trend: { direction: 'up', value: 8, label: 'MoM' } as const },
    { title: 'Pipeline Velocity', value: '12 Days', icon: <Clock />, status: 'success' as const }
  ];

  return (
    <PageTransition>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Personnel Strategy', path: '/recruitment' }, { label: 'Talent Calibration', path: '/recruitment/evaluation' }]} />
            <h1 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tight">Talent Calibration Box</h1>
            <p className="text-secondary-500 font-medium italic">Advanced evaluation and conversion of elite personnel prospects.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
              <select
                className="pl-12 pr-8 py-3 bg-white dark:bg-secondary-900 rounded-2xl border-2 border-transparent focus:border-primary-500/20 outline-none text-xs font-black uppercase tracking-widest dark:text-white transition-all appearance-none cursor-pointer"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ApplicationStatus | '')}
              >
                <option value="">Lifecycle: All States</option>
                {Object.values(ApplicationStatus).map(s => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m, i) => (
            <EnhancedStatCard key={i} {...m} isLoading={loading} />
          ))}
        </div>

        {/* Workflow visualization */}
        <div className="premium-card p-8 bg-secondary-900 border-primary-500/10 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[800px]">
            {statusWorkflow.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-3 group/step relative">
                <div className={`w-10 h-10 rounded-2xl center transition-all duration-700 ${filterStatus === s ? 'bg-primary-600 text-white shadow-glow scale-110' : 'bg-secondary-800 text-secondary-500 border border-secondary-700'}`}>
                  <span className="text-sm font-black italic">{i + 1}</span>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-colors ${filterStatus === s ? 'text-primary-500' : 'text-secondary-500 group-hover/step:text-secondary-300'}`}>{s.replace(/_/g, ' ')}</span>
                {i < statusWorkflow.length - 1 && (
                  <div className="absolute top-5 -right-full w-full h-px bg-secondary-800 pointer-events-none" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Table Container */}
        <div className="premium-card overflow-hidden">
          <DataTable
            data={applications}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
          />
        </div>

        {/* --- SideDrawers Modernized --- */}

        {/* Evaluation Drawer */}
        <SideDrawer
          isOpen={isEvaluationDrawerOpen}
          onClose={() => setIsEvaluationDrawerOpen(false)}
          title="Talent Calibration Protocol"
          subtitle="Quantifying candidate potential and qualitative alignment"
          size="md"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="ghost" onClick={() => setIsEvaluationDrawerOpen(false)}>Abort</Button>
              <Button variant="primary" onClick={handleUpdateEvaluation} isLoading={loading}>Persist Evaluation</Button>
            </div>
          }
        >
          <div className="space-y-10 py-6">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Strategic Score
              </h4>
              <div className="flex items-center justify-between p-6 rounded-3xl bg-secondary-900 shadow-premium">
                <div className="flex gap-4">
                  {[1, 2, 3, 4, 5].map(r => (
                    <button
                      key={r}
                      onClick={() => setEvaluationData(prev => ({ ...prev, rating: r }))}
                      className="group/star relative transition-all active:scale-90"
                    >
                      <Award className={`w-10 h-10 transition-all duration-300 ${evaluationData.rating >= r ? 'text-primary-500 fill-primary-500 drop-shadow-glow' : 'text-secondary-800'}`} />
                    </button>
                  ))}
                </div>
                <div className="w-12 h-12 rounded-full border border-secondary-800 center text-xl font-black italic text-primary-500">
                  {evaluationData.rating || '-'}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Professional Judgment
              </h4>
              <FormField
                label="Detailed Calibration Narrative"
                name="feedback"
                type="textarea"
                rows={8}
                placeholder="Analyze technical proficiency, cultural alignment, and strategic potential..."
                value={evaluationData.feedback}
                onChange={(val) => setEvaluationData({ ...evaluationData, feedback: val })}
                required
              />
            </div>
          </div>
        </SideDrawer>

        {/* View Drawer */}
        <SideDrawer
          isOpen={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          title="Talent Deep-Dive Profile"
          subtitle="Comprehensive record of personnel acquisition lifecycle"
          size="lg"
        >
          {selectedApplication && (
            <div className="space-y-12 py-8 group/view">
              {/* Identity Header */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                <div className="space-y-6 flex-1">
                  <div className="flex items-center gap-3">
                    {(() => {
                      const config = getStatusConfig(selectedApplication.status);
                      return (
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border center gap-1.5 ${config.color}`}>
                          {React.cloneElement(config.icon as React.ReactElement, { className: 'w-3 h-3' })}
                          {config.label}
                        </span>
                      );
                    })()}
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary-500 bg-primary-50 dark:bg-primary-900/10 px-3 py-1 rounded-full">{selectedApplication.source.replace(/_/g, ' ')}</span>
                  </div>
                  <div>
                    <h2 className="text-5xl font-black text-secondary-900 dark:text-white tracking-tighter leading-tight italic uppercase">{selectedApplication.candidate.fullName}</h2>
                    <div className="flex gap-4 mt-2 h-6">
                      <span className="text-sm font-bold text-secondary-500 uppercase tracking-widest flex items-center gap-2 italic">
                        <Briefcase className="w-3.5 h-3.5" /> {selectedApplication.candidate.currentJobTitle || 'Core Professional'}
                      </span>
                      {selectedApplication.candidate.currentCompany && (
                        <>
                          <div className="w-px h-full bg-secondary-200 dark:bg-secondary-800" />
                          <span className="text-sm font-bold text-secondary-400 italic">Formerly at {selectedApplication.candidate.currentCompany}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <Button variant="primary" icon={<Mail className="w-4 h-4" />}>Dispatch Comms</Button>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-xl bg-secondary-50 dark:bg-secondary-800 center text-secondary-400 hover:text-primary-500 transition-colors cursor-pointer border border-secondary-100 dark:border-secondary-700">
                      <Phone className="w-4.5 h-4.5" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-secondary-50 dark:bg-secondary-800 center text-secondary-400 hover:text-primary-500 transition-colors cursor-pointer border border-secondary-100 dark:border-secondary-700">
                      <MapPin className="w-4.5 h-4.5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bio Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12 border-t border-secondary-100 dark:border-secondary-800 pt-10">
                <div className="md:col-span-8 space-y-12">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-primary-500" /> Statement of Intent
                    </h3>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed font-bold tracking-tight italic bg-secondary-50 dark:bg-secondary-900 border-l-4 border-l-primary-500 p-6 rounded-r-3xl">
                      "{selectedApplication.coverLetter || 'No narrative provided for this prospect.'}"
                    </p>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400 flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-primary-500" /> Evolution of Expertise
                    </h3>
                    <div className="space-y-6 relative ml-4 pl-8 border-l-2 border-dashed border-secondary-200 dark:border-secondary-800">
                      {selectedApplication.candidate.workExperience.map((exp, i) => (
                        <div key={i} className="relative group/exp">
                          <div className="absolute -left-[41px] top-1 w-4 h-4 rounded-full bg-white dark:bg-secondary-900 border-4 border-secondary-200 dark:border-secondary-700 group-hover/exp:border-primary-500 transition-all duration-500" />
                          <div className="space-y-1">
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-black text-secondary-900 dark:text-white uppercase tracking-tighter italic">{exp.jobTitle}</h4>
                              <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{exp.startDate} — {exp.endDate || 'Active'}</span>
                            </div>
                            <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest mb-2">{exp.company}</p>
                            <p className="text-xs text-secondary-500 font-medium leading-relaxed max-w-xl">{exp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400 flex items-center gap-2">
                      <Zap className="w-3.5 h-3.5 text-primary-500" /> Core Skillsets
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedApplication.candidate.skills.map((s, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700 text-xs font-black italic text-secondary-700 dark:text-secondary-300">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400 flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-primary-500" /> Academic Foundation
                    </h3>
                    <div className="space-y-4">
                      {selectedApplication.candidate.education.map((e, i) => (
                        <div key={i} className="premium-card p-4 bg-secondary-50/50 dark:bg-secondary-800/20 border-secondary-100 dark:border-secondary-800">
                          <div className="text-xs font-black text-secondary-900 dark:text-white uppercase tracking-tighter">{e.degree}</div>
                          <div className="text-[10px] font-bold text-secondary-400 italic mt-1">{e.institution} • {e.graduationYear}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-secondary-900 text-white space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-[60px]" />
                    <div className="flex justify-between items-center relative z-10 border-b border-secondary-800 pb-3">
                      <span className="text-[9px] font-black uppercase tracking-widest text-secondary-500">Acquisition Analytics</span>
                      <Target className="w-3.5 h-3.5 text-primary-500" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                      <div className="flex flex-col">
                        <span className="text-[18px] font-black italic tracking-tighter">{selectedApplication.candidate.yearsOfExperience}y</span>
                        <span className="text-[9px] font-bold text-secondary-500 uppercase">Tenure</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-[18px] font-black italic tracking-tighter text-primary-500">#{selectedApplication.id}</span>
                        <span className="text-[9px] font-bold text-secondary-500 uppercase">Registry</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feedback History */}
              <div className="space-y-6 pt-10 border-t border-secondary-100 dark:border-secondary-800 mt-12 bg-primary-50/30 dark:bg-primary-900/5 -mx-8 px-8 py-10 rounded-3xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary-500">Assessment Archive</h3>
                  <div className="flex gap-1.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < (selectedApplication.rating || 0) ? 'text-primary-500 fill-primary-500 shadow-glow' : 'text-secondary-200 dark:text-secondary-700'}`} />
                    ))}
                  </div>
                </div>
                {selectedApplication.reviewComments ? (
                  <div className="premium-card p-10 bg-white dark:bg-secondary-900 shadow-xl space-y-6 relative border-t-4 border-t-primary-600">
                    <Award className="absolute top-8 right-8 w-12 h-12 text-primary-500/5 -rotate-12" />
                    <p className="text-base text-secondary-900 dark:text-white leading-relaxed font-black tracking-tight italic indent-12">
                      "{selectedApplication.reviewComments}"
                    </p>
                    <div className="flex items-center gap-3 justify-end pt-4 opacity-40">
                      <span className="text-[10px] font-bold text-secondary-500 italic tracking-widest uppercase">
                        Authenticated by {selectedApplication.reviewedBy?.fullName || 'Personnel Lead'} on {new Date(selectedApplication.reviewedAt!).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="center flex-col py-10 space-y-4 opacity-30 italic">
                    <Star className="w-8 h-8" />
                    <p className="text-xs font-black uppercase tracking-widest text-secondary-400">No Assessment Recorded</p>
                  </div>
                )}
              </div>

              {/* Footer Navigation */}
              <div className="flex justify-between items-center pt-8">
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" icon={<Trash2 className="w-4 h-4" />}>Discard Asset</Button>
                </div>
                <div className="flex gap-3">
                  <Button variant="glass" onClick={() => openEvaluationDrawer(selectedApplication)}>Modify Assessment</Button>
                  {selectedApplication.status === ApplicationStatus.OFFER_ACCEPTED ? (
                    <Button variant="success" icon={<UserCheck className="w-4 h-4" />} onClick={() => { setIsViewDrawerOpen(false); setIsHiringModalOpen(true); }} className="px-8 shadow-glow-success">Secure Personnel</Button>
                  ) : (
                    <div className="relative group">
                      <Button variant="primary" icon={<ChevronRight className="w-4 h-4" />}>Advance Lifecycle</Button>
                      <div className="absolute bottom-full right-0 mb-3 w-64 premium-card p-2 hidden group-hover:block animate-slide-up shadow-2xl z-50">
                        <div className="text-[10px] font-black uppercase tracking-widest text-secondary-400 p-2 border-b border-secondary-100 dark:border-secondary-800 mb-1 italic">Transition Matrix</div>
                        {getNextStatuses(selectedApplication.status).map(s => (
                          <button
                            key={s}
                            onClick={() => handleUpdateStatus(selectedApplication.id, s)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-tighter hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-colors flex items-center justify-between group/opt ${s.includes('REJECT') ? 'text-danger-500' : 'text-secondary-700 dark:text-secondary-300'}`}
                          >
                            {s.replace(/_/g, ' ')}
                            <ChevronRight className="w-3 h-3 translate-x-1 opacity-0 group-hover/opt:opacity-100 transition-all" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SideDrawer>

        {/* Hiring Modal */}
        <Modal
          isOpen={isHiringModalOpen}
          onClose={() => setIsHiringModalOpen(false)}
          title="Personnel Activation Control"
          subtitle="Executing final conversion of candidate to organizational asset"
          size="md"
        >
          {selectedApplication && (
            <div className="space-y-8 py-4">
              <div className="premium-card bg-secondary-900 border-primary-500 overflow-hidden relative p-8 group/hire anim-pulse-border">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 blur-[100px] rounded-full" />
                <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-3xl bg-primary-600 center text-white shadow-glow animate-bounce-slow">
                    <UserCheck className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-3xl font-black text-white tracking-tighter italic uppercase">{selectedApplication.candidate.fullName}</h3>
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-primary-500 group-hover:tracking-[0.6em] transition-all duration-1000">Acquisition Target Locked</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Personnel ID (Registry)"
                  name="employeeNumber"
                  placeholder="e.g. EMP-998"
                  value={hiringData.employeeNumber}
                  onChange={(val) => setHiringData({ ...hiringData, employeeNumber: val })}
                  required
                />
                <FormField
                  label="Activation Date"
                  name="hireDate"
                  type="date"
                  value={hiringData.hireDate}
                  onChange={(val) => setHiringData({ ...hiringData, hireDate: val })}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-8">
                  <FormField
                    label="Personnel Rank (Job Title)"
                    name="jobTitle"
                    value={hiringData.jobTitle}
                    onChange={(val) => setHiringData({ ...hiringData, jobTitle: val })}
                    required
                  />
                </div>
                <div className="md:col-span-4">
                  <FormField
                    label="Asset Index (Dept)"
                    name="departmentId"
                    type="number"
                    value={hiringData.departmentId}
                    onChange={(val) => setHiringData({ ...hiringData, departmentId: parseInt(val) })}
                    required
                  />
                </div>
              </div>

              <div className="premium-card bg-success-500/10 border-success-500/20 p-6 flex flex-col items-center group/sal">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-success-500">Authorized Financial Baseline (Base Salary)</span>
                <div className="flex gap-2 items-baseline mt-2">
                  <DollarSign className="w-6 h-6 text-success-500" />
                  <input
                    type="number"
                    className="bg-transparent border-none focus:ring-0 p-0 text-5xl font-black italic tracking-tighter text-secondary-900 dark:text-white w-[240px] text-center"
                    value={hiringData.salary}
                    onChange={(e) => setHiringData({ ...hiringData, salary: parseInt(e.target.value) })}
                  />
                </div>
                <p className="text-[9px] font-bold text-secondary-400 mt-2 italic group-hover:text-success-400 transition-colors uppercase tracking-widest">Calculated against market benchmarks</p>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-secondary-100 dark:border-secondary-800">
                <Button variant="ghost" onClick={() => setIsHiringModalOpen(false)}>Abort Activation</Button>
                <Button variant="success" className="px-12 shadow-glow-success" onClick={handleConvertHiring} isLoading={loading}>EXECUTE ACTIVATION</Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </PageTransition>
  );
};

export default CandidateEvaluationPage;
