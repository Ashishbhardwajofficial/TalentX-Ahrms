import React, { useState, useEffect } from 'react';
import exitApi, { EmployeeExitDTO, EmployeeExitCreateDTO, ExitType, EmployeeExitWithdrawDTO, EmployeeExitApproveDTO, EmployeeExitCompleteDTO } from '../../api/exitApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { ExitStatus } from '../../types';
import ExitWorkflowStepper from './ExitWorkflowStepper';
import { useAuth } from '../../hooks/useAuth';

const ExitManagementPage: React.FC = () => {
  const { user } = useAuth();
  const currentEmployeeId = user?.id ?? 1;
  const [exits, setExits] = useState<EmployeeExitDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isWorkflowModalOpen, setIsWorkflowModalOpen] = useState(false);
  const [editingExit, setEditingExit] = useState<EmployeeExitDTO | null>(null);
  const [selectedExit, setSelectedExit] = useState<EmployeeExitDTO | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Form state
  const today = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState<EmployeeExitCreateDTO>({
    employeeId: currentEmployeeId,
    resignationDate: today,
    lastWorkingDay: '',
    exitReason: ''
  });

  // Filter state
  const [filters, setFilters] = useState({
    status: '',
    employeeId: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Exit checklist items
  const [exitChecklist] = useState([
    { id: 1, item: 'Return company assets (laptop, ID card, etc.)', completed: false },
    { id: 2, item: 'Complete knowledge transfer documentation', completed: false },
    { id: 3, item: 'Handover ongoing projects and responsibilities', completed: false },
    { id: 4, item: 'Update bank details for final settlement', completed: false },
    { id: 5, item: 'Complete exit interview', completed: false },
    { id: 6, item: 'Clear pending expenses and reimbursements', completed: false },
    { id: 7, item: 'Return access cards and office keys', completed: false },
    { id: 8, item: 'Update emergency contact information', completed: false }
  ]);


  useEffect(() => {
    loadExits();
  }, [pagination.page, pagination.size, filters]);

  const loadExits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await exitApi.getExits({
        page: pagination.page - 1, // Backend uses 0-based indexing
        size: pagination.size,
        ...(filters.status && { status: filters.status as ExitStatus }),
        ...(filters.employeeId && { employeeId: parseInt(filters.employeeId) }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search })
      });
      setExits(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load employee exits');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingExit(null);
    const today = new Date().toISOString().slice(0, 10);
    setFormData({
      employeeId: currentEmployeeId,
      resignationDate: today,
      lastWorkingDay: '',
      exitReason: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (exit: EmployeeExitDTO) => {
    setEditingExit(exit);
    const today = new Date().toISOString().slice(0, 10);
    setFormData({
      employeeId: exit.employeeId,
      resignationDate: exit.resignationDate || today,
      lastWorkingDay: exit.lastWorkingDay || '',
      exitReason: exit.exitReason || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this exit request?')) {
      return;
    }

    try {
      await exitApi.deleteExit(id);
      loadExits();
    } catch (err: any) {
      setError(err.message || 'Failed to delete exit request');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingExit) {
        await exitApi.updateExit(editingExit.id, formData);
      } else {
        await exitApi.createExit(formData);
      }
      setIsModalOpen(false);
      loadExits();
    } catch (err: any) {
      setError(err.message || 'Failed to save exit request');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filtering
  };

  const handleApprove = (exit: EmployeeExitDTO) => {
    setSelectedExit(exit);
    setIsApprovalModalOpen(true);
  };

  const handleWithdraw = async (exit: EmployeeExitDTO) => {
    const withdrawalReason = window.prompt('Please provide withdrawal reason:');
    if (!withdrawalReason) return;

    try {
      const withdrawData: EmployeeExitWithdrawDTO = {
        withdrawalReason
      };
      await exitApi.withdrawExit(exit.id, withdrawData);
      loadExits();
    } catch (err: any) {
      setError(err.message || 'Failed to withdraw exit request');
    }
  };

  const handleComplete = async (exit: EmployeeExitDTO) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const completeData: EmployeeExitCompleteDTO = {
        completedBy: 1, // TODO: Get from context
        completionDate: today,
        completionNotes: 'Exit process completed successfully'
      };
      await exitApi.completeExit(exit.id, completeData);
      loadExits();
    } catch (err: any) {
      setError(err.message || 'Failed to complete exit process');
    }
  };

  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExit) return;

    try {
      const approveData: EmployeeExitApproveDTO = {
        approvedBy: 1, // TODO: Get from context
        approvalComments: 'Exit request approved'
      };
      await exitApi.approveExit(selectedExit.id, approveData);
      setIsApprovalModalOpen(false);
      setSelectedExit(null);
      loadExits();
    } catch (err: any) {
      setError(err.message || 'Failed to approve exit request');
    }
  };

  const handleViewWorkflow = (exit: EmployeeExitDTO) => {
    setSelectedExit(exit);
    setIsWorkflowModalOpen(true);
  };

  const getStatusColor = (status: ExitStatus) => {
    switch (status) {
      case ExitStatus.INITIATED:
        return 'orange';
      case ExitStatus.APPROVED:
        return 'green';
      case ExitStatus.WITHDRAWN:
        return 'gray';
      case ExitStatus.COMPLETED:
        return 'blue';
      default:
        return 'black';
    }
  };

  const columns: ColumnDefinition<EmployeeExitDTO>[] = [
    {
      key: 'employeeId',
      header: 'Employee ID',
      render: (value) => `EMP-${value}`
    },
    {
      key: 'resignationDate',
      header: 'Resignation Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'lastWorkingDay',
      header: 'Last Working Day',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'exitReason',
      header: 'Reason',
      render: (value) => value || '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span style={{ color: getStatusColor(value as ExitStatus), fontWeight: 'bold' }}>
          {value.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, exit) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleViewWorkflow(exit)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Workflow
          </button>
          {exit.status === ExitStatus.INITIATED && (
            <>
              <button
                onClick={() => handleApprove(exit)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Approve
              </button>
              <button
                onClick={() => handleWithdraw(exit)}
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#ffc107',
                  color: 'black',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Withdraw
              </button>
            </>
          )}
          {exit.status === ExitStatus.APPROVED && (
            <button
              onClick={() => handleComplete(exit)}
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
              Complete
            </button>
          )}
          <button
            onClick={() => handleEdit(exit)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#6c757d',
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
            onClick={() => handleDelete(exit.id)}
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
        <h1>Exit Management</h1>
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
          + Initiate Exit
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px'
      }}>
        <div>
          <label htmlFor="search" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Search
          </label>
          <input
            id="search"
            name="search"
            type="text"
            placeholder="Search exits..."
            value={filters.search}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div>
          <label htmlFor="status" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="">All Statuses</option>
            <option value={ExitStatus.INITIATED}>Initiated</option>
            <option value={ExitStatus.APPROVED}>Approved</option>
            <option value={ExitStatus.WITHDRAWN}>Withdrawn</option>
            <option value={ExitStatus.COMPLETED}>Completed</option>
          </select>
        </div>

        <div>
          <label htmlFor="startDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Start Date
          </label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={filters.startDate}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
        </div>

        <div>
          <label htmlFor="endDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            End Date
          </label>
          <input
            id="endDate"
            name="endDate"
            type="date"
            value={filters.endDate}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
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
        data={exits}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      {/* Create/Edit Exit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExit ? 'Edit Exit Request' : 'Initiate Exit Request'}
        size="md"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="resignationDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Resignation Date *
            </label>
            <input
              id="resignationDate"
              name="resignationDate"
              type="date"
              value={formData.resignationDate}
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
            <label htmlFor="lastWorkingDay" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Last Working Day *
            </label>
            <input
              id="lastWorkingDay"
              name="lastWorkingDay"
              type="date"
              value={formData.lastWorkingDay}
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
            <label htmlFor="exitReason" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Exit Reason
            </label>
            <textarea
              id="exitReason"
              name="exitReason"
              value={formData.exitReason || ''}
              onChange={handleInputChange}
              placeholder="Please provide reason for leaving..."
              rows={4}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
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
              {editingExit ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        title="Approve Exit Request"
        size="md"
      >
        <form onSubmit={handleApprovalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedExit && (
            <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h4>Exit Request Details</h4>
              <p><strong>Employee ID:</strong> EMP-{selectedExit.employeeId}</p>
              <p><strong>Resignation Date:</strong> {selectedExit.resignationDate ? new Date(selectedExit.resignationDate).toLocaleDateString() : '-'}</p>
              <p><strong>Last Working Day:</strong> {selectedExit.lastWorkingDay ? new Date(selectedExit.lastWorkingDay).toLocaleDateString() : '-'}</p>
              <p><strong>Reason:</strong> {selectedExit.exitReason || '-'}</p>
            </div>
          )}

          {/* Exit Checklist */}
          <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h4>Exit Checklist</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {exitChecklist.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <input
                    type="checkbox"
                    id={`checklist-${item.id}`}
                    defaultChecked={item.completed}
                    style={{ marginRight: '8px' }}
                  />
                  <label htmlFor={`checklist-${item.id}`} style={{ fontSize: '14px' }}>
                    {item.item}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsApprovalModalOpen(false)}
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
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Approve Exit
            </button>
          </div>
        </form>
      </Modal>

      {/* Workflow Modal */}
      <Modal
        isOpen={isWorkflowModalOpen}
        onClose={() => setIsWorkflowModalOpen(false)}
        title="Exit Workflow"
        size="lg"
      >
        {selectedExit && (
          <ExitWorkflowStepper exit={selectedExit} />
        )}
      </Modal>
    </div>
  );
};

export default ExitManagementPage;