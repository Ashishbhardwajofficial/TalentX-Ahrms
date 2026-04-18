import React, { useState, useEffect } from 'react';
import trainingApi, {
  TrainingProgramDTO,
  TrainingProgramCreateDTO,
  TrainingProgramUpdateDTO,
  TrainingStatsResponse,
  TrainingProgramStatsResponse
} from '../../api/trainingApi';
import {
  TrainingType,
  DeliveryMethod
} from '../../types';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';

const TrainingProgramsPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 1;
  const [programs, setPrograms] = useState<TrainingProgramDTO[]>([]);
  const [stats, setStats] = useState<TrainingStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgramDTO | null>(null);
  const [selectedType, setSelectedType] = useState<TrainingType | ''>('');
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod | ''>('');
  const [mandatoryFilter, setMandatoryFilter] = useState<boolean | ''>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState<TrainingProgramCreateDTO>({
    title: '',
    trainingType: TrainingType.TECHNICAL,
    deliveryMethod: DeliveryMethod.ONLINE,
    isMandatory: false,
    isActive: true
  });


  useEffect(() => {
    loadPrograms();
    loadStats();
  }, [pagination.page, pagination.size, selectedType, selectedMethod, mandatoryFilter, searchQuery]);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await trainingApi.getTrainingPrograms({
        page: pagination.page - 1, // Backend uses 0-based indexing
        size: pagination.size,
        organizationId: orgId,
        ...(selectedType && { trainingType: selectedType }),
        ...(selectedMethod && { deliveryMethod: selectedMethod }),
        ...(mandatoryFilter !== '' && { isMandatory: mandatoryFilter }),
        ...(searchQuery && { search: searchQuery })
      });
      setPrograms(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load training programs');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await trainingApi.getTrainingStats();
      setStats(statsData);
    } catch (err: any) {
      console.error('Failed to load training stats:', err);
    }
  };

  const handleCreate = () => {
    setEditingProgram(null);
    setFormData({
      title: '',
      trainingType: TrainingType.TECHNICAL,
      deliveryMethod: DeliveryMethod.ONLINE,
      isMandatory: false,
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (program: TrainingProgramDTO) => {
    setEditingProgram(program);
    setFormData({
      title: program.title,
      trainingType: program.trainingType,
      deliveryMethod: program.deliveryMethod,
      isMandatory: program.isMandatory,
      isActive: program.isActive,
      ...(program.description && { description: program.description }),
      ...(program.durationHours && { durationHours: program.durationHours }),
      ...(program.costPerParticipant && { costPerParticipant: program.costPerParticipant }),
      ...(program.maxParticipants && { maxParticipants: program.maxParticipants }),
      ...(program.provider && { provider: program.provider }),
      ...(program.externalUrl && { externalUrl: program.externalUrl })
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this training program?')) {
      return;
    }

    try {
      await trainingApi.deleteTrainingProgram(id);
      loadPrograms();
      loadStats();
    } catch (err: any) {
      setError(err.message || 'Failed to delete training program');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingProgram) {
        const updateData: TrainingProgramUpdateDTO = {
          title: formData.title,
          trainingType: formData.trainingType,
          deliveryMethod: formData.deliveryMethod,
          isMandatory: formData.isMandatory,
          isActive: formData.isActive,
          ...(formData.description && { description: formData.description }),
          ...(formData.durationHours && { durationHours: formData.durationHours }),
          ...(formData.costPerParticipant && { costPerParticipant: formData.costPerParticipant }),
          ...(formData.maxParticipants && { maxParticipants: formData.maxParticipants }),
          ...(formData.provider && { provider: formData.provider }),
          ...(formData.externalUrl && { externalUrl: formData.externalUrl })
        };
        await trainingApi.updateTrainingProgram(editingProgram.id, updateData);
      } else {
        await trainingApi.createTrainingProgram(formData);
      }
      setIsModalOpen(false);
      loadPrograms();
      loadStats();
    } catch (err: any) {
      setError(err.message || 'Failed to save training program');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked :
        type === 'number' ? (value ? Number(value) : undefined) :
          value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadPrograms();
  };

  const clearFilters = () => {
    setSelectedType('');
    setSelectedMethod('');
    setMandatoryFilter('');
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const columns: ColumnDefinition<TrainingProgramDTO>[] = [
    {
      key: 'title',
      header: 'Program Title',
      sortable: true,
      render: (value, program) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {value}
          </div>
          {program.isMandatory && (
            <span style={{
              fontSize: '10px',
              backgroundColor: '#dc3545',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '8px',
              marginTop: '4px',
              display: 'inline-block'
            }}>
              MANDATORY
            </span>
          )}
        </div>
      )
    },
    {
      key: 'trainingType',
      header: 'Type',
      sortable: true,
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          backgroundColor: '#e3f2fd',
          color: '#1976d2',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'deliveryMethod',
      header: 'Delivery',
      sortable: true,
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          backgroundColor: '#f3e5f5',
          color: '#7b1fa2',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'durationHours',
      header: 'Duration',
      sortable: true,
      render: (value) => value ? `${value} hours` : 'N/A'
    },
    {
      key: 'costPerParticipant',
      header: 'Cost',
      sortable: true,
      render: (value) => formatCurrency(value)
    },
    {
      key: 'maxParticipants',
      header: 'Max Participants',
      render: (value) => value || 'Unlimited'
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          backgroundColor: value ? '#d4edda' : '#f8d7da',
          color: value ? '#155724' : '#721c24',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, program) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEdit(program)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(program.id)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
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
        <h1>Training Programs</h1>
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
          + Create Program
        </button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#007bff' }}>{stats.totalPrograms}</h3>
            <p style={{ margin: 0, color: '#6c757d' }}>Total Programs</p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#28a745' }}>{stats.activePrograms}</h3>
            <p style={{ margin: 0, color: '#6c757d' }}>Active Programs</p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#17a2b8' }}>{stats.totalEnrollments}</h3>
            <p style={{ margin: 0, color: '#6c757d' }}>Total Enrollments</p>
          </div>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#ffc107' }}>{stats.completionRate.toFixed(1)}%</h3>
            <p style={{ margin: 0, color: '#6c757d' }}>Completion Rate</p>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #dee2e6',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '200px' }}>
            <label htmlFor="search" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Search Programs
            </label>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or description..."
                style={{
                  flex: '1',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Search
              </button>
            </form>
          </div>

          <div style={{ minWidth: '150px' }}>
            <label htmlFor="typeFilter" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Training Type
            </label>
            <select
              id="typeFilter"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as TrainingType | '')}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value="">All Types</option>
              {Object.values(TrainingType).map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '150px' }}>
            <label htmlFor="methodFilter" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Delivery Method
            </label>
            <select
              id="methodFilter"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value as DeliveryMethod | '')}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value="">All Methods</option>
              {Object.values(DeliveryMethod).map(method => (
                <option key={method} value={method}>
                  {method.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '120px' }}>
            <label htmlFor="mandatoryFilter" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Mandatory
            </label>
            <select
              id="mandatoryFilter"
              value={mandatoryFilter.toString()}
              onChange={(e) => setMandatoryFilter(e.target.value === '' ? '' : e.target.value === 'true')}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value="">All</option>
              <option value="true">Mandatory</option>
              <option value="false">Optional</option>
            </select>
          </div>

          {(selectedType || selectedMethod || mandatoryFilter !== '' || searchQuery) && (
            <button
              onClick={clearFilters}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
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
        data={programs}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProgram ? 'Edit Training Program' : 'Create Training Program'}
        size="lg"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="title" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Program Title *
              </label>
              <input
                id="title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., Advanced JavaScript Training"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
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
                placeholder="e.g., Internal, Coursera, Udemy"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description of the training program..."
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="trainingType" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Training Type *
              </label>
              <select
                id="trainingType"
                name="trainingType"
                value={formData.trainingType}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                {Object.values(TrainingType).map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="deliveryMethod" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Delivery Method *
              </label>
              <select
                id="deliveryMethod"
                name="deliveryMethod"
                value={formData.deliveryMethod}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                {Object.values(DeliveryMethod).map(method => (
                  <option key={method} value={method}>
                    {method.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="durationHours" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Duration (Hours)
              </label>
              <input
                id="durationHours"
                name="durationHours"
                type="number"
                min="0"
                step="0.5"
                value={formData.durationHours || ''}
                onChange={handleInputChange}
                placeholder="e.g., 40"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="costPerParticipant" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Cost per Participant ($)
              </label>
              <input
                id="costPerParticipant"
                name="costPerParticipant"
                type="number"
                min="0"
                step="0.01"
                value={formData.costPerParticipant || ''}
                onChange={handleInputChange}
                placeholder="e.g., 500.00"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="maxParticipants" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Max Participants
              </label>
              <input
                id="maxParticipants"
                name="maxParticipants"
                type="number"
                min="1"
                value={formData.maxParticipants || ''}
                onChange={handleInputChange}
                placeholder="e.g., 20"
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          <div>
            <label htmlFor="externalUrl" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              External URL
            </label>
            <input
              id="externalUrl"
              name="externalUrl"
              type="url"
              value={formData.externalUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/training"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <small style={{ color: '#6c757d', fontSize: '12px' }}>
              Link to external training platform or materials
            </small>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="isMandatory"
                name="isMandatory"
                type="checkbox"
                checked={formData.isMandatory}
                onChange={handleInputChange}
                style={{ transform: 'scale(1.2)' }}
              />
              <label htmlFor="isMandatory" style={{ fontWeight: 'bold' }}>
                Mandatory Training
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleInputChange}
                style={{ transform: 'scale(1.2)' }}
              />
              <label htmlFor="isActive" style={{ fontWeight: 'bold' }}>
                Active Program
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
              {editingProgram ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainingProgramsPage;