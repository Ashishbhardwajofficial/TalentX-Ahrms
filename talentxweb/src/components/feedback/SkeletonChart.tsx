import React from 'react';
import Skeleton from './Skeleton';

interface SkeletonChartProps {
  height?: number;
}

const SkeletonChart: React.FC<SkeletonChartProps> = ({ height = 250 }) => {
  return (
    <div className="skeleton-chart">
      <Skeleton width="40%" height={20} className="skeleton-chart-title" />
      <Skeleton width="100%" height={height} className="skeleton-chart-body" />
    </div>
  );
};

export default SkeletonChart;
