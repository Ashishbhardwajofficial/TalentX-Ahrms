import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import employeeApi, { EmployeeRequest, EmployeeResponse } from '../../api/employeeApi';
import EmployeeForm from '../../components/employees/EmployeeForm';
import PageTransition from '../../components/common/PageTransition';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EmployeeEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const employeeId = id ? parseInt(id, 10) : 0;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employee, setEmployee] = useState<EmployeeResponse | null>(null);
  const [initialData, setInitialData] = useState<Partial<EmployeeRequest> | undefined>(undefined);

  
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

      // Populate form initial data
      setInitialData({
        organizationId: data.organizationId,
        employeeNumber: data.employeeNumber,
        firstName: data.firstName,
        lastName: data.lastName,
        hireDate: data.hireDate,
        employmentStatus: data.employmentStatus,
        employmentType: data.employmentType,
        workEmail: data.workEmail || '',
        phoneNumber: data.phoneNumber || '',
        middleName: data.middleName ?? '',
        preferredName: data.preferredName ?? '',
        personalEmail: data.personalEmail ?? '',
        mobileNumber: data.mobileNumber ?? '',
        ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
        ...(data.managerId !== undefined && { managerId: data.managerId }),
        jobTitle: data.jobTitle ?? '',
        jobLevel: data.jobLevel ?? '',
        ...(data.salaryAmount !== undefined && { salaryAmount: data.salaryAmount }),
        salaryCurrency: data.salaryCurrency ?? '',
        ...(data.payFrequency !== undefined && { payFrequency: data.payFrequency }),
        dateOfBirth: data.dateOfBirth ?? '',
        ...(data.gender !== undefined && { gender: data.gender }),
        nationality: data.nationality ?? '',
        ...(data.maritalStatus !== undefined && { maritalStatus: data.maritalStatus }),
        ...(data.locationId !== undefined && { locationId: data.locationId }),
        profilePictureUrl: data.profilePictureUrl ?? '',
        bio: data.bio ?? ''
      });
    } catch (err: any) {
      console.error('Error loading employee:', err);
      setError(err.message || 'Failed to load employee');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: EmployeeRequest) => {
    try {
      setLoading(true);
      await employeeApi.updateEmployee(employeeId, { ...data, id: employeeId });
      navigate(`/employees/${employeeId}`);
    } catch (err: any) {
      console.error('Error updating employee:', err);
      setError(err.message || 'Failed to update employee');
      setLoading(false);
    }
  };

  if (loading && !initialData) {
    return <LoadingSpinner />;
  }

  if (error && !employee) {
    return (
      <div className="p-8 text-center">
        <div className="bg-danger-50 text-danger-700 p-4 rounded-lg mb-4 inline-block">
          {error}
        </div>
        <div>
          <button
            onClick={() => navigate('/employees')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <Breadcrumb
            items={[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Employees', path: '/employees' },
              ...(employee ? [{ label: employee.fullName, path: `/employees/${employeeId}` }] : []),
              { label: 'Edit', path: `/employees/${employeeId}/edit` }
            ]}
          />
          <div>
            <h1 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tight">Refine Profile</h1>
            <p className="text-secondary-500 font-medium italic">
              Keeping talent data accurate and up-to-date for <span className="font-bold text-primary-600">{employee?.fullName}</span>.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fadeIn">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        {initialData && (
          <EmployeeForm
            initialData={initialData}
            onSubmit={handleSubmit}
            onCancel={() => navigate(`/employees/${employeeId}`)}
            loading={loading}
            isEditMode={true}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default EmployeeEditPage;