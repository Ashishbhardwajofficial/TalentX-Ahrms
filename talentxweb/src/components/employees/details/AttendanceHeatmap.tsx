import React from 'react';

const AttendanceHeatmap: React.FC = () => {
    // Mock data for a month (31 days)
    const days = Array.from({ length: 31 }, (_, i) => ({
        day: i + 1,
        status: Math.random() > 0.1 ? 'present' : Math.random() > 0.5 ? 'absent' : 'leave'
    }));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return 'bg-success-500';
            case 'absent': return 'bg-danger-500';
            case 'leave': return 'bg-amber-500';
            default: return 'bg-secondary-100';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-secondary-900 uppercase tracking-widest">Attendance Heatmap (Last 30 Days)</h4>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-tighter">
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-success-500 rounded-sm"></span>
                        Present
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-danger-500 rounded-sm"></span>
                        Absent
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span>
                        Leave
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {days.map((day) => (
                    <div
                        key={day.day}
                        title={`Day ${day.day}: ${day.status}`}
                        className={`w-6 h-6 rounded-md ${getStatusColor(day.status)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center text-[8px] text-white font-bold shadow-sm`}
                    >
                        {day.day}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AttendanceHeatmap;
