import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit2, Download, Trash2, UserPlus, FileText, Shield, CreditCard, Landmark, Briefcase } from 'lucide-react';
import employeeApi, { EmployeeResponse } from '../../api/employeeApi';
import PageTransition from '../../components/common/PageTransition';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import EmploymentHistoryTimeline from '../../components/employees/details/EmploymentHistoryTimeline';
import BankDetails from '../../components/employees/details/BankDetails';
import EmployeeAddresses from '../../components/employees/details/EmployeeAddresses';
import EmergencyContacts from '../../components/employees/details/EmergencyContacts';
import EmployeeStatsBar from '../../components/employees/details/EmployeeStatsBar';
import EmployeeDocuments from '../../components/employees/details/EmployeeDocuments';
import AttendanceHeatmap from '../../components/employees/details/AttendanceHeatmap';
import QuickActionsDropdown, { ActionItem } from '../../components/common/QuickActionsDropdown';
import { EmploymentStatus, EmploymentType } from '../../types';

const EmployeeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const employeeId = id ? parseInt(id, 10) : 0;

  const [employee, setEmployee] = useState<EmployeeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'employment' | 'personal' | 'financial' | 'documents'>('overview');

  
  useEffect(() => {
    if (employeeId) {
      loadEmployee();
    }
  }, [employeeId]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const data = await employeeApi.getEmployee(employeeId);
      setEmployee(data);
    } catch (err: any) {
      console.error('Error loading employee:', err);
      setError(err.message || 'Failed to load employee details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error || !employee) {
    return (
      <div className="p-8 text-center animate-fadeIn">
        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-4 inline-block border border-danger-100">
          {error || 'Employee not found'}
        </div>
        <div>
          <Button variant="outline" onClick={() => navigate('/employees')}>
            Back to Employees
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'employment', label: 'Employment History' },
    { id: 'personal', label: 'Personal & Contact' },
    { id: 'financial', label: 'Financial & Statutory' },
    { id: 'documents', label: 'Documents' }
  ];

  const quickActions: ActionItem[] = [
    {
      label: 'Edit Profile',
      icon: <Edit2 className="w-4 h-4" />,
      onClick: () => navigate(`/employees/${employeeId}/edit`)
    },
    {
      label: 'Download PDF',
      icon: <Download className="w-4 h-4" />,
      onClick: () => console.log('Download PDF')
    },
    {
      label: 'Promote',
      icon: <UserPlus className="w-4 h-4" />,
      onClick: () => console.log('Promote')
    },
    {
      label: 'Terminate',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => console.log('Terminate'),
      variant: 'danger'
    }
  ];

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="animate-slideInUp">
          <Breadcrumb
            items={[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Employees', path: '/employees' },
              { label: employee.fullName, path: `/employees/${employeeId}` }
            ]}
          />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center text-white text-3xl font-display font-bold shadow-lg border-4 border-white overflow-hidden transition-transform group-hover:scale-105">
                  {employee.profilePictureUrl ? (
                    <img src={employee.profilePictureUrl} alt={employee.fullName} className="w-full h-full object-cover" />
                  ) : (
                    employee.firstName.charAt(0) + employee.lastName.charAt(0)
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success-500 border-2 border-white rounded-full shadow-sm" title="Active"></div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-display font-bold text-secondary-900">{employee.fullName}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${employee.employmentStatus === EmploymentStatus.ACTIVE ? 'bg-success-100 text-success-700' : 'bg-secondary-100 text-secondary-700'
                    }`}>
                    {employee.employmentStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-secondary-500 mt-2">
                  <span className="flex items-center gap-1.5 bg-secondary-50 text-secondary-700 px-2 py-0.5 rounded font-mono text-xs border border-secondary-200">
                    {employee.employeeNumber}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-secondary-400" />
                    {employee.jobTitle}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Landmark className="w-4 h-4 text-secondary-400" />
                    {employee.departmentName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => navigate('/employees')}>
                Back
              </Button>
              <QuickActionsDropdown actions={quickActions} />
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <EmployeeStatsBar
          hireDate={employee.hireDate}
          leaveBalance={15} // Placeholder
          rating={4.5} // Placeholder
          nextReviewDate="2026-03-31" // Placeholder
        />

        {/* Tabs */}
        <div className="border-b border-secondary-100 sticky top-0 bg-secondary-50/80 backdrop-blur-md z-30 -mx-4 px-4 pt-2">
          <nav className="-mb-px flex space-x-8 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  whitespace-nowrap pb-4 px-1 border-b-2 font-bold text-sm transition-all duration-300
                  ${activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 scale-105'
                    : 'border-transparent text-secondary-400 hover:text-secondary-600 hover:border-secondary-200'}
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fadeIn">
              {/* Left Column: Basic Info */}
              <div className="md:col-span-2 space-y-8">
                <div className="premium-card p-8">
                  <h3 className="section-title">
                    <Shield className="w-5 h-5" />
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                    <InfoItem label="Full Name" value={employee.fullName} />
                    <InfoItem label="Preferred Name" value={employee.preferredName} />
                    <InfoItem label="Date of Birth" value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString(undefined, { dateStyle: 'long' }) : undefined} />
                    <InfoItem label="Gender" value={employee.gender} />
                    <InfoItem label="Marital Status" value={employee.maritalStatus} />
                    <InfoItem label="Nationality" value={employee.nationality} />
                  </div>
                </div>

                <div className="premium-card p-8">
                  <h3 className="section-title">
                    <Briefcase className="w-5 h-5" />
                    Employment Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                    <InfoItem label="Job Title" value={employee.jobTitle} />
                    <InfoItem label="Department" value={employee.departmentName} />
                    <InfoItem label="Reporting Manager" value={employee.managerName} />
                    <InfoItem label="Employment Type" value={employee.employmentType.replace(/_/g, ' ')} />
                    <InfoItem label="Hire Date" value={new Date(employee.hireDate).toLocaleDateString(undefined, { dateStyle: 'long' })} />
                    <InfoItem label="Employee Code" value={employee.employeeNumber} />
                  </div>
                </div>

                <div className="premium-card p-8">
                  <AttendanceHeatmap />
                </div>
              </div>

              {/* Right Column: Contact & Bio */}
              <div className="space-y-8">
                <div className="premium-card p-8">
                  <h3 className="section-title">
                    <CreditCard className="w-5 h-5" />
                    Contact Information
                  </h3>
                  <div className="space-y-6">
                    <div className="group">
                      <span className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Work Email</span>
                      {employee.workEmail ? (
                        <a href={`mailto:${employee.workEmail}`} className="text-primary-600 font-medium hover:underline flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary-400" />
                          {employee.workEmail}
                        </a>
                      ) : <span className="text-secondary-300 italic">No email provided</span>}
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Work Phone</span>
                      <span className="text-secondary-900 font-mono">{employee.phoneNumber || '-'}</span>
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1.5">Mobile Number</span>
                      <span className="text-secondary-900 font-mono font-bold tracking-tight text-lg">{employee.mobileNumber || '-'}</span>
                    </div>
                  </div>
                </div>

                {employee.bio && (
                  <div className="premium-card p-8 bg-primary-50/30 border-primary-100">
                    <h3 className="section-title !text-primary-900">
                      <FileText className="w-5 h-5 !text-primary-600" />
                      About
                    </h3>
                    <p className="text-secondary-600 text-sm leading-relaxed italic">
                      "{employee.bio}"
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'employment' && (
            <div className="premium-card p-8 animate-fadeIn">
              <EmploymentHistoryTimeline employeeId={employeeId} />
            </div>
          )}

          {activeTab === 'personal' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
              <div className="premium-card p-8">
                <EmployeeAddresses employeeId={employeeId} />
              </div>
              <div className="premium-card p-8">
                <EmergencyContacts employeeId={employeeId} />
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="premium-card p-8">
                <h3 className="section-title">
                  <Landmark className="w-5 h-5" />
                  Compensation & Payroll
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-5 bg-secondary-900 rounded-2xl text-white shadow-xl shadow-secondary-200">
                    <span className="text-xs font-bold text-secondary-400 uppercase tracking-widest block mb-2">Monthly Base</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-display font-bold">
                        {employee.salaryCurrency === 'INR' ? '₹' : '$'}
                        {employee.salaryAmount?.toLocaleString() || '-'}
                      </span>
                      <span className="text-secondary-400 text-sm">/mo</span>
                    </div>
                  </div>

                  <div className="status-item bg-secondary-50 border border-secondary-100 p-5 rounded-2xl">
                    <span className="text-xs font-bold text-secondary-400 uppercase tracking-widest block mb-2">Pay Frequency</span>
                    <span className="text-lg font-bold text-secondary-900">{employee.payFrequency || 'Monthly'}</span>
                  </div>

                  <div className="status-item bg-secondary-50 border border-secondary-100 p-5 rounded-2xl">
                    <span className="text-xs font-bold text-secondary-400 uppercase tracking-widest block mb-2">Tax Regime</span>
                    <span className="text-lg font-bold text-secondary-900">Old Regime (FY25-26)</span>
                  </div>
                </div>
              </div>

              {/* Statutory Section - Indian Context */}
              <div className="premium-card p-8 border-l-4 border-l-amber-500">
                <h3 className="section-title">
                  <Shield className="w-5 h-5" />
                  Statutory Details (India)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                  <InfoItem label="PAN Card Number" value={employee.panNumber} isCode />
                  <InfoItem label="Aadhaar Number" value={employee.aadhaarNumber} isCode />
                  <InfoItem label="UAN (PF Number)" value={employee.uanNumber} isCode />
                  <InfoItem label="ESIC Number" value={employee.esicNumber} isCode />
                </div>
              </div>

              <div className="premium-card p-8">
                <BankDetails employeeId={employeeId} />
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="premium-card p-8 animate-fadeIn">
              <EmployeeDocuments employeeId={employeeId} />
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

// Helper components for cleaner code
const InfoItem: React.FC<{ label: string; value?: any; isCode?: boolean }> = ({ label, value, isCode }) => (
  <div className="group">
    <span className="block text-xs font-bold text-secondary-400 uppercase tracking-widest mb-1.5 group-hover:text-primary-500 transition-colors">
      {label}
    </span>
    <span className={`block text-secondary-900 ${isCode ? 'font-mono bg-secondary-50 px-2 py-1 rounded inline-block' : 'font-medium'}`}>
      {value || <span className="text-secondary-300 italic">Not set</span>}
    </span>
  </div>
);

export default EmployeeDetailPage;
