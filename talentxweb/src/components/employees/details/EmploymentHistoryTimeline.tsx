import React, { useState, useEffect } from 'react';
import employmentHistoryApi, { EmploymentHistoryDTO } from '../../../api/employmentHistoryApi';
import { EmploymentHistoryReason } from '../../../types';
import LoadingSpinner from '../../common/LoadingSpinner';

interface EmploymentHistoryTimelineProps {
    employeeId: number;
}

const EmploymentHistoryTimeline: React.FC<EmploymentHistoryTimelineProps> = ({ employeeId }) => {
    const [historyRecords, setHistoryRecords] = useState<EmploymentHistoryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmploymentHistory = async () => {
            try {
                setLoading(true);
                const response = await employmentHistoryApi.getEmployeeEmploymentHistory(employeeId, {
                    page: 0,
                    size: 50,
                    sort: 'effectiveFrom',
                    direction: 'desc'
                });
                setHistoryRecords(response.content);
            } catch (err) {
                setError('Failed to load employment history');
                console.error('Error fetching employment history:', err);
            } finally {
                setLoading(false);
            }
        };

        if (employeeId) {
            fetchEmploymentHistory();
        }
    }, [employeeId]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getReasonLabel = (reason: EmploymentHistoryReason) => {
        const labels = {
            [EmploymentHistoryReason.JOINING]: 'Joined',
            [EmploymentHistoryReason.PROMOTION]: 'Promoted',
            [EmploymentHistoryReason.TRANSFER]: 'Transferred',
            [EmploymentHistoryReason.SALARY_REVISION]: 'Salary Revised',
            [EmploymentHistoryReason.ROLE_CHANGE]: 'Role Changed'
        };
        return labels[reason] || reason;
    };

    const getReasonColorClass = (reason: EmploymentHistoryReason) => {
        const colors = {
            [EmploymentHistoryReason.JOINING]: 'bg-success-500',
            [EmploymentHistoryReason.PROMOTION]: 'bg-primary-500',
            [EmploymentHistoryReason.TRANSFER]: 'bg-warning-500',
            [EmploymentHistoryReason.SALARY_REVISION]: 'bg-info-500',
            [EmploymentHistoryReason.ROLE_CHANGE]: 'bg-purple-500' // Assuming purple exists in extensions or use a custom class
        };
        return colors[reason] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <LoadingSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-danger-50 text-danger-700 rounded-lg">
                {error}
            </div>
        );
    }

    if (historyRecords.length === 0) {
        return (
            <div className="p-8 text-center text-secondary-500 bg-secondary-50 rounded-lg border border-secondary-200 border-dashed">
                <div>No employment history records found</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h3 className="text-lg font-semibold text-secondary-900 mb-6">Employment History Timeline</h3>
            <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-secondary-200" />

                {historyRecords.map((record) => (
                    <div key={record.id} className="relative mb-8 pl-14 last:mb-0">
                        {/* Timeline dot */}
                        <div className={`absolute left-2.5 top-1.5 w-5 h-5 rounded-full border-4 border-white shadow-sm ring-1 ring-secondary-200 ${getReasonColorClass(record.reason)}`} />

                        {/* Content card */}
                        <div className="bg-white border border-secondary-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className={`inline-block px-2.5 py-1 ${getReasonColorClass(record.reason).replace('bg-', 'bg-').replace('500', '100')} ${getReasonColorClass(record.reason).replace('bg-', 'text-').replace('500', '700')} text-xs font-semibold rounded-md mb-2`}>
                                        {getReasonLabel(record.reason)}
                                    </span>
                                    <div className="text-sm text-secondary-500 flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {formatDate(record.effectiveFrom)}
                                        {record.effectiveTo && ` - ${formatDate(record.effectiveTo)}`}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                {record.jobTitle && (
                                    <div>
                                        <strong className="block text-secondary-700 font-medium">Job Title</strong>
                                        <div className="text-secondary-600">{record.jobTitle}</div>
                                    </div>
                                )}

                                {record.departmentName && (
                                    <div>
                                        <strong className="block text-secondary-700 font-medium">Department</strong>
                                        <div className="text-secondary-600">{record.departmentName}</div>
                                    </div>
                                )}

                                {record.jobLevel && (
                                    <div>
                                        <strong className="block text-secondary-700 font-medium">Job Level</strong>
                                        <div className="text-secondary-600">{record.jobLevel}</div>
                                    </div>
                                )}

                                {record.managerName && (
                                    <div>
                                        <strong className="block text-secondary-700 font-medium">Manager</strong>
                                        <div className="text-secondary-600">{record.managerName}</div>
                                    </div>
                                )}

                                {record.salaryAmount && (
                                    <div>
                                        <strong className="block text-secondary-700 font-medium">Salary</strong>
                                        <div className="text-secondary-600 font-mono">
                                            ${record.salaryAmount.toLocaleString()}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmploymentHistoryTimeline;
