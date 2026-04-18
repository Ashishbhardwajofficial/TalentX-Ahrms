import React, { useState } from 'react';
import { ExpenseType } from '../../types';
import expenseApi from '../../api/expenseApi';

export interface ExpenseFormData {
  employeeId: number;
  expenseType: ExpenseType;
  amount: number;
  expenseDate: string;
  description?: string;
  receiptUrl?: string;
}

interface ExpenseFormProps {
  initialData?: Partial<ExpenseFormData>;
  onSubmit: (data: ExpenseFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  submitLabel?: string;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  submitLabel = 'Submit Expense'
}) => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    employeeId: initialData?.employeeId || 1, // TODO: Get from context
    expenseType: initialData?.expenseType || ExpenseType.TRAVEL,
    amount: initialData?.amount || 0,
    expenseDate: (initialData?.expenseDate || new Date().toISOString().split('T')[0]) as string,
    description: initialData?.description || '',
    ...(initialData?.receiptUrl && { receiptUrl: initialData.receiptUrl })
  });

  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.expenseType) {
      newErrors.expenseType = 'Expense type is required';
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Expense date is required';
    }

    // Check if expense date is not in the future
    const expenseDate = new Date(formData.expenseDate);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    if (expenseDate > today) {
      newErrors.expenseDate = 'Expense date cannot be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        receipt: 'File size must be less than 5MB'
      }));
      return;
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        receipt: 'Only JPEG, PNG, GIF, and PDF files are allowed'
      }));
      return;
    }

    try {
      setUploadingReceipt(true);
      setErrors(prev => ({
        ...prev,
        receipt: ''
      }));

      const response = await expenseApi.uploadReceipt(file);
      setFormData(prev => ({
        ...prev,
        receiptUrl: response.url
      }));
    } catch (err: any) {
      setErrors(prev => ({
        ...prev,
        receipt: err.message || 'Failed to upload receipt'
      }));
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const formatExpenseType = (type: ExpenseType) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Expense Type */}
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
            border: `1px solid ${errors.expenseType ? '#dc3545' : '#ccc'}`,
            borderRadius: '4px',
            backgroundColor: 'white'
          }}
        >
          <option value={ExpenseType.TRAVEL}>{formatExpenseType(ExpenseType.TRAVEL)}</option>
          <option value={ExpenseType.FOOD}>{formatExpenseType(ExpenseType.FOOD)}</option>
          <option value={ExpenseType.ACCOMMODATION}>{formatExpenseType(ExpenseType.ACCOMMODATION)}</option>
          <option value={ExpenseType.OFFICE}>{formatExpenseType(ExpenseType.OFFICE)}</option>
          <option value={ExpenseType.OTHER}>{formatExpenseType(ExpenseType.OTHER)}</option>
        </select>
        {errors.expenseType && (
          <span style={{ color: '#dc3545', fontSize: '14px' }}>{errors.expenseType}</span>
        )}
      </div>

      {/* Amount */}
      <div>
        <label htmlFor="amount" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Amount ($) *
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
          placeholder="0.00"
          style={{
            width: '100%',
            padding: '8px',
            border: `1px solid ${errors.amount ? '#dc3545' : '#ccc'}`,
            borderRadius: '4px'
          }}
        />
        {errors.amount && (
          <span style={{ color: '#dc3545', fontSize: '14px' }}>{errors.amount}</span>
        )}
      </div>

      {/* Expense Date */}
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
          max={new Date().toISOString().split('T')[0]} // Prevent future dates
          style={{
            width: '100%',
            padding: '8px',
            border: `1px solid ${errors.expenseDate ? '#dc3545' : '#ccc'}`,
            borderRadius: '4px'
          }}
        />
        {errors.expenseDate && (
          <span style={{ color: '#dc3545', fontSize: '14px' }}>{errors.expenseDate}</span>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleInputChange}
          placeholder="Describe the expense (optional)..."
          rows={3}
          maxLength={500}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            resize: 'vertical',
            fontFamily: 'inherit'
          }}
        />
        <div style={{ textAlign: 'right', fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
          {(formData.description || '').length}/500 characters
        </div>
      </div>

      {/* Receipt Upload */}
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
            border: `1px solid ${errors.receipt ? '#dc3545' : '#ccc'}`,
            borderRadius: '4px',
            backgroundColor: uploadingReceipt ? '#f8f9fa' : 'white'
          }}
        />
        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
          Supported formats: JPEG, PNG, GIF, PDF (max 5MB)
        </div>

        {uploadingReceipt && (
          <div style={{ color: '#007bff', fontSize: '14px', marginTop: '8px' }}>
            <span>📤 Uploading receipt...</span>
          </div>
        )}

        {formData.receiptUrl && (
          <div style={{ color: '#28a745', fontSize: '14px', marginTop: '8px' }}>
            <span>✅ Receipt uploaded successfully! </span>
            <a
              href={formData.receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              View Receipt
            </a>
          </div>
        )}

        {errors.receipt && (
          <span style={{ color: '#dc3545', fontSize: '14px', display: 'block', marginTop: '4px' }}>
            {errors.receipt}
          </span>
        )}
      </div>

      {/* Form Actions */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px solid #e9ecef'
      }}>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading || uploadingReceipt}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || uploadingReceipt ? 'not-allowed' : 'pointer',
            opacity: loading || uploadingReceipt ? 0.6 : 1
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || uploadingReceipt}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading || uploadingReceipt ? 'not-allowed' : 'pointer',
            opacity: loading || uploadingReceipt ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {loading && <span>⏳</span>}
          {submitLabel}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm;