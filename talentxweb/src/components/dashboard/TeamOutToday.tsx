import React from 'react';
import { Users, Info } from 'lucide-react';

interface EmployeeOut {
    id: string;
    name: string;
    avatar?: string;
    reason: string;
    duration: string;
}

const TeamOutToday: React.FC = () => {
    // Mock data for employees out today
    const employeesOut: EmployeeOut[] = [
        { id: '1', name: 'John Doe', reason: 'Medical Leave', duration: 'Full Day' },
        { id: '2', name: 'Jane Smith', reason: 'Casual Leave', duration: 'First Half' },
        { id: '3', name: 'Rahul Kumar', reason: 'On-site Visit', duration: 'Full Day' },
        { id: '4', name: 'Priya Singh', reason: 'Sick Leave', duration: 'Full Day' },
    ];

    return (
        <div className="premium-card p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-secondary-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-danger-500" />
                    Team Out Today
                </h3>
                <span className="bg-danger-50 text-danger-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-danger-100 uppercase tracking-widest">
                    {employeesOut.length} Out Now
                </span>
            </div>

            <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-secondary-200">
                {employeesOut.length > 0 ? (
                    employeesOut.map((emp) => (
                        <div key={emp.id} className="flex items-center gap-3 p-2 hover:bg-secondary-50 rounded-xl transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-100 to-secondary-200 flex items-center justify-center text-secondary-700 font-bold border-2 border-white shadow-sm overflow-hidden group-hover:scale-105 transition-transform">
                                {emp.avatar ? (
                                    <img src={emp.avatar} alt={emp.name} className="w-full h-full object-cover" />
                                ) : (
                                    emp.name.split(' ').map(n => n[0]).join('')
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-secondary-900 truncate">{emp.name}</h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <p className="text-xs text-secondary-500 truncate">{emp.reason}</p>
                                    <span className="w-1 h-1 bg-secondary-300 rounded-full"></span>
                                    <p className="text-[10px] font-bold text-secondary-400 uppercase tracking-tighter">{emp.duration}</p>
                                </div>
                            </div>
                            <button className="text-secondary-300 hover:text-secondary-500 transition-colors">
                                <Info className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-secondary-400 py-8">
                        <Users className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm italic">Everyone is in today!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeamOutToday;
