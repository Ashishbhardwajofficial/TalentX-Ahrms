import React from 'react';
import DataTable, { ColumnDefinition } from '../common/DataTable';
import Button from '../common/Button';
import { EmployeeResponse } from '../../api/employeeApi';
import { useAuth } from '../../hooks/useAuth';

export interface EmployeeTableProps {
  employees: EmployeeResponse[];
  loading?: boolean;
  onViewEmployee?: (employee: EmployeeResponse) => void;
  onEditEmployee?: (employee: EmployeeResponse) => void;
  onDeleteEmployee?: (employee: EmployeeResponse) => void;
  showActions?: boolean;
  selectable?: boolean;
  selectedEmployees?: number[];
  onSelectionChange?: (selectedIds: number[]) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  loading = false,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
  showActions = true,
  selectable = false,
  selectedEmployees = [],
  onSelectionChange
}) => {
  const { hasPermission } = useAuth();

  const handleSelectionChange = (employee: EmployeeResponse, selected: boolean) => {
    if (!onSelectionChange) return;

    const newSelection = selected
      ? [...selectedEmployees, employee.id]
      : selectedEmployees.filter(id => id !== employee.id);

    onSelectionChange(newSelection);
  };

  const selectColumn: ColumnDefinition<EmployeeResponse> = {
    key: 'select' as keyof EmployeeResponse,
    header: 'Select',
    render: (value, employee) => employee ? (
      <input
        type="checkbox"
        checked={selectedEmployees.includes(employee.id)}
        onChange={(e) => handleSelectionChange(employee, e.target.checked)}
      />
    ) : null
  };

  const columns: ColumnDefinition<EmployeeResponse>[] = [
    ...(selectable ? [selectColumn] : []),
    {
      key: 'employeeNumber',
      header: 'Employee #',
      sortable: true,
      render: (value, employee) => employee ? (
        <button
          className="link-button"
          onClick={() => onViewEmployee?.(employee)}
        >
          {value || '-'}
        </button>
      ) : '-'
    },
    {
      key: 'fullName',
      header: 'Full Name',
      sortable: true,
      render: (value, employee) => employee ? (
        <div>
          <div className="employee-name">{value || '-'}</div>
          {employee.preferredName && (
            <div className="employee-preferred-name">({employee.preferredName})</div>
          )}
        </div>
      ) : '-'
    },
    {
      key: 'workEmail',
      header: 'Email',
      sortable: true
    },
    {
      key: 'departmentName',
      header: 'Department',
      sortable: true,
      filterable: true
    },
    {
      key: 'jobTitle',
      header: 'Job Title',
      sortable: true
    },
    {
      key: 'employmentStatus',
      header: 'Status',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span className={`status-badge status-${value?.toLowerCase()}`}>
          {value}
        </span>
      )
    },
    {
      key: 'employmentType',
      header: 'Type',
      sortable: true,
      filterable: true,
      render: (value) => (
        <span className={`type-badge type-${value?.toLowerCase()}`}>
          {value?.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'hireDate',
      header: 'Hire Date',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : ''
    },
  ];

  const actionsColumn: ColumnDefinition<EmployeeResponse> = {
    key: 'actions' as keyof EmployeeResponse,
    header: 'Actions',
    render: (value, employee) => employee ? (
      <div className="action-buttons">
        {onViewEmployee && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onViewEmployee(employee)}
          >
            View
          </Button>
        )}
        {onEditEmployee && hasPermission('employees', 'update') && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onEditEmployee(employee)}
          >
            Edit
          </Button>
        )}
        {onDeleteEmployee && hasPermission('employees', 'delete') && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDeleteEmployee(employee)}
          >
            Delete
          </Button>
        )}
      </div>
    ) : null
  };

  if (showActions) {
    columns.push(actionsColumn);
  }

  return (
    <div className="employee-table">
      <DataTable
        data={employees}
        columns={columns}
        loading={loading}
      />
    </div>
  );
};

export default EmployeeTable;