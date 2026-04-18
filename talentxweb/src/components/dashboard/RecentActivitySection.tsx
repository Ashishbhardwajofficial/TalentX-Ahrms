import React from 'react';

export interface ActivityItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}

export interface RecentActivitySectionProps {
  activities: ActivityItem[];
  title?: string;
  maxItems?: number;
  onViewAll?: () => void;
  className?: string;
}

const RecentActivitySection: React.FC<RecentActivitySectionProps> = ({
  activities,
  title = 'Recent Activity',
  maxItems = 10,
  onViewAll,
  className = '',
}) => {
  const displayActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'danger':
        return '✕';
      default:
        return 'ℹ';
    }
  };

  return (
    <section className={`w-full ${className}`}>
      <div className="flex items-center justify-between mb-4">
        {title && <h2 className="text-xl font-semibold text-secondary-900 font-display">{title}</h2>}
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors group"
          >
            View All
            <svg className="w-4 h-4 ml-1 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-soft border border-secondary-200 overflow-hidden">
        {displayActivities.length === 0 ? (
          <div className="p-8 text-center text-secondary-500">
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="divide-y divide-secondary-100">
            {displayActivities.map((activity) => (
              <div key={activity.id} className="p-4 flex gap-4 hover:bg-secondary-50 transition-colors group">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg shadow-sm
                  ${activity.type === 'success' ? 'bg-success-100 text-success-600' :
                    activity.type === 'warning' ? 'bg-warning-100 text-warning-600' :
                      activity.type === 'danger' ? 'bg-danger-100 text-danger-600' :
                        'bg-info-100 text-info-600'
                  }`}
                >
                  {activity.icon || getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-sm font-semibold text-secondary-900 truncate group-hover:text-primary-700 transition-colors">
                      {activity.title}
                    </h4>
                    <span className="text-xs text-secondary-400 whitespace-nowrap ml-2">
                      {activity.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-secondary-500 mt-0.5 line-clamp-1">
                    {activity.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RecentActivitySection;
