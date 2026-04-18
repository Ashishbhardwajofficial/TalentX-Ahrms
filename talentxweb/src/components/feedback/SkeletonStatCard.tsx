import React from 'react';
import Skeleton from './Skeleton';

const SkeletonStatCard: React.FC = () => {
  return (
    <div className="stat-card skeleton-card">
      <div className="stat-card-header">
        <Skeleton width="60%" height={14} />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      <div className="stat-card-body">
        <Skeleton width="40%" height={48} className="skeleton-value" />
        <Skeleton width="20%" height={20} />
      </div>
      <Skeleton width="50%" height={12} className="skeleton-trend" />
    </div>
  );
};

export default SkeletonStatCard;
