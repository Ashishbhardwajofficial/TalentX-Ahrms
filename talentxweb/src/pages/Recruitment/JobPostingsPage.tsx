import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Users,
  TrendingUp,
  Search,
  Filter,
  MapPin,
  Clock,
  DollarSign,
  Globe,
  Settings2,
  CheckCircle2,
  PauseCircle,
  XCircle,
  ChevronRight,
  Target,
  Rocket,
  Trash2,
  Calendar,
  Zap,
  Tag,
  ArrowUpRight,
  AlertCircle,
  MoreVertical,
  Edit2,
  PlayCircle,
  User,
  Info,
  Activity
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
  JobPostingDTO,
  JobPostingCreateDTO,
  JobPostingStatus,
  JobEmploymentType,
  ExperienceLevel,
  ApplicationDTO,
  ApplicationSearchParams
} from '../../api/recruitmentApi';
import { PaginatedResponse } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

const JobPostingsPage: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 1;
  const [jobPostings, setJobPostings] = useState<JobPostingDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false);
  const [isViewDrawerOpen, setIsViewDrawerOpen] = useState(false);
  const [isApplicationsDrawerOpen, setIsApplicationsDrawerOpen] = useState(false);
  const [selectedJobPosting, setSelectedJobPosting] = useState<JobPostingDTO | null>(null);
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<JobPostingCreateDTO>>({
    organizationId: orgId,
    title: '',
    description: '',
    requirements: '',
    departmentId: 1,
    locationId: 1,
    employmentType: JobEmploymentType.FULL_TIME,
    isRemote: false,
    experienceLevel: ExperienceLevel.MID_LEVEL,
    skillsRequired: [],
    benefitsOffered: []
  });

  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    loadJobPostings();
  }, [pagination.page, pagination.size, searchQuery]);

  const loadJobPostings = async () => {
    setLoading(true);
    try {
      const response: PaginatedResponse<JobPostingDTO> = await recruitmentApi.getJobPostings({
        page: pagination.page - 1,
        size: pagination.size,
        ...(searchQuery && { search: searchQuery })
      });
      setJobPostings(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (error) {
      toast.error('Failed to synchronize recruitment data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const loadApplications = async (jobPostingId: number) => {
    setApplicationsLoading(true);
    try {
      const params: ApplicationSearchParams = {
        jobPostingId,
        page: 0,
        size: 100
      };
      const response: PaginatedResponse<ApplicationDTO> = await recruitmentApi.getApplications(params);
      setApplications(response.content);
    } catch (error) {
      toast.error('Failed to load application pipeline');
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handleCreateJobPosting = async () => {
    const toastId = toast.loading('Architecting new job posting...');
    try {
      await recruitmentApi.createJobPosting(formData as JobPostingCreateDTO);
      setIsFormDrawerOpen(false);
      resetForm();
      toast.success('Position published to talent networks');
      loadJobPostings();
    } catch (error) {
      toast.error('Failed to establish position');
    } finally {
      toast.removeToast(toastId);
    }
  };

  const handleUpdateJobPosting = async () => {
    if (!selectedJobPosting) return;
    const toastId = toast.loading('Optimizing position parameters...');
    try {
      await recruitmentApi.updateJobPosting(selectedJobPosting.id, formData);
      setIsFormDrawerOpen(false);
      resetForm();
      toast.success('Position updated successfully');
      loadJobPostings();
    } catch (error) {
      toast.error('Failed to persist updates');
    } finally {
      toast.removeToast(toastId);
    }
  };

  const handleStatusChange = async (id: number, status: JobPostingStatus) => {
    const toastId = toast.loading(`Transitioning position to ${status.toLowerCase()}...`);
    try {
      if (status === JobPostingStatus.PUBLISHED) await recruitmentApi.publishJobPosting(id);
      else if (status === JobPostingStatus.PAUSED) await recruitmentApi.pauseJobPosting(id);
      else if (status === JobPostingStatus.CLOSED) await recruitmentApi.closeJobPosting(id);
      toast.success(`Position is now ${status.toLowerCase()} `);
      loadJobPostings();
    } catch (error) {
      toast.error('Workflow transition failed');
    } finally {
      toast.removeToast(toastId);
    }
  };

  const handleDeleteJobPosting = async (id: number) => {
    if (window.confirm('This will purge the position and all application history. Proced with caution?')) {
      const toastId = toast.loading('Purging position data...');
      try {
        await recruitmentApi.deleteJobPosting(id);
        toast.success('Position eliminated from registry');
        loadJobPostings();
      } catch (error) {
        toast.error('Deletion protocol failed');
      } finally {
        toast.removeToast(toastId);
      }
    }
  };

  const openFormDrawer = (jobPosting?: JobPostingDTO) => {
    if (jobPosting) {
      setSelectedJobPosting(jobPosting);
      setFormData({
        organizationId: jobPosting.organizationId,
        title: jobPosting.title,
        description: jobPosting.description,
        requirements: jobPosting.requirements,
        departmentId: jobPosting.department.id,
        locationId: jobPosting.location.id,
        employmentType: jobPosting.employmentType,
        isRemote: jobPosting.isRemote,
        experienceLevel: jobPosting.experienceLevel,
        skillsRequired: jobPosting.skillsRequired,
        benefitsOffered: jobPosting.benefitsOffered,
        salaryMin: jobPosting.salaryMin,
        salaryMax: jobPosting.salaryMax,
        currency: jobPosting.currency || 'USD'
      });
    } else {
      resetForm();
    }
    setIsFormDrawerOpen(true);
  };

  const resetForm = () => {
    setFormData({
      organizationId: orgId,
      title: '',
      description: '',
      requirements: '',
      departmentId: 1,
      locationId: 1,
      employmentType: JobEmploymentType.FULL_TIME,
      isRemote: false,
      experienceLevel: ExperienceLevel.MID_LEVEL,
      skillsRequired: [],
      benefitsOffered: []
    });
    setSelectedJobPosting(null);
  };

  const getStatusConfig = (status: JobPostingStatus) => {
    switch (status) {
      case JobPostingStatus.PUBLISHED:
        return { label: 'Live', color: 'bg-success-50 text-success-600 border-success-200 dark:bg-success-900/20 dark:border-success-800', icon: <Rocket /> };
      case JobPostingStatus.DRAFT:
        return { label: 'Internal Draft', color: 'bg-secondary-50 text-secondary-500 border-secondary-200 dark:bg-secondary-800/50 dark:border-secondary-700', icon: <Clock /> };
      case JobPostingStatus.PAUSED:
        return { label: 'On Hold', color: 'bg-warning-50 text-warning-600 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800', icon: <PauseCircle /> };
      case JobPostingStatus.CLOSED:
      case JobPostingStatus.CANCELLED:
        return { label: 'Concluded', color: 'bg-secondary-100 text-secondary-400 border-transparent', icon: <XCircle /> };
      default:
        return { label: status, color: 'bg-secondary-50 text-secondary-500 border-secondary-200', icon: <Clock /> };
    }
  };

  const columns: ColumnDefinition<JobPostingDTO>[] = [
    {
      key: 'title',
      header: 'Position Profile',
      render: (value, item) => (
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => { setSelectedJobPosting(item); setIsViewDrawerOpen(true); }}>
          <div className="p-3 bg-secondary-50 dark:bg-secondary-800 rounded-2xl border border-secondary-100 dark:border-secondary-700 transition-all group-hover:scale-110 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20">
            <Briefcase className="w-5 h-5 text-secondary-400 group-hover:text-primary-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-black text-secondary-900 dark:text-white tracking-tighter truncate group-hover:text-primary-600 transition-colors">{value}</span>
            <div className="flex items-center gap-2 text-[10px] font-bold text-secondary-400">
              <span className="flex items-center gap-1 uppercase tracking-widest leading-none"><MapPin className="w-2.5 h-2.5" /> {item.location.city}, {item.location.country}</span>
              <span className="w-1 h-1 rounded-full bg-secondary-200 dark:bg-secondary-700" />
              <span className="flex items-center gap-1 uppercase tracking-widest leading-none"><Globe className="w-2.5 h-2.5" /> {item.employmentType.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Pipeline Status',
      render: (value) => {
        const config = getStatusConfig(value as JobPostingStatus);
        return (
          <span className={`px - 2.5 py - 1 rounded - lg text - [10px] font - black uppercase tracking - [0.1em] border flex items - center gap - 1.5 w - fit ${config.color} `}>
            {React.cloneElement(config.icon as React.ReactElement, { className: 'w-3 h-3' })}
            {config.label}
          </span>
        );
      }
    },
    {
      key: 'applicationCount',
      header: 'Candidates',
      render: (value, item) => (
        <button
          onClick={() => { setSelectedJobPosting(item); loadApplications(item.id); setIsApplicationsDrawerOpen(true); }}
          className="flex flex-col items-center gap-1 group/btn"
        >
          <div className="flex -space-x-2 group-hover/btn:-space-x-1 transition-all duration-300">
            {Array.from({ length: Math.min(value, 3) }).map((_, i) => (
              <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-secondary-900 bg-secondary-100 dark:bg-secondary-800 center shadow-sm">
                <Users className="w-2.5 h-2.5 text-secondary-400" />
              </div>
            ))}
            {value > 3 && <div className="w-6 h-6 rounded-full border-2 border-white dark:border-secondary-900 bg-primary-600 center text-[8px] font-black text-white">+{value - 3}</div>}
            {value === 0 && <span className="text-xs font-black text-secondary-300 italic tracking-tighter">— No applicants</span>}
          </div>
          {value > 0 && <span className="text-[10px] font-black uppercase text-primary-500 tracking-widest">{value} Total</span>}
        </button>
      )
    },
    {
      key: 'id',
      header: 'Operations',
      render: (val, item) => (
        <div className="flex items-center gap-2 justify-end">
          <Button variant="glass" size="xs" onClick={() => openFormDrawer(item)} icon={<Settings2 className="w-3.5 h-3.5" />} />
          <div className="w-px h-6 bg-secondary-100 dark:bg-secondary-800 mx-1" />
          <div className="flex gap-1.5">
            {item.status === JobPostingStatus.DRAFT && (
              <Button variant="primary" size="xs" onClick={() => handleStatusChange(item.id, JobPostingStatus.PUBLISHED)}>Go Live</Button>
            )}
            {item.status === JobPostingStatus.PUBLISHED && (
              <Button variant="secondary" size="xs" onClick={() => handleStatusChange(item.id, JobPostingStatus.PAUSED)}>Pause</Button>
            )}
            {(item.status === JobPostingStatus.PUBLISHED || item.status === JobPostingStatus.PAUSED) && (
              <Button variant="outline" size="xs" onClick={() => handleStatusChange(item.id, JobPostingStatus.CLOSED)}>Conclude</Button>
            )}
          </div>
        </div>
      )
    }
  ];

  const metrics = [
    { title: 'Open Requisitions', value: jobPostings.filter(p => p.status === JobPostingStatus.PUBLISHED).length, icon: <Rocket />, status: 'info' as const },
    { title: 'Active Postings', value: jobPostings.length, icon: <Briefcase />, status: 'info' as const },
    { title: 'Total Prospects', value: pagination.total, icon: <Users />, status: 'info' as const, trend: { direction: 'up', value: 24, label: 'Yield' } as const },
    { title: 'Time to Hire', value: '18 Days', icon: <Clock />, status: 'success' as const }
  ];

  return (
    <PageTransition>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Personnel Strategy', path: '/recruitment' }, { label: 'Job Postings', path: '/recruitment/jobs' }]} />
            <h1 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tight">Talent Acquisition</h1>
            <p className="text-secondary-500 font-medium italic">Architecting organizational competitive advantage via strategic hiring.</p>
          </div>
          <Button
            variant="gradient"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => openFormDrawer()}
            className="shadow-glow"
          >
            Create Req
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {metrics.map((m, i) => (
            <EnhancedStatCard key={i} {...m} isLoading={loading} />
          ))}
        </div>

        {/* Action Bar */}
        <div className="premium-card p-6 flex flex-col md:flex-row gap-4 items-center bg-white/50 dark:bg-secondary-900/50 backdrop-blur-md transition-all hover:shadow-premium">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by position, department, or department ID..."
              className="w-full pl-12 pr-4 py-3 bg-secondary-50/50 dark:bg-secondary-800/50 rounded-2xl border-2 border-transparent focus:border-primary-500/20 focus:bg-white dark:focus:bg-secondary-800 outline-none text-sm font-bold placeholder:text-secondary-400 dark:text-white transition-all"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="glass" icon={<Filter className="w-4 h-4" />}>Advanced Filter</Button>
            <Button variant="secondary" icon={<TrendingUp className="w-4 h-4" />}>Reports</Button>
          </div>
        </div>

        {/* Table */}
        <div className="premium-card overflow-hidden">
          <DataTable
            data={jobPostings}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
          />
        </div>

        {/* --- SideDrawers Modernized --- */}

        {/* Form Drawer */}
        <SideDrawer
          isOpen={isFormDrawerOpen}
          onClose={() => setIsFormDrawerOpen(false)}
          title={selectedJobPosting ? "Optimize Position Strategy" : "New Personnel Requisition"}
          subtitle="Configure position parameters and candidate requirements"
          size="lg"
          footer={
            <div className="flex justify-end gap-3 w-full">
              <Button variant="ghost" onClick={() => setIsFormDrawerOpen(false)}>Discard</Button>
              <Button variant="primary" onClick={selectedJobPosting ? handleUpdateJobPosting : handleCreateJobPosting} isLoading={loading}>
                {selectedJobPosting ? "Persist Updates" : "Publish to Market"}
              </Button>
            </div>
          }
        >
          <div className="space-y-10 py-6">
            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Core Definition
              </h4>
              <FormField
                label="Position Title"
                name="title"
                placeholder="e.g. Senior Principal Architect"
                value={formData.title}
                onChange={(val) => setFormData({ ...formData, title: val })}
                required
              />
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  label="Hiring Department"
                  name="departmentId"
                  type="select"
                  options={[{ label: 'Engineering', value: '1' }, { label: 'Product', value: '2' }, { label: 'Sales', value: '3' }]}
                  value={formData.departmentId?.toString()}
                  onChange={(val) => setFormData({ ...formData, departmentId: parseInt(val) })}
                />
                <FormField
                  label="Base Location"
                  name="locationId"
                  type="select"
                  options={[{ label: 'San Francisco, CA', value: '1' }, { label: 'Remote', value: '2' }]}
                  value={formData.locationId?.toString()}
                  onChange={(val) => setFormData({ ...formData, locationId: parseInt(val) })}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Classification & Seniority
              </h4>
              <div className="grid grid-cols-2 gap-6">
                <FormField
                  label="Employment Type"
                  name="employmentType"
                  type="select"
                  options={Object.values(JobEmploymentType).map(v => ({ label: v.replace(/_/g, ' '), value: v }))}
                  value={formData.employmentType}
                  onChange={(val) => setFormData({ ...formData, employmentType: val as JobEmploymentType })}
                />
                <FormField
                  label="Target Seniority"
                  name="experienceLevel"
                  type="select"
                  options={Object.values(ExperienceLevel).map(v => ({ label: v.replace(/_/g, ' '), value: v }))}
                  value={formData.experienceLevel}
                  onChange={(val) => setFormData({ ...formData, experienceLevel: val as ExperienceLevel })}
                />
              </div>
              <div className="p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-secondary-900 dark:text-white uppercase tracking-tighter italic">Remote Capability</span>
                  <p className="text-[10px] font-medium text-secondary-400">Enable candidates to apply from any geographical location</p>
                </div>
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded-lg border-2 border-secondary-200 dark:border-secondary-700 checked:bg-primary-600 focus:ring-primary-500 transition-all cursor-pointer"
                  checked={formData.isRemote}
                  onChange={(e) => setFormData({ ...formData, isRemote: e.target.checked })}
                />
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Narrative & Requirements
              </h4>
              <FormField
                label="Strategic Narrative (Description)"
                name="description"
                type="textarea"
                placeholder="Define the mission, impact, and success criteria for this role..."
                rows={6}
                value={formData.description}
                onChange={(val) => setFormData({ ...formData, description: val })}
                required
              />
              <FormField
                label="Competency Matrix (Requirements)"
                name="requirements"
                type="textarea"
                placeholder="List critical skills, experience, and educational prerequisites..."
                rows={6}
                value={formData.requirements}
                onChange={(val) => setFormData({ ...formData, requirements: val })}
                required
              />
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Financial Bandwidth
              </h4>
              <div className="grid grid-cols-3 gap-6">
                <FormField
                  label="Floor"
                  name="salaryMin"
                  type="number"
                  placeholder="Min"
                  value={formData.salaryMin}
                  onChange={(val) => setFormData({ ...formData, salaryMin: parseInt(val) })}
                />
                <FormField
                  label="Ceiling"
                  name="salaryMax"
                  type="number"
                  placeholder="Max"
                  value={formData.salaryMax}
                  onChange={(val) => setFormData({ ...formData, salaryMax: parseInt(val) })}
                />
                <FormField
                  label="Currency"
                  name="currency"
                  placeholder="USD"
                  value={formData.currency}
                  onChange={(val) => setFormData({ ...formData, currency: val })}
                />
              </div>
            </div>
          </div>
        </SideDrawer>

        {/* View Drawer */}
        <SideDrawer
          isOpen={isViewDrawerOpen}
          onClose={() => setIsViewDrawerOpen(false)}
          title="Position Specification"
          subtitle="Detailed breakdown of strategic personnel requisition"
          size="lg"
        >
          {selectedJobPosting && (
            <div className="space-y-12 py-8 group/view">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  {(() => {
                    const config = getStatusConfig(selectedJobPosting.status);
                    return (
                      <span className={`px - 3 py - 1 rounded - full text - [10px] font - black uppercase tracking - [0.2em] border center gap - 1.5 ${config.color} `}>
                        {React.cloneElement(config.icon as React.ReactElement, { className: 'w-3 h-3' })}
                        {config.label}
                      </span>
                    );
                  })()}
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-3 py-1 rounded-full">{selectedJobPosting.department.name}</span>
                </div>
                <h2 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tighter leading-tight italic">{selectedJobPosting.title}</h2>
                <div className="flex flex-wrap gap-8 items-center pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/10 text-primary-600 center shadow-soft">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400">Deployment</span>
                      <span className="text-sm font-bold text-secondary-900 dark:text-white">{selectedJobPosting.location.city}, {selectedJobPosting.location.country} {selectedJobPosting.isRemote && '(Fully Remote)'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-info-50 dark:bg-info-900/10 text-info-600 center shadow-soft">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400">Modal Plane</span>
                      <span className="text-sm font-bold text-secondary-900 dark:text-white">{selectedJobPosting.employmentType.replace(/_/g, ' ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-success-50 dark:bg-success-900/10 text-success-600 center shadow-soft">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400">Budget Range</span>
                      <span className="text-sm font-bold text-secondary-900 dark:text-white">{selectedJobPosting.currency} {selectedJobPosting.salaryMin?.toLocaleString()} — {selectedJobPosting.salaryMax?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-secondary-100 dark:border-secondary-800 pt-10">
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400 underline underline-offset-8 decoration-primary-500/30">Strategic Mission</h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed font-medium whitespace-pre-wrap">{selectedJobPosting.description}</p>
                </div>
                <div className="space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400 underline underline-offset-8 decoration-primary-500/30">Success Criteria</h3>
                  <p className="text-sm text-secondary-600 dark:text-secondary-400 leading-relaxed font-medium whitespace-pre-wrap">{selectedJobPosting.requirements}</p>
                </div>
              </div>

              <div className="space-y-10 border-t border-secondary-100 dark:border-secondary-800 pt-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Skills Tags */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400">Core Competencies</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJobPosting.skillsRequired.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700 text-xs font-bold text-secondary-700 dark:text-secondary-300 flex items-center gap-2">
                          <Zap className="w-3 h-3 text-primary-500" /> {skill}
                        </span>
                      ))}
                      {selectedJobPosting.skillsRequired.length === 0 && <span className="text-xs font-medium text-secondary-400 italic">No specific skills indexed.</span>}
                    </div>
                  </div>
                  {/* Benefits Tags */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400">Incentive Package</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedJobPosting.benefitsOffered.map((benefit, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-xl bg-success-50 dark:bg-success-900/10 border border-success-100 dark:border-success-800/30 text-xs font-bold text-success-700 dark:text-success-400 flex items-center gap-2">
                          <CheckCircle2 className="w-3 h-3" /> {benefit}
                        </span>
                      ))}
                      {selectedJobPosting.benefitsOffered.length === 0 && <span className="text-xs font-medium text-secondary-400 italic">Standard benefits applied.</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="premium-card p-6 bg-secondary-900 text-white flex justify-between items-center group-hover/view:shadow-glow transition-all duration-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full border-2 border-primary-500 overflow-hidden center bg-secondary-800">
                    <User className="w-5 h-5 text-secondary-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400">Personnel Sponsor</span>
                    <span className="text-sm font-bold tracking-tight">{selectedJobPosting.postedBy.fullName} — Strategic Hiring Dept</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400">Registry Timestamp</span>
                  <p className="text-sm font-bold tracking-tight text-primary-500">{new Date(selectedJobPosting.postedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-8">
                <div className="flex items-center gap-8">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-secondary-900 dark:text-white tracking-tighter">{selectedJobPosting.applicationCount}</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-secondary-400">Lifecycle Apps</span>
                  </div>
                  <div className="w-px h-8 bg-secondary-100 dark:bg-secondary-800" />
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-primary-500 tracking-tighter">{selectedJobPosting.viewCount}</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-secondary-400">Talent Impressions</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" icon={<Trash2 className="w-3.5 h-3.5" />} onClick={() => handleDeleteJobPosting(selectedJobPosting.id)} />
                  <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => { setIsViewDrawerOpen(false); openFormDrawer(selectedJobPosting); }}>Optimize Strategy</Button>
                </div>
              </div>
            </div>
          )}
        </SideDrawer>

        {/* Applications Drawer */}
        <SideDrawer
          isOpen={isApplicationsDrawerOpen}
          onClose={() => setIsApplicationsDrawerOpen(false)}
          title={`Talent Pipeline: ${selectedJobPosting?.title || ''} `}
          subtitle="Synchronized dashboard of candidate entries for this requisition"
          size="lg"
        >
          <div className="py-6 space-y-6">
            {applicationsLoading ? (
              <div className="center flex-col py-32 space-y-4 opacity-50">
                <div className="w-12 h-12 rounded-full border-4 border-primary-500/20 border-t-primary-500 animate-spin" />
                <p className="text-sm font-black uppercase tracking-widest text-secondary-400 italic">Synchronizing Pipeline...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <div className="premium-card p-24 center flex-col text-center space-y-4 bg-secondary-50 dark:bg-secondary-800/30 border-dashed">
                    <Users className="w-12 h-12 text-secondary-300" />
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-secondary-900 dark:text-white tracking-tighter">Empty Pipeline</h3>
                      <p className="text-xs font-medium text-secondary-400 italic max-w-xs">No entries have been recorded for this requisition yet. Ensure the position is actively published to live market planes.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {applications.map((app) => (
                      <div key={app.id} className="premium-card p-5 group hover:shadow-glow transition-all duration-500 border-l-4 border-l-primary-500">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-secondary-900 border-2 border-secondary-800 center text-white text-xl font-black">
                              {app.candidate.fullName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-lg font-black text-secondary-900 dark:text-white tracking-tighter group-hover:text-primary-600 transition-colors uppercase">{app.candidate.fullName}</span>
                              <span className="text-[10px] font-bold text-secondary-400">{app.candidate.email}</span>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-info-50 dark:bg-info-900/20 text-info-600 border border-info-200 dark:border-info-800 text-[9px] font-black uppercase tracking-widest">
                            {app.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <div className="flex items-end justify-between border-t border-secondary-50 dark:border-secondary-800/50 pt-4">
                          <div className="flex gap-6">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black uppercase tracking-widest text-secondary-400">Entry Date</span>
                              <span className="text-xs font-bold text-secondary-900 dark:text-white">{new Date(app.appliedAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black uppercase tracking-widest text-secondary-400">Talent Rating</span>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div key={i} className={`w - 1.5 h - 1.5 rounded - full ${i < (app.rating || 0) ? 'bg-primary-500 shadow-glow' : 'bg-secondary-200 dark:bg-secondary-700'} `} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <Button variant="glass" size="xs" icon={<ChevronRight className="w-3.5 h-3.5" />}>Explore Entry</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            <div className="pt-8 flex justify-center">
              <Button variant="outline" className="w-full" icon={<Settings2 className="w-4 h-4" />}>Pipeline Strategy & Logic</Button>
            </div>
          </div>
        </SideDrawer>
      </div>
    </PageTransition>
  );
};

export default JobPostingsPage;