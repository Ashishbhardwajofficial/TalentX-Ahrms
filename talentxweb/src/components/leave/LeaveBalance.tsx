import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, PieChart, Info, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import leaveApi, { LeaveBalanceDTO } from '../../api/leaveApi';
import { useAuthContext } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';

interface LeaveBalanceProps {
  employeeId?: number | undefined;
  year?: number | undefined;
  compact?: boolean;
}

const LeaveBalance: React.FC<LeaveBalanceProps> = ({
  employeeId,
  year = new Date().getFullYear(),
  compact = false
}) => {
  const { user } = useAuthContext();
  const { error: showError } = useToast();
  const [balances, setBalances] = useState<LeaveBalanceDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const targetEmployeeId = employeeId || user?.id;

  useEffect(() => {
    const fetchLeaveBalance = async () => {
      if (!targetEmployeeId) return;
      try {
        setLoading(true);
        const balanceData = await leaveApi.getLeaveBalance(targetEmployeeId, year);
        setBalances(balanceData);
      } catch (error) {
        showError('Failed to load leave balance', { description: 'Loading Error' });
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveBalance();
  }, [targetEmployeeId, year, showError]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="premium-card p-6 animate-pulse space-y-4">
            <div className="flex justify-between">
              <div className="h-6 w-24 bg-secondary-100 dark:bg-secondary-800 rounded-lg"></div>
              <div className="h-4 w-12 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg"></div>
            </div>
            <div className="h-2 w-full bg-secondary-100 dark:bg-secondary-800 rounded-full"></div>
            <div className="flex gap-4">
              <div className="h-4 w-16 bg-secondary-50 dark:bg-secondary-800/50 rounded"></div>
              <div className="h-4 w-16 bg-secondary-50 dark:bg-secondary-800/50 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (balances.length === 0) {
    return (
      <div className="premium-card p-12 center flex-col space-y-4 border-dashed">
        <div className="w-16 h-16 rounded-3xl bg-secondary-50 dark:bg-secondary-800 center text-secondary-300">
          <PieChart className="w-8 h-8" />
        </div>
        <p className="text-secondary-500 font-bold tracking-tight">Balance insights unavailable for {year}</p>
      </div>
    );
  }

  const getGradient = (usage: number) => {
    if (usage >= 90) return 'from-danger-500 to-danger-600 shadow-danger-500/20';
    if (usage >= 75) return 'from-warning-400 to-warning-600 shadow-warning-500/20';
    return 'from-primary-500 to-indigo-600 shadow-primary-500/20';
  };

  return (
    <div className="space-y-6">
      {!compact && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-50 dark:bg-primary-900/10 center text-primary-600">
              <PieChart className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-black text-secondary-900 dark:text-white tracking-tight">Quota Overview</h3>
          </div>
          <span className="px-4 py-1.5 rounded-full bg-secondary-100 dark:bg-secondary-800 text-[10px] font-black uppercase tracking-widest text-secondary-500">FY {year}</span>
        </div>
      )}

      <div className={compact ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}>
        {balances.map((balance, index) => {
          const usage = Math.min((balance.usedDays / balance.allocatedDays) * 100, 100);
          return (
            <motion.div
              key={balance.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`premium-card group relative overflow-hidden ${compact ? 'p-4' : 'p-6'}`}
            >
              {/* Background Glow */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${getGradient(usage)}`} />

              <div className="relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <h4 className="font-black text-secondary-900 dark:text-white tracking-tight group-hover:text-primary-600 transition-colors uppercase text-xs">{balance.leaveType?.name || 'Leave Type'}</h4>
                    <p className="text-[10px] text-secondary-400 font-bold uppercase tracking-widest">Available Quota</p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-secondary-900 dark:text-white leading-none">{balance.availableDays}</span>
                    <span className="text-[10px] font-black text-secondary-400 block mt-1">DAYS</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                      <span className="text-secondary-500">Usage Tracker</span>
                      <span className={usage > 75 ? 'text-danger-500' : 'text-primary-600'}>{Math.round(usage)}% Consumed</span>
                    </div>
                    <div className="h-2.5 w-full bg-secondary-50 dark:bg-secondary-800/50 rounded-full overflow-hidden border border-secondary-100/50 dark:border-secondary-700/30">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${usage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${getGradient(usage)}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-4 border-t border-secondary-50 dark:border-secondary-800/50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-tighter text-secondary-400">Total Allocated</span>
                      <span className="text-xs font-bold text-secondary-700 dark:text-secondary-300">{balance.allocatedDays} Days</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[9px] font-black uppercase tracking-tighter text-secondary-400">Carried Over</span>
                      <span className="text-xs font-bold text-secondary-700 dark:text-secondary-300">{balance.carriedForwardDays} Days</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default LeaveBalance;