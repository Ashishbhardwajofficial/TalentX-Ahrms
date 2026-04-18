import React, { useState, useEffect } from 'react';
import Form from '../common/Form';
import FormField from '../common/FormField';
import Button from '../common/Button';
import { EmployeeRequest } from '../../api/employeeApi';
import { EmploymentStatus, EmploymentType, FieldError, PayFrequency, Gender, MaritalStatus } from '../../types';
import { User, Mail, Briefcase, DollarSign, Heart, MapPin, Building2, UserCheck } from 'lucide-react';
import departmentApi from '../../api/departmentApi';
import locationApi from '../../api/locationApi';
import employeeApi from '../../api/employeeApi';

export interface EmployeeFormProps {
  initialData?: Partial<EmployeeRequest> & {
    hireDate?: string;
    dateOfBirth?: string;
  };
  onSubmit: (data: EmployeeRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  isEditMode?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  isEditMode = false
}) => {
  const [departments, setDepartments] = useState<Array<{ value: number | string; label: string }>>([]);
  const [managers, setManagers] = useState<Array<{ value: number | string; label: string }>>([]);
  const [locations, setLocations] = useState<Array<{ value: number | string; label: string }>>([]);

  useEffect(() => {
    // Load departments from real API
    departmentApi.getDepartments({ page: 0, size: 100 })
      .then(res => {
        const items = (res as any).content ?? (Array.isArray(res) ? res : []);
        setDepartments(items.map((d: any) => ({ value: d.id, label: d.name })));
      })
      .catch(() => {
        // Fallback to defaults if API fails
        setDepartments([
          { value: 1, label: 'Engineering' },
          { value: 2, label: 'Human Resources' },
          { value: 3, label: 'Finance' },
          { value: 4, label: 'Sales' },
          { value: 5, label: 'Marketing' },
        ]);
      });

    // Load locations from real API
    locationApi.getLocations({ page: 0, size: 100 })
      .then(res => {
        const items = (res as any).content ?? (Array.isArray(res) ? res : []);
        setLocations(items.map((l: any) => ({ value: l.id, label: l.name })));
      })
      .catch(() => {
        setLocations([{ value: 1, label: 'Main HQ' }]);
      });

    // Load managers (active employees) from real API
    employeeApi.getEmployees({ page: 0, size: 200 })
      .then(res => {
        setManagers(res.content.map((e: any) => ({
          value: e.id,
          label: `${e.firstName} ${e.lastName} (${e.employeeNumber})`
        })));
      })
      .catch(() => setManagers([]));
  }, []);

  const handleSubmit = async (formData: Record<string, any>) => {
    // Build submission — with exactOptionalPropertyTypes:true we must omit
    // optional keys entirely rather than assigning undefined explicitly.
    const submissionData: EmployeeRequest = {
      organizationId: 1,
      employeeNumber: formData.employeeNumber || '',
      firstName: formData.firstName || '',
      lastName: formData.lastName || '',
      hireDate: formData.hireDate || '',
      employmentStatus: formData.employmentStatus as EmploymentStatus,
      employmentType: formData.employmentType as EmploymentType,
      // Optional string fields — only include when truthy
      ...(formData.middleName && { middleName: formData.middleName }),
      ...(formData.preferredName && { preferredName: formData.preferredName }),
      ...(formData.workEmail && { workEmail: formData.workEmail }),
      ...(formData.personalEmail && { personalEmail: formData.personalEmail }),
      ...(formData.phoneNumber && { phoneNumber: formData.phoneNumber }),
      ...(formData.mobileNumber && { mobileNumber: formData.mobileNumber }),
      ...(formData.panNumber && { panNumber: formData.panNumber }),
      ...(formData.aadhaarNumber && { aadhaarNumber: formData.aadhaarNumber }),
      ...(formData.uanNumber && { uanNumber: formData.uanNumber }),
      ...(formData.esicNumber && { esicNumber: formData.esicNumber }),
      ...(formData.pfNumber && { pfNumber: formData.pfNumber }),
      ...(formData.jobTitle && { jobTitle: formData.jobTitle }),
      ...(formData.jobLevel && { jobLevel: formData.jobLevel }),
      ...(formData.salaryCurrency && { salaryCurrency: formData.salaryCurrency }),
      ...(formData.nationality && { nationality: formData.nationality }),
      ...(formData.bio && { bio: formData.bio }),
      // Optional number fields
      ...(formData.departmentId && { departmentId: Number(formData.departmentId) }),
      ...(formData.managerId && { managerId: Number(formData.managerId) }),
      ...(formData.locationId && { locationId: Number(formData.locationId) }),
      ...(formData.salaryAmount && { salaryAmount: Number(formData.salaryAmount) }),
      // Optional enum fields
      ...(formData.payFrequency && { payFrequency: formData.payFrequency as PayFrequency }),
      ...(formData.gender && { gender: formData.gender as Gender }),
      ...(formData.maritalStatus && { maritalStatus: formData.maritalStatus as MaritalStatus }),
      // Optional date fields
      ...(formData.dateOfBirth && { dateOfBirth: formData.dateOfBirth }),
    };

    await onSubmit(submissionData);
  };

  const validationRules = {
    employeeNumber: { required: true },
    firstName: { required: true },
    lastName: { required: true },
    workEmail: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    hireDate: { required: true },
    employmentStatus: { required: true },
    employmentType: { required: true },
  };

  const processedInitialData = {
    ...initialData,
    hireDate: initialData?.hireDate?.split('T')[0] || '',
    dateOfBirth: initialData?.dateOfBirth?.split('T')[0] || '',
  };

  const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
    <div className="flex items-center gap-4 mb-8">
      <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 center shadow-soft group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-0.5">
        <h3 className="text-xl font-black text-secondary-900 dark:text-white tracking-tight leading-none">{title}</h3>
        <p className="text-[10px] font-black uppercase tracking-widest text-secondary-400">{subtitle}</p>
      </div>
    </div>
  );

  return (
    <Form
      onSubmit={handleSubmit}
      initialData={processedInitialData}
      validationRules={validationRules}
      loading={loading}
      onCancel={onCancel}
      submitButtonText={isEditMode ? 'Update Profile' : 'Onboard Talent'}
      className="max-w-5xl mx-auto"
    >
      {/* 1. Identity & Role */}
      <div className="premium-card p-8 group transition-all duration-500 hover:border-primary-500/30">
        <SectionHeader icon={User} title="Core Identity" subtitle="Identity and verification details" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <FormField
            label="Employee ID"
            name="employeeNumber"
            required
            placeholder="e.g. EMP-001"
          />
          <FormField
            label="First Name"
            name="firstName"
            required
          />
          <FormField
            label="Middle Name"
            name="middleName"
          />
          <FormField
            label="Last Name"
            name="lastName"
            required
          />
          <FormField
            label="Preferred Name"
            name="preferredName"
          />
        </div>
      </div>

      {/* 2. Communication Hub */}
      <div className="premium-card p-8 group transition-all duration-500 hover:border-primary-500/30">
        <SectionHeader icon={Mail} title="Communication Hub" subtitle="Work and primary contact channels" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <FormField
            label="Professional Email"
            name="workEmail"
            type="email"
            required
            placeholder="name.surname@talentx.ai"
          />
          <FormField
            label="Private Email"
            name="personalEmail"
            type="email"
          />
          <FormField
            label="Office Extension"
            name="phoneNumber"
            type="tel"
          />
          <FormField
            label="Direct Mobile"
            name="mobileNumber"
            type="tel"
          />
        </div>
      </div>

      {/* 3. Organizational Alignment */}
      <div className="premium-card p-8 group transition-all duration-500 hover:border-primary-500/30">
        <SectionHeader icon={Briefcase} title="Career Alignment" subtitle="Placement and status within organization" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <FormField
            label="Commencement Date"
            name="hireDate"
            type="date"
            required
          />
          <FormField
            label="Status"
            name="employmentStatus"
            type="select"
            required
            options={Object.values(EmploymentStatus).map(s => ({ value: s, label: s.replace(/_/g, ' ') }))}
          />
          <FormField
            label="Contract Type"
            name="employmentType"
            type="select"
            required
            options={Object.values(EmploymentType).map(t => ({ value: t, label: t.replace(/_/g, ' ') }))}
          />
          <FormField
            label="Strategic Unit"
            name="departmentId"
            type="select"
            options={departments}
          />
          <FormField
            label="Reporting Line"
            name="managerId"
            type="select"
            options={managers}
          />
          <FormField
            label="Professional Title"
            name="jobTitle"
            placeholder="Senior Architect"
          />
          <FormField
            label="Primary Base"
            name="locationId"
            type="select"
            options={locations}
          />
        </div>
      </div>

      {/* 4. Compensation Structure */}
      <div className="premium-card p-8 group transition-all duration-500 hover:border-primary-500/30">
        <SectionHeader icon={DollarSign} title="Compensation" subtitle="Financial and payroll structure" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          <FormField
            label="Base Remuneration"
            name="salaryAmount"
            type="number"
          />
          <FormField
            label="Currency"
            name="salaryCurrency"
            placeholder="INR"
          />
          <FormField
            label="Cycle"
            name="payFrequency"
            type="select"
            options={Object.values(PayFrequency).map(p => ({ value: p, label: p }))}
          />
        </div>
      </div>

      {/* 5. Statutory Details (Indian Context) */}
      <div className="premium-card p-8 group transition-all duration-500 hover:border-primary-500/30">
        <SectionHeader icon={Building2} title="Statutory Details" subtitle="Compliance and identification" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          <FormField
            label="PAN Number"
            name="panNumber"
            placeholder="ABCDE1234F"
          />
          <FormField
            label="Aadhaar Number"
            name="aadhaarNumber"
            placeholder="1234 5678 9012"
          />
          <FormField
            label="UAN (PF)"
            name="uanNumber"
            placeholder="100XXXXXXXXX"
          />
          <FormField
            label="ESIC Number"
            name="esicNumber"
          />
          <FormField
            label="PF Number"
            name="pfNumber"
          />
        </div>
      </div>

      {/* 6. Personal Insights */}
      <div className="premium-card p-8 group transition-all duration-500 hover:border-primary-500/30">
        <SectionHeader icon={Heart} title="Personal Insights" subtitle="Individual and demographic data" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
          <FormField
            label="Birth Date"
            name="dateOfBirth"
            type="date"
          />
          <FormField
            label="Gender"
            name="gender"
            type="select"
            options={Object.values(Gender).map(g => ({ value: g, label: g }))}
          />
          <FormField
            label="Civil Status"
            name="maritalStatus"
            type="select"
            options={Object.values(MaritalStatus).map(s => ({ value: s, label: s }))}
          />
          <FormField
            label="Global Residency"
            name="nationality"
            placeholder="India"
          />
        </div>
      </div>
    </Form>
  );
};

export default EmployeeForm;