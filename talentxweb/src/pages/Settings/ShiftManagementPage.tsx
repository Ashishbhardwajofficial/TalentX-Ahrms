import React, { useState, useEffect } from 'react';
import shiftApi, {
  ShiftDTO,
  ShiftCreateDTO,
  ShiftUpdateDTO,
  EmployeeShiftDTO,
  ShiftAssignmentDTO
} from '../../api/shiftApi';
import employeeApi, { EmployeeResponse } from '../../api/employeeApi';
import { Employee } from '../../types';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { useAuth } from '../../hooks/useAuth';

const ShiftManagementPage: React.FC = () => {
  const { user } = useAuth();
  const orgId = user?.organizationId ?? 1;
  const [shifts, setShifts] = useState<ShiftDTO[]>([]);
  const [employees, setEmployees] = useState<EmployeeResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<ShiftDTO | null>(null);
  const [selectedShift, setSelectedShift] = useState<ShiftDTO | null>(null);
  const [shiftAssignments, setShiftAssignments] = useState<EmployeeShiftDTO[]>([]);
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Shift form state
  const [shiftFormData, setShiftFormData] = useState<ShiftCreateDTO>({
    organizationId: orgId,
    name: '',
    startTime: '09:00',
    endTime: '17:00',
    breakMinutes: 60,
    isNightShift: false
  });

  // Assignment form state
  const [assignmentFormData, setAssignmentFormData] = useState<ShiftAssignmentDTO>({
    employeeId: 0,
    shiftId: 0,
    effectiveFrom: new Date().toISOString().substring(0, 10)
  });


  useEffect(() => {
    loadShifts();
    loadEmployees();
  }, [pagination.page, pagination.size]);

  const loadShifts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shiftApi.getShifts({
        page: pagination.page - 1,
        size: pagination.size,
        organizationId: orgId
      });
      setShifts(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load shifts');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getEmployees({
        page: 0,
        size: 1000
      });
      setEmployees(response.content);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
    }
  };

  const loadShiftAssignments = async (shiftId: number) => {
    try {
      const response = await shiftApi.getShiftAssignments({
        shiftId,
        page: 0,
        size: 100
      });
      setShiftAssignments(response.content);
    } catch (err: any) {
      console.error('Failed to load shift assignments:', err);
    }
  };

  const handleCreateShift = () => {
    setEditingShift(null);
    setShiftFormData({
      organizationId: orgId,
      name: '',
      startTime: '09:00',
      endTime: '17:00',
      breakMinutes: 60,
      isNightShift: false
    });
    setIsShiftModalOpen(true);
  };

  const handleEditShift = (shift: ShiftDTO) => {
    setEditingShift(shift);
    setShiftFormData({
      organizationId: shift.organizationId,
      name: shift.name,
      startTime: shift.startTime,
      endTime: shift.endTime,
      breakMinutes: shift.breakMinutes,
      isNightShift: shift.isNightShift
    });
    setIsShiftModalOpen(true);
  };

  const handleDeleteShift = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this shift?')) {
      return;
    }

    try {
      await shiftApi.deleteShift(id);
      loadShifts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete shift');
    }
  };

  const handleAssignShift = (shift: ShiftDTO) => {
    setSelectedShift(shift);
    setAssignmentFormData({
      employeeId: 0,
      shiftId: shift.id,
      effectiveFrom: new Date().toISOString().substring(0, 10)
    });
    setConflictWarning(null);
    setIsAssignmentModalOpen(true);
  };

  const handleViewCalendar = async (shift: ShiftDTO) => {
    setSelectedShift(shift);
    await loadShiftAssignments(shift.id);
    setIsCalendarModalOpen(true);
  };

  const handleShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingShift) {
        const updateData: ShiftUpdateDTO = {
          name: shiftFormData.name,
          startTime: shiftFormData.startTime,
          endTime: shiftFormData.endTime,
          breakMinutes: shiftFormData.breakMinutes,
          isNightShift: shiftFormData.isNightShift
        };
        await shiftApi.updateShift(editingShift.id, updateData);
      } else {
        await shiftApi.createShift(shiftFormData);
      }
      setIsShiftModalOpen(false);
      loadShifts();
    } catch (err: any) {
      setError(err.message || 'Failed to save shift');
    }
  };

  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setConflictWarning(null);

    try {
      const conflictCheck = await shiftApi.checkShiftConflict(
        assignmentFormData.employeeId,
        assignmentFormData.effectiveFrom,
        assignmentFormData.effectiveTo
      );

      if (conflictCheck.hasConflict) {
        setConflictWarning(
          conflictCheck.message ||
          'This employee already has a shift assignment for the selected date range.'
        );
        return;
      }

      await shiftApi.assignShift(assignmentFormData);
      setIsAssignmentModalOpen(false);
      loadShifts();
    } catch (err: any) {
      setError(err.message || 'Failed to assign shift');
    }
  };

  const handleShiftInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setShiftFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }));
  };

  const handleAssignmentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAssignmentFormData(prev => ({
      ...prev,
      [name]: name === 'employeeId' || name === 'shiftId' ? parseInt(value) : value
    }));
    setConflictWarning(null);
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours || '0', 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes || '00'} ${ampm}`;
  };

  const calculateShiftDuration = (startTime: string, endTime: string, breakMinutes: number): string => {
    const startParts = startTime.split(':');
    const endParts = endTime.split(':');

    const startHour = parseInt(startParts[0] || '0', 10);
    const startMin = parseInt(startParts[1] || '0', 10);
    const endHour = parseInt(endParts[0] || '0', 10);
    const endMin = parseInt(endParts[1] || '0', 10);

    let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    if (totalMinutes < 0) totalMinutes += 24 * 60;

    const workMinutes = totalMinutes - breakMinutes;
    const hours = Math.floor(workMinutes / 60);
    const minutes = workMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  const shiftColumns: ColumnDefinition<ShiftDTO>[] = [
    {
      key: 'name',
      header: 'Shift Name',
      sortable: true
    },
    {
      key: 'startTime',
      header: 'Start Time',
      render: (value) => formatTime(value as string)
    },
    {
      key: 'endTime',
      header: 'End Time',
      render: (value) => formatTime(value as string)
    },
    {
      key: 'breakMinutes',
      header: 'Break',
      render: (value) => `${value} min`
    },
    {
      key: 'id',
      header: 'Duration',
      render: (_, shift) => calculateShiftDuration(shift.startTime, shift.endTime, shift.breakMinutes)
    },
    {
      key: 'isNightShift',
      header: 'Type',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: value ? '#343a40' : '#ffc107',
          color: value ? 'white' : '#000',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {value ? '🌙 Night' : '☀️ Day'}
        </span>
      )
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, shift) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleViewCalendar(shift)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#17a2b8',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="View Calendar"
          >
            📅 Calendar
          </button>
          <button
            onClick={() => handleAssignShift(shift)}
            style={{
              padding: '4px 8px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Assign to Employee"
          >
            👤 Assign
          </button>
          <button
            onClick={() => handleEditShift(shift)}
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
            onClick={() => handleDeleteShift(shift.id)}
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

  const assignmentColumns: ColumnDefinition<EmployeeShiftDTO>[] = [
    {
      key: 'employeeName',
      header: 'Employee',
      sortable: true
    },
    {
      key: 'effectiveFrom',
      header: 'Start Date',
      render: (value) => new Date(value as string).toLocaleDateString()
    },
    {
      key: 'effectiveTo',
      header: 'End Date',
      render: (value) => value ? new Date(value as string).toLocaleDateString() : 'Ongoing'
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: value ? '#d4edda' : '#f8d7da',
          color: value ? '#155724' : '#721c24',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Shift Management</h1>
        <button
          onClick={handleCreateShift}
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
          + Create Shift
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
        data={shifts}
        columns={shiftColumns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      <Modal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        title={editingShift ? 'Edit Shift' : 'Create Shift'}
        size="md"
      >
        <form onSubmit={handleShiftSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="name" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Shift Name *
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={shiftFormData.name}
              onChange={handleShiftInputChange}
              required
              placeholder="e.g., Morning Shift, Night Shift"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="startTime" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Start Time *
              </label>
              <input
                id="startTime"
                name="startTime"
                type="time"
                value={shiftFormData.startTime}
                onChange={handleShiftInputChange}
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
              <label htmlFor="endTime" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                End Time *
              </label>
              <input
                id="endTime"
                name="endTime"
                type="time"
                value={shiftFormData.endTime}
                onChange={handleShiftInputChange}
                required
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
            <label htmlFor="breakMinutes" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Break Duration (minutes) *
            </label>
            <input
              id="breakMinutes"
              name="breakMinutes"
              type="number"
              min="0"
              max="480"
              value={shiftFormData.breakMinutes}
              onChange={handleShiftInputChange}
              required
              placeholder="e.g., 60"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
              Total break time during the shift (typically 30-60 minutes)
            </p>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="isNightShift"
                checked={shiftFormData.isNightShift}
                onChange={handleShiftInputChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 'bold' }}>Night Shift</span>
            </label>
            <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px', marginLeft: '26px' }}>
              Mark this shift as a night shift
            </p>
          </div>

          <div style={{
            padding: '12px',
            backgroundColor: '#e7f3ff',
            border: '1px solid #b3d9ff',
            borderRadius: '4px'
          }}>
            <strong>Shift Duration:</strong>{' '}
            {calculateShiftDuration(shiftFormData.startTime, shiftFormData.endTime, shiftFormData.breakMinutes)}
            <div style={{ fontSize: '12px', color: '#495057', marginTop: '4px' }}>
              {formatTime(shiftFormData.startTime)} - {formatTime(shiftFormData.endTime)}
              {' '}(Break: {shiftFormData.breakMinutes} min)
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsShiftModalOpen(false)}
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
              {editingShift ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        title={selectedShift ? `Assign ${selectedShift.name}` : 'Assign Shift'}
        size="md"
      >
        <form onSubmit={handleAssignmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedShift && (
            <div style={{
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '4px',
              border: '1px solid #dee2e6'
            }}>
              <strong>{selectedShift.name}</strong>
              <div style={{ fontSize: '14px', color: '#6c757d', marginTop: '4px' }}>
                {formatTime(selectedShift.startTime)} - {formatTime(selectedShift.endTime)}
                {' '}• Break: {selectedShift.breakMinutes} min
                {' '}• {selectedShift.isNightShift ? '🌙 Night Shift' : '☀️ Day Shift'}
              </div>
            </div>
          )}

          {conflictWarning && (
            <div style={{
              padding: '12px',
              backgroundColor: '#fff3cd',
              color: '#856404',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span>{conflictWarning}</span>
            </div>
          )}

          <div>
            <label htmlFor="employeeId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Employee *
            </label>
            <select
              id="employeeId"
              name="employeeId"
              value={assignmentFormData.employeeId}
              onChange={handleAssignmentInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={0}>Select Employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} - {emp.employeeNumber}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="effectiveFrom" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Effective From *
              </label>
              <input
                id="effectiveFrom"
                name="effectiveFrom"
                type="date"
                value={assignmentFormData.effectiveFrom}
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

            <div>
              <label htmlFor="effectiveTo" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Effective To
              </label>
              <input
                id="effectiveTo"
                name="effectiveTo"
                type="date"
                value={assignmentFormData.effectiveTo || ''}
                onChange={handleAssignmentInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <p style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                Leave empty for ongoing assignment
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsAssignmentModalOpen(false)}
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
              Assign Shift
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        title={selectedShift ? `${selectedShift.name} - Employee Assignments` : 'Shift Assignments'}
        size="lg"
      >
        {selectedShift && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px' }}>
                {selectedShift.name}
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '14px' }}>
                <div>
                  <strong>Start Time:</strong> {formatTime(selectedShift.startTime)}
                </div>
                <div>
                  <strong>End Time:</strong> {formatTime(selectedShift.endTime)}
                </div>
                <div>
                  <strong>Break:</strong> {selectedShift.breakMinutes} minutes
                </div>
                <div>
                  <strong>Duration:</strong> {calculateShiftDuration(selectedShift.startTime, selectedShift.endTime, selectedShift.breakMinutes)}
                </div>
                <div>
                  <strong>Type:</strong> {selectedShift.isNightShift ? '🌙 Night Shift' : '☀️ Day Shift'}
                </div>
                <div>
                  <strong>Assigned Employees:</strong> {shiftAssignments.length}
                </div>
              </div>
            </div>

            {shiftAssignments.length > 0 ? (
              <DataTable
                data={shiftAssignments}
                columns={assignmentColumns}
                loading={false}
                pagination={{ page: 1, size: shiftAssignments.length, total: shiftAssignments.length }}
                onPageChange={() => { }}
                onPageSizeChange={() => { }}
              />
            ) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
                <h4 style={{ margin: '0 0 8px 0', color: '#495057' }}>No Assignments Yet</h4>
                <p style={{ margin: 0, color: '#6c757d' }}>
                  This shift hasn't been assigned to any employees yet.
                </p>
                <button
                  onClick={() => {
                    setIsCalendarModalOpen(false);
                    handleAssignShift(selectedShift);
                  }}
                  style={{
                    marginTop: '16px',
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Assign to Employee
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShiftManagementPage;
