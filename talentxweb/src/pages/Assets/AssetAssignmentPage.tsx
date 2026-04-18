import React, { useState, useEffect } from 'react';
import assetApi, { AssetDTO, AssetAssignmentDTO, AssetAssignmentCreateDTO, AssetReturnDTO } from '../../api/assetApi';
import employeeApi, { EmployeeResponse } from '../../api/employeeApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { AssetStatus, AssetType } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const AssetAssignmentPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 1;
  const [assignments, setAssignments] = useState<AssetAssignmentDTO[]>([]);
  const [availableAssets, setAvailableAssets] = useState<AssetDTO[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<AssetAssignmentDTO | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Assignment form state
  const [assignmentForm, setAssignmentForm] = useState<AssetAssignmentCreateDTO>({
    assetId: 0,
    employeeId: 0
  });

  // Return form state
  const [returnForm, setReturnForm] = useState<AssetReturnDTO>({
    returnedDate: new Date().toISOString().split('T')[0] as string
  });

  // Filter state
  const [filters, setFilters] = useState({
    employeeId: '',
    assetType: '',
    search: ''
  });


  useEffect(() => {
    loadAssignments();
    loadAvailableAssets();
    loadEmployees();
  }, [pagination.page, pagination.size, filters]);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      if (filters.employeeId) {
        // Filter by specific employee
        const employeeAssignments = await assetApi.getEmployeeAssets(parseInt(filters.employeeId));
        const active = employeeAssignments.filter(a => !a.returnedDate);
        setAssignments(active);
        setPagination(prev => ({ ...prev, total: active.length }));
      } else {
        // Use the dedicated paginated assignments endpoint
        const response = await assetApi.getAssetAssignments({
          page: pagination.page - 1,
          size: pagination.size
        });
        // Only show active (not returned) assignments
        const active = (response.content ?? []).filter(a => !a.returnedDate);
        setAssignments(active);
        setPagination(prev => ({ ...prev, total: response.totalElements ?? 0 }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableAssets = async () => {
    try {
      const response = await assetApi.getAssets({
        page: 0,
        size: 100,
        organizationId: orgId,
        status: AssetStatus.AVAILABLE
      });
      setAvailableAssets(response.content);
    } catch (err: any) {
      console.error('Failed to load available assets:', err);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getEmployees({
        page: 0,
        size: 100,
        organizationId: orgId
      });
      setEmployees(response.content);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
    }
  };

  const handleAssign = () => {
    setAssignmentForm({
      assetId: 0,
      employeeId: 0,
      assignedDate: new Date().toISOString().split('T')[0]
    } as AssetAssignmentCreateDTO);
    setIsAssignModalOpen(true);
  };

  const handleReturn = (assignment: AssetAssignmentDTO) => {
    setSelectedAssignment(assignment);
    setReturnForm({
      returnedDate: new Date().toISOString().split('T')[0] as string
    });
    setIsReturnModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await assetApi.assignAsset(assignmentForm);
      setIsAssignModalOpen(false);
      loadAssignments();
      loadAvailableAssets(); // Refresh available assets
    } catch (err: any) {
      setError(err.message || 'Failed to assign asset');
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!selectedAssignment) return;

    try {
      await assetApi.returnAsset(selectedAssignment.assetId, returnForm);
      setIsReturnModalOpen(false);
      setSelectedAssignment(null);
      loadAssignments();
      loadAvailableAssets(); // Refresh available assets
    } catch (err: any) {
      setError(err.message || 'Failed to return asset');
    }
  };

  const handleAssignmentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssignmentForm(prev => ({
      ...prev,
      [name]: name === 'assetId' || name === 'employeeId' ? parseInt(value) : value
    }));
  };

  const handleReturnInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setReturnForm(prev => ({
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
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : `Employee ${employeeId}`;
  };

  const getAssetInfo = async (assetId: number) => {
    try {
      const asset = await assetApi.getAsset(assetId);
      return `${asset.assetType.replace(/_/g, ' ')} - ${asset.assetTag || asset.serialNumber || `ID: ${asset.id}`}`;
    } catch {
      return `Asset ${assetId}`;
    }
  };

  // Asset info component for proper hook usage
  const AssetInfoCell: React.FC<{ assetId: number }> = ({ assetId }) => {
    const [assetInfo, setAssetInfo] = useState<string>(`Asset ${assetId}`);


    useEffect(() => {
      getAssetInfo(assetId).then(setAssetInfo);
    }, [assetId]);

    return <span>{assetInfo}</span>;
  };

  const columns: ColumnDefinition<AssetAssignmentDTO>[] = [
    {
      key: 'assetId',
      header: 'Asset',
      render: (assetId, assignment) =>
        assignment.assetTag
          ? `${assignment.assetType?.replace(/_/g, ' ') ?? ''} - ${assignment.assetTag}`
          : <AssetInfoCell assetId={assetId} />
    },
    {
      key: 'employeeId',
      header: 'Employee',
      render: (employeeId, assignment) =>
        assignment.employeeName || getEmployeeName(employeeId)
    },
    {
      key: 'assignedDate',
      header: 'Assigned Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, assignment) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleReturn(assignment)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#ffc107',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Return
          </button>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Asset Assignments</h1>
        <button
          onClick={handleAssign}
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
          + Assign Asset
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
          <label htmlFor="employeeId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Employee
          </label>
          <select
            id="employeeId"
            name="employeeId"
            value={filters.employeeId}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="">All Employees</option>
            {employees.map(employee => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
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
        data={assignments}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      {/* Assignment Modal */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Assign Asset"
        size="md"
      >
        <form onSubmit={handleAssignSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="assetId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Asset *
            </label>
            <select
              id="assetId"
              name="assetId"
              value={assignmentForm.assetId}
              onChange={handleAssignmentInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={0}>Select an asset...</option>
              {availableAssets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.assetType.replace(/_/g, ' ')} - {asset.assetTag || asset.serialNumber || `ID: ${asset.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="employeeId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Employee *
            </label>
            <select
              id="employeeId"
              name="employeeId"
              value={assignmentForm.employeeId}
              onChange={handleAssignmentInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={0}>Select an employee...</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} - {employee.employeeNumber}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assignedDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Assignment Date *
            </label>
            <input
              id="assignedDate"
              name="assignedDate"
              type="date"
              value={assignmentForm.assignedDate}
              onChange={handleAssignmentInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsAssignModalOpen(false)}
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
              Assign
            </button>
          </div>
        </form>
      </Modal>

      {/* Return Modal */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        title="Return Asset"
        size="md"
      >
        <form onSubmit={handleReturnSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedAssignment && (
            <div style={{
              padding: '12px',
              backgroundColor: '#e9ecef',
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              <p><strong>Asset:</strong> Asset {selectedAssignment.assetId}</p>
              <p><strong>Employee:</strong> {getEmployeeName(selectedAssignment.employeeId)}</p>
              <p><strong>Assigned:</strong> {selectedAssignment.assignedDate ? new Date(selectedAssignment.assignedDate).toLocaleDateString() : '-'}</p>
            </div>
          )}

          <div>
            <label htmlFor="returnedDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Return Date *
            </label>
            <input
              id="returnedDate"
              name="returnedDate"
              type="date"
              value={returnForm.returnedDate}
              onChange={handleReturnInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsReturnModalOpen(false)}
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
                backgroundColor: '#ffc107',
                color: 'black',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Return Asset
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AssetAssignmentPage;