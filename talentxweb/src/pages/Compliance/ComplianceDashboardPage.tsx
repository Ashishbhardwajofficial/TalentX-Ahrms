import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  MapPin,
  Scaling,
  History,
  Search,
  Plus,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Info,
  Globe,
  Gavel,
  FileSearch
} from 'lucide-react';
import complianceApi, {
  ComplianceJurisdictionDTO,
  ComplianceRuleDTO,
  ComplianceCheckDTO,
  ComplianceJurisdictionCreateDTO,
  ComplianceRuleCreateDTO,
  ComplianceCheckRunRequest,
  ComplianceCheckResolveRequest,
  ComplianceOverviewResponse
} from '../../api/complianceApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import PageTransition from '../../components/common/PageTransition';
import ComplianceAlertCard from '../../components/compliance/ComplianceAlertCard';
import {
  JurisdictionType,
  ComplianceRuleCategory,
  ComplianceCheckStatus,
  ComplianceSeverity
} from '../../types';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

type TabType = 'overview' | 'jurisdictions' | 'rules' | 'checks';

const ComplianceDashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const organizationId = user?.organizationId ?? 1;
  const toast = useToast();

  // Overview state
  const [overview, setOverview] = useState<ComplianceOverviewResponse | null>(null);

  // Jurisdiction state
  const [jurisdictions, setJurisdictions] = useState<ComplianceJurisdictionDTO[]>([]);
  const [isJurisdictionModalOpen, setIsJurisdictionModalOpen] = useState(false);
  const [editingJurisdiction, setEditingJurisdiction] = useState<ComplianceJurisdictionDTO | null>(null);
  const [jurisdictionFormData, setJurisdictionFormData] = useState<ComplianceJurisdictionCreateDTO>({
    countryCode: '',
    name: '',
    jurisdictionType: JurisdictionType.COUNTRY
  });

  // Rule state
  const [rules, setRules] = useState<ComplianceRuleDTO[]>([]);
  const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ComplianceRuleDTO | null>(null);
  const [ruleFormData, setRuleFormData] = useState<ComplianceRuleCreateDTO>({
    jurisdictionId: 0,
    ruleCategory: ComplianceRuleCategory.OTHER,
    ruleName: ''
  });

  // Check state
  const [checks, setChecks] = useState<ComplianceCheckDTO[]>([]);
  const [unresolvedViolations, setUnresolvedViolations] = useState<ComplianceCheckDTO[]>([]);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvingCheck, setResolvingCheck] = useState<ComplianceCheckDTO | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Pagination state
  const [jurisdictionPagination, setJurisdictionPagination] = useState({ page: 1, size: 10, total: 0 });
  const [rulePagination, setRulePagination] = useState({ page: 1, size: 10, total: 0 });
  const [checkPagination, setCheckPagination] = useState({ page: 1, size: 10, total: 0 });


  useEffect(() => {
    if (activeTab === 'overview') {
      loadOverview();
      loadUnresolvedViolations();
    } else if (activeTab === 'jurisdictions') {
      loadJurisdictions();
    } else if (activeTab === 'rules') {
      loadRules();
    } else if (activeTab === 'checks') {
      loadChecks();
    }
  }, [activeTab, jurisdictionPagination.page, rulePagination.page, checkPagination.page]);

  const loadOverview = async () => {
    try {
      setLoading(true);
      const data = await complianceApi.getComplianceOverview(organizationId);
      setOverview(data);
    } catch (err: any) {
      // Silently ignore — overview defaults to zeros when no data exists
      console.error('Compliance overview error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUnresolvedViolations = async () => {
    try {
      const response = await complianceApi.getUnresolvedViolations(organizationId, { page: 0, size: 5 });
      setUnresolvedViolations(response?.content ?? []);
    } catch (err: any) {
      console.error('Violations Error:', err);
      setUnresolvedViolations([]);
    }
  };

  const loadJurisdictions = async () => {
    try {
      setLoading(true);
      const response = await complianceApi.getJurisdictions({
        page: jurisdictionPagination.page - 1,
        size: jurisdictionPagination.size
      });
      setJurisdictions(response?.content ?? []);
      setJurisdictionPagination(prev => ({ ...prev, total: response?.totalElements ?? 0 }));
    } catch (err: any) {
      toast.error('Load Failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadRules = async () => {
    try {
      setLoading(true);
      const response = await complianceApi.getRules({
        page: rulePagination.page - 1,
        size: rulePagination.size
      });
      setRules(response?.content ?? []);
      setRulePagination(prev => ({ ...prev, total: response?.totalElements ?? 0 }));
    } catch (err: any) {
      toast.error('Load Failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const loadChecks = async () => {
    try {
      setLoading(true);
      const response = await complianceApi.getChecks({
        page: checkPagination.page - 1,
        size: checkPagination.size,
        organizationId
      });
      setChecks(response?.content ?? []);
      setCheckPagination(prev => ({ ...prev, total: response?.totalElements ?? 0 }));
    } catch (err: any) {
      toast.error('Load Failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleRunComplianceCheck = async () => {
    try {
      setLoading(true);
      await complianceApi.runComplianceCheck({ organizationId });
      toast.success('Check Completed', { description: 'System-wide compliance audit finished.' });
      loadChecks();
      loadOverview();
    } catch (err: any) {
      toast.error('Audit Failed', { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResolveViolation = (check: ComplianceCheckDTO) => {
    setResolvingCheck(check);
    setResolutionNotes('');
    setIsResolveModalOpen(true);
  };

  const submitResolution = async () => {
    if (!resolvingCheck) return;
    try {
      await complianceApi.resolveViolation(resolvingCheck.id, { resolutionNotes });
      toast.success('Victory', { description: 'Violation successfully mitigated.' });
      setIsResolveModalOpen(false);
      loadChecks();
      loadOverview();
      loadUnresolvedViolations();
    } catch (err: any) {
      toast.error('Mitigation Failed', { description: err.message });
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {overview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="premium-card p-5 bg-gradient-to-br from-white to-secondary-50/50">
            <div className="w-10 h-10 rounded-xl bg-secondary-100 center text-secondary-600 mb-3">
              <FileSearch className="w-5 h-5" />
            </div>
            <div className="text-secondary-500 text-[10px] font-black uppercase tracking-widest">Total Audits</div>
            <div className="text-2xl font-black text-secondary-900 mt-1">{overview.totalChecks}</div>
          </div>
          <div className="premium-card p-5 border-success-100 bg-success-50/20">
            <div className="w-10 h-10 rounded-xl bg-success-500 text-white center mb-3 shadow-glow-success">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-success-700 text-[10px] font-black uppercase tracking-widest">Compliant</div>
            <div className="text-2xl font-black text-success-900 mt-1">{overview.compliantChecks}</div>
          </div>
          <div className="premium-card p-5 border-danger-100 bg-danger-50/20">
            <div className="w-10 h-10 rounded-xl bg-danger-500 text-white center mb-3 shadow-glow-danger">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-danger-700 text-[10px] font-black uppercase tracking-widest">Violations</div>
            <div className="text-2xl font-black text-danger-900 mt-1">{overview.nonCompliantChecks}</div>
          </div>
          <div className="premium-card p-5 border-warning-100 bg-warning-50/20">
            <div className="w-10 h-10 rounded-xl bg-warning-500 text-white center mb-3 shadow-glow-warning">
              <Zap className="w-5 h-5" />
            </div>
            <div className="text-warning-700 text-[10px] font-black uppercase tracking-widest">Warnings</div>
            <div className="text-2xl font-black text-warning-900 mt-1">{overview.warningChecks}</div>
          </div>
          <div className="premium-card p-5 border-primary-100 bg-primary-50/20">
            <div className="w-10 h-10 rounded-xl bg-primary-500 text-white center mb-3 shadow-glow">
              <Info className="w-5 h-5" />
            </div>
            <div className="text-primary-700 text-[10px] font-black uppercase tracking-widest">Manual Review</div>
            <div className="text-2xl font-black text-primary-900 mt-1">{overview.reviewRequiredChecks}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-secondary-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-danger-500" />
              Critical Redlines
            </h3>
            <span className="px-3 py-1 bg-danger-50 text-danger-700 text-[10px] font-black rounded-full border border-danger-100 uppercase tracking-wider">
              Requires Intervention
            </span>
          </div>
          <div className="space-y-4">
            {(unresolvedViolations ?? []).map(violation => (
              <ComplianceAlertCard
                key={violation.id}
                violation={violation}
                onResolve={() => handleResolveViolation(violation)}
              />
            ))}
            {(unresolvedViolations ?? []).length === 0 && (
              <div className="p-12 text-center bg-secondary-50/50 rounded-[32px] border-2 border-dashed border-secondary-200">
                <CheckCircle2 className="w-12 h-12 text-success-400 mx-auto mb-4" />
                <div className="text-secondary-900 font-bold">Absolute Compliance Shared</div>
                <p className="text-secondary-500 text-sm mt-1">System is running within all defined parameters.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-black text-secondary-900 tracking-tight flex items-center gap-2">
            <Scaling className="w-5 h-5 text-primary-500" />
            Action Center
          </h3>
          <div className="premium-card p-6 space-y-4">
            <p className="text-secondary-500 text-xs font-medium leading-relaxed">
              Trigger a system-wide scan of all active controls, employment contracts, and statutory requirements across all jurisdictions.
            </p>
            <Button
              variant="primary"
              className="w-full py-6 shadow-premium group"
              icon={<ShieldCheck className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
              onClick={handleRunComplianceCheck}
              isLoading={loading}
            >
              Start Full Scan
            </Button>
            <div className="pt-4 border-t border-secondary-50 flex items-center justify-between text-[10px] font-black text-secondary-400 uppercase tracking-widest">
              <span>Last Scan</span>
              <span>24m ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const jurisdictionColumns: ColumnDefinition<ComplianceJurisdictionDTO>[] = [
    { key: 'name', header: 'Region', render: (val) => <span className="font-bold text-secondary-900">{val}</span> },
    { key: 'countryCode', header: 'ISO Code', render: (val) => <span className="text-xs font-black text-primary-600 bg-primary-50 px-2 py-0.5 rounded-lg border border-primary-100">{val}</span> },
    { key: 'jurisdictionType', header: 'Tier', render: (val) => <span className="text-[10px] font-black uppercase tracking-wider text-secondary-500">{val}</span> },
    {
      key: 'isActive',
      header: 'Integrity',
      render: (value) => (
        <div className={`center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${value ? 'bg-success-50 text-success-700 border border-success-100' : 'bg-secondary-100 text-secondary-500'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-success-500 animate-pulse' : 'bg-secondary-400'}`} />
          {value ? 'Governed' : 'Suspended'}
        </div>
      )
    }
  ];

  const ruleColumns: ColumnDefinition<ComplianceRuleDTO>[] = [
    { key: 'ruleName', header: 'Directive', render: (val) => <span className="font-bold text-secondary-900">{val}</span> },
    { key: 'ruleCategory', header: 'Domain', render: (val) => <span className="text-xs font-medium text-secondary-600">{val?.replace('_', ' ')}</span> },
    { key: 'jurisdiction', header: 'Authority', render: (_, rule) => <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-secondary-400" /> <span className="text-xs font-bold text-secondary-700">{rule.jurisdiction?.name}</span></div> },
    {
      key: 'isActive',
      header: 'Protocol',
      render: (value) => (
        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wide ${value ? 'text-success-600' : 'text-secondary-400'}`}>
          {value ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
          {value ? 'Active Enforcement' : 'Draft Protocol'}
        </div>
      )
    }
  ];

  const checkColumns: ColumnDefinition<ComplianceCheckDTO>[] = [
    { key: 'checkDate', header: 'Timestamp', render: (v) => <div className="text-xs font-bold text-secondary-500">{new Date(v).toLocaleString()}</div> },
    { key: 'rule', header: 'Protocol', render: (_, c) => <span className="font-bold text-secondary-900">{c.rule?.ruleName}</span> },
    { key: 'employeeName', header: 'Subject', render: (v) => <span className="text-xs font-medium text-secondary-600 italic">@{v || 'SYSTEM'}</span> },
    {
      key: 'status',
      header: 'Outcome',
      render: (v) => (
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase ${v === ComplianceCheckStatus.COMPLIANT ? 'bg-success-50 text-success-700' :
          v === ComplianceCheckStatus.NON_COMPLIANT ? 'bg-danger-50 text-danger-700' :
            'bg-warning-50 text-warning-700'
          }`}>
          {v}
        </span>
      )
    },
    {
      key: 'severity',
      header: 'Gravity',
      render: (v) => (
        <span className={`font-black text-[10px] tracking-widest uppercase ${v === ComplianceSeverity.CRITICAL ? 'text-danger-600' :
          v === ComplianceSeverity.HIGH ? 'text-warning-600' : 'text-secondary-400'
          }`}>
          {v}
        </span>
      )
    },
    {
      key: 'resolved',
      header: 'Status',
      render: (v) => v ? <span className="text-success-500"><CheckCircle2 className="w-4 h-4" /></span> : <span className="text-danger-500"><AlertTriangle className="w-4 h-4" /></span>
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Breadcrumb />
            <h1 className="text-3xl font-display font-black text-secondary-900 tracking-tight flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-primary-600" />
              Gnosis Governance Engine
            </h1>
            <p className="text-secondary-500 mt-1 font-medium">Global regulatory oversight and statutory compliance monitoring.</p>
          </div>

          <div className="flex p-1 bg-secondary-100 rounded-2xl w-fit">
            {(['overview', 'jurisdictions', 'rules', 'checks'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab
                  ? 'bg-white text-primary-600 shadow-premium'
                  : 'text-secondary-500 hover:text-secondary-700'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && renderOverviewTab()}

        {activeTab === 'jurisdictions' && (
          <div className="premium-card p-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-secondary-900 tracking-tight flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary-500" />
                Regional Authorities
              </h3>
              <Button icon={<Plus className="w-4 h-4" />} variant="primary" size="sm" className="shadow-premium">
                Map Jurisdiction
              </Button>
            </div>
            <DataTable
              data={jurisdictions}
              columns={jurisdictionColumns}
              loading={loading}
              pagination={jurisdictionPagination}
              onPageChange={(page) => setJurisdictionPagination(prev => ({ ...prev, page }))}
              onPageSizeChange={(size) => setJurisdictionPagination(prev => ({ ...prev, size, page: 1 }))}
            />
          </div>
        )}

        {activeTab === 'rules' && (
          <div className="premium-card p-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-secondary-900 tracking-tight flex items-center gap-2">
                <Gavel className="w-5 h-5 text-primary-500" />
                Directive Matrix
              </h3>
              <Button icon={<Plus className="w-4 h-4" />} variant="primary" size="sm" className="shadow-premium">
                Draft Directive
              </Button>
            </div>
            <DataTable
              data={rules}
              columns={ruleColumns}
              loading={loading}
              pagination={rulePagination}
              onPageChange={(page) => setRulePagination(prev => ({ ...prev, page }))}
              onPageSizeChange={(size) => setRulePagination(prev => ({ ...prev, size, page: 1 }))}
            />
          </div>
        )}

        {activeTab === 'checks' && (
          <div className="premium-card p-6 animate-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-secondary-900 tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 text-primary-500" />
                Audit Trail
              </h3>
            </div>
            <DataTable
              data={checks}
              columns={checkColumns}
              loading={loading}
              pagination={checkPagination}
              onPageChange={(page) => setCheckPagination(prev => ({ ...prev, page }))}
              onPageSizeChange={(size) => setCheckPagination(prev => ({ ...prev, size, page: 1 }))}
            />
          </div>
        )}
      </div>

      {/* Mitigation Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Mitigation Protocol"
        subtitle="Formal resolution of identified compliance redline."
        size="md"
      >
        <div className="space-y-6">
          {resolvingCheck && (
            <div className="p-4 bg-secondary-50/50 rounded-2xl border border-secondary-100 flex gap-4">
              <div className={`w-12 h-12 rounded-xl center shadow-glow flex-shrink-0 ${resolvingCheck.severity === ComplianceSeverity.CRITICAL ? 'bg-danger-500 text-white' : 'bg-warning-500 text-white'
                }`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <div className="font-black text-secondary-900 leading-none">{resolvingCheck.rule?.ruleName}</div>
                <div className="text-[10px] font-black uppercase text-secondary-400 mt-1.5 tracking-wider">
                  Target: @{resolvingCheck.employeeName || 'SYSTEM'} • {new Date(resolvingCheck.checkDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-secondary-400 uppercase tracking-widest">Resolution Narrative</label>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              rows={4}
              placeholder="Detail the corrective actions taken into mitigate this risk..."
              className="w-full px-4 py-3 bg-secondary-50 border-2 border-secondary-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-primary-500 outline-none transition-all shadow-inner-pill"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-50 font-black uppercase tracking-widest text-[11px]">
            <Button variant="ghost" onClick={() => setIsResolveModalOpen(false)}>Abort Mitigation</Button>
            <Button
              variant="primary"
              onClick={submitResolution}
              disabled={!resolutionNotes.trim()}
              className="shadow-premium min-w-[140px]"
            >
              Commit Mitigation
            </Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
};

export default ComplianceDashboardPage;
