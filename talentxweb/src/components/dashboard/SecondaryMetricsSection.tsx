import React from 'react';
import EnhancedStatCard, { EnhancedStatCardProps } from '../cards/EnhancedStatCard';

export interface SecondaryMetricsSectionProps {
  metrics: EnhancedStatCardProps[];
  title?: string;
  className?: string;
  loading?: boolean;
}

const SecondaryMetricsSection: React.FC<SecondaryMetricsSectionProps> = ({
  metrics,
  title = 'Key Metrics',
  className = '',
  loading = false,
}) => {
  const displayMetrics = metrics.slice(0, 12);

  return (
    <section className={`w-full ${className} animate-slide-up`}>
      {title && (
        <h2 className="text-xl font-extrabold text-secondary-900 dark:text-white mb-6 font-display flex items-center gap-3">
          <span className="w-1.5 h-6 bg-primary-500 rounded-full"></span>
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayMetrics.map((metric, index) => (
          <EnhancedStatCard key={index} {...metric} isLoading={loading} />
        ))}
      </div>
    </section>
  );
};


export default SecondaryMetricsSection;
