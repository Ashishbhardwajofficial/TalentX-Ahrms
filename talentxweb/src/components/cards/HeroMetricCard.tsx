import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'critical';

export interface TrendData {
  direction: 'up' | 'down' | 'neutral';
  value: number;
  label?: string;
}

export interface HeroMetricCardProps {
  title: string;
  value: string | number;
  icon: string | React.ReactNode;
  status?: StatusType;
  trend?: TrendData;
  subtitle?: string;
  progress?: number;
  onClick?: () => void;
  className?: string;
}

const HeroMetricCard: React.FC<HeroMetricCardProps> = ({
  title,
  value,
  icon,
  status = 'neutral',
  trend,
  subtitle,
  progress,
  onClick,
  className = '',
}) => {
  const getStatusStyles = (status: StatusType) => {
    switch (status) {
      case 'success': return 'text-success-600 bg-success-50 dark:bg-success-900/20 shadow-success-500/10';
      case 'warning': return 'text-warning-600 bg-warning-50 dark:bg-warning-900/20 shadow-warning-500/10';
      case 'danger':
      case 'critical': return 'text-danger-600 bg-danger-50 dark:bg-danger-900/20 shadow-danger-500/10';
      case 'info': return 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 shadow-primary-500/10';
      default: return 'text-secondary-600 bg-secondary-50 dark:bg-secondary-800 shadow-secondary-500/10';
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return <TrendingUp className="w-3 h-3" />;
      case 'down': return <TrendingDown className="w-3 h-3" />;
      default: return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up': return 'text-success-600 dark:text-success-400 bg-success-50 dark:bg-success-900/20';
      case 'down': return 'text-danger-600 dark:text-danger-400 bg-danger-50 dark:bg-danger-900/20';
      default: return 'text-secondary-500 dark:text-secondary-400 bg-secondary-100 dark:bg-secondary-800';
    }
  };

  return (
    <div
      className={`premium-card p-6 group ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="space-y-1">
          <h3 className="text-secondary-500 dark:text-secondary-400 text-xs font-bold uppercase tracking-widest">{title}</h3>
          <div className="text-3xl font-black text-secondary-900 dark:text-white tracking-tight leading-none">
            {value}
          </div>
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-soft transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${getStatusStyles(status)}`}>
          {icon}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        {trend ? (
          <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold transition-colors ${getTrendColor(trend.direction)}`}>
            {getTrendIcon(trend.direction)}
            <span>{Math.abs(trend.value)}%</span>
            {trend.label && <span className="opacity-70 font-medium ml-1">{trend.label}</span>}
          </div>
        ) : (
          <div className="h-6"></div> // Spacer
        )}

        {subtitle && (
          <p className="text-[11px] font-medium text-secondary-400 dark:text-secondary-500">{subtitle}</p>
        )}
      </div>

      {progress !== undefined && (
        <div className="mt-5 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-secondary-500">
            <span>Completion</span>
            <span className="text-secondary-900 dark:text-white">{progress}%</span>
          </div>
          <div className="h-1.5 bg-secondary-100 dark:bg-secondary-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${status === 'success' ? 'bg-success-500' :
                status === 'warning' ? 'bg-warning-500' :
                  status === 'danger' ? 'bg-danger-500' :
                    'bg-primary-500'
                }`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};


export default HeroMetricCard;
