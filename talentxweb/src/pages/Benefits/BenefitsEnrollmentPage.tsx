import React, { useState, useEffect } from 'react';
import benefitApi, { BenefitPlanDTO, EmployeeBenefitDTO, EmployeeBenefitCreateDTO } from '../../api/benefitApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import BenefitPlanCard from '../../components/benefits/BenefitPlanCard';
import { BenefitStatus, CoverageLevel } from '../../types';

const BenefitsEnrollmentPage: React.FC = () => {
  const [availablePlans, setAvailablePlans] = useState<BenefitPlanDTO[]>([]);
  const [employeeBenefits, setEmployeeBenefits] = useState<EmployeeBenefitDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<BenefitPlanDTO | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'enrolled'>('available');

  // Mock employee ID - in real app, get from auth context
  const employeeId = 1;

  // Enrollment form state
  const [enrollmentData, setEnrollmentData] = useState<EmployeeBenefitCreateDTO>({
    employeeId: employeeId,
    benefitPlanId: 0,
    enrollmentDate: new Date().toISOString().split('T')[0] as string,
    effectiveDate: new Date().toISOString().split('T')[0] as string,
    coverageLevel: CoverageLevel.EMPLOYEE_ONLY,
    beneficiaries: {}
  });

  // Beneficiary form state
  const [beneficiaries, setBeneficiaries] = useState<Array<{
    name: string;
    relationship: string;
    percentage: number;
  }>>([]);

  useEffect(() => {
    loadAvailablePlans();
    loadEmployeeBenefits();
  }, []);

  const loadAvailablePlans = async () => {
    try {
      setLoading(true);
      const response = await benefitApi.getActiveBenefitPlans(1, { page: 0, size: 50 }); // TODO: Get org ID from context
      setAvailablePlans(response.content);
    } catch (err: any) {
      setError(err.message || 'Failed to load available benefit plans');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeBenefits = async () => {
    try {
      const response = await benefitApi.getEmployeeBenefitsByEmployee(employeeId, { page: 0, size: 50 });
      setEmployeeBenefits(response.content);
    } catch (err: any) {
      setError(err.message || 'Failed to load employee benefits');
    }
  };

  const handleEnrollClick = (plan: BenefitPlanDTO) => {
    setSelectedPlan(plan);
    setEnrollmentData(prev => ({
      ...prev,
      benefitPlanId: plan.id
    }));
    setIsEnrollmentModalOpen(true);
  };

  const handleTerminateBenefit = async (benefitId: number) => {
    if (!window.confirm('Are you sure you want to terminate this benefit enrollment?')) {
      return;
    }

    try {
      await benefitApi.terminateBenefit(benefitId, {
        terminationDate: new Date().toISOString().split('T')[0] as string
      });
      loadEmployeeBenefits();
    } catch (err: any) {
      setError(err.message || 'Failed to terminate benefit');
    }
  };

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const enrollmentPayload = {
        ...enrollmentData,
        beneficiaries: beneficiaries.length > 0 ? { beneficiaries } : undefined
      };

      await benefitApi.enrollEmployee(enrollmentPayload);
      setIsEnrollmentModalOpen(false);
      loadEmployeeBenefits();

      // Reset form
      setBeneficiaries([]);
      setEnrollmentData({
        employeeId: employeeId,
        benefitPlanId: 0,
        enrollmentDate: new Date().toISOString().split('T')[0] as string,
        effectiveDate: new Date().toISOString().split('T')[0] as string,
        coverageLevel: CoverageLevel.EMPLOYEE_ONLY,
        beneficiaries: {}
      });
    } catch (err: any) {
      setError(err.message || 'Failed to enroll in benefit plan');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEnrollmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addBeneficiary = () => {
    setBeneficiaries(prev => [...prev, { name: '', relationship: '', percentage: 0 }]);
  };

  const updateBeneficiary = (index: number, field: string, value: string | number) => {
    setBeneficiaries(prev => prev.map((beneficiary, i) =>
      i === index ? { ...beneficiary, [field]: value } : beneficiary
    ));
  };

  const removeBeneficiary = (index: number) => {
    setBeneficiaries(prev => prev.filter((_, i) => i !== index));
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const enrolledBenefitColumns: ColumnDefinition<EmployeeBenefitDTO>[] = [
    {
      key: 'benefitPlanId',
      header: 'Plan Name',
      render: (_, benefit) => benefit.benefitPlan?.name || 'Unknown Plan'
    },
    {
      key: 'benefitPlanId',
      header: 'Type',
      render: (_, benefit) => benefit.benefitPlan?.planType.replace(/_/g, ' ') || '-'
    },
    {
      key: 'coverageLevel',
      header: 'Coverage Level',
      render: (value) => value?.replace(/_/g, ' ') ?? '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span style={{
          color: value === BenefitStatus.ACTIVE ? 'green' :
            value === BenefitStatus.PENDING ? 'orange' : 'red'
        }}>
          {value}
        </span>
      )
    },
    {
      key: 'effectiveDate',
      header: 'Effective Date',
      render: (value) => formatDate(value)
    },
    {
      key: 'terminationDate',
      header: 'Termination Date',
      render: (value) => value ? formatDate(value) : '-'
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, benefit) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {benefit.status === BenefitStatus.ACTIVE && (
            <button
              onClick={() => handleTerminateBenefit(benefit.id)}
              style={{
                padding: '4px 8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Terminate
            </button>
          )}
        </div>
      )
    }
  ];

  const totalBeneficiaryPercentage = beneficiaries.reduce((sum, b) => sum + b.percentage, 0);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h1>Benefits Enrollment</h1>
        <p>Manage your benefit plan enrollments and view available options.</p>
      </div>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          <button
            onClick={() => setActiveTab('available')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'available' ? '2px solid #007bff' : '2px solid transparent',
              color: activeTab === 'available' ? '#007bff' : '#666',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Available Plans
          </button>
          <button
            onClick={() => setActiveTab('enrolled')}
            style={{
              padding: '10px 20px',
              border: 'none',
              backgroundColor: 'transparent',
              borderBottom: activeTab === 'enrolled' ? '2px solid #007bff' : '2px solid transparent',
              color: activeTab === 'enrolled' ? '#007bff' : '#666',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            My Benefits ({employeeBenefits.length})
          </button>
        </div>
      </div>

      {/* Available Plans Tab */}
      {activeTab === 'available' && (
        <div>
          <h2>Available Benefit Plans</h2>
          {loading ? (
            <div>Loading available plans...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
              {availablePlans.map(plan => (
                <BenefitPlanCard
                  key={plan.id}
                  plan={plan}
                  onEnroll={() => handleEnrollClick(plan)}
                  isEnrolled={employeeBenefits.some(eb =>
                    eb.benefitPlanId === plan.id && eb.status === BenefitStatus.ACTIVE
                  )}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Enrolled Benefits Tab */}
      {activeTab === 'enrolled' && (
        <div>
          <h2>My Current Benefits</h2>
          <DataTable
            data={employeeBenefits}
            columns={enrolledBenefitColumns}
            loading={loading}
          />
        </div>
      )}

      {/* Enrollment Modal */}
      <Modal
        isOpen={isEnrollmentModalOpen}
        onClose={() => setIsEnrollmentModalOpen(false)}
        title={`Enroll in ${selectedPlan?.name}`}
        size="lg"
      >
        <form onSubmit={handleEnrollmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedPlan && (
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              <h3>{selectedPlan.name}</h3>
              <p><strong>Type:</strong> {selectedPlan.planType?.replace(/_/g, ' ') ?? '-'}</p>
              <p><strong>Provider:</strong> {selectedPlan.provider || 'N/A'}</p>
              <p><strong>Employee Cost:</strong> {formatCurrency(selectedPlan.employeeCost)} {selectedPlan.costFrequency?.toLowerCase() ?? ''}</p>
              {selectedPlan.description && <p><strong>Description:</strong> {selectedPlan.description}</p>}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="enrollmentDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Enrollment Date *
              </label>
              <input
                id="enrollmentDate"
                name="enrollmentDate"
                type="date"
                value={enrollmentData.enrollmentDate}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="effectiveDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Effective Date *
              </label>
              <input
                id="effectiveDate"
                name="effectiveDate"
                type="date"
                value={enrollmentData.effectiveDate}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="coverageLevel" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Coverage Level *
              </label>
              <select
                id="coverageLevel"
                name="coverageLevel"
                value={enrollmentData.coverageLevel}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <option value={CoverageLevel.EMPLOYEE_ONLY}>Employee Only</option>
                <option value={CoverageLevel.EMPLOYEE_SPOUSE}>Employee + Spouse</option>
                <option value={CoverageLevel.EMPLOYEE_CHILDREN}>Employee + Children</option>
                <option value={CoverageLevel.FAMILY}>Family</option>
              </select>
            </div>
          </div>

          {/* Beneficiaries Section */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4>Beneficiaries (Optional)</h4>
              <button
                type="button"
                onClick={addBeneficiary}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                + Add Beneficiary
              </button>
            </div>

            {beneficiaries.map((beneficiary, index) => (
              <div key={index} style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 100px 40px',
                gap: '8px',
                marginBottom: '8px',
                alignItems: 'end'
              }}>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={beneficiary.name}
                  onChange={(e) => updateBeneficiary(index, 'name', e.target.value)}
                  style={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <input
                  type="text"
                  placeholder="Relationship"
                  value={beneficiary.relationship}
                  onChange={(e) => updateBeneficiary(index, 'relationship', e.target.value)}
                  style={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <input
                  type="number"
                  placeholder="Percentage"
                  min="0"
                  max="100"
                  value={beneficiary.percentage}
                  onChange={(e) => updateBeneficiary(index, 'percentage', parseInt(e.target.value) || 0)}
                  style={{
                    padding: '8px',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeBeneficiary(index)}
                  style={{
                    padding: '8px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            {beneficiaries.length > 0 && (
              <div style={{
                marginTop: '8px',
                fontSize: '14px',
                color: totalBeneficiaryPercentage === 100 ? 'green' : 'orange'
              }}>
                Total: {totalBeneficiaryPercentage}%
                {totalBeneficiaryPercentage !== 100 && ' (Should total 100%)'}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsEnrollmentModalOpen(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Enroll
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BenefitsEnrollmentPage;