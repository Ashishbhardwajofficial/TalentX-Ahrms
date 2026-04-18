import React, { useState, useEffect } from 'react';
import roleApi, {
  RoleDTO,
  RoleCreateDTO,
  RoleUpdateDTO,
  RoleSearchParams,
  PermissionDTO,
  PermissionsByCategoryResponse
} from '../../api/roleApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { Permission } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const RolePermissionPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 1;
  const [roles, setRoles] = useState<RoleDTO[]>([]);
  const [allPermissions, setAllPermissions] = useState<PermissionDTO[]>([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState<PermissionsByCategoryResponse>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isMatrixModalOpen, setIsMatrixModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDTO | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSystemRole, setFilterSystemRole] = useState<boolean | undefined>(undefined);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState<RoleCreateDTO>({
    organizationId: orgId,
    name: '',
    code: '',
    description: '',
    permissionIds: []
  });

  // Permission assignment state
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  useEffect(() => {
    loadRoles();
    loadPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size, filterSystemRole]);

  const loadRoles = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: RoleSearchParams = {
        page: pagination.page - 1,
        size: pagination.size,
        organizationId: orgId
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      if (filterSystemRole !== undefined) {
        params.isSystemRole = filterSystemRole;
      }

      const response = await roleApi.getRoles(params);
      setRoles(response?.content ?? []);
      setPagination(prev => ({
        ...prev,
        total: response?.totalElements ?? 0
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      const [permissions, categorized] = await Promise.all([
        roleApi.getPermissions(),
        roleApi.getPermissionsByCategory()
      ]);
      setAllPermissions(permissions);
      setPermissionsByCategory(categorized);
    } catch (err: any) {
      console.error('Failed to load permissions:', err);
    }
  };

  const handleCreate = () => {
    setEditingRole(null);
    setFormData({
      organizationId: orgId,
      name: '',
      code: '',
      description: '',
      permissionIds: []
    });
    setIsModalOpen(true);
  };

  const handleEdit = (role: RoleDTO) => {
    setEditingRole(role);
    setFormData({
      organizationId: role.organizationId,
      name: role.name,
      code: role.code,
      description: role.description || '',
      permissionIds: (role.permissions ?? []).map(p => p.id)
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }

    try {
      await roleApi.deleteRole(id);
      loadRoles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete role');
    }
  };

  const handleManagePermissions = (role: RoleDTO) => {
    setSelectedRole(role);
    setSelectedPermissionIds((role.permissions ?? []).map(p => p.id));
    setIsPermissionModalOpen(true);
  };

  const handleViewMatrix = () => {
    setIsMatrixModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingRole) {
        const updateData: RoleUpdateDTO = {
          name: formData.name,
          code: formData.code,
          ...(formData.description !== undefined && { description: formData.description })
        };

        await roleApi.updateRole(editingRole.id, updateData);

        const currentPermissionIds = (editingRole.permissions ?? []).map(p => p.id);
        const permissionsToAdd = formData.permissionIds?.filter(id => !currentPermissionIds.includes(id)) || [];
        const permissionsToRemove = currentPermissionIds.filter(id => !formData.permissionIds?.includes(id));

        for (const permissionId of permissionsToAdd) {
          await roleApi.assignPermission(editingRole.id, permissionId);
        }

        for (const permissionId of permissionsToRemove) {
          await roleApi.removePermission(editingRole.id, permissionId);
        }
      } else {
        await roleApi.createRole(formData);
      }
      setIsModalOpen(false);
      loadRoles();
    } catch (err: any) {
      setError(err.message || 'Failed to save role');
    }
  };

  const handlePermissionAssignment = async () => {
    if (!selectedRole) return;

    try {
      const currentPermissionIds = (selectedRole.permissions ?? []).map(p => p.id);
      const permissionsToAdd = selectedPermissionIds.filter(id => !currentPermissionIds.includes(id));
      const permissionsToRemove = currentPermissionIds.filter(id => !selectedPermissionIds.includes(id));

      for (const permissionId of permissionsToAdd) {
        await roleApi.assignPermission(selectedRole.id, permissionId);
      }

      for (const permissionId of permissionsToRemove) {
        await roleApi.removePermission(selectedRole.id, permissionId);
      }

      setIsPermissionModalOpen(false);
      loadRoles();
    } catch (err: any) {
      setError(err.message || 'Failed to update role permissions');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionCheckboxChange = (permissionId: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        permissionIds: [...(prev.permissionIds || []), permissionId]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        permissionIds: (prev.permissionIds || []).filter(id => id !== permissionId)
      }));
    }
  };

  const handlePermissionModalCheckboxChange = (permissionId: number, checked: boolean) => {
    if (checked) {
      setSelectedPermissionIds(prev => [...prev, permissionId]);
    } else {
      setSelectedPermissionIds(prev => prev.filter(id => id !== permissionId));
    }
  };

  const columns: ColumnDefinition<RoleDTO>[] = [
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
      header: 'Description',
      render: (value) => value || '-'
    },
    {
      key: 'isSystemRole',
      header: 'Type',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: value ? '#e7f3ff' : '#f8f9fa',
          color: value ? '#0066cc' : '#495057',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {value ? 'System' : 'Custom'}
        </span>
      )
    },
    {
      key: 'permissions',
      header: 'Permissions',
      render: (permissions: Permission[]) => {
        const count = (permissions ?? []).length;
        return (
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>
            {count} permission{count !== 1 ? 's' : ''}
          </span>
        );
      }
    },
    {
      key: 'createdAt',
      header: 'Created',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, role) => (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleManagePermissions(role)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Manage Permissions"
          >
            Permissions
          </button>
          <button
            onClick={() => handleEdit(role)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            disabled={role.isSystemRole}
            title={role.isSystemRole ? 'System roles cannot be edited' : 'Edit role'}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(role.id)}
            style={{
              padding: '4px 8px',
              backgroundColor: role.isSystemRole ? '#6c757d' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: role.isSystemRole ? 'not-allowed' : 'pointer',
              fontSize: '12px',
              opacity: role.isSystemRole ? 0.6 : 1
            }}
            disabled={role.isSystemRole}
            title={role.isSystemRole ? 'System roles cannot be deleted' : 'Delete role'}
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
        <h1>Role & Permission Management</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleViewMatrix}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            📊 Permission Matrix
          </button>
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
            + Create Role
          </button>
        </div>
      </div>

      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        padding: '16px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <select
            value={filterSystemRole === undefined ? '' : filterSystemRole.toString()}
            onChange={(e) => setFilterSystemRole(e.target.value === '' ? undefined : e.target.value === 'true')}
            style={{
              padding: '8px 12px',
              border: '1px solid #ced4da',
              borderRadius: '4px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="">All Roles</option>
            <option value="true">System Roles Only</option>
            <option value="false">Custom Roles Only</option>
          </select>
        </div>
        <button
          onClick={loadRoles}
          style={{
            padding: '8px 16px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Search
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
        data={roles}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      {/* Create/Edit Role Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? 'Edit Role' : 'Create Role'}
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
                placeholder="e.g., HR Manager"
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
                placeholder="e.g., HR_MANAGER"
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
                placeholder="Describe the role and its responsibilities..."
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontFamily: 'inherit'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Permissions
              </label>
              <div style={{
                maxHeight: '300px',
                overflowY: 'auto',
                padding: '12px',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                border: '1px solid #dee2e6'
              }}>
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <div key={category} style={{ marginBottom: '16px' }}>
                    <div style={{
                      fontWeight: 'bold',
                      fontSize: '14px',
                      marginBottom: '8px',
                      color: '#495057',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {category || 'Uncategorized'}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                      gap: '8px',
                      paddingLeft: '12px'
                    }}>
                      {permissions.map(permission => (
                        <label
                          key={permission.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            padding: '4px'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.permissionIds?.includes(permission.id) || false}
                            onChange={(e) => handlePermissionCheckboxChange(permission.id, e.target.checked)}
                            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                          />
                          <span style={{ fontSize: '13px' }} title={permission.description}>
                            {permission.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
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
              {editingRole ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Permission Assignment Modal */}
      <Modal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        title="Assign Permissions"
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, color: '#6c757d' }}>
            Select the permissions you want to assign to this role. Changes will be applied immediately.
          </p>

          <div style={{
            maxHeight: '500px',
            overflowY: 'auto',
            padding: '16px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            {Object.entries(permissionsByCategory).map(([category, permissions]) => (
              <div key={category} style={{ marginBottom: '20px' }}>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginBottom: '12px',
                  color: '#495057',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '2px solid #dee2e6',
                  paddingBottom: '8px'
                }}>
                  {category || 'Uncategorized'}
                </div>
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  paddingLeft: '12px'
                }}>
                  {permissions.map(permission => (
                    <label
                      key={permission.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        cursor: 'pointer',
                        padding: '12px',
                        backgroundColor: 'white',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#007bff';
                        e.currentTarget.style.backgroundColor = '#f0f8ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#dee2e6';
                        e.currentTarget.style.backgroundColor = 'white';
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissionIds.includes(permission.id)}
                        onChange={(e) => handlePermissionModalCheckboxChange(permission.id, e.target.checked)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', marginTop: '2px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>
                          {permission.name}
                        </div>
                        {permission.description && (
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>
                            {permission.description}
                          </div>
                        )}
                        <div style={{
                          display: 'inline-block',
                          marginTop: '4px',
                          padding: '2px 6px',
                          backgroundColor: '#e9ecef',
                          color: '#495057',
                          fontSize: '10px',
                          borderRadius: '4px',
                          fontFamily: 'monospace'
                        }}>
                          {permission.code}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setIsPermissionModalOpen(false)}
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
              type="button"
              onClick={handlePermissionAssignment}
              style={{
                padding: '10px 20px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </Modal>

      {/* Permission Matrix Modal */}
      <Modal
        isOpen={isMatrixModalOpen}
        onClose={() => setIsMatrixModalOpen(false)}
        title="Permission Matrix"
        size="lg"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, color: '#6c757d' }}>
            This matrix shows which permissions are assigned to each role. Use this view to quickly understand access control across your organization.
          </p>

          <div style={{
            overflowX: 'auto',
            overflowY: 'auto',
            maxHeight: '600px',
            border: '1px solid #dee2e6',
            borderRadius: '8px'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '13px'
            }}>
              <thead style={{
                position: 'sticky',
                top: 0,
                backgroundColor: '#f8f9fa',
                zIndex: 10
              }}>
                <tr>
                  <th style={{
                    padding: '12px',
                    textAlign: 'left',
                    borderBottom: '2px solid #dee2e6',
                    borderRight: '2px solid #dee2e6',
                    fontWeight: 'bold',
                    position: 'sticky',
                    left: 0,
                    backgroundColor: '#f8f9fa',
                    zIndex: 11
                  }}>
                    Permission
                  </th>
                  {roles.map(role => (
                    <th key={role.id} style={{
                      padding: '12px',
                      textAlign: 'center',
                      borderBottom: '2px solid #dee2e6',
                      fontWeight: 'bold',
                      minWidth: '100px'
                    }}>
                      <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                        {role.name}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissionsByCategory).map(([category, permissions]) => (
                  <React.Fragment key={category}>
                    <tr style={{ backgroundColor: '#e9ecef' }}>
                      <td colSpan={roles.length + 1} style={{
                        padding: '8px 12px',
                        fontWeight: 'bold',
                        fontSize: '12px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#495057'
                      }}>
                        {category || 'Uncategorized'}
                      </td>
                    </tr>
                    {permissions.map(permission => (
                      <tr key={permission.id} style={{
                        borderBottom: '1px solid #dee2e6'
                      }}>
                        <td style={{
                          padding: '12px',
                          borderRight: '2px solid #dee2e6',
                          position: 'sticky',
                          left: 0,
                          backgroundColor: 'white',
                          fontWeight: '500'
                        }}>
                          <div>{permission.name}</div>
                          <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                            {permission.code}
                          </div>
                        </td>
                        {roles.map(role => {
                          const hasPermission = (role.permissions ?? []).some(p => p.id === permission.id);
                          return (
                            <td key={role.id} style={{
                              padding: '12px',
                              textAlign: 'center',
                              backgroundColor: hasPermission ? '#d4edda' : 'white'
                            }}>
                              {hasPermission ? (
                                <span style={{ color: '#28a745', fontSize: '18px', fontWeight: 'bold' }}>✓</span>
                              ) : (
                                <span style={{ color: '#dc3545', fontSize: '18px' }}>✗</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setIsMatrixModalOpen(false)}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default RolePermissionPage;