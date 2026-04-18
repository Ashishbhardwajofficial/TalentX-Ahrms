import React, { useState, useEffect } from 'react';
import organizationApi, { OrganizationDTO, OrganizationCreateDTO, OrganizationUpdateDTO } from '../../api/organizationApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { CompanySize, SubscriptionTier } from '../../types';

const OrganizationSettingsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<OrganizationDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<OrganizationDTO | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState<OrganizationCreateDTO>({
    name: '',
    legalName: '',
    taxId: '',
    industry: '',
    companySize: CompanySize.SMALL,
    headquartersCountry: '',
    logoUrl: '',
    website: '',
    subscriptionTier: SubscriptionTier.STARTER
  });

  
  useEffect(() => {
    loadOrganizations();
  }, [pagination.page, pagination.size]);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await organizationApi.getOrganizations({
        page: pagination.page - 1, // Backend uses 0-based indexing
        size: pagination.size
      });
      setOrganizations(response?.content ?? []);
      setPagination(prev => ({
        ...prev,
        total: response?.totalElements ?? 0
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingOrg(null);
    setFormData({
      name: '',
      legalName: '',
      taxId: '',
      industry: '',
      companySize: CompanySize.SMALL,
      headquartersCountry: '',
      logoUrl: '',
      website: '',
      subscriptionTier: SubscriptionTier.STARTER
    });
    setIsModalOpen(true);
  };

  const handleEdit = (org: OrganizationDTO) => {
    setEditingOrg(org);
    setFormData({
      name: org.name,
      legalName: org.legalName,
      taxId: org.taxId || '',
      industry: org.industry || '',
      companySize: org.companySize,
      headquartersCountry: org.headquartersCountry || '',
      logoUrl: org.logoUrl || '',
      website: org.website || '',
      subscriptionTier: org.subscriptionTier
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this organization?')) {
      return;
    }

    try {
      await organizationApi.deleteOrganization(id);
      loadOrganizations();
    } catch (err: any) {
      setError(err.message || 'Failed to delete organization');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingOrg) {
        const updateData: OrganizationUpdateDTO = {
          name: formData.name,
          ...(formData.legalName && { legalName: formData.legalName }),
          ...(formData.companySize && { companySize: formData.companySize }),
          ...(formData.subscriptionTier && { subscriptionTier: formData.subscriptionTier }),
          ...(formData.taxId && { taxId: formData.taxId }),
          ...(formData.industry && { industry: formData.industry }),
          ...(formData.headquartersCountry && { headquartersCountry: formData.headquartersCountry }),
          ...(formData.logoUrl && { logoUrl: formData.logoUrl }),
          ...(formData.website && { website: formData.website })
        };

        await organizationApi.updateOrganization(editingOrg.id, updateData);
      } else {
        await organizationApi.createOrganization(formData);
      }
      setIsModalOpen(false);
      loadOrganizations();
    } catch (err: any) {
      setError(err.message || 'Failed to save organization');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const columns: ColumnDefinition<OrganizationDTO>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true
    },
    {
      key: 'legalName',
      header: 'Legal Name',
      sortable: true
    },
    {
      key: 'industry',
      header: 'Industry'
    },
    {
      key: 'companySize',
      header: 'Company Size'
    },
    {
      key: 'subscriptionTier',
      header: 'Subscription'
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
      render: (_, org) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEdit(org)}
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
            onClick={() => handleDelete(org.id)}
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
        <h1>Organization Settings</h1>
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
          + Create Organization
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
        data={organizations}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrg ? 'Edit Organization' : 'Create Organization'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Name *
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
              <label htmlFor="legalName" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Legal Name
              </label>
              <input
                id="legalName"
                name="legalName"
                type="text"
                value={formData.legalName}
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
              <label htmlFor="taxId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Tax ID
              </label>
              <input
                id="taxId"
                name="taxId"
                type="text"
                value={formData.taxId}
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
              <label htmlFor="industry" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Industry
              </label>
              <input
                id="industry"
                name="industry"
                type="text"
                value={formData.industry}
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
              <label htmlFor="companySize" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Company Size *
              </label>
              <select
                id="companySize"
                name="companySize"
                value={formData.companySize}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <option value={CompanySize.SMALL}>Small</option>
                <option value={CompanySize.MEDIUM}>Medium</option>
                <option value={CompanySize.LARGE}>Large</option>
                <option value={CompanySize.ENTERPRISE}>Enterprise</option>
              </select>
            </div>

            <div>
              <label htmlFor="subscriptionTier" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Subscription Tier *
              </label>
              <select
                id="subscriptionTier"
                name="subscriptionTier"
                value={formData.subscriptionTier}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <option value={SubscriptionTier.STARTER}>Starter</option>
                <option value={SubscriptionTier.PROFESSIONAL}>Professional</option>
                <option value={SubscriptionTier.ENTERPRISE}>Enterprise</option>
              </select>
            </div>

            <div>
              <label htmlFor="headquartersCountry" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Headquarters Country
              </label>
              <input
                id="headquartersCountry"
                name="headquartersCountry"
                type="text"
                value={formData.headquartersCountry}
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
              <label htmlFor="website" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Website
              </label>
              <input
                id="website"
                name="website"
                type="url"
                value={formData.website}
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
              <label htmlFor="logoUrl" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Logo URL
              </label>
              <input
                id="logoUrl"
                name="logoUrl"
                type="url"
                value={formData.logoUrl}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
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
              {editingOrg ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrganizationSettingsPage;