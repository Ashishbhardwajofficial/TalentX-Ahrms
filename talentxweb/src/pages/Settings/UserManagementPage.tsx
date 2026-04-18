import React, { useState, useEffect } from 'react';
import { Plus, Search, UserCheck, UserX, UserPlus, Settings, Shield, Mail, Key } from 'lucide-react';
import userApi, {
  UserDTO,
  UserCreateDTO,
  UserUpdateDTO,
  UserSearchParams
} from '../../api/userApi';
import roleApi from '../../api/roleApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Breadcrumb from '../../components/common/Breadcrumb';
import PageTransition from '../../components/common/PageTransition';
import { Role } from '../../types';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [availableRoles, setAvailableRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [_error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const toast = useToast();
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 1;

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Form state
  const [formData, setFormData] = useState<UserCreateDTO>({
    organizationId: orgId,
    email: '',
    username: '',
    password: '',
    isActive: true,
    twoFactorEnabled: false,
    roleIds: []
  });

  // Role assignment state
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);

  useEffect(() => {
    loadUsers();
    loadAvailableRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.size, filterActive]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: UserSearchParams = {
        page: pagination.page - 1,
        size: pagination.size,
        organizationId: orgId
      };

      if (searchTerm) params.search = searchTerm;
      if (filterActive !== undefined) params.isActive = filterActive;

      const response = await userApi.getUsers(params);
      setUsers(response?.content ?? []);
      setPagination(prev => ({ ...prev, total: response?.totalElements ?? 0 }));
    } catch (err: any) {
      toast.error('Failed to load users', { description: err.message });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableRoles = async () => {
    try {
      const response = await roleApi.getRoles({ page: 0, size: 100, organizationId: orgId });
      // Map RoleDTO to Role shape expected by the form
      const roles = (response?.content ?? []).map(r => ({
        id: r.id,
        organizationId: r.organizationId,
        name: r.name,
        code: r.code,
        isSystemRole: r.isSystemRole,
        permissions: r.permissions ?? [],
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        description: r.description ?? ''
      }));
      setAvailableRoles(roles);
    } catch {
      // Fallback to system defaults if API fails
      setAvailableRoles([
        { id: 1, organizationId: 1, name: 'Admin', code: 'ADMIN', isSystemRole: true, permissions: [], createdAt: '', updatedAt: '', description: 'Full system access' },
        { id: 2, organizationId: 1, name: 'Manager', code: 'MANAGER', isSystemRole: true, permissions: [], createdAt: '', updatedAt: '', description: 'Team management' },
        { id: 3, organizationId: 1, name: 'Employee', code: 'EMPLOYEE', isSystemRole: true, permissions: [], createdAt: '', updatedAt: '', description: 'Self-service access' },
        { id: 4, organizationId: 1, name: 'HR', code: 'HR', isSystemRole: true, permissions: [], createdAt: '', updatedAt: '', description: 'HR management' }
      ]);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({
      organizationId: orgId,
      email: '',
      username: '',
      password: '',
      isActive: true,
      twoFactorEnabled: false,
      roleIds: []
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: UserDTO) => {
    setEditingUser(user);
    setFormData({
      organizationId: user.organizationId,
      email: user.email,
      username: user.username || '',
      password: '',
      isActive: user.isActive,
      twoFactorEnabled: user.twoFactorEnabled,
      roleIds: (user.roles ?? []).filter(r => r != null).map(r => r.id)
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      await userApi.deleteUser(id);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (err: any) {
      toast.error('Deletion failed', { description: err.message });
    }
  };

  const handleToggleActive = async (user: UserDTO) => {
    try {
      if (user.isActive) {
        await userApi.deactivateUser(user.id);
      } else {
        await userApi.activateUser(user.id);
      }
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'} successfully`);
      loadUsers();
    } catch (err: any) {
      toast.error('Action failed', { description: err.message });
    }
  };

  const handleManageRoles = (user: UserDTO) => {
    setSelectedUser(user);
    setSelectedRoleIds((user.roles ?? []).filter(r => r != null).map(r => r.id));
    setIsRoleModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const updateData: UserUpdateDTO = {
          email: formData.email,
          isActive: formData.isActive ?? false,
          twoFactorEnabled: formData.twoFactorEnabled ?? false,
          ...(formData.username && { username: formData.username })
        };
        await userApi.updateUser(editingUser.id, updateData);

        // Handle role synchronization
        const currentRoleIds = (editingUser.roles ?? []).filter(r => r != null).map(r => r.id);
        const rolesToAdd = formData.roleIds?.filter(id => !currentRoleIds.includes(id)) || [];
        const rolesToRemove = currentRoleIds.filter(id => !formData.roleIds?.includes(id));

        for (const roleId of rolesToAdd) await userApi.assignRole(editingUser.id, roleId);
        for (const roleId of rolesToRemove) await userApi.removeRole(editingUser.id, roleId);

        toast.success('User updated successfully');
      } else {
        await userApi.createUser(formData);
        toast.success('User created successfully');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      toast.error('Save failed', { description: err.message });
    }
  };

  const handleRoleAssignment = async () => {
    if (!selectedUser) return;
    try {
      const currentRoleIds = (selectedUser.roles ?? []).filter(r => r != null).map(r => r.id);
      const rolesToAdd = selectedRoleIds.filter(id => !currentRoleIds.includes(id));
      const rolesToRemove = currentRoleIds.filter(id => !selectedRoleIds.includes(id));

      for (const roleId of rolesToAdd) await userApi.assignRole(selectedUser.id, roleId);
      for (const roleId of rolesToRemove) await userApi.removeRole(selectedUser.id, roleId);

      toast.success('Roles updated successfully');
      setIsRoleModalOpen(false);
      loadUsers();
    } catch (err: any) {
      toast.error('Update failed', { description: err.message });
    }
  };

  const columns: ColumnDefinition<UserDTO>[] = [
    {
      key: 'email',
      header: 'Identity',
      render: (email, user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center text-primary-600 font-bold border border-primary-200">
            {user.username?.[0]?.toUpperCase() || email[0].toUpperCase()}
          </div>
          <div>
            <div className="font-bold text-secondary-900 leading-none">{user.username || 'Anonymous'}</div>
            <div className="text-xs text-secondary-500 mt-1">{email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'roles',
      header: 'Assigned Roles',
      render: (roles: Role[]) => {
        const validRoles = (roles ?? []).filter(r => r != null && r.name != null);
        return (
          <div className="flex flex-wrap gap-1.5">
            {validRoles.map(role => (
              <span key={role.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-100/50 text-secondary-600 text-[10px] font-bold uppercase tracking-wider border border-secondary-200">
                <Shield className="w-2.5 h-2.5" />
                {role.name}
              </span>
            ))}
            {validRoles.length === 0 && <span className="text-xs italic text-secondary-400">No roles assigned</span>}
          </div>
        );
      }
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (isActive) => (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.1em] ${isActive
          ? 'bg-success-50 text-success-700 border border-success-100'
          : 'bg-secondary-100 text-secondary-500 border border-secondary-200'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-success-500 animate-pulse' : 'bg-secondary-400'}`}></span>
          {isActive ? 'Live Account' : 'Deactivated'}
        </div>
      )
    },
    {
      key: 'twoFactorEnabled',
      header: 'Security',
      render: (twoFactor) => (
        <div className={`flex items-center gap-1.5 text-xs font-bold ${twoFactor ? 'text-primary-600' : 'text-secondary-400'}`}>
          {twoFactor ? <Key className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5 opacity-50" />}
          {twoFactor ? '2FA Active' : 'Basic Security'}
        </div>
      )
    },
    {
      key: 'lastLoginAt',
      header: 'Last Activity',
      render: (value) => value ? (
        <div className="text-xs text-secondary-500">
          <div className="font-medium text-secondary-700">{new Date(value).toLocaleDateString()}</div>
          <div className="opacity-70">{new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      ) : <span className="text-xs text-secondary-300">Never</span>
    },
    {
      key: 'id',
      header: 'Control',
      render: (_, user) => (
        <div className="flex items-center gap-2">
          <Button variant="glass" size="xs" onClick={() => handleManageRoles(user)} title="Manage Roles">
            <Shield className="w-3.5 h-3.5" />
          </Button>
          <Button variant="glass" size="xs" onClick={() => handleEdit(user)} title="Edit User">
            <Settings className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant={user.isActive ? 'warning' : 'success'}
            size="xs"
            onClick={() => handleToggleActive(user)}
            title={user.isActive ? 'Deactivate' : 'Activate'}
          >
            {user.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
          </Button>
          <Button variant="danger" size="xs" onClick={() => handleDelete(user.id)} title="Delete Forever">
            <Plus className="w-3.5 h-3.5 rotate-45" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Breadcrumb />
            <h1 className="text-3xl font-display font-black text-secondary-900 tracking-tight flex items-center gap-3">
              <UserPlus className="w-8 h-8 text-primary-600" />
              User Access Control
            </h1>
            <p className="text-secondary-500 mt-1 font-medium">Manage system accounts, roles, and security protocols.</p>
          </div>
          <Button variant="primary" size="md" icon={<Plus className="w-5 h-5" />} onClick={handleCreate} className="shadow-premium">
            Create Security Account
          </Button>
        </div>

        <div className="premium-card p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
              <input
                type="text"
                placeholder="Lookup accounts by email, username or identity..."
                className="w-full pl-12 pr-4 py-3 bg-secondary-50 border-2 border-secondary-100 rounded-2xl text-sm focus:bg-white focus:border-primary-500 transition-all outline-none font-medium shadow-inner-pill"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadUsers()}
              />
            </div>
            <select
              className="px-6 py-3 bg-secondary-50 border-2 border-secondary-100 rounded-2xl text-sm font-bold text-secondary-700 outline-none focus:border-primary-500 transition-all cursor-pointer shadow-inner-pill"
              value={filterActive === undefined ? '' : filterActive.toString()}
              onChange={(e) => setFilterActive(e.target.value === '' ? undefined : e.target.value === 'true')}
            >
              <option value="">All Account Statuses</option>
              <option value="true">Active & Verified Only</option>
              <option value="false">Deactivated Accounts</option>
            </select>
            <Button variant="secondary" onClick={loadUsers} className="shadow-sm">Scan Directory</Button>
          </div>

          <DataTable
            data={users}
            columns={columns}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
            onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
          />
        </div>
      </div>

      {/* Creation/Modification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Optimize Security Account' : 'New System Registration'}
        subtitle={editingUser ? `Managing identity for ${editingUser.email}` : 'Register a new authenticated user for the platform'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-xs font-black text-secondary-400 uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-3 h-3" />
                Primary Email Gateway *
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 bg-secondary-50 border-2 border-secondary-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 outline-none transition-all shadow-inner-pill"
                placeholder="user@organization.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-secondary-400 uppercase tracking-widest flex items-center gap-2">
                <UserPlus className="w-3 h-3" />
                System Alias / Username
              </label>
              <input
                name="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 bg-secondary-50 border-2 border-secondary-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 outline-none transition-all shadow-inner-pill"
                placeholder="e.g. jdoe_matrix"
              />
            </div>

            {!editingUser && (
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-black text-secondary-400 uppercase tracking-widest flex items-center gap-2">
                  <Key className="w-3 h-3" />
                  Initial Secure Credentials *
                </label>
                <input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!editingUser}
                  className="w-full px-4 py-3 bg-secondary-50 border-2 border-secondary-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 outline-none transition-all shadow-inner-pill"
                  placeholder="Set minimum 8 character passphrase"
                />
              </div>
            )}

            <div className="md:col-span-2">
              <label className="text-xs font-black text-secondary-400 uppercase tracking-widest mb-4 block">Defined System Roles</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {availableRoles.map(role => (
                  <label key={role.id} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center text-center gap-3 ${formData.roleIds?.includes(role.id)
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-secondary-100/50 hover:bg-secondary-50'
                    }`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={formData.roleIds?.includes(role.id) || false}
                      onChange={(e) => {
                        const newRoles = e.target.checked
                          ? [...(formData.roleIds || []), role.id]
                          : (formData.roleIds || []).filter(id => id !== role.id);
                        setFormData({ ...formData, roleIds: newRoles });
                      }}
                    />
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.roleIds?.includes(role.id) ? 'bg-primary-500 text-white' : 'bg-secondary-100 text-secondary-400'
                      }`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-tighter leading-none">{role.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-secondary-50/50 p-4 rounded-3xl border border-secondary-100">
              <div className={`p-2 rounded-xl ${formData.isActive ? 'bg-success-100 text-success-600' : 'bg-secondary-200 text-secondary-400'}`}>
                <UserCheck className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-black text-secondary-900">Authorize Login</div>
                <div className="text-[10px] text-secondary-500 uppercase font-bold tracking-wider">Enable account immediately</div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                className={`relative w-12 h-6 rounded-full self-center transition-colors pointer-events-auto ${formData.isActive ? 'bg-success-500' : 'bg-secondary-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.isActive ? 'translate-x-[26px]' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-secondary-50/50 p-4 rounded-3xl border border-secondary-100">
              <div className={`p-2 rounded-xl ${formData.twoFactorEnabled ? 'bg-primary-100 text-primary-600' : 'bg-secondary-200 text-secondary-400'}`}>
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-black text-secondary-900">Mandatory 2FA</div>
                <div className="text-[10px] text-secondary-500 uppercase font-bold tracking-wider">Enhanced Security Layer</div>
              </div>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, twoFactorEnabled: !formData.twoFactorEnabled })}
                className={`relative w-12 h-6 rounded-full self-center transition-colors pointer-events-auto ${formData.twoFactorEnabled ? 'bg-primary-500' : 'bg-secondary-300'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.twoFactorEnabled ? 'translate-x-[26px]' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-secondary-50 uppercase tracking-widest text-[11px] font-black">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Abort Process</Button>
            <Button variant="primary" type="submit" className="min-w-[160px] shadow-premium">
              {editingUser ? 'Synchronize Data' : 'Finalize Registration'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Role Assignment Modal */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Permission Matrix Tuning"
        subtitle={selectedUser ? `Modifying authorization tiers for ${selectedUser.username || selectedUser.email}` : 'Tune system level permissions'}
      >
        <div className="space-y-6">
          <div className="bg-primary-50 p-4 rounded-2xl border border-primary-100 text-[11px] font-bold text-primary-700 uppercase tracking-wider">
            Critical Action: You are modifying system access for a security identity. These changes propagate instantly.
          </div>

          <div className="space-y-3">
            {availableRoles.map(role => (
              <label key={role.id} className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedRoleIds.includes(role.id)
                ? 'bg-primary-50/50 border-primary-500'
                : 'bg-white border-secondary-100 hover:border-primary-200'
                }`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedRoleIds.includes(role.id)}
                  onChange={(e) => {
                    const newRoles = e.target.checked
                      ? [...selectedRoleIds, role.id]
                      : selectedRoleIds.filter(id => id !== role.id);
                    setSelectedRoleIds(newRoles);
                  }}
                />
                <div className={`w-12 h-12 rounded-xl center transition-colors ${selectedRoleIds.includes(role.id) ? 'bg-primary-500 text-white shadow-glow' : 'bg-secondary-50 text-secondary-400 group-hover:bg-primary-50'
                  }`}>
                  <Shield className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="font-black text-secondary-900 leading-none">{role.name}</div>
                  <div className="text-[10px] text-secondary-500 uppercase mt-1.5 font-bold tracking-wider">{role.description}</div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 transition-all center ${selectedRoleIds.includes(role.id) ? 'bg-primary-500 border-primary-500' : 'border-secondary-100'
                  }`}>
                  {selectedRoleIds.includes(role.id) && <Plus className="w-3.5 h-3.5 text-white" />}
                </div>
              </label>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 font-black uppercase tracking-widest text-[11px]">
            <Button variant="ghost" onClick={() => setIsRoleModalOpen(false)}>Cancel Tuning</Button>
            <Button variant="primary" onClick={handleRoleAssignment} className="shadow-premium min-w-[140px]">Commit Permissions</Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
};

export default UserManagementPage;
