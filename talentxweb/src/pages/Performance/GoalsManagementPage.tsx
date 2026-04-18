import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import performanceApi, {
  GoalDTO,
  GoalCreateDTO,
  GoalUpdateDTO,
  GoalProgressUpdateDTO,
  GoalSearchParams
} from '../../api/performanceApi';
import {
  GoalType,
  GoalCategory,
  GoalStatus,
  PaginatedResponse
} from '../../types';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Form from '../../components/common/Form';
import FormField from '../../components/common/FormField';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatCard from '../../components/common/StatCard';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import {
  Target,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Calendar,
  User,
  Filter as FilterIcon,
  Plus,
  Edit3,
  Trash2,
  Zap,
  Activity,
  Layers,
  Flag,
  Search,
  ChevronRight,
  Sparkles,
  BarChart3,
  Clock
} from 'lucide-react';

interface FilterState {
  goalType?: GoalType;
  category?: GoalCategory;
  status?: GoalStatus;
  employeeId?: number;
}

const GoalsManagementPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Goals State
  const [goals, setGoals] = useState<PaginatedResponse<GoalDTO>>({
    content: [],
    totalElements: 0,
    totalPages: 0,
    size: 10,
    number: 0,
    first: true,
    last: true
  });

  const [searchParams, setSearchParams] = useState<GoalSearchParams>({
    page: 0,
    size: 10
  });

  const [filters, setFilters] = useState<FilterState>({});

  // Modal States
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalDTO | null>(null);
  const [updatingProgressGoal, setUpdatingProgressGoal] = useState<GoalDTO | null>(null);

  
  useEffect(() => {
    loadGoals();
  }, [searchParams]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performanceApi.getGoals(searchParams);
      setGoals(data);
    } catch (err: any) {
      console.error('Error loading goals:', err);
      setError(err.message || 'Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  // Goal Handlers
  const handleCreateGoal = () => {
    setEditingGoal(null);
    setShowGoalModal(true);
  };

  const handleEditGoal = (goal: GoalDTO) => {
    setEditingGoal(goal);
    setShowGoalModal(true);
  };

  const handleSaveGoal = async (formData: Record<string, any>) => {
    try {
      if (editingGoal) {
        const updateData: GoalUpdateDTO = {
          title: formData.title,
          description: formData.description,
          goalType: formData.goalType,
          category: formData.category,
          startDate: formData.startDate,
          targetDate: formData.targetDate,
          weight: formData.weight,
          measurementCriteria: formData.measurementCriteria,
          status: formData.status,
          progressPercentage: formData.progressPercentage
        };
        await performanceApi.updateGoal(editingGoal.id, updateData);
      } else {
        const createData: GoalCreateDTO = {
          employeeId: formData.employeeId,
          title: formData.title,
          description: formData.description,
          goalType: formData.goalType,
          category: formData.category,
          startDate: formData.startDate,
          targetDate: formData.targetDate,
          weight: formData.weight,
          measurementCriteria: formData.measurementCriteria
        };
        await performanceApi.createGoal(createData);
      }
      setShowGoalModal(false);
      loadGoals();
    } catch (err: any) {
      console.error('Error saving goal:', err);
      throw err;
    }
  };

  const handleUpdateProgress = (goal: GoalDTO) => {
    setUpdatingProgressGoal(goal);
    setShowProgressModal(true);
  };

  const handleSaveProgress = async (formData: Record<string, any>) => {
    if (!updatingProgressGoal) return;

    try {
      const progressData: GoalProgressUpdateDTO = {
        progressPercentage: formData.progressPercentage,
        status: formData.status,
        completionDate: formData.completionDate
      };
      await performanceApi.updateGoalProgress(updatingProgressGoal.id, progressData);
      setShowProgressModal(false);
      setUpdatingProgressGoal(null);
      loadGoals();
    } catch (err: any) {
      console.error('Error updating goal progress:', err);
      throw err;
    }
  };

  const handleDeleteGoal = async (goalId: number) => {
    if (!window.confirm('Confirm permanent deletion of this strategic objective?')) {
      return;
    }

    try {
      await performanceApi.deleteGoal(goalId);
      loadGoals();
    } catch (err: any) {
      console.error('Error deleting goal:', err);
      setError(err.message || 'Failed to delete goal');
    }
  };

  // Filter Handlers
  const handleFilterChange = (filterKey: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [filterKey]: value };
    setFilters(newFilters);

    setSearchParams(prev => ({
      ...prev,
      page: 0,
      ...newFilters
    }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchParams({
      page: 0,
      size: 10
    });
  };

  // Status Styling Config
  const getStatusConfig = (status: GoalStatus) => {
    const config: Record<GoalStatus, { color: string, icon: React.ReactNode, label: string }> = {
      [GoalStatus.NOT_STARTED]: { color: 'text-secondary-400 bg-secondary-400/10 border-secondary-400/20', icon: <Clock className="w-3 h-3" />, label: 'Primed' },
      [GoalStatus.IN_PROGRESS]: { color: 'text-primary-400 bg-primary-400/10 border-primary-400/20 shadow-glow-sm', icon: <Activity className="w-3 h-3 animate-pulse" />, label: 'Active' },
      [GoalStatus.COMPLETED]: { color: 'text-success-400 bg-success-400/10 border-success-400/20', icon: <CheckCircle2 className="w-3 h-3" />, label: 'Achieved' },
      [GoalStatus.CANCELLED]: { color: 'text-danger-400 bg-danger-400/10 border-danger-400/20', icon: <AlertCircle className="w-3 h-3" />, label: 'Aborted' },
      [GoalStatus.DEFERRED]: { color: 'text-warning-400 bg-warning-400/10 border-warning-400/20', icon: <Clock className="w-3 h-3" />, label: 'Staged' }
    };
    return config[status] || config[GoalStatus.NOT_STARTED];
  };

  // Table Columns
  const goalColumns: ColumnDefinition<GoalDTO>[] = [
    {
      key: 'title',
      header: 'Strategic Objective',
      sortable: true,
      render: (value, goal) => (
        <div className="flex flex-col">
          <span className="font-black italic uppercase tracking-tighter text-white text-sm leading-none mb-1 group-hover:text-primary-400 transition-colors">
            {value}
          </span>
          <div className="flex items-center gap-1.5">
            <Layers className="w-2.5 h-2.5 text-secondary-500" />
            <span className="text-[10px] text-secondary-500 font-bold uppercase tracking-widest leading-none">
              {goal.goalType?.replace('_', ' ')} / {goal.category?.replace('_', ' ')}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'employeeName',
      header: 'Operational Asset',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-secondary-800 border border-white/5 center">
            <User className="w-3 h-3 text-primary-500" />
          </div>
          <span className="text-[11px] font-black uppercase tracking-wider text-secondary-300 italic">{value}</span>
        </div>
      )
    },
    {
      key: 'progressPercentage',
      header: 'Execution Index',
      sortable: true,
      render: (value, goal) => (
        <div className="flex items-center gap-3 w-full max-w-[140px]">
          <div className="flex-1 h-1.5 bg-secondary-800 rounded-full overflow-hidden border border-white/5 p-[1px]">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${goal.status === GoalStatus.COMPLETED ? 'bg-success-500 shadow-glow-success' :
                goal.status === GoalStatus.CANCELLED ? 'bg-danger-500' : 'bg-primary-500 shadow-glow-primary'
                }`}
              style={{ width: `${value || 0}%` }}
            />
          </div>
          <span className="text-[11px] font-black italic text-white w-8">{value || 0}%</span>
        </div>
      )
    },
    {
      key: 'status',
      header: 'System Registry',
      sortable: true,
      render: (value) => {
        const config = getStatusConfig(value as GoalStatus);
        return (
          <div className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${config.color}`}>
            {config.icon}
            {config.label}
          </div>
        );
      }
    },
    {
      key: 'targetDate',
      header: 'Deadline Protocol',
      sortable: true,
      render: (value) => (
        <div className="flex items-center gap-2 text-[11px] font-bold text-secondary-400">
          <Calendar className="w-3 h-3 text-secondary-500" />
          {value ? new Date(value).toLocaleDateString() : 'NO LIMIT'}
        </div>
      )
    },
    {
      key: 'id',
      header: 'Tactical Controls',
      render: (_, goal) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditGoal(goal)}
            className="w-8 h-8 rounded-lg bg-secondary-800 border border-white/5 center text-secondary-400 hover:text-white hover:bg-secondary-700 transition-all group"
            title="Edit Protocol"
            disabled={goal.status === GoalStatus.COMPLETED}
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleUpdateProgress(goal)}
            className="px-3 py-1.5 rounded-lg bg-primary-600/10 border border-primary-500/20 text-[10px] font-black uppercase tracking-widest text-primary-400 hover:bg-primary-600 hover:text-white transition-all shadow-glow-sm"
            disabled={goal.status === GoalStatus.COMPLETED || goal.status === GoalStatus.CANCELLED}
          >
            Update
          </button>
          <button
            onClick={() => handleDeleteGoal(goal.id)}
            className="w-8 h-8 rounded-lg bg-danger-500/10 border border-danger-500/20 center text-danger-500 hover:bg-danger-500 hover:text-white transition-all"
            title="Purge Objective"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">Strategic Objectives</h1>
              <p className="text-[10px] font-bold text-secondary-500 uppercase tracking-widest mt-1">Operational target management & performance tracking</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            onClick={handleCreateGoal}
            icon={<Plus className="w-4 h-4" />}
            className="shadow-glow-primary border-primary-400/50"
          >
            INITIATE NEW OBJECTIVE
          </Button>
        </div>
      </div>

      {/* Summary Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Global Objectives"
          value={goals.totalElements}
          icon={<Target className="w-5 h-5" />}
          color="primary"
          trend={{ value: 5.4, isPositive: true }}
        />
        <StatCard
          title="Active Missions"
          value={goals.content.filter(g => g.status === GoalStatus.IN_PROGRESS).length}
          icon={<Activity className="w-5 h-5" />}
          color="success"
        />
        <StatCard
          title="Validated Success"
          value={goals.content.filter(g => g.status === GoalStatus.COMPLETED).length}
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="info"
        />
        <StatCard
          title="Aggregate Index"
          value={goals.content.length > 0
            ? `${Math.round(goals.content.reduce((sum, g) => sum + (g.progressPercentage || 0), 0) / goals.content.length)}%`
            : '0%'}
          icon={<BarChart3 className="w-5 h-5" />}
          color="warning"
        />
      </div>

      {/* Tactical Filter Cluster */}
      <div className="glass-card p-6 border-white/5 bg-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <FilterIcon className="w-4 h-4 text-primary-500" />
            <h3 className="text-xs font-black italic uppercase tracking-widest text-white">Registry Protocols</h3>
          </div>
          <button
            onClick={clearFilters}
            className="text-[9px] font-black uppercase tracking-widest text-secondary-500 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3 h-3" /> Reset Matrix
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary-500 ml-1 italic flex items-center gap-1">
              <Layers className="w-2.5 h-2.5" /> Objective Type
            </label>
            <div className="relative">
              <select
                value={filters.goalType || ''}
                onChange={(e) => handleFilterChange('goalType', e.target.value || undefined)}
                className="w-full bg-secondary-900 border-2 border-white/5 rounded-xl py-2 px-4 text-white font-bold text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none appearance-none"
              >
                <option value="">ALL VECTORS</option>
                {Object.values(GoalType).map(type => (
                  <option key={type} value={type}>{type.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary-500 ml-1 italic flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Operational Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || undefined)}
              className="w-full bg-secondary-900 border-2 border-white/5 rounded-xl py-2 px-4 text-white font-bold text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none appearance-none"
            >
              <option value="">ALL DOMAINS</option>
              {Object.values(GoalCategory).map(cat => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary-500 ml-1 italic flex items-center gap-1">
              <Flag className="w-2.5 h-2.5" /> Registry Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              className="w-full bg-secondary-900 border-2 border-white/5 rounded-xl py-2 px-4 text-white font-bold text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none appearance-none"
            >
              <option value="">ALL STATES</option>
              {Object.values(GoalStatus).map(status => (
                <option key={status} value={status}>{status.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-secondary-500 ml-1 italic flex items-center gap-1">
              <Search className="w-2.5 h-2.5" /> Asset Tracker
            </label>
            <div className="relative group">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-500 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="number"
                value={filters.employeeId || ''}
                onChange={(e) => handleFilterChange('employeeId', e.target.value ? Number(e.target.value) : undefined)}
                placeholder="ID PROTOCOL..."
                className="w-full bg-secondary-900 border-2 border-white/5 rounded-xl py-2 pl-10 pr-4 text-white font-bold text-sm focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Primary Registry Table */}
      <div className="glass-card overflow-hidden">
        <DataTable
          data={goals.content}
          columns={goalColumns}
          loading={loading}
          pagination={{
            page: goals.number + 1,
            size: goals.size,
            total: goals.totalElements
          }}
          onPageChange={(page) => setSearchParams(prev => ({ ...prev, page: page - 1 }))}
          onPageSizeChange={(size) => setSearchParams(prev => ({ ...prev, size, page: 0 }))}
        />
      </div>

      {/* Tactical Modals */}
      <Modal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        title={editingGoal ? 'MODIFY STRATEGIC PROTOCOL' : 'INITIATE NEW OBJECTIVE'}
        size="lg"
      >
        <div className="p-1">
          <Form
            onSubmit={handleSaveGoal}
            initialData={editingGoal || {}}
            submitButtonText={editingGoal ? 'VERIFY CHANGES' : 'DEPLOY OBJECTIVE'}
            onCancel={() => setShowGoalModal(false)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              <FormField
                name="employeeId"
                label="Asset ID"
                type="number"
                required
                placeholder="000"
                disabled={!!editingGoal}
              />
              <FormField
                name="title"
                label="Objective Designation"
                type="text"
                required
                placeholder="MISSION TITLE..."
              />
              <div className="md:col-span-2">
                <FormField
                  name="description"
                  label="Operational intelligence"
                  type="textarea"
                  placeholder="EXPLAIN MISSION PARAMETERS..."
                />
              </div>
              <FormField
                name="goalType"
                label="Protocol Type"
                type="select"
                required
                options={Object.values(GoalType).map(t => ({ value: t, label: t.replace('_', ' ') }))}
              />
              <FormField
                name="category"
                label="Mission Domain"
                type="select"
                required
                options={Object.values(GoalCategory).map(c => ({ value: c, label: c.replace('_', ' ') }))}
              />
              <FormField
                name="startDate"
                label="Commencement Vector"
                type="date"
              />
              <FormField
                name="targetDate"
                label="Deadline Vector"
                type="date"
              />
              <FormField
                name="weight"
                label="Strategic Weight (%)"
                type="number"
                min={0}
                max={100}
                placeholder="IMPORTANCE"
              />
              <div className="md:col-span-2">
                <FormField
                  name="measurementCriteria"
                  label="Success Matrix Criteria"
                  type="textarea"
                  placeholder="METRICS FOR VALIDATION..."
                />
              </div>
              {editingGoal && (
                <>
                  <FormField
                    name="progressPercentage"
                    label="Execution Multiplier (%)"
                    type="number"
                    min={0}
                    max={100}
                  />
                  <FormField
                    name="status"
                    label="Registry Status"
                    type="select"
                    options={Object.values(GoalStatus).map(s => ({ value: s, label: s.replace('_', ' ') }))}
                  />
                </>
              )}
            </div>
          </Form>
        </div>
      </Modal>

      <Modal
        isOpen={showProgressModal}
        onClose={() => setShowProgressModal(false)}
        title="UPDATE EXECUTION INDEX"
        size="md"
      >
        <div className="p-1">
          <div className="mb-8 p-6 bg-secondary-900/50 border border-white/5 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 blur-3xl group-hover:bg-primary-500/10 transition-all rounded-full" />
            <h4 className="text-lg font-black italic uppercase tracking-tighter text-white mb-2 leading-none flex items-center gap-2">
              <Target className="w-5 h-5 text-primary-500" /> {updatingProgressGoal?.title}
            </h4>
            <p className="text-xs text-secondary-500 font-bold uppercase tracking-widest line-clamp-2 leading-relaxed">
              {updatingProgressGoal?.description}
            </p>
          </div>

          <Form
            onSubmit={handleSaveProgress}
            initialData={updatingProgressGoal || {}}
            submitButtonText="SYNCHRONIZE PROGRESS"
            onCancel={() => setShowProgressModal(false)}
          >
            <div className="grid grid-cols-1 gap-4">
              <FormField
                name="progressPercentage"
                label="Current Multiplier (%)"
                type="number"
                min={0}
                max={100}
                required
                placeholder="0-100"
              />

              <FormField
                name="status"
                label="Registry State"
                type="select"
                required
                options={Object.values(GoalStatus).map(s => ({ value: s, label: s.replace('_', ' ') }))}
              />

              <FormField
                name="completionDate"
                label="Final Validation Date"
                type="date"
              />
            </div>
          </Form>
        </div>
      </Modal>

      {loading && <LoadingSpinner message="SYNCHRONIZING OBJECTIVE REGISTRY..." overlay />}
    </div>
  );
};

export default GoalsManagementPage;
