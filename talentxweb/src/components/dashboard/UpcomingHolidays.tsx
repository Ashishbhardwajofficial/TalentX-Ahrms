import React from 'react';
import { Calendar, ChevronRight } from 'lucide-react';

interface Holiday {
    id: string;
    name: string;
    date: string;
    type: 'Public' | 'Optional';
}

const UpcomingHolidays: React.FC = () => {
    // Mock data for upcoming Indian holidays
    const holidays: Holiday[] = [
        { id: '1', name: 'Makar Sankranti', date: '2026-01-14', type: 'Public' },
        { id: '2', name: 'Republic Day', date: '2026-01-26', type: 'Public' },
        { id: '3', name: 'Vasant Panchami', date: '2026-02-02', type: 'Optional' },
        { id: '4', name: 'Maha Shivratri', date: '2026-02-15', type: 'Public' },
        { id: '5', name: 'Holi', date: '2026-03-04', type: 'Public' },
    ];

    return (
        <div className="premium-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-secondary-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    Upcoming Holidays
                </h3>
                <button className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest flex items-center gap-1 group transition-all">
                    View All
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-secondary-200">
                {holidays.map((holiday) => (
                    <div key={holiday.id} className="flex items-center gap-4 group p-2 hover:bg-secondary-50 rounded-xl transition-colors cursor-pointer">
                        <div className={`
              w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-display border shadow-sm transition-transform group-hover:scale-105
              ${holiday.type === 'Public' ? 'bg-primary-50 border-primary-100 text-primary-700' : 'bg-secondary-50 border-secondary-200 text-secondary-600'}
            `}>
                            <span className="text-[10px] uppercase font-bold leading-none">{new Date(holiday.date).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-lg font-bold leading-none mt-0.5">{new Date(holiday.date).getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-bold text-secondary-900 truncate">{holiday.name}</h4>
                            <p className="text-xs text-secondary-500 flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${holiday.type === 'Public' ? 'bg-success-500' : 'bg-amber-500'}`}></span>
                                {holiday.type} Holiday
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpcomingHolidays;
