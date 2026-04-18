import React from 'react';
import { ChevronRight } from 'lucide-react';

export interface ActionCardProps {
  title: string;
  description: string;
  icon: string | React.ReactNode;
  onClick: () => void;
  badge?: number;
  className?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  icon,
  onClick,
  badge,
  className = '',
}) => {
  return (
    <div
      className={`premium-card p-6 flex flex-col group cursor-pointer active:scale-[0.98] ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-2 -right-2 w-7 h-7 bg-danger-500 text-white text-[10px] font-black rounded-full center shadow-glow animate-scale-in border-4 border-[var(--bg-primary)] z-10">
          {badge}
        </span>
      )}

      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-900/10 text-primary-600 flex items-center justify-center text-xl shadow-soft transition-all duration-500 group-hover:bg-gradient-primary group-hover:text-white group-hover:scale-110 group-hover:rotate-3">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-secondary-900 dark:text-white font-bold group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate tracking-tight">{title}</h3>
        </div>
      </div>

      <div className="flex-1">
        <p className="text-sm text-secondary-500 dark:text-secondary-400 leading-relaxed line-clamp-2 mb-4">{description}</p>
      </div>

      <div className="pt-4 border-t border-secondary-50 dark:border-secondary-800 flex items-center justify-between group-hover:border-primary-100 dark:group-hover:border-primary-900/20 transition-colors">
        <span className="text-[10px] font-bold uppercase tracking-widest text-secondary-400 group-hover:text-primary-500 transition-colors">View Details</span>
        <ChevronRight className="w-4 h-4 text-secondary-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
};

export default ActionCard;
