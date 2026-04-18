import React, { useState, useEffect } from 'react';
import departmentApi, {
  DepartmentDTO,
  DepartmentCreateDTO,
  DepartmentUpdateDTO,
  DepartmentHierarchyNode
} from '../../api/departmentApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';

const DepartmentManagementPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 1;
  const [departments, setDepartments] = useState<DepartmentDTO[]>([]);
  const [hierarchyData, setHierarchyData] = useState<DepartmentHierarchyNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentDTO | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState<DepartmentCreateDTO>({
    organizationId: orgId,
    name: '',
    code: '',
    description: '',
    costCenter: '',
    location: ''
  });


  useEffect(() => {
    if (viewMode === 'list') {
      loadDepartments();
    } else {
      loadHierarchy();
    }
  }, [pagination.page, pagination.size, viewMode]);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await departmentApi.getDepartments({
        page: pagination.page - 1, // Backend uses 0-based indexing
        size: pagination.size,
        organizationId: orgId
      });
      setDepartments(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      setError(null);
      const hierarchy = await departmentApi.getDepartmentHierarchy(orgId);
      setHierarchyData(hierarchy);
    } catch (err: any) {
      setError(err.message || 'Failed to load department hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingDept(null);
    setFormData({
      organizationId: orgId,
      name: '',
      code: '',
      description: '',
      costCenter: '',
      location: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (dept: DepartmentDTO) => {
    setEditingDept(dept);
    setFormData({
      organizationId: dept.organizationId,
      name: dept.name,
      code: dept.code || '',
      description: dept.description || '',
      costCenter: dept.costCenter || '',
      location: dept.location || '',
      ...(dept.parentDepartmentId && { parentDepartmentId: dept.parentDepartmentId }),
      ...(dept.managerId && { managerId: dept.managerId })
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this department?')) {
      return;
    }

    try {
      await departmentApi.deleteDepartment(id);
      if (viewMode === 'list') {
        loadDepartments();
      } else {
        loadHierarchy();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete department');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingDept) {
        const updateData: DepartmentUpdateDTO = {
          name: formData.name,
          ...(formData.code && { code: formData.code }),
          ...(formData.description && { description: formData.description }),
          ...(formData.parentDepartmentId && { parentDepartmentId: formData.parentDepartmentId }),
          ...(formData.managerId && { managerId: formData.managerId }),
          ...(formData.costCenter && { costCenter: formData.costCenter }),
          ...(formData.location && { location: formData.location })
        };

        await departmentApi.updateDepartment(editingDept.id, updateData);
      } else {
        await departmentApi.createDepartment(formData);
      }
      setIsModalOpen(false);
      if (viewMode === 'list') {
        loadDepartments();
      } else {
        loadHierarchy();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save department');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? undefined : (name === 'parentDepartmentId' || name === 'managerId' ? Number(value) : value)
    }));
  };

  const columns: ColumnDefinition<DepartmentDTO>[] = [
    {
      key: 'code',
      header: 'Code',
      sortable: true
    },
    {
      key: 'name',
      header: 'Name',
      sortable: true
    },
    {
      key: 'description',
      header: 'Description'
    },
    {
      key: 'parentDepartmentId',
      header: 'Parent Department',
      render: (value) => value ? `Dept #${value}` : '-'
    },
    {
      key: 'costCenter',
      header: 'Cost Center'
    },
    {
      key: 'location',
      header: 'Location'
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, dept) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleEdit(dept)}
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
            onClick={() => handleDelete(dept.id)}
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

  const renderTreeNode = (node: DepartmentHierarchyNode, level: number = 0): React.ReactNode => {
    return (
      <div key={node.id} style={{ marginLeft: `${level * 24}px`, marginBottom: '8px' }}>
        <div
          style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
              {level > 0 && '└─ '}
              {node.name} ({node.code})
            </div>
            {node.description && (
              <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                {node.description}
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
              {node.costCenter && `Cost Center: ${node.costCenter}`}
              {node.location && ` | Location: ${node.location}`}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleEdit(node as DepartmentDTO)}
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
              onClick={() => handleDelete(node.id)}
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
        </div>
        {node.children && node.children.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Department Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#e9ecef', borderRadius: '4px', padding: '4px' }}>
            <button
              onClick={() => setViewMode('list')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'list' ? '#007bff' : 'transparent',
                color: viewMode === 'list' ? 'white' : '#495057',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: viewMode === 'list' ? 'bold' : 'normal'
              }}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('tree')}
              style={{
                padding: '8px 16px',
                backgroundColor: viewMode === 'tree' ? '#007bff' : 'transparent',
                color: viewMode === 'tree' ? 'white' : '#495057',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: viewMode === 'tree' ? 'bold' : 'normal'
              }}
            >
              Tree View
            </button>
          </div>
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
            + Create Department
          </button>
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

      {viewMode === 'list' ? (
        <DataTable
          data={departments}
          columns={columns}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
        />
      ) : (
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', border: '1px solid #dee2e6' }}>
          <h2 style={{ marginBottom: '20px', fontSize: '20px', fontWeight: 'bold' }}>Department Hierarchy</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading hierarchy...</div>
          ) : hierarchyData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
              No departments found. Create your first department to get started.
            </div>
          ) : (
            <div>
              {hierarchyData.map(node => renderTreeNode(node))}
            </div>
          )}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create Department'}
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
              <label htmlFor="code" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Code *
              </label>
              <input
                id="code"
                name="code"
                type="text"
                value={formData.code}
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
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div>
              <label htmlFor="parentDepartmentId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Parent Department
              </label>
              <select
                id="parentDepartmentId"
                name="parentDepartmentId"
                value={formData.parentDepartmentId || ''}
                onChange={handleInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              >
                <option value="">None (Top Level)</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="managerId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Manager ID
              </label>
              <input
                id="managerId"
                name="managerId"
                type="number"
                value={formData.managerId || ''}
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
              <label htmlFor="costCenter" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Cost Center
              </label>
              <input
                id="costCenter"
                name="costCenter"
                type="text"
                value={formData.costCenter}
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
              <label htmlFor="location" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
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
              {editingDept ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DepartmentManagementPage;
