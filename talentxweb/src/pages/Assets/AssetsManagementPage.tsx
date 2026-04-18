import React, { useState, useEffect } from 'react';
import {
  Laptop,
  CreditCard,
  Smartphone,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldOff,
  Package,
  ArrowUpRight,
  ChevronRight,
  History,
  Box,
  Monitor,
  Activity
} from 'lucide-react';
import assetApi, { AssetDTO, AssetCreateDTO } from '../../api/assetApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import FormField from '../../components/common/FormField';
import PageTransition from '../../components/common/PageTransition';
import Breadcrumb from '../../components/common/Breadcrumb';
import EnhancedStatCard from '../../components/cards/EnhancedStatCard';
import { AssetType, AssetStatus } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

const AssetsManagementPage: React.FC = () => {
  const toast = useToast();
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 1;
  const [assets, setAssets] = useState<AssetDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetDTO | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  const [formData, setFormData] = useState<AssetCreateDTO>({
    organizationId: orgId,
    assetType: AssetType.LAPTOP,
    assetTag: '',
    serialNumber: ''
  });

  const [filters, setFilters] = useState({
    assetType: '',
    status: '',
    search: ''
  });


  useEffect(() => {
    loadAssets();
  }, [pagination.page, pagination.size, filters]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await assetApi.getAssets({
        page: pagination.page - 1,
        size: pagination.size,
        organizationId: orgId,
        ...(filters.assetType && { assetType: filters.assetType as AssetType }),
        ...(filters.status && { status: filters.status as AssetStatus }),
        ...(filters.search && { search: filters.search })
      });
      setAssets(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      toast.error('Failed to synchronize asset registry');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAsset(null);
    setFormData({
      organizationId: orgId,
      assetType: AssetType.LAPTOP,
      assetTag: '',
      serialNumber: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(editingAsset ? 'Updating asset parameters...' : 'Provisioning new hardware...');
    try {
      if (editingAsset) {
        await assetApi.updateAsset(editingAsset.id, formData);
        toast.success('Asset synchronized successfully');
      } else {
        await assetApi.createAsset(formData);
        toast.success('Asset provisioned and indexed');
      }
      setIsModalOpen(false);
      loadAssets();
    } catch (err: any) {
      toast.error('Inventory operation failed');
    } finally {
      toast.removeToast(toastId);
    }
  };

  const getAssetIcon = (type: AssetType) => {
    switch (type) {
      case AssetType.LAPTOP: return <Laptop className="w-5 h-5" />;
      case AssetType.ID_CARD: return <CreditCard className="w-5 h-5" />;
      case AssetType.MOBILE: return <Smartphone className="w-5 h-5" />;
      default: return <Package className="w-5 h-5" />;
    }
  };

  const getStatusConfig = (status: AssetStatus) => {
    switch (status) {
      case AssetStatus.AVAILABLE:
        return { icon: <CheckCircle2 className="w-3.5 h-3.5" />, color: 'text-success-600', bg: 'bg-success-50 border-success-100', label: 'In Stock' };
      case AssetStatus.ASSIGNED:
        return { icon: <Activity className="w-3.5 h-3.5" />, color: 'text-primary-600', bg: 'bg-primary-50 border-primary-100 shadow-glow', label: 'Active Deployment' };
      case AssetStatus.DAMAGED:
        return { icon: <AlertCircle className="w-3.5 h-3.5" />, color: 'text-danger-600', bg: 'bg-danger-50 border-danger-100', label: 'Maintenance Required' };
      case AssetStatus.RETIRED:
        return { icon: <ShieldOff className="w-3.5 h-3.5" />, color: 'text-secondary-400', bg: 'bg-secondary-50 border-secondary-200', label: 'Decommissioned' };
      default:
        return { icon: <Clock className="w-3.5 h-3.5" />, color: 'text-secondary-600', bg: 'bg-secondary-50 border-secondary-200', label: status };
    }
  };

  const columns: ColumnDefinition<AssetDTO>[] = [
    {
      key: 'assetTag',
      header: 'Strategic Asset',
      render: (_, asset) => (
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-2xl bg-secondary-50 dark:bg-secondary-800 text-secondary-400 center border border-secondary-100 dark:border-secondary-700 transition-all group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-500">
            {getAssetIcon(asset.assetType)}
          </div>
          <div>
            <div className="font-black text-secondary-900 dark:text-white tracking-tight leading-none italic uppercase">{asset.assetTag || 'NO TAG'}</div>
            <div className="text-[10px] font-black text-secondary-400 uppercase tracking-widest mt-1 italic">{asset.assetType.replace(/_/g, ' ')}</div>
          </div>
        </div>
      )
    },
    {
      key: 'serialNumber',
      header: 'Hardware ID',
      render: (val) => <span className="font-mono text-[10px] font-bold text-secondary-500 bg-secondary-50 dark:bg-secondary-800 px-2 py-0.5 rounded-lg border border-secondary-100 dark:border-secondary-700">{val || '---'}</span>
    },
    {
      key: 'status',
      header: 'Deployment State',
      render: (val) => {
        const config = getStatusConfig(val as AssetStatus);
        return (
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${config.bg} ${config.color} font-black text-[10px] uppercase tracking-wider`}>
            {config.icon}
            {config.label}
          </div>
        );
      }
    },
    {
      key: 'id',
      header: 'Lifecycle Control',
      render: (_, asset) => (
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="glass"
            size="xs"
            onClick={() => {
              setEditingAsset(asset);
              setFormData({
                organizationId: asset.organizationId,
                assetType: asset.assetType,
                assetTag: asset.assetTag || '',
                serialNumber: asset.serialNumber || ''
              });
              setIsModalOpen(true);
            }}
            icon={<Monitor className="w-3.5 h-3.5" />}
          />
          <div className="h-6 w-px bg-secondary-100 dark:bg-secondary-800" />
          <Button variant="glass" size="xs" className="text-secondary-400 hover:text-primary-600" icon={<History className="w-3.5 h-3.5" />} />
        </div>
      )
    }
  ];

  const stats = [
    { title: 'Global Inventory', value: pagination.total, icon: <Package />, status: 'info' as const },
    { title: 'Active Deployments', value: assets.filter(a => a.status === 'ASSIGNED').length, icon: <Activity />, status: 'info' as const, trend: { direction: 'neutral', value: 100, label: 'High Load' } as const },
    { title: 'Buffer Stock', value: assets.filter(a => a.status === 'AVAILABLE').length, icon: <Box />, status: 'success' as const },
    { title: 'Risk Assets', value: assets.filter(a => a.status === 'DAMAGED').length, icon: <AlertCircle />, status: 'danger' as const }
  ];

  return (
    <PageTransition>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Logistics', path: '/assets' }, { label: 'Inventory Control', path: '/assets' }]} />
            <h1 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tight">Enterprise Asset Command</h1>
            <p className="text-secondary-500 font-medium italic">Strategic hardware lifecycle management and deployment monitoring.</p>
          </div>
          <Button
            variant="gradient"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleCreate}
            className="shadow-glow"
          >
            Provision Asset
          </Button>
        </div>

        {/* Analytics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <EnhancedStatCard key={i} title={s.title} value={s.value} icon={s.icon} status={s.status} trend={s.trend as any} isLoading={loading} />
          ))}
        </div>

        {/* Control Center */}
        <div className="premium-card p-6 flex flex-col md:flex-row gap-4 items-center bg-white/50 dark:bg-secondary-900/50 backdrop-blur-md transition-all hover:shadow-premium">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by tag, serial, or identifying metric..."
              className="w-full pl-12 pr-4 py-3 bg-secondary-50/50 dark:bg-secondary-800/50 rounded-2xl border-2 border-transparent focus:border-primary-500/20 focus:bg-white dark:focus:bg-secondary-800 outline-none text-sm font-black placeholder:text-secondary-400 dark:text-white transition-all appearance-none"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <select
              className="flex-1 md:w-48 px-4 py-3 bg-secondary-50/50 dark:bg-secondary-800/50 rounded-2xl border-2 border-transparent focus:border-primary-500/20 outline-none text-xs font-black uppercase tracking-widest dark:text-white transition-all cursor-pointer appearance-none"
              value={filters.assetType}
              onChange={(e) => setFilters({ ...filters, assetType: e.target.value })}
            >
              <option value="">Categories</option>
              {Object.values(AssetType).map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
            <select
              className="flex-1 md:w-48 px-4 py-3 bg-secondary-50/50 dark:bg-secondary-800/50 rounded-2xl border-2 border-transparent focus:border-primary-500/20 outline-none text-xs font-black uppercase tracking-widest dark:text-white transition-all cursor-pointer appearance-none"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Status</option>
              {Object.values(AssetStatus).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <Button variant="glass" icon={<Filter className="w-4 h-4" />} />
          </div>
        </div>

        {/* Inventory Plane */}
        <div className="premium-card overflow-hidden">
          <DataTable
            data={assets}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
          />
        </div>

        {/* Provisioning Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingAsset ? 'Optimize Asset Strategy' : 'Provision Organizational Asset'}
          subtitle="Configure hardware parameters for secure organizational deployment"
          size="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-10 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Core Classification
                </h4>
                <FormField
                  label="Strategic Category"
                  name="assetType"
                  type="select"
                  options={Object.values(AssetType).map(t => ({ value: t, label: t.replace(/_/g, ' ') }))}
                  value={formData.assetType}
                  onChange={(e: any) => setFormData({ ...formData, assetType: e.target.value })}
                  required
                />
                <FormField
                  label="Audit Target Tag"
                  name="assetTag"
                  placeholder="e.g. LNX-X1-CARBON-01"
                  value={formData.assetTag}
                  onChange={(e: any) => setFormData({ ...formData, assetTag: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" /> Identification Data
                </h4>
                <FormField
                  label="Hardware Serial Number"
                  name="serialNumber"
                  placeholder="Manufacturer Unique ID"
                  value={formData.serialNumber}
                  onChange={(e: any) => setFormData({ ...formData, serialNumber: e.target.value })}
                  required
                />
                <div className="p-6 rounded-3xl bg-secondary-900 border-l-4 border-l-primary-500 space-y-2">
                  <p className="text-xs font-black text-white italic tracking-tight">Provisioning Logic</p>
                  <p className="text-[10px] font-medium text-secondary-400 leading-relaxed uppercase tracking-wider">
                    Newly indexed assets are initialized with <span className="text-success-500 font-black">AVAILABLE</span> status and secured within the central logistics hub.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-8 border-t border-secondary-100 dark:border-secondary-800">
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Discard</Button>
              <Button type="submit" className="px-10 shadow-glow" isLoading={loading}>
                {editingAsset ? 'Persist Logic Shift' : 'Execute Provisioning'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </PageTransition>
  );
};

export default AssetsManagementPage;
