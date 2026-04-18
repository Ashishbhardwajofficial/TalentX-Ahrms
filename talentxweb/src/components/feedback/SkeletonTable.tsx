import React from 'react';
import Skeleton from './Skeleton';

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="skeleton-table">
      {/* Header */}
      <div className="skeleton-table-header">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={`header-${i}`} width="25%" height={16} />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="skeleton-table-row">
          {Array.from({ length: cols }).map((_, colIndex) => (
            <Skeleton key={`cell-${rowIndex}-${colIndex}`} width="25%" height={20} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default SkeletonTable;
