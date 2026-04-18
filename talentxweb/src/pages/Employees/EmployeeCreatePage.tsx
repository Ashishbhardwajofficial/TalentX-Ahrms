import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import employeeApi, { EmployeeRequest } from '../../api/employeeApi';
import EmployeeForm from '../../components/employees/EmployeeForm';
import PageTransition from '../../components/common/PageTransition';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EmployeeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: EmployeeRequest) => {
    try {
      setLoading(true);
      setError(null);
      await employeeApi.createEmployee(data);
      navigate('/employees');
    } catch (err: any) {
      console.error('Error creating employee:', err);
      setError(err.message || 'Failed to create employee');
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 space-y-2">
          <Breadcrumb
            items={[
              { label: 'Dashboard', path: '/dashboard' },
              { label: 'Employees', path: '/employees' },
              { label: 'Create Employee', path: '/employees/new' }
            ]}
          />
          <h1 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tight">Expand the Team</h1>
          <p className="text-secondary-500 font-medium italic">
            Onboarding excellence starts with a complete profile.
          </p>
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
        <EmployeeForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/employees')}
          loading={loading}
        />
      </div>
    </PageTransition>
  );
};

export default EmployeeCreatePage;