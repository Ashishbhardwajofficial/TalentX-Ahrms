import React, { useState, useEffect } from 'react';
import trainingApi, {
  TrainingEnrollmentDTO,
  TrainingEnrollmentCreateDTO,
  TrainingEnrollmentCompleteDTO,
  TrainingProgramDTO
} from '../../api/trainingApi';
import employeeApi from '../../api/employeeApi';
import {
  TrainingEnrollmentStatus,
  Employee
} from '../../types';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';

const TrainingEnrollmentPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<TrainingEnrollmentDTO[]>([]);
  const [programs, setPrograms] = useState<TrainingProgramDTO[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [completingEnrollment, setCompletingEnrollment] = useState<TrainingEnrollmentDTO | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<TrainingEnrollmentStatus | ''>('');
  const [selectedEmployee, setSelectedEmployee] = useState<number | ''>('');
  const [selectedProgram, setSelectedProgram] = useState<number | ''>('');
  const [showOverdue, setShowOverdue] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Enrollment form state
  const [enrollmentFormData, setEnrollmentFormData] = useState<TrainingEnrollmentCreateDTO>({
    trainingProgramId: 0,
    employeeId: 0,
    dueDate: ''
  });

  // Completion form state
  const today = new Date().toISOString().slice(0, 10);
  const [completionFormData, setCompletionFormData] = useState<TrainingEnrollmentCompleteDTO>({
    completionDate: today,
    certificateUrl: ''
  });

  
  useEffect(() => {
    loadEnrollments();
    loadPrograms();
    loadEmployees();
  }, [pagination.page, pagination.size, selectedStatus, selectedEmployee, selectedProgram, showOverdue, searchQuery]);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: pagination.page - 1, // Backend uses 0-based indexing
        size: pagination.size
      };
      if (selectedStatus) params.status = selectedStatus;
      if (selectedEmployee) params.employeeId = selectedEmployee;
      if (selectedProgram) params.trainingProgramId = selectedProgram;
      if (searchQuery) params.search = searchQuery;

      const response = await trainingApi.getTrainingEnrollments(params);
      setEnrollments(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load training enrollments');
    } finally {
      setLoading(false);
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await trainingApi.getTrainingPrograms({
        page: 0,
        size: 100,
        isActive: true
      });
      setPrograms(response.content);
    } catch (err: any) {
      console.error('Failed to load training programs:', err);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeeApi.getEmployees({
        page: 0,
        size: 100
      });
      setEmployees(response.content);
    } catch (err: any) {
      console.error('Failed to load employees:', err);
    }
  };

  const handleEnroll = () => {
    setEnrollmentFormData({
      trainingProgramId: 0,
      employeeId: 0,
      dueDate: ''
    });
    setIsEnrollModalOpen(true);
  };

  const handleComplete = (enrollment: TrainingEnrollmentDTO) => {
    setCompletingEnrollment(enrollment);
    const today = new Date().toISOString().slice(0, 10);
    setCompletionFormData({
      completionDate: today,
      certificateUrl: ''
    });
    setIsCompleteModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this enrollment?')) {
      return;
    }

    try {
      await trainingApi.deleteTrainingEnrollment(id);
      loadEnrollments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete enrollment');
    }
  };

  const handleEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await trainingApi.createTrainingEnrollment(enrollmentFormData);
      setIsEnrollModalOpen(false);
      loadEnrollments();
    } catch (err: any) {
      setError(err.message || 'Failed to create enrollment');
    }
  };

  const handleCompletionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!completingEnrollment) return;

    try {
      await trainingApi.completeTrainingEnrollment(completingEnrollment.id, completionFormData);
      setIsCompleteModalOpen(false);
      setCompletingEnrollment(null);
      loadEnrollments();
    } catch (err: any) {
      setError(err.message || 'Failed to complete enrollment');
    }
  };

  const handleEnrollmentInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEnrollmentFormData(prev => ({
      ...prev,
      [name]: name.includes('Id') ? (value ? Number(value) : 0) : value
    }));
  };

  const handleCompletionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setCompletionFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : undefined) : value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    loadEnrollments();
  };

  const clearFilters = () => {
    setSelectedStatus('');
    setSelectedEmployee('');
    setSelectedProgram('');
    setShowOverdue(false);
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getStatusColor = (status: TrainingEnrollmentStatus) => {
    switch (status) {
      case TrainingEnrollmentStatus.COMPLETED:
        return { bg: '#d4edda', color: '#155724' };
      case TrainingEnrollmentStatus.IN_PROGRESS:
        return { bg: '#d1ecf1', color: '#0c5460' };
      case TrainingEnrollmentStatus.ENROLLED:
        return { bg: '#fff3cd', color: '#856404' };
      case TrainingEnrollmentStatus.FAILED:
        return { bg: '#f8d7da', color: '#721c24' };
      case TrainingEnrollmentStatus.CANCELLED:
        return { bg: '#f8f9fa', color: '#6c757d' };
      case TrainingEnrollmentStatus.EXPIRED:
        return { bg: '#f5c6cb', color: '#721c24' };
      default:
        return { bg: '#e2e3e5', color: '#383d41' };
    }
  };

  const isOverdue = (enrollment: TrainingEnrollmentDTO) => {
    if (!enrollment.dueDate || enrollment.status === TrainingEnrollmentStatus.COMPLETED) {
      return false;
    }
    return new Date(enrollment.dueDate) < new Date();
  };

  const canComplete = (enrollment: TrainingEnrollmentDTO) => {
    return [TrainingEnrollmentStatus.ENROLLED, TrainingEnrollmentStatus.IN_PROGRESS].includes(enrollment.status);
  };

  const columns: ColumnDefinition<TrainingEnrollmentDTO>[] = [
    {
      key: 'trainingProgramId',
      header: 'Training Program',
      render: (_, enrollment) => (
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
            {enrollment.trainingProgram?.title || `Program ID: ${enrollment.trainingProgramId}`}
          </div>
          {enrollment.trainingProgram?.trainingType && (
            <div style={{ fontSize: '12px', color: '#6c757d' }}>
              {enrollment.trainingProgram.trainingType.replace('_', ' ')}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'employeeId',
      header: 'Employee',
      render: (value) => {
        const employee = employees.find(emp => emp.id === value);
        return employee ? `${employee.firstName} ${employee.lastName}` : `Employee ID: ${value}`;
      }
    },
    {
      key: 'status',
      header: 'Status',
      render: (value, enrollment) => {
        const statusColor = getStatusColor(value);
        const overdue = isOverdue(enrollment);

        return (
          <div>
            <span style={{
              padding: '4px 8px',
              backgroundColor: statusColor.bg,
              color: statusColor.color,
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {value.replace('_', ' ')}
            </span>
            {overdue && (
              <div style={{
                fontSize: '10px',
                color: '#dc3545',
                fontWeight: 'bold',
                marginTop: '2px'
              }}>
                OVERDUE
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'enrolledDate',
      header: 'Enrolled',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'dueDate',
      header: 'Due Date',
      sortable: true,
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'completionDate',
      header: 'Completed',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'score',
      header: 'Score',
      render: (value, enrollment) => {
        if (!value) return '-';
        const passingScore = enrollment.passingScore || 70;
        const passed = value >= passingScore;
        return (
          <span style={{
            color: passed ? '#28a745' : '#dc3545',
            fontWeight: 'bold'
          }}>
            {value}%
          </span>
        );
      }
    },
    {
      key: 'certificateUrl',
      header: 'Certificate',
      render: (value) => value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#007bff',
            textDecoration: 'none',
            fontSize: '12px'
          }}
        >
          View Certificate
        </a>
      ) : '-'
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, enrollment) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          {canComplete(enrollment) && (
            <button
              onClick={() => handleComplete(enrollment)}
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
              Complete
            </button>
          )}
          <button
            onClick={() => handleDelete(enrollment.id)}
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
        <h1>Training Enrollments</h1>
        <button
          onClick={handleEnroll}
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
          + Enroll Employee
        </button>
      </div>

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
              Search Enrollments
            </label>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search enrollments..."
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
            <label htmlFor="statusFilter" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Status
            </label>
            <select
              id="statusFilter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as TrainingEnrollmentStatus | '')}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value="">All Statuses</option>
              {Object.values(TrainingEnrollmentStatus).map(status => (
                <option key={status} value={status}>
                  {status.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div style={{ minWidth: '200px' }}>
            <label htmlFor="employeeFilter" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Employee
            </label>
            <select
              id="employeeFilter"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value ? Number(e.target.value) : '')}
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

          <div style={{ minWidth: '200px' }}>
            <label htmlFor="programFilter" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Training Program
            </label>
            <select
              id="programFilter"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value ? Number(e.target.value) : '')}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value="">All Programs</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>
                  {program.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="overdueFilter"
              type="checkbox"
              checked={showOverdue}
              onChange={(e) => setShowOverdue(e.target.checked)}
              style={{ transform: 'scale(1.2)' }}
            />
            <label htmlFor="overdueFilter" style={{ fontWeight: 'bold' }}>
              Show Overdue Only
            </label>
          </div>

          {(selectedStatus || selectedEmployee || selectedProgram || showOverdue || searchQuery) && (
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
        data={enrollments}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      {/* Enrollment Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll Employee in Training"
        size="md"
      >
        <form onSubmit={handleEnrollmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="trainingProgramId" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Training Program *
            </label>
            <select
              id="trainingProgramId"
              name="trainingProgramId"
              value={enrollmentFormData.trainingProgramId}
              onChange={handleEnrollmentInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={0}>Select a training program</option>
              {programs.map(program => (
                <option key={program.id} value={program.id}>
                  {program.title} ({program.trainingType.replace('_', ' ')})
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
              value={enrollmentFormData.employeeId}
              onChange={handleEnrollmentInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={0}>Select an employee</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName} - {employee.jobTitle}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label htmlFor="startDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Start Date
              </label>
              <input
                id="startDate"
                name="startDate"
                type="date"
                value={enrollmentFormData.startDate}
                onChange={handleEnrollmentInputChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>

            <div>
              <label htmlFor="dueDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
                Due Date
              </label>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                value={enrollmentFormData.dueDate}
                onChange={handleEnrollmentInputChange}
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
              onClick={() => setIsEnrollModalOpen(false)}
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
              Enroll
            </button>
          </div>
        </form>
      </Modal>

      {/* Completion Modal */}
      <Modal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        title="Complete Training"
        size="md"
      >
        {completingEnrollment && (
          <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <strong>Training Program:</strong> {completingEnrollment.trainingProgram?.title}<br />
            <strong>Employee:</strong> {employees.find(emp => emp.id === completingEnrollment.employeeId)?.firstName} {employees.find(emp => emp.id === completingEnrollment.employeeId)?.lastName}
          </div>
        )}

        <form onSubmit={handleCompletionSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="completionDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Completion Date *
            </label>
            <input
              id="completionDate"
              name="completionDate"
              type="date"
              value={completionFormData.completionDate}
              onChange={handleCompletionInputChange}
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
            <label htmlFor="score" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Score (%)
            </label>
            <input
              id="score"
              name="score"
              type="number"
              min="0"
              max="100"
              value={completionFormData.score || ''}
              onChange={handleCompletionInputChange}
              placeholder="e.g., 85"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div>
            <label htmlFor="certificateUrl" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Certificate URL
            </label>
            <input
              id="certificateUrl"
              name="certificateUrl"
              type="url"
              value={completionFormData.certificateUrl}
              onChange={handleCompletionInputChange}
              placeholder="https://example.com/certificate.pdf"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <small style={{ color: '#6c757d', fontSize: '12px' }}>
              Link to the completion certificate
            </small>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => setIsCompleteModalOpen(false)}
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
              Complete Training
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TrainingEnrollmentPage;