import React from 'react';
import { Briefcase, Calendar, Star, Clock } from 'lucide-react';

interface EmployeeStatsBarProps {
    hireDate: string;
    leaveBalance: number;
    rating?: number;
    nextReviewDate?: string;
}

const EmployeeStatsBar: React.FC<EmployeeStatsBarProps> = ({
    hireDate,
    leaveBalance,
    rating,
    nextReviewDate
}) => {
    const calculateExperience = (date: string) => {
        const start = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
        const diffMonths = Math.floor((diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));

        if (diffYears === 0) return `${diffMonths} months`;
        return `${diffYears}y ${diffMonths}m`;
    };

    const experience = calculateExperience(hireDate);

    const stats = [
        {
            label: 'Experience',
            value: experience,
            icon: <Briefcase className="w-4 h-4" />,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50'
        },
        {
            label: 'Leave Balance',
            value: `${leaveBalance} Days`,
            icon: <Calendar className="w-4 h-4" />,
            color: 'text-green-600',
            bgColor: 'bg-green-50'
        },
        {
            label: 'Performance',
            value: rating ? `${rating}/5.0` : 'N/A',
            icon: <Star className="w-4 h-4" />,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50'
        },
        {
            label: 'Next Review',
            value: nextReviewDate ? new Date(nextReviewDate).toLocaleDateString() : 'TBD',
            icon: <Clock className="w-4 h-4" />,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slideInUp">
            {stats.map((stat, index) => (
                <div
                    key={index}
                    className="bg-white p-4 rounded-xl border border-secondary-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md"
                >
                    <div className={`${stat.bgColor} ${stat.color} p-2.5 rounded-lg`}>
                        {stat.icon}
                    </div>
                    <div>
                        <p className="text-xs font-medium text-secondary-500 uppercase tracking-wider">{stat.label}</p>
                        <p className="text-lg font-bold text-secondary-900">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EmployeeStatsBar;
