import React, { useState, useEffect } from 'react';
import expenseApi, { ExpenseDTO, ExpenseCreateDTO, ExpenseRejectDTO, ExpensePaymentDTO, ExpenseApproveDTO } from '../../api/expenseApi';
import DataTable, { ColumnDefinition } from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import { ExpenseType, ExpenseStatus } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const ExpenseManagementPage: React.FC = () => {
  const { user } = useAuth();
  const currentEmployeeId = user?.id ?? 1;
  const [expenses, setExpenses] = useState<ExpenseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseDTO | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseDTO | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    total: 0
  });

  // Form state
  const today = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState<ExpenseCreateDTO>({
    employeeId: currentEmployeeId,
    expenseType: ExpenseType.TRAVEL,
    amount: 0,
    expenseDate: today,
    description: ''
  });

  // Filter state
  const [filters, setFilters] = useState({
    expenseType: '',
    status: '',
    employeeId: '',
    startDate: '',
    endDate: '',
    search: ''
  });

  // Receipt upload state
  const [uploadingReceipt, setUploadingReceipt] = useState(false);


  useEffect(() => {
    loadExpenses();
  }, [pagination.page, pagination.size, filters]);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await expenseApi.getExpenses({
        page: pagination.page - 1, // Backend uses 0-based indexing
        size: pagination.size,
        ...(filters.expenseType && { expenseType: filters.expenseType as ExpenseType }),
        ...(filters.status && { status: filters.status as ExpenseStatus }),
        ...(filters.employeeId && { employeeId: parseInt(filters.employeeId) }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search })
      });
      setExpenses(response.content);
      setPagination(prev => ({
        ...prev,
        total: response.totalElements
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingExpense(null);
    const today = new Date().toISOString().slice(0, 10);
    setFormData({
      employeeId: currentEmployeeId,
      expenseType: ExpenseType.TRAVEL,
      amount: 0,
      expenseDate: today,
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (expense: ExpenseDTO) => {
    setEditingExpense(expense);
    setFormData({
      employeeId: expense.employeeId,
      expenseType: expense.expenseType,
      amount: expense.amount || 0,
      expenseDate: (expense.expenseDate || new Date().toISOString().split('T')[0]) as string,
      receiptUrl: expense.receiptUrl,
      description: ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      await expenseApi.deleteExpense(id);
      loadExpenses();
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (editingExpense) {
        await expenseApi.updateExpense(editingExpense.id, formData);
      } else {
        await expenseApi.createExpense(formData);
      }
      setIsModalOpen(false);
      loadExpenses();
    } catch (err: any) {
      setError(err.message || 'Failed to save expense');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
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

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingReceipt(true);
      const response = await expenseApi.uploadReceipt(file);
      setFormData(prev => ({
        ...prev,
        receiptUrl: response.url
      }));
    } catch (err: any) {
      setError(err.message || 'Failed to upload receipt');
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleApprove = (expense: ExpenseDTO) => {
    setSelectedExpense(expense);
    setIsApprovalModalOpen(true);
  };

  const handleReject = async (expense: ExpenseDTO) => {
    const rejectionComments = window.prompt('Please provide rejection reason:');
    if (!rejectionComments) return;

    try {
      const rejectData: ExpenseRejectDTO = {
        rejectedBy: 1, // TODO: Get from context
        rejectionComments
      };
      await expenseApi.rejectExpense(expense.id, rejectData);
      loadExpenses();
    } catch (err: any) {
      setError(err.message || 'Failed to reject expense');
    }
  };

  const handleMarkAsPaid = async (expense: ExpenseDTO) => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const paymentData: ExpensePaymentDTO = {
        paidBy: 1, // TODO: Get from context
        paymentDate: today,
        paymentMethod: 'Bank Transfer'
      };
      await expenseApi.markAsPaid(expense.id, paymentData);
      loadExpenses();
    } catch (err: any) {
      setError(err.message || 'Failed to mark expense as paid');
    }
  };

  const handleApprovalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExpense) return;

    try {
      const approveData: ExpenseApproveDTO = {
        approvedBy: 1, // TODO: Get from context
        approvalComments: 'Approved'
      };
      await expenseApi.approveExpense(selectedExpense.id, approveData);
      setIsApprovalModalOpen(false);
      setSelectedExpense(null);
      loadExpenses();
    } catch (err: any) {
      setError(err.message || 'Failed to approve expense');
    }
  };

  const getStatusColor = (status: ExpenseStatus) => {
    switch (status) {
      case ExpenseStatus.SUBMITTED:
        return 'orange';
      case ExpenseStatus.APPROVED:
        return 'green';
      case ExpenseStatus.REJECTED:
        return 'red';
      case ExpenseStatus.PAID:
        return 'blue';
      default:
        return 'black';
    }
  };

  const formatCurrency = (amount?: number) => {
    return amount ? `$${amount.toFixed(2)}` : '$0.00';
  };

  const columns: ColumnDefinition<ExpenseDTO>[] = [
    {
      key: 'expenseType',
      header: 'Type',
      render: (value) => value?.replace(/_/g, ' ') ?? '-'
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (value) => formatCurrency(value as number)
    },
    {
      key: 'expenseDate',
      header: 'Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span style={{ color: getStatusColor(value as ExpenseStatus), fontWeight: 'bold' }}>
          {(value as string)?.replace(/_/g, ' ') ?? '-'}
        </span>
      )
    },
    {
      key: 'receiptUrl',
      header: 'Receipt',
      render: (value) => value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" style={{ color: '#007bff' }}>
          View Receipt
        </a>
      ) : '-'
    },
    {
      key: 'createdAt',
      header: 'Submitted',
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'id',
      header: 'Actions',
      render: (_, expense) => (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {expense.status === ExpenseStatus.SUBMITTED && (
            <>
              <button
                onClick={() => handleApprove(expense)}
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
                onClick={() => handleReject(expense)}
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
                Reject
              </button>
            </>
          )}
          {expense.status === ExpenseStatus.APPROVED && (
            <button
              onClick={() => handleMarkAsPaid(expense)}
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
              Mark Paid
            </button>
          )}
          <button
            onClick={() => handleEdit(expense)}
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
            onClick={() => handleDelete(expense.id)}
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
        <h1>Expense Management</h1>
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
          + Submit Expense
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
            placeholder="Search expenses..."
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
          <label htmlFor="expenseType" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
            Expense Type
          </label>
          <select
            id="expenseType"
            name="expenseType"
            value={filters.expenseType}
            onChange={handleFilterChange}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          >
            <option value="">All Types</option>
            <option value={ExpenseType.TRAVEL}>Travel</option>
            <option value={ExpenseType.FOOD}>Food</option>
            <option value={ExpenseType.ACCOMMODATION}>Accommodation</option>
            <option value={ExpenseType.OFFICE}>Office</option>
            <option value={ExpenseType.OTHER}>Other</option>
          </select>
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
            <option value={ExpenseStatus.SUBMITTED}>Submitted</option>
            <option value={ExpenseStatus.APPROVED}>Approved</option>
            <option value={ExpenseStatus.REJECTED}>Rejected</option>
            <option value={ExpenseStatus.PAID}>Paid</option>
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
        data={expenses}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        onPageSizeChange={(size) => setPagination(prev => ({ ...prev, size, page: 1 }))}
      />

      {/* Create/Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense' : 'Submit Expense'}
        size="md"
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="expenseType" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Expense Type *
            </label>
            <select
              id="expenseType"
              name="expenseType"
              value={formData.expenseType}
              onChange={handleInputChange}
              required
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={ExpenseType.TRAVEL}>Travel</option>
              <option value={ExpenseType.FOOD}>Food</option>
              <option value={ExpenseType.ACCOMMODATION}>Accommodation</option>
              <option value={ExpenseType.OFFICE}>Office</option>
              <option value={ExpenseType.OTHER}>Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="amount" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Amount *
            </label>
            <input
              id="amount"
              name="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
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
            <label htmlFor="expenseDate" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Expense Date *
            </label>
            <input
              id="expenseDate"
              name="expenseDate"
              type="date"
              value={formData.expenseDate}
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
            <label htmlFor="description" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              placeholder="Describe the expense..."
              rows={3}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
          </div>

          <div>
            <label htmlFor="receipt" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
              Receipt
            </label>
            <input
              id="receipt"
              type="file"
              accept="image/*,.pdf"
              onChange={handleReceiptUpload}
              disabled={uploadingReceipt}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            {uploadingReceipt && <p style={{ color: '#007bff', fontSize: '14px' }}>Uploading receipt...</p>}
            {formData.receiptUrl && (
              <p style={{ color: '#28a745', fontSize: '14px' }}>
                Receipt uploaded successfully!
                <a href={formData.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px' }}>
                  View
                </a>
              </p>
            )}
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
              {editingExpense ? 'Update' : 'Submit'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Approval Modal */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        title="Approve Expense"
        size="sm"
      >
        <form onSubmit={handleApprovalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedExpense && (
            <div style={{ padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              <h4>Expense Details</h4>
              <p><strong>Type:</strong> {selectedExpense.expenseType?.replace(/_/g, ' ') ?? '-'}</p>
              <p><strong>Amount:</strong> {formatCurrency(selectedExpense.amount)}</p>
              <p><strong>Date:</strong> {selectedExpense.expenseDate ? new Date(selectedExpense.expenseDate).toLocaleDateString() : '-'}</p>
            </div>
          )}

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
              Approve
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ExpenseManagementPage;