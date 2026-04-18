import React, { useState, useEffect } from 'react';
import emergencyContactApi, { EmergencyContactDTO, EmergencyContactCreateDTO, EmergencyContactUpdateDTO } from '../../../api/emergencyContactApi';
import Button from '../../common/Button';
import FormField from '../../common/FormField';
import LoadingSpinner from '../../common/LoadingSpinner';

interface EmergencyContactsProps {
    employeeId: number;
}

const EmergencyContacts: React.FC<EmergencyContactsProps> = ({ employeeId }) => {
    const [contacts, setContacts] = useState<EmergencyContactDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState<EmergencyContactCreateDTO>({
        employeeId,
        contactName: '',
        relationship: '',
        primaryPhone: '',
        secondaryPhone: '',
        email: '',
        address: '',
        isPrimary: false,
        canPickUpChildren: false,
        notes: ''
    });

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (employeeId) {
            fetchContacts();
        }
    }, [employeeId]);

    const fetchContacts = async () => {
        try {
            setLoading(true);
            const response = await emergencyContactApi.getContactsByEmployee(employeeId);
            setContacts(response.content);
            setError(null);
        } catch (err) {
            console.error('Error fetching emergency contacts:', err);
            setError('Failed to load emergency contacts');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (contact: EmergencyContactDTO) => {
        setEditingId(contact.id);
        setFormData({
            employeeId,
            contactName: contact.contactName,
            relationship: contact.relationship,
            primaryPhone: contact.primaryPhone ?? '',
            secondaryPhone: contact.secondaryPhone ?? '',
            email: contact.email ?? '',
            address: contact.address ?? '',
            isPrimary: contact.isPrimary,
            canPickUpChildren: contact.canPickUpChildren,
            notes: contact.notes ?? ''
        });
        setShowForm(true);
        setFormErrors({});
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this contact?')) return;

        try {
            setSubmitting(true);
            await emergencyContactApi.deleteEmergencyContact(id);
            await fetchContacts();
        } catch (err) {
            console.error('Error deleting contact:', err);
            setError('Failed to delete contact');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetPrimary = async (id: number) => {
        try {
            await emergencyContactApi.setPrimaryContact(id);
            await fetchContacts();
        } catch (err) {
            console.error('Error setting primary contact:', err);
            setError('Failed to set primary contact');
        }
    };

    const validate = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.contactName.trim()) errors.contactName = 'Contact Name is required';
        if (!formData.relationship.trim()) errors.relationship = 'Relationship is required';
        if (!formData.primaryPhone?.trim()) errors.primaryPhone = 'Primary Phone is required';

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
                primaryPhone: formData.primaryPhone || undefined,
                secondaryPhone: formData.secondaryPhone || undefined,
                email: formData.email || undefined,
                address: formData.address || undefined,
                notes: formData.notes || undefined
            };

            if (editingId) {
                await emergencyContactApi.updateEmergencyContact(editingId, payload as EmergencyContactUpdateDTO);
            } else {
                await emergencyContactApi.createEmergencyContact(payload);
            }

            await fetchContacts();
            closeForm();
        } catch (err) {
            console.error('Error saving contact:', err);
            setError('Failed to save contact');
        } finally {
            setSubmitting(false);
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            employeeId,
            contactName: '',
            relationship: '',
            primaryPhone: '',
            secondaryPhone: '',
            email: '',
            address: '',
            isPrimary: false,
            canPickUpChildren: false,
            notes: ''
        });
        setFormErrors({});
    };

    if (loading && !showForm) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-secondary-900">Emergency Contacts</h3>
                {!showForm && (
                    <Button onClick={() => setShowForm(true)} size="sm" variant="outline">
                        + Add Contact
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
                        {editingId ? 'Edit Contact' : 'Add Contact'}
                    </h4>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                label="Contact Name"
                                name="contactName"
                                value={formData.contactName}
                                onChange={val => setFormData(prev => ({ ...prev, contactName: val }))}
                                error={formErrors.contactName}
                                required
                            />
                            <FormField
                                label="Relationship"
                                name="relationship"
                                value={formData.relationship}
                                onChange={val => setFormData(prev => ({ ...prev, relationship: val }))}
                                error={formErrors.relationship}
                                required
                            />
                            <FormField
                                label="Primary Phone"
                                name="primaryPhone"
                                type="tel"
                                value={formData.primaryPhone}
                                onChange={val => setFormData(prev => ({ ...prev, primaryPhone: val }))}
                                error={formErrors.primaryPhone}
                                required
                            />
                            <FormField
                                label="Secondary Phone"
                                name="secondaryPhone"
                                type="tel"
                                value={formData.secondaryPhone}
                                onChange={val => setFormData(prev => ({ ...prev, secondaryPhone: val }))}
                                placeholder="Optional"
                            />
                            <FormField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={val => setFormData(prev => ({ ...prev, email: val }))}
                                placeholder="Optional"
                            />
                            <div className="md:col-span-2">
                                <FormField
                                    label="Address"
                                    name="address"
                                    value={formData.address}
                                    onChange={val => setFormData(prev => ({ ...prev, address: val }))}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <FormField
                                    label="Notes"
                                    name="notes"
                                    type="textarea"
                                    value={formData.notes}
                                    onChange={val => setFormData(prev => ({ ...prev, notes: val }))}
                                    placeholder="Optional notes..."
                                />
                            </div>
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
                                    Primary Contact
                                </label>
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="canPickUpChildren"
                                    checked={formData.canPickUpChildren}
                                    onChange={e => setFormData(prev => ({ ...prev, canPickUpChildren: e.target.checked }))}
                                    className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                                />
                                <label htmlFor="canPickUpChildren" className="text-sm font-medium text-secondary-700">
                                    Can Pick Up Children
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={closeForm} disabled={submitting}>
                                Cancel
                            </Button>
                            <Button type="submit" isLoading={submitting}>
                                {editingId ? 'Update Contact' : 'Add Contact'}
                            </Button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {contacts.length === 0 ? (
                        <div className="col-span-full text-center py-8 text-secondary-500 bg-secondary-50 rounded-lg border border-dashed border-secondary-200">
                            No emergency contacts found
                        </div>
                    ) : (
                        contacts.map(contact => (
                            <div
                                key={contact.id}
                                className={`p-4 rounded-lg border transition-all duration-200 ${contact.isPrimary
                                    ? 'bg-primary-50 border-primary-200 shadow-sm'
                                    : 'bg-white border-secondary-200 hover:border-secondary-300'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-secondary-900">{contact.contactName}</h4>
                                            {contact.isPrimary && (
                                                <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-secondary-600 mt-0.5">{contact.relationship}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        {!contact.isPrimary && (
                                            <button
                                                onClick={() => handleSetPrimary(contact.id)}
                                                className="p-1 text-secondary-400 hover:text-success-600 transition-colors"
                                                title="Set Primary"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleEdit(contact)}
                                            className="p-1 text-secondary-400 hover:text-primary-600 transition-colors"
                                            title="Edit"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(contact.id)}
                                            className="p-1 text-secondary-400 hover:text-danger-600 transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-secondary-600">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>{contact.primaryPhone}</span>
                                    </div>
                                    {contact.email && (
                                        <div className="flex items-center gap-2 text-secondary-600">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                            <span>{contact.email}</span>
                                        </div>
                                    )}
                                    {contact.canPickUpChildren && (
                                        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-success-700 bg-success-50 w-fit px-2 py-1 rounded">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Can pick up children
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default EmergencyContacts;
