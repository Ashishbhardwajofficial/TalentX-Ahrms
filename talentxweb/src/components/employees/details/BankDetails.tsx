import React, { useState, useEffect } from 'react';
import bankDetailsApi, { BankDetailsDTO, BankDetailsCreateDTO, BankDetailsUpdateDTO } from '../../../api/bankDetailsApi';
import { BankAccountType } from '../../../types';
import Button from '../../common/Button';
import FormField from '../../common/FormField';
import LoadingSpinner from '../../common/LoadingSpinner';

interface BankDetailsProps {
    employeeId: number;
}

const BankDetails: React.FC<BankDetailsProps> = ({ employeeId }) => {
    const [bankDetails, setBankDetails] = useState<BankDetailsDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [formData, setFormData] = useState<BankDetailsCreateDTO>({
        employeeId,
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        accountType: BankAccountType.SAVINGS,
        isPrimary: false
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (employeeId) {
            fetchBankDetails();
        }
    }, [employeeId]);

    const fetchBankDetails = async () => {
        try {
            setLoading(true);
            const response = await bankDetailsApi.getEmployeeBankDetails(employeeId);
            setBankDetails(response.content);
            setError(null);
        } catch (err) {
            console.error('Error fetching bank details:', err);
            setError('Failed to load bank details');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (detail: BankDetailsDTO) => {
        setEditingId(detail.id);
        setFormData({
            employeeId,
            bankName: detail.bankName,
            accountNumber: detail.accountNumber,
            ifscCode: detail.ifscCode ?? '',
            branchName: detail.branchName ?? '',
            accountType: detail.accountType,
            isPrimary: detail.isPrimary
        });
        setShowForm(true);
        setFormErrors({});
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this bank account?')) return;

        try {
            setSubmitting(true); // Reuse submitting state for delete loading indication if needed, or use separate
            await bankDetailsApi.deleteBankDetails(id);
            await fetchBankDetails();
        } catch (err) {
            console.error('Error deleting bank details:', err);
            setError('Failed to delete bank account');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetPrimary = async (id: number) => {
        try {
            // Optimistic update could go here, but let's just reload
            await bankDetailsApi.setPrimaryBankAccount(id);
            await fetchBankDetails();
        } catch (err) {
            console.error('Error setting primary bank account:', err);
            setError('Failed to set primary bank account');
        }
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.bankName.trim()) errors.bankName = 'Bank Name is required';
        if (!formData.accountNumber.trim()) errors.accountNumber = 'Account Number is required';
        if (!formData.accountType) errors.accountType = 'Account Type is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);

            // Prepare payload - omitting undefined/empty strings if strict types required
            // But API DTOs align with state here mostly. 
            // ifscCode and branchName are optional strings in DTO.

            const payload: any = {
                ...formData,
                ifscCode: formData.ifscCode || undefined,
                branchName: formData.branchName || undefined
            };

            if (editingId) {
                await bankDetailsApi.updateBankDetails(editingId, payload as BankDetailsUpdateDTO);
            } else {
                await bankDetailsApi.createBankDetails(payload);
            }

            await fetchBankDetails();
            closeForm();
        } catch (err) {
            console.error('Error saving bank details:', err);
            setError('Failed to save bank details'); // Show global error or form error?
        } finally {
            setSubmitting(false);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            employeeId,
            bankName: '',
            accountNumber: '',
            ifscCode: '',
            branchName: '',
            accountType: BankAccountType.SAVINGS,
            isPrimary: false
        });
        setFormErrors({});
    };

    if (loading && !showForm) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-secondary-900">Bank Accounts</h3>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} size="sm" variant="outline">
                        + Add Account
                    </Button>
                )}
            </div>

            {error && (
                <div className="bg-danger-50 text-danger-700 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {showForm ? (
                <div className="bg-secondary-50 p-6 rounded-xl border border-secondary-200 animate-fadeIn">
                    <h4 className="font-semibold text-secondary-800 mb-4">
                        {editingId ? 'Edit Bank Account' : 'Add Bank Account'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Bank Name"
                                name="bankName"
                                value={formData.bankName}
                                onChange={val => setFormData(prev => ({ ...prev, bankName: val }))}
                                error={formErrors.bankName}
                                required
                            />
                            <FormField
                                label="Account Number"
                                name="accountNumber"
                                value={formData.accountNumber}
                                onChange={val => setFormData(prev => ({ ...prev, accountNumber: val }))}
                                error={formErrors.accountNumber}
                                required
                            />
                            <FormField
                                label="IFSC Code"
                                name="ifscCode"
                                value={formData.ifscCode}
                                onChange={val => setFormData(prev => ({ ...prev, ifscCode: val }))}
                                placeholder="Optional"
                            />
                            <FormField
                                label="Branch Name"
                                name="branchName"
                                value={formData.branchName}
                                onChange={val => setFormData(prev => ({ ...prev, branchName: val }))}
                                placeholder="Optional"
                            />
                            <FormField
                                label="Account Type"
                                name="accountType"
                                type="select"
                                value={formData.accountType}
                                onChange={val => setFormData(prev => ({ ...prev, accountType: val }))}
                                options={Object.values(BankAccountType).map(t => ({ value: t, label: t.replace(/_/g, ' ') }))}
                                required
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isPrimary"
                                checked={formData.isPrimary}
                                onChange={e => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                                className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                            />
                            <label htmlFor="isPrimary" className="text-sm font-medium text-secondary-700">
                                Set as primary account
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={closeForm} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={submitting}>
                                {editingId ? 'Update Account' : 'Add Account'}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {bankDetails.length === 0 ? (
                        <div className="text-center py-8 text-secondary-500 bg-secondary-50 rounded-lg border border-dashed border-secondary-200">
                            No bank accounts found
                        </div>
                    ) : (
                        bankDetails.map(detail => (
                            <div
                                key={detail.id}
                                className={`p-4 rounded-lg border transition-all duration-200 ${detail.isPrimary
                                    ? 'bg-primary-50 border-primary-200 shadow-sm'
                                    : 'bg-white border-secondary-200 hover:border-secondary-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-secondary-900">{detail.bankName}</h4>
                                            {detail.isPrimary && (
                                                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-secondary-600 mt-1 font-mono">
                                            {detail.maskedAccountNumber || detail.accountNumber}
                                        </p>
                                        <div className="flex gap-4 mt-2 text-xs text-secondary-500">
                                            <span>{detail.accountType.replace(/_/g, ' ')}</span>
                                            {detail.ifscCode && <span>IFSC: {detail.ifscCode}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!detail.isPrimary && (
                                            <button
                                                onClick={() => handleSetPrimary(detail.id)}
                                                className="text-xs font-medium text-primary-600 hover:text-primary-800"
                                            >
                                                Set Primary
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(detail)}
                                            className="p-1 text-secondary-400 hover:text-primary-600 transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(detail.id)}
                                            className="p-1 text-secondary-400 hover:text-danger-600 transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default BankDetails;
