import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Plus, Trash2, Edit, Eye, User, Briefcase, Building2, Calendar, Mail } from 'lucide-react';
import employeeApi, { EmployeeResponse, EmployeeSearchParams } from '../../api/employeeApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PageTransition from '../../components/common/PageTransition';
import Breadcrumb from '../../components/common/Breadcrumb';
import SideDrawer from '../../components/common/SideDrawer';
import { EmploymentStatus } from '../../types';

const EmployeeListPage: React.FC = () => {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeResponse | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    total: 0
  });

  const [filters, setFilters] = useState<EmployeeSearchParams>({
    page: 0,
    size: 10
  });

  
  useEffect(() => {
    loadEmployees();
  }, [filters.page, filters.size, filters.employmentStatus, filters.search]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await employeeApi.getEmployees(filters);
      setEmployees(response.content);
      setPagination({
        page: response.number + 1, // Convert 0-indexed to 1-indexed for display
        size: response.size,
        total: response.totalElements
      });
    } catch (err: any) {
      console.error('Error loading employees:', err);
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query, page: 0 }));
  };

  const handleViewEmployee = (employee: EmployeeResponse) => {
    setSelectedEmployee(employee);
    setIsDrawerOpen(true);
  };

  const handleDeleteSelected = async (selected: EmployeeResponse[]) => {
    if (!window.confirm(`Are you sure you want to delete ${selected.length} employees?`)) return;
    try {
      await Promise.all(selected.map(emp => employeeApi.deleteEmployee(emp.id)));
      loadEmployees();
    } catch (err: any) {
      setError('Failed to delete some employees');
    }
  };

  const getStatusStyles = (status: EmploymentStatus) => {
    switch (status) {
      case EmploymentStatus.ACTIVE: return 'bg-success-50 text-success-600 border-success-200 dark:bg-success-900/20 dark:border-success-800';
      case EmploymentStatus.INACTIVE: return 'bg-secondary-50 text-secondary-600 border-secondary-200 dark:bg-secondary-800/50 dark:border-secondary-700';
      case EmploymentStatus.TERMINATED: return 'bg-danger-50 text-danger-600 border-danger-200 dark:bg-danger-900/20 dark:border-danger-800';
      case EmploymentStatus.ON_LEAVE: return 'bg-warning-50 text-warning-600 border-warning-200 dark:bg-warning-900/20 dark:border-warning-800';
      case EmploymentStatus.PROBATION: return 'bg-primary-50 text-primary-600 border-primary-200 dark:bg-primary-900/20 dark:border-primary-800';
      default: return 'bg-secondary-50 text-secondary-600 border-secondary-200';
    }
  };

  const columns: ColumnDefinition<EmployeeResponse>[] = [
    {
      key: 'fullName',
      header: 'Employee',
      sortable: true,
      render: (value, employee) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-primary center text-white font-bold text-xs shadow-soft">
            {employee.fullName.split(' ').map(n => n[0]).join('')}
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-secondary-900 dark:text-white tracking-tight">{employee.fullName}</span>
            <span className="text-[11px] text-secondary-500 font-medium">{employee.employeeNumber}</span>
          </div>
        </div>
      )
    },
    {
      key: 'jobTitle',
      header: 'Designation',
      sortable: true,
      render: (value, employee) => (
        <div className="flex flex-col">
          <span className="text-secondary-700 dark:text-secondary-300 font-bold text-xs">{employee.jobTitle}</span>
          <span className="text-[10px] text-secondary-500 uppercase tracking-widest font-black">{employee.departmentName}</span>
        </div>
      )
    },
    {
      key: 'workEmail',
      header: 'Contact',
      render: (value, employee) => (
        <div className="flex items-center gap-2 text-secondary-500">
          <Mail className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">{employee.workEmail || 'No email'}</span>
        </div>
      )
    },
    {
      key: 'employmentStatus',
      header: 'Status',
      sortable: true,
      render: (value, employee) => (
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(employee.employmentStatus)}`}>
          {employee.employmentStatus.replace(/_/g, ' ')}
        </span>
      )
    },
    {
      key: 'id' as keyof EmployeeResponse,
      header: 'Actions',
      render: (value, employee) => (
        <div className="flex items-center gap-1">
          <Button variant="glass" size="xs" onClick={() => handleViewEmployee(employee)} icon={<Eye className="w-3.5 h-3.5" />} />
          <Button variant="glass" size="xs" onClick={() => navigate(`/employees/${employee.id}/edit`)} icon={<Edit className="w-3.5 h-3.5" />} />
          <Button variant="glass" size="xs" className="text-danger-500 hover:bg-danger-50" onClick={() => handleDeleteSelected([employee])} icon={<Trash2 className="w-3.5 h-3.5" />} />
        </div>
      )
    }
  ];

  return (
    <PageTransition>
      <div className="space-y-8 animate-slide-up">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <Breadcrumb items={[{ label: 'Dashboard', path: '/dashboard' }, { label: 'Employees', path: '/employees' }]} />
            <h1 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tight">Workforce</h1>
            <p className="text-secondary-500 font-medium italic">Empowering your team, one profile at a time.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" icon={<Download className="w-4 h-4" />}>Export Data</Button>
            <Button variant="gradient" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/employees/new')}>Add Talent</Button>
          </div>
        </div>

        {/* Filters */}
        <div className="premium-card p-6 flex flex-col md:flex-row gap-4 items-center bg-white/50 dark:bg-secondary-900/50 backdrop-blur-md">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Find talent by name, role or ID..."
              className="w-full pl-12 pr-4 py-3 bg-secondary-50/50 dark:bg-secondary-800/50 border-2 border-transparent focus:border-primary-500/20 focus:bg-white dark:focus:bg-secondary-800 transition-all rounded-2xl outline-none text-sm font-medium dark:text-white"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              className="flex-1 md:w-48 px-4 py-3 bg-secondary-50/50 dark:bg-secondary-800/50 rounded-2xl border-2 border-transparent focus:border-primary-500/20 outline-none text-xs font-bold uppercase tracking-widest dark:text-white"
              onChange={(e) => setFilters(p => ({ ...p, employmentStatus: e.target.value as EmploymentStatus || undefined, page: 0 }))}
            >
              <option value="">All Statuses</option>
              {Object.values(EmploymentStatus).map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
            <Button variant="primary" icon={<Filter className="w-4 h-4" />}>Filter</Button>
          </div>
        </div>

        {/* Table */}
        <DataTable
          data={employees}
          columns={columns}
          loading={loading}
          enableBulkActions
          onBulkAction={(action, items) => action === 'delete' && handleDeleteSelected(items)}
          pagination={pagination}
          onPageChange={(p) => setFilters(prev => ({ ...prev, page: p - 1 }))}
          onPageSizeChange={(s) => setFilters(prev => ({ ...prev, size: s, page: 0 }))}
        />

        {/* Detail Drawer */}
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          title="Talent Preview"
          subtitle={selectedEmployee?.fullName}
          footer={
            <div className="flex gap-3">
              <Button variant="primary" fullWidth onClick={() => navigate(`/employees/${selectedEmployee?.id}`)}>Full Profile</Button>
              <Button variant="outline" fullWidth onClick={() => setIsDrawerOpen(false)}>Close</Button>
            </div>
          }
        >
          {selectedEmployee && (
            <div className="space-y-8">
              <div className="center flex-col space-y-4">
                <div className="w-24 h-24 rounded-3xl bg-gradient-primary center text-white text-3xl font-black shadow-glow">
                  {selectedEmployee.fullName.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-black text-secondary-900 dark:text-white">{selectedEmployee.fullName}</h3>
                  <p className="text-primary-600 font-bold text-sm tracking-tight">{selectedEmployee.jobTitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Employee ID', value: selectedEmployee.employeeNumber, icon: <User /> },
                  { label: 'Department', value: selectedEmployee.departmentName, icon: <Building2 /> },
                  { label: 'Joining Date', value: new Date(selectedEmployee.hireDate).toLocaleDateString(), icon: <Calendar /> },
                  { label: 'Work Email', value: selectedEmployee.workEmail, icon: <Mail /> },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-700/50 transition-transform hover:scale-[1.02]">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-secondary-800 center text-secondary-400 shadow-soft">
                      {React.cloneElement(item.icon as React.ReactElement, { className: 'w-5 h-5' })}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-secondary-400">{item.label}</span>
                      <span className="text-sm font-bold text-secondary-900 dark:text-white">{item.value || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </SideDrawer>
      </div>
    </PageTransition>
  );
};

export default EmployeeListPage;