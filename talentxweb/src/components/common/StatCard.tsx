import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  onClick?: () => void;
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'primary',
  onClick,
  isLoading = false,
}) => {
  const colorStyles = {
    primary: 'bg-primary-50 dark:bg-primary-900/10 text-primary-600',
    success: 'bg-success-50 dark:bg-success-900/10 text-success-600',
    warning: 'bg-warning-50 dark:bg-warning-900/10 text-warning-600',
    danger: 'bg-danger-50 dark:bg-danger-900/10 text-danger-600',
    info: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600',
  };

  if (isLoading) {
    return (
      <div className="premium-card p-6 animate-pulse">
        <div className="flex justify-between items-start">
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-secondary-100 dark:bg-secondary-800 rounded"></div>
            <div className="h-8 w-16 bg-secondary-200 dark:bg-secondary-700 rounded"></div>
          </div>
          <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`premium-card p-6 group transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <p className="text-xs font-bold text-secondary-500 uppercase tracking-widest mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-extrabold text-secondary-900 dark:text-white tracking-tight">
              {value}
            </h3>
            {trend && (
              <div className={`flex items-center gap-1 text-xs font-bold ${trend.isPositive ? 'text-success-600' : 'text-danger-600'}`}>
                {trend.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>{trend.value}%</span>
              </div>
            )}
          </div>
        </div>

        {icon && (
          <div className={`p-3 rounded-2xl ${colorStyles[color]} group-hover:scale-110 shadow-soft transition-transform duration-500`}>
            {icon}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${color === 'primary' ? 'bg-primary-500' : color === 'success' ? 'bg-success-500' : 'bg-secondary-400'}`}
            style={{ width: trend ? `${Math.min(100, 40 + trend.value)}%` : '60%' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

