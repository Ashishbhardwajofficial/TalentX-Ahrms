import React from 'react';
import ChartCard, { ChartCardProps } from '../cards/ChartCard';

export interface ChartsSectionProps {
  charts: ChartCardProps[];
  title?: string;
  className?: string;
}

const ChartsSection: React.FC<ChartsSectionProps> = ({
  charts,
  title = 'Analytics',
  className = '',
}) => {
  // Limit to 4-6 charts
  const displayCharts = charts.slice(0, 6);

  return (
    <section className={`w-full ${className}`}>
      {title && <h2 className="text-xl font-semibold text-secondary-900 mb-4 font-display">{title}</h2>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayCharts.map((chart, index) => (
          <ChartCard key={index} {...chart} />
        ))}
      </div>
    </section>
  );
};

export default ChartsSection;
