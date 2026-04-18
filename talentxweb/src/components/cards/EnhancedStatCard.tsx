import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'critical';

export interface TrendData {
  direction: 'up' | 'down' | 'neutral';
  value: number;
  label?: string;
}

export interface EnhancedStatCardProps {
  title: string;
  value: string | number;
  icon: string | React.ReactNode;
  status?: StatusType;
  trend?: TrendData;
  context?: string;
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
}

const EnhancedStatCard: React.FC<EnhancedStatCardProps> = ({
  title,
  value,
  icon,
  status = 'neutral',
  trend,
  context,
  onClick,
  className = '',
  isLoading = false,
}) => {
  const getStatusStyles = (status: StatusType) => {
    switch (status) {
      case 'success': return 'text-success-600 bg-success-50 dark:bg-success-900/20';
      case 'warning': return 'text-warning-600 bg-warning-50 dark:bg-warning-900/20';
      case 'danger':
      case 'critical': return 'text-danger-600 bg-danger-50 dark:bg-danger-900/20';
      case 'info': return 'text-primary-600 bg-primary-50 dark:bg-primary-900/20';
      default: return 'text-secondary-600 bg-secondary-50 dark:bg-secondary-800';
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
      case 'up': return 'text-success-600 dark:text-success-400';
      case 'down': return 'text-danger-600 dark:text-danger-400';
      default: return 'text-secondary-500 dark:text-secondary-400';
    }
  };

  if (isLoading) {
    return (
      <div className={`premium-card p-5 animate-pulse space-y-4 ${className}`}>
        <div className="flex justify-between items-start">
          <div className="h-3 w-16 bg-secondary-100 dark:bg-secondary-800 rounded"></div>
          <div className="h-8 w-8 bg-secondary-50 dark:bg-secondary-800/50 rounded-lg"></div>
        </div>
        <div className="h-7 w-20 bg-secondary-100 dark:bg-secondary-800 rounded-lg"></div>
        <div className="h-3 w-32 bg-secondary-50 dark:bg-secondary-800/50 rounded"></div>
      </div>
    );
  }

  return (
    <div
      className={`premium-card p-5 group transition-all duration-300 ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-secondary-500 dark:text-secondary-400 text-xs font-bold uppercase tracking-widest leading-none">{title}</h3>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm transition-all duration-300 group-hover:scale-110 shadow-soft ${getStatusStyles(status)}`}>
          {icon}
        </div>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-black text-secondary-900 dark:text-white tracking-tight leading-none">{value}</div>
      </div>

      <div className="flex items-center justify-between min-h-[1.25rem]">
        {trend ? (
          <div className={`flex items-center gap-1 text-[11px] font-bold ${getTrendColor(trend.direction)}`}>
            {getTrendIcon(trend.direction)}
            <span>{Math.abs(trend.value)}%</span>
            {trend.label && <span className="opacity-60 font-medium ml-0.5">{trend.label}</span>}
          </div>
        ) : (
          <div />
        )}

        {context && (
          <span className="text-[10px] text-secondary-400 dark:text-secondary-500 font-bold uppercase tracking-wider">
            {context}
          </span>
        )}
      </div>
    </div>
  );
};

export default EnhancedStatCard;
