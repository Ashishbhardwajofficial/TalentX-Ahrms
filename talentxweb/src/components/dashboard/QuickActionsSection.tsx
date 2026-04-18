import React from 'react';
import ActionCard, { ActionCardProps } from '../cards/ActionCard';

export interface QuickActionsSectionProps {
  actions: ActionCardProps[];
  title?: string;
  className?: string;
  loading?: boolean;
}

const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  actions,
  title = 'Quick Actions',
  className = '',
  loading = false,
}) => {
  const displayActions = actions.slice(0, 6);

  if (loading) {
    return (
      <section className={`w-full ${className} animate-pulse`}>
        {title && (
          <div className="h-6 w-32 bg-secondary-100 dark:bg-secondary-800 rounded-lg mb-6"></div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-40 bg-secondary-50 dark:bg-secondary-800/50 rounded-2xl"></div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`w-full ${className} animate-slide-up`}>
      {title && (
        <h2 className="text-xl font-extrabold text-secondary-900 dark:text-white mb-6 font-display flex items-center gap-3">
          <span className="w-1.5 h-6 bg-primary-500 rounded-full"></span>
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {displayActions.map((action, index) => (
          <ActionCard key={index} {...action} />
        ))}
      </div>
    </section>
  );
};

export default QuickActionsSection;
