import React, { useState, useEffect } from 'react';
import employeeAddressApi, { EmployeeAddressDTO, EmployeeAddressCreateDTO, EmployeeAddressUpdateDTO } from '../../../api/employeeAddressApi';
import Button from '../../common/Button';
import FormField from '../../common/FormField';
import LoadingSpinner from '../../common/LoadingSpinner';

interface EmployeeAddressesProps {
    employeeId: number;
}

const EmployeeAddresses: React.FC<EmployeeAddressesProps> = ({ employeeId }) => {
    const [addresses, setAddresses] = useState<EmployeeAddressDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState<EmployeeAddressCreateDTO>({
        employeeId,
        addressType: 'HOME',
        addressLine1: '',
        addressLine2: '',
        city: '',
        stateProvince: '',
        postalCode: '',
        country: '',
        isPrimary: false,
        isCurrent: true
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (employeeId) {
            fetchAddresses();
        }
    }, [employeeId]);

    const fetchAddresses = async () => {
        try {
            setLoading(true);
            const response = await employeeAddressApi.getAddressesByEmployee(employeeId);
            setAddresses(response.content);
            setError(null);
        } catch (err) {
            console.error('Error fetching addresses:', err);
            setError('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (address: EmployeeAddressDTO) => {
        setEditingId(address.id);
        setFormData({
            employeeId,
            addressType: address.addressType,
            addressLine1: address.addressLine1 ?? '',
            addressLine2: address.addressLine2 ?? '',
            city: address.city ?? '',
            stateProvince: address.stateProvince ?? '',
            postalCode: address.postalCode ?? '',
            country: address.country ?? '',
            isPrimary: address.isPrimary,
            isCurrent: address.isCurrent
        });
        setShowForm(true);
        setFormErrors({});
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            setSubmitting(true);
            await employeeAddressApi.deleteEmployeeAddress(id);
            await fetchAddresses();
        } catch (err) {
            console.error('Error deleting address:', err);
            setError('Failed to delete address');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetPrimary = async (id: number) => {
        try {
            await employeeAddressApi.setPrimaryAddress(id);
            await fetchAddresses();
        } catch (err) {
            console.error('Error setting primary address:', err);
            setError('Failed to set primary address');
        }
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.addressType) errors.addressType = 'Address Type is required';

        // Some validation for address lines if needed, typically addressLine1 is required
        // But let's check if the API strictly requires it. API DTO says optional in TS interface?
        // DTO: addressLine1?: string. So it's optional?
        // Usually line 1 is required. I'll enforce it for better data quality.
        if (!formData.addressLine1?.trim()) errors.addressLine1 = 'Address Line 1 is required';
        if (!formData.city?.trim()) errors.city = 'City is required';
        if (!formData.country?.trim()) errors.country = 'Country is required';

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            setSubmitting(true);

            const payload: any = {
                ...formData,
                // Ensure we send defined values or omit them if API is strict, 
                // but here API likely accepts empty strings or we can sanitize.
                // For optional fields in DTO being UpdateDTO, let's keep it simple.
                addressLine2: formData.addressLine2 || undefined
            };

            if (editingId) {
                await employeeAddressApi.updateEmployeeAddress(editingId, payload as EmployeeAddressUpdateDTO);
            } else {
                await employeeAddressApi.createEmployeeAddress(payload);
            }

            await fetchAddresses();
            closeForm();
        } catch (err) {
            console.error('Error saving address:', err);
            setError('Failed to save address');
        } finally {
            setSubmitting(false);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            employeeId,
            addressType: 'HOME',
            addressLine1: '',
            addressLine2: '',
            city: '',
            stateProvince: '',
            postalCode: '',
            country: '',
            isPrimary: false,
            isCurrent: true
        });
        setFormErrors({});
    };

    const getAddressTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            'HOME': 'Home',
            'WORK': 'Work',
            'MAILING': 'Mailing',
            'PERMANENT': 'Permanent',
            'TEMPORARY': 'Temporary'
        };
        return types[type] || type;
    };

    const formatFullAddress = (address: EmployeeAddressDTO) => {
        const parts = [
            address.addressLine1,
            address.addressLine2,
            address.city,
            address.stateProvince,
            address.postalCode,
            address.country
        ].filter(Boolean);
        return parts.join(', ');
    };

    if (loading && !showForm) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-secondary-900">Address Information</h3>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} size="sm" variant="outline">
                        + Add Address
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
                        {editingId ? 'Edit Address' : 'Add Address'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Address Type"
                                name="addressType"
                                type="select"
                                value={formData.addressType}
                                onChange={val => setFormData(prev => ({ ...prev, addressType: val }))}
                                options={[
                                    { value: 'HOME', label: 'Home' },
                                    { value: 'WORK', label: 'Work' },
                                    { value: 'MAILING', label: 'Mailing' },
                                    { value: 'PERMANENT', label: 'Permanent' },
                                    { value: 'TEMPORARY', label: 'Temporary' }
                                ]}
                                error={formErrors.addressType}
                                required
                            />
                            <FormField
                                label="Address Line 1"
                                name="addressLine1"
                                value={formData.addressLine1}
                                onChange={val => setFormData(prev => ({ ...prev, addressLine1: val }))}
                                error={formErrors.addressLine1}
                                required
                            />
                            <FormField
                                label="Address Line 2"
                                name="addressLine2"
                                value={formData.addressLine2}
                                onChange={val => setFormData(prev => ({ ...prev, addressLine2: val }))}
                            />
                            <FormField
                                label="City"
                                name="city"
                                value={formData.city}
                                onChange={val => setFormData(prev => ({ ...prev, city: val }))}
                                error={formErrors.city}
                                required
                            />
                            <FormField
                                label="State / Province"
                                name="stateProvince"
                                value={formData.stateProvince}
                                onChange={val => setFormData(prev => ({ ...prev, stateProvince: val }))}
                            />
                            <FormField
                                label="Postal Code"
                                name="postalCode"
                                value={formData.postalCode}
                                onChange={val => setFormData(prev => ({ ...prev, postalCode: val }))}
                            />
                            <FormField
                                label="Country"
                                name="country"
                                value={formData.country}
                                onChange={val => setFormData(prev => ({ ...prev, country: val }))}
                                error={formErrors.country}
                                required
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPrimary"
                                    checked={formData.isPrimary}
                                    onChange={e => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="isPrimary" className="text-sm font-medium text-secondary-700">
                                    Set as primary address
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isCurrent"
                                    checked={formData.isCurrent}
                                    onChange={e => setFormData(prev => ({ ...prev, isCurrent: e.target.checked }))}
                                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="isCurrent" className="text-sm font-medium text-secondary-700">
                                    Current address
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={closeForm} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={submitting}>
                                {editingId ? 'Update Address' : 'Add Address'}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {addresses.length === 0 ? (
                        <div className="text-center py-8 text-secondary-500 bg-secondary-50 rounded-lg border border-dashed border-secondary-200">
                            No addresses found
                        </div>
                    ) : (
                        addresses.map(address => (
                            <div
                                key={address.id}
                                className={`p-4 rounded-lg border transition-all duration-200 ${address.isPrimary
                                    ? 'bg-primary-50 border-primary-200 shadow-sm'
                                    : 'bg-white border-secondary-200 hover:border-secondary-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-secondary-100 text-secondary-700 text-xs font-semibold rounded-md uppercase">
                                                {getAddressTypeLabel(address.addressType)}
                                            </span>
                                            {address.isPrimary && (
                                                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                                                    Primary
                                                </span>
                                            )}
                                            {!address.isCurrent && (
                                                <span className="px-2 py-0.5 bg-warning-100 text-warning-800 text-xs font-semibold rounded-full">
                                                    Inactive
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-secondary-800 text-sm leading-relaxed max-w-lg">
                                            {formatFullAddress(address)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {!address.isPrimary && (
                                            <button
                                                onClick={() => handleSetPrimary(address.id)}
                                                className="text-xs font-medium text-primary-600 hover:text-primary-800"
                                            >
                                                Set Primary
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(address)}
                                            className="p-1 text-secondary-400 hover:text-primary-600 transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(address.id)}
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

export default EmployeeAddresses;
