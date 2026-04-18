import React, { useState, useEffect } from 'react';
import benefitApi, { BenefitPlanDTO, BenefitPlanCreateDTO, BenefitPlanUpdateDTO } from '../../api/benefitApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { BenefitPlanType, CostFrequency } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const BenefitsManagementPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 1;
  const [benefitPlans, setBenefitPlans] = useState<BenefitPlanDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<BenefitPlanDTO | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState<BenefitPlanCreateDTO>({
    organizationId: orgId,
    name: '',
    planType: BenefitPlanType.HEALTH_INSURANCE,
    description: '',
    provider: '',
    employeeCost: 0,
    employerCost: 0,
    costFrequency: CostFrequency.MONTHLY,
    isActive: true,
    effectiveDate: '',
    expiryDate: ''
  });


  useEffect(() => {
    loadBenefitPlans();
  }, [pagination.page, pagination.size]);

  const loadBenefitPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await benefitApi.getBenefitPlans({
        page: pagination.page - 1, // Backend uses 0-based indexing
        size: pagination.size,
        organizationId: orgId
      });
      setBenefitPlans(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load benefit plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setFormData({
      organizationId: orgId,
      name: '',
      planType: BenefitPlanType.HEALTH_INSURANCE,
      description: '',
      provider: '',
      employeeCost: 0,
      employerCost: 0,
      costFrequency: CostFrequency.MONTHLY,
      isActive: true,
      effectiveDate: '',
      expiryDate: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (plan: BenefitPlanDTO) => {
    setEditingPlan(plan);
    setFormData({
      organizationId: plan.organizationId,
      name: plan.name,
      planType: plan.planType,
      description: plan.description || '',
      provider: plan.provider || '',
      employeeCost: plan.employeeCost || 0,
      employerCost: plan.employerCost || 0,
      costFrequency: plan.costFrequency,
      isActive: plan.isActive,
      effectiveDate: plan.effectiveDate || '',
      expiryDate: plan.expiryDate || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this benefit plan?')) {
      return;
    }

    try {
      await benefitApi.deleteBenefitPlan(id);
      loadBenefitPlans();
    } catch (err: any) {
      setError(err.message || 'Failed to delete benefit plan');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingPlan) {
        const updateData: BenefitPlanUpdateDTO = {
          name: formData.name,
          planType: formData.planType,
          costFrequency: formData.costFrequency
        };

        // Only include optional fields if they have values
        if (formData.description) updateData.description = formData.description;
        if (formData.provider) updateData.provider = formData.provider;
        if (formData.employeeCost !== undefined) updateData.employeeCost = formData.employeeCost;
        if (formData.employerCost !== undefined) updateData.employerCost = formData.employerCost;
        if (formData.effectiveDate) updateData.effectiveDate = formData.effectiveDate;
        if (formData.expiryDate) updateData.expiryDate = formData.expiryDate;
        if (formData.isActive !== undefined) updateData.isActive = formData.isActive;

        await benefitApi.updateBenefitPlan(editingPlan.id, updateData);
      } else {
        await benefitApi.createBenefitPlan(formData);
      }
      setIsModalOpen(false);
      loadBenefitPlans();
    } catch (err: any) {
      setError(err.message || 'Failed to save benefit plan');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
        type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined || amount === null) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const columns: ColumnDefinition<BenefitPlanDTO>[] = [
    {
      key: 'name',
      header: 'Plan Name',
      sortable: true
    },
    {
      key: 'planType',
      header: 'Type',
      render: (value) => value?.replace(/_/g, ' ') ?? '-'
    },
    {
      key: 'provider',
      header: 'Provider'
    },
    {
      key: 'employeeCost',
      header: 'Employee Cost',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'employerCost',
      header: 'Employer Cost',
      render: (value) => formatCurrency(value)
    },
    {
      key: 'costFrequency',
      header: 'Frequency',
      render: (value) => value?.replace(/_/g, ' ') ?? '-'
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <span style={{ color: value ? 'green' : 'red' }}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, plan) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEdit(plan)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(plan.id)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Benefits Management</h1>
        <button
          onClick={handleCreate}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          + Create Benefit Plan
        </button>
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

      <DataTable
        data={benefitPlans}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlan ? 'Edit Benefit Plan' : 'Create Benefit Plan'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Plan Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
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
              <label htmlFor="planType" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Plan Type *
              </label>
              <select
                id="planType"
                name="planType"
                value={formData.planType}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <option value={BenefitPlanType.HEALTH_INSURANCE}>Health Insurance</option>
                <option value={BenefitPlanType.DENTAL}>Dental</option>
                <option value={BenefitPlanType.VISION}>Vision</option>
                <option value={BenefitPlanType.LIFE_INSURANCE}>Life Insurance</option>
                <option value={BenefitPlanType.RETIREMENT}>Retirement</option>
                <option value={BenefitPlanType.STOCK_OPTIONS}>Stock Options</option>
                <option value={BenefitPlanType.OTHER}>Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="provider" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Provider
              </label>
              <input
                id="provider"
                name="provider"
                type="text"
                value={formData.provider}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="costFrequency" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Cost Frequency *
              </label>
              <select
                id="costFrequency"
                name="costFrequency"
                value={formData.costFrequency}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <option value={CostFrequency.MONTHLY}>Monthly</option>
                <option value={CostFrequency.ANNUALLY}>Annually</option>
                <option value={CostFrequency.PER_PAY_PERIOD}>Per Pay Period</option>
              </select>
            </div>

            <div>
              <label htmlFor="employeeCost" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Employee Cost ($)
              </label>
              <input
                id="employeeCost"
                name="employeeCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.employeeCost}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="employerCost" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Employer Cost ($)
              </label>
              <input
                id="employerCost"
                name="employerCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.employerCost}
                onChange={handleInputChange}
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
                Effective Date
              </label>
              <input
                id="effectiveDate"
                name="effectiveDate"
                type="date"
                value={formData.effectiveDate}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="expiryDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Expiry Date
              </label>
              <input
                id="expiryDate"
                name="expiryDate"
                type="date"
                value={formData.expiryDate}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label htmlFor="description" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                <span style={{ fontWeight: 'bold' }}>Active Plan</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
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
              {editingPlan ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default BenefitsManagementPage;