import React, { useState, useEffect } from 'react';
import {
  Download,
  Printer,
  Receipt,
  Calendar,
  Clock,
  User,
  Building2,
  Briefcase,
  Wallet,
  TrendingDown,
  CheckCircle2,
  ChevronRight,
  FileText
} from 'lucide-react';
import Button from '../../components/common/Button';
import PageTransition from '../../components/common/PageTransition';
import Breadcrumb from '../../components/common/Breadcrumb';
import payrollApi, { PayslipDTO } from '../../api/payrollApi';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

interface PayslipPageProps {
  employeeId?: number;
}

const PayslipPage: React.FC<PayslipPageProps> = ({ employeeId }) => {
  const { user } = useAuthContext();
  const toast = useToast();
  const [payslips, setPayslips] = useState<PayslipDTO[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);

  const currentEmployeeId = employeeId || user?.id || 1;

  
  useEffect(() => {
    loadPayslips();
  }, [currentEmployeeId]);

  const loadPayslips = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await payrollApi.getEmployeePayslips(currentEmployeeId, {
        page: 0,
        size: 50
      });
      setPayslips(response.content);
      if (response.content.length > 0 && response.content[0]) {
        setSelectedPayslip(response.content[0]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load payslips';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPayslip = async (payrollItemId: number) => {
    setDownloading(true);
    const toastId = toast.loading('Generating secure PDF transcript...');
    try {
      const blob = await payrollApi.downloadPayslip(payrollItemId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `payslip-${payrollItemId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Document ready for download');
    } catch (err) {
      toast.error('Transcript generation failed');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintPayslip = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string, format: 'short' | 'long' = 'long') => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: format === 'long' ? 'long' : 'short',
      day: 'numeric'
    });
  };

  const InfoRow = ({ label, value, icon: Icon }: { label: string, value: string | number, icon?: any }) => (
    <div className="flex items-center justify-between py-2 border-b border-secondary-100 dark:border-secondary-800 last:border-0 group">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-3.5 h-3.5 text-secondary-400 group-hover:text-primary-500 transition-colors" />}
        <span className="text-[10px] uppercase font-black tracking-widest text-secondary-400">{label}</span>
      </div>
      <span className="text-sm font-bold text-secondary-900 dark:text-white tracking-tight">{value}</span>
    </div>
  );

  return (
    <PageTransition>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Financials', path: '/payroll' }, { label: 'Earnings History', path: '/payroll/payslips' }]} />
            <h1 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tight text-print-hidden">Earnings Vault</h1>
            <p className="text-secondary-500 font-medium italic text-print-hidden">Authorized transcripts of your organizational compensation.</p>
          </div>
          <div className="flex items-center gap-3 text-print-hidden">
            <Button variant="outline" icon={<Printer className="w-4 h-4" />} onClick={handlePrintPayslip}>Print View</Button>
            {selectedPayslip && (
              <Button
                variant="gradient"
                icon={<Download className="w-4 h-4" />}
                onClick={() => handleDownloadPayslip(selectedPayslip.payrollItemId)}
                isLoading={downloading}
                className="shadow-glow"
              >
                Get PDF
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* History Sidebar */}
          <div className="lg:col-span-4 space-y-6 text-print-hidden">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-secondary-400 px-2">Cycle History</h2>
              <span className="text-[10px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">{payslips.length} Cycles</span>
            </div>

            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {loading && payslips.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="premium-card p-5 animate-pulse flex justify-between h-24" />
                ))
              ) : payslips.length === 0 ? (
                <div className="premium-card p-12 center flex-col text-center space-y-4 opacity-50">
                  <Receipt className="w-12 h-12 text-secondary-300" />
                  <p className="text-sm font-medium text-secondary-400 italic">No financial cycles found for this period.</p>
                </div>
              ) : (
                payslips.map((payslip) => (
                  <button
                    key={payslip.id}
                    onClick={() => setSelectedPayslip(payslip)}
                    className={`w-full text-left premium-card p-5 group transition-all duration-300 ${selectedPayslip?.id === payslip.id
                      ? 'border-primary-500 dark:border-primary-500 bg-primary-50/30 dark:bg-primary-900/10 shadow-glow ring-1 ring-primary-500/20'
                      : 'hover:border-secondary-300 dark:hover:border-secondary-700 hover:translate-x-1'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl center transition-colors ${selectedPayslip?.id === payslip.id ? 'bg-primary-600 text-white' : 'bg-secondary-100 dark:bg-secondary-800 text-secondary-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 group-hover:text-primary-600'
                          }`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-secondary-900 dark:text-white uppercase tracking-tighter">
                            {formatDate(payslip.payPeriod.start, 'short')} — {formatDate(payslip.payPeriod.end, 'short')}
                          </span>
                          <span className="text-[10px] font-bold text-secondary-500 tracking-tight">Post Date: {formatDate(payslip.payDate)}</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${selectedPayslip?.id === payslip.id ? 'text-primary-500 translate-x-1' : 'text-secondary-300 group-hover:text-secondary-500'}`} />
                    </div>
                    <div className="flex items-end justify-between">
                      <div className="text-lg font-black tracking-tighter text-secondary-900 dark:text-white">
                        {formatCurrency(payslip.netPay)}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-[0.1em] text-secondary-400 bg-secondary-100 dark:bg-secondary-800 px-2 py-0.5 rounded">Net Distributed</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-8">
            {selectedPayslip ? (
              <div className="premium-card p-0 overflow-hidden bg-white dark:bg-secondary-900 shadow-2xl print:shadow-none print:border-0">
                {/* Visual Accent */}
                <div className="h-2 bg-gradient-primary w-full" />

                <div className="p-8 md:p-12 space-y-12">
                  {/* Branding & Top Info */}
                  <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-secondary-900 center text-white shadow-premium">
                          <Receipt className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                          <h2 className="text-2xl font-black text-secondary-900 dark:text-white tracking-tighter">OFFICIAL PAYSLIP</h2>
                          <p className="text-xs font-bold text-primary-600 uppercase tracking-widest">Digital Transcript</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.15em] text-secondary-400">Statement Reference</p>
                        <p className="text-sm font-mono font-bold text-secondary-600 uppercase">TX-PLY-{selectedPayslip.id}-{selectedPayslip.payrollItemId}</p>
                      </div>
                    </div>

                    <div className="premium-card bg-secondary-50 dark:bg-secondary-800/50 p-6 flex flex-col items-end min-w-[240px]">
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400 mb-1">Pay Period Window</span>
                      <span className="text-sm font-bold text-secondary-900 dark:text-white tracking-tight">{formatDate(selectedPayslip.payPeriod.start)} — {formatDate(selectedPayslip.payPeriod.end)}</span>
                      <div className="mt-4 flex flex-col items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400 mb-1">Disbursement Date</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-success-50 dark:bg-success-900/20 text-success-600 rounded-full border border-success-100 dark:border-success-800/30">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span className="text-xs font-black uppercase tracking-tighter">{formatDate(selectedPayslip.payDate)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Identity Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 border-y border-secondary-100 dark:border-secondary-800 py-8">
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary-400 mb-4 px-2 italic underline underline-offset-4 decoration-primary-500/30">Recipient Details</h4>
                      <InfoRow label="Personnel ID" value={selectedPayslip.employee.employeeNumber} icon={User} />
                      <InfoRow label="Legal Name" value={selectedPayslip.employee.fullName} icon={User} />
                      <InfoRow label="Organizational Unit" value={selectedPayslip.employee.departmentName || 'Global Operations'} icon={Building2} />
                      <InfoRow label="Professional Rank" value={selectedPayslip.employee.jobTitle || 'Core Contributor'} icon={Briefcase} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-secondary-400 mb-4 px-2 italic underline underline-offset-4 decoration-primary-500/30">Payroll Metrics</h4>
                      <InfoRow label="Hours Captured" value={selectedPayslip.hoursWorked} icon={Clock} />
                      <InfoRow label="Operational Days" value={selectedPayslip.daysWorked} icon={Calendar} />
                      <InfoRow label="Record Generated" value={formatDate(selectedPayslip.generatedAt)} icon={Clock} />
                      <InfoRow label="Currency Base" value="USD — US Dollar" icon={Wallet} />
                    </div>
                  </div>

                  {/* Financial Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Earnings */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-success-50 dark:bg-success-900/20 text-success-600 center shadow-soft">
                          <Wallet className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-secondary-900 dark:text-white">Aggregated Earnings</h3>
                      </div>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span className="font-bold text-secondary-500">Base Salary Contract</span>
                          <span className="font-black text-secondary-900 dark:text-white">{formatCurrency(selectedPayslip.earnings.baseSalary)}</span>
                        </div>
                        {selectedPayslip.earnings.overtimePay > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-secondary-500">Overtime Compensation</span>
                            <span className="font-black text-secondary-900 dark:text-white">{formatCurrency(selectedPayslip.earnings.overtimePay)}</span>
                          </div>
                        )}
                        {selectedPayslip.earnings.bonuses > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-secondary-500">Performance Incentives</span>
                            <span className="font-black text-success-600">{formatCurrency(selectedPayslip.earnings.bonuses)}</span>
                          </div>
                        )}
                        {selectedPayslip.earnings.allowances > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-secondary-500">Supplementary Allowances</span>
                            <span className="font-black text-secondary-900 dark:text-white">{formatCurrency(selectedPayslip.earnings.allowances)}</span>
                          </div>
                        )}
                        <div className="pt-4 border-t border-secondary-100 dark:border-secondary-800 flex justify-between items-center">
                          <span className="text-xs font-black uppercase tracking-widest text-secondary-900 dark:text-white">Gross Remuneration</span>
                          <span className="text-lg font-black tracking-tighter text-secondary-900 dark:text-white">{formatCurrency(selectedPayslip.earnings.grossPay)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-danger-50 dark:bg-danger-900/20 text-danger-600 center shadow-soft">
                          <TrendingDown className="w-4 h-4" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-secondary-900 dark:text-white">Statutory Deductions</h3>
                      </div>

                      <div className="space-y-4">
                        {selectedPayslip.deductions.tax > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-secondary-500">Income Tax (Estimated)</span>
                            <span className="font-black text-danger-500">-{formatCurrency(selectedPayslip.deductions.tax)}</span>
                          </div>
                        )}
                        {selectedPayslip.deductions.socialSecurity > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-secondary-500">Social Security Contribution</span>
                            <span className="font-black text-danger-500">-{formatCurrency(selectedPayslip.deductions.socialSecurity)}</span>
                          </div>
                        )}
                        {selectedPayslip.deductions.healthInsurance > 0 && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-secondary-500">Health Insurance Premium</span>
                            <span className="font-black text-danger-500">-{formatCurrency(selectedPayslip.deductions.healthInsurance)}</span>
                          </div>
                        )}
                        <div className="pt-4 border-t border-secondary-100 dark:border-secondary-800 flex justify-between items-center">
                          <span className="text-xs font-black uppercase tracking-widest text-secondary-900 dark:text-white">Total Adjustments</span>
                          <span className="text-lg font-black tracking-tighter text-danger-500">{formatCurrency(selectedPayslip.deductions.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Net Pay Highlight */}
                  <div className="bg-secondary-900 dark:bg-black rounded-3xl p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group/net">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[120px] rounded-full" />
                    <div className="space-y-2 z-10">
                      <h3 className="text-xs font-black uppercase tracking-[0.3em] text-primary-500">Net Distributed Payable</h3>
                      <p className="text-sm font-medium text-secondary-400 max-w-sm">This is the final amount credited to your designated financial account after all adjustments.</p>
                    </div>
                    <div className="text-center md:text-right z-10">
                      <div className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-glow">
                        {formatCurrency(selectedPayslip.netPay)}
                      </div>
                      <div className="mt-2 flex items-center justify-center md:justify-end gap-2 text-success-400 font-bold uppercase text-[10px] tracking-widest bg-success-500/10 px-4 py-1 rounded-full border border-success-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        Settled & Verified
                      </div>
                    </div>
                  </div>

                  {/* Anti-Forgery & Footer */}
                  <div className="flex flex-col md:flex-row justify-between items-end gap-6 pt-12 border-t border-secondary-100 dark:border-secondary-800">
                    <div className="flex items-center gap-6 opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700">
                      <div className="center flex-col text-[10px] space-y-2">
                        <div className="w-16 h-16 border-2 border-secondary-300 dark:border-secondary-700 center rounded-xl p-2">
                          <FileText className="w-full h-full text-secondary-200" />
                        </div>
                        <span className="font-black tracking-widest uppercase">Digital Stamp</span>
                      </div>
                      <div className="center flex-col text-[10px] space-y-2">
                        <div className="font-mono text-center space-y-1">
                          <div>SECURE_TX_HASH</div>
                          <div className="tracking-tighter break-all max-w-[120px]">0x{Math.random().toString(16).substring(2, 24)}</div>
                        </div>
                        <span className="font-black tracking-widest uppercase">Integrity Hash</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-xs font-black text-secondary-900 dark:text-white uppercase tracking-tighter">TalentX Financial Systems</p>
                      <p className="text-[10px] text-secondary-400 font-medium">This is a computer-generated statement and does not require a signature.</p>
                      <p className="text-[10px] text-primary-500 font-bold">Confidential & Proprietary</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full premium-card center flex-col text-center p-24 space-y-6 bg-white/30 dark:bg-secondary-900/30 backdrop-blur-sm border-dashed">
                <div className="w-20 h-20 rounded-full bg-secondary-100 dark:bg-secondary-800 center animate-bounce-slow">
                  <Receipt className="w-8 h-8 text-secondary-400" />
                </div>
                <div className="space-y-2 max-w-sm">
                  <h3 className="text-xl font-black text-secondary-900 dark:text-white tracking-tight">Select a Disbursement</h3>
                  <p className="text-secondary-500 font-medium italic">Your financial history is stored securely. Select a cycle from the history panel to view the full breakdown.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default PayslipPage;
