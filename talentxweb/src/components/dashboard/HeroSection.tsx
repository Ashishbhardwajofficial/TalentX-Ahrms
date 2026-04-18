import React from 'react';
import HeroMetricCard, { HeroMetricCardProps } from '../cards/HeroMetricCard';

export interface HeroSectionProps {
  metrics: HeroMetricCardProps[];
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ metrics, className = '' }) => {
  return (
    <section className={`w-full ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <HeroMetricCard key={index} {...metric} />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
