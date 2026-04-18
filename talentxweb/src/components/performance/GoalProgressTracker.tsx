import React from 'react';
import { GoalStatus } from '../../types';

export interface GoalProgressTrackerProps {
  progress: number; // 0-100
  status: GoalStatus;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  showMilestones?: boolean;
  milestones?: Milestone[];
  animated?: boolean;
  className?: string;
}

export interface Milestone {
  id: string;
  name: string;
  percentage: number;
  completed: boolean;
  date?: string;
}

const GoalProgressTracker: React.FC<GoalProgressTrackerProps> = ({
  progress,
  status,
  size = 'medium',
  showLabel = true,
  showMilestones = false,
  milestones = [],
  animated = true,
  className = ''
}) => {
  // Clamp progress between 0 and 100
  const clampedProgress = Math.max(0, Math.min(100, progress));

  // Get progress bar color based on status and progress
  const getProgressColor = (): string => {
    switch (status) {
      case GoalStatus.COMPLETED:
        return '#10b981'; // Green
      case GoalStatus.CANCELLED:
        return '#ef4444'; // Red
      case GoalStatus.DEFERRED:
        return '#f59e0b'; // Orange
      case GoalStatus.NOT_STARTED:
        return '#6b7280'; // Gray
      case GoalStatus.IN_PROGRESS:
        if (clampedProgress >= 80) return '#10b981'; // Green for high progress
        if (clampedProgress >= 50) return '#3b82f6'; // Blue for medium progress
        if (clampedProgress >= 25) return '#f59e0b'; // Orange for low progress
        return '#ef4444'; // Red for very low progress
      default:
        return '#6b7280';
    }
  };

  // Get size-specific dimensions
  const getSizeDimensions = () => {
    switch (size) {
      case 'small':
        return {
          height: '8px',
          fontSize: '12px',
          milestoneSize: '6px'
        };
      case 'large':
        return {
          height: '20px',
          fontSize: '16px',
          milestoneSize: '12px'
        };
      default: // medium
        return {
          height: '12px',
          fontSize: '14px',
          milestoneSize: '8px'
        };
    }
  };

  const dimensions = getSizeDimensions();
  const progressColor = getProgressColor();

  // Get status icon
  const getStatusIcon = (): string => {
    switch (status) {
      case GoalStatus.COMPLETED:
        return '✓';
      case GoalStatus.CANCELLED:
        return '✗';
      case GoalStatus.DEFERRED:
        return '⏸';
      case GoalStatus.NOT_STARTED:
        return '○';
      case GoalStatus.IN_PROGRESS:
        return '▶';
      default:
        return '○';
    }
  };

  // Sort milestones by percentage
  const sortedMilestones = [...milestones].sort((a, b) => a.percentage - b.percentage);

  return (
    <div className={`goal-progress-tracker ${className}`}>
      {/* Progress Bar Container */}
      <div className="progress-container" style={{ position: 'relative' }}>
        {/* Background Bar */}
        <div
          className="progress-background"
          style={{
            width: '100%',
            height: dimensions.height,
            backgroundColor: '#e5e7eb',
            borderRadius: dimensions.height,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Progress Fill */}
          <div
            className={`progress-fill ${animated ? 'animated' : ''}`}
            style={{
              width: `${clampedProgress}%`,
              height: '100%',
              backgroundColor: progressColor,
              borderRadius: dimensions.height,
              transition: animated ? 'width 0.3s ease-in-out' : 'none',
              position: 'relative'
            }}
          />

          {/* Milestones */}
          {showMilestones && sortedMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className="milestone"
              style={{
                position: 'absolute',
                left: `${milestone.percentage}%`,
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: dimensions.milestoneSize,
                height: dimensions.milestoneSize,
                borderRadius: '50%',
                backgroundColor: milestone.completed ? '#10b981' : '#6b7280',
                border: '2px solid white',
                zIndex: 2,
                cursor: 'pointer'
              }}
              title={`${milestone.name}: ${milestone.percentage}%${milestone.date ? ` (${milestone.date})` : ''}`}
            />
          ))}
        </div>

        {/* Progress Label */}
        {showLabel && (
          <div
            className="progress-label"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '4px',
              fontSize: dimensions.fontSize,
              color: '#374151'
            }}
          >
            <span className="progress-text">
              {getStatusIcon()} {clampedProgress}%
            </span>
            <span className="status-text" style={{ color: progressColor }}>
              {status.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Milestones List */}
      {showMilestones && milestones.length > 0 && (
        <div className="milestones-list" style={{ marginTop: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
            Milestones:
          </div>
          {sortedMilestones.map((milestone) => (
            <div
              key={milestone.id}
              className="milestone-item"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '2px 0',
                fontSize: '11px',
                color: milestone.completed ? '#10b981' : '#6b7280'
              }}
            >
              <span>
                {milestone.completed ? '✓' : '○'} {milestone.name}
              </span>
              <span>{milestone.percentage}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Progress Insights */}
      {size === 'large' && (
        <div className="progress-insights" style={{ marginTop: '8px', fontSize: '12px' }}>
          {status === GoalStatus.IN_PROGRESS && (
            <div style={{ color: '#6b7280' }}>
              {clampedProgress >= 75 && 'Excellent progress! Keep it up.'}
              {clampedProgress >= 50 && clampedProgress < 75 && 'Good progress. Stay focused.'}
              {clampedProgress >= 25 && clampedProgress < 50 && 'Making progress. Consider accelerating.'}
              {clampedProgress < 25 && 'Early stages. Time to pick up the pace.'}
            </div>
          )}
          {status === GoalStatus.COMPLETED && (
            <div style={{ color: '#10b981' }}>
              🎉 Goal completed successfully!
            </div>
          )}
          {status === GoalStatus.CANCELLED && (
            <div style={{ color: '#ef4444' }}>
              Goal was cancelled.
            </div>
          )}
          {status === GoalStatus.DEFERRED && (
            <div style={{ color: '#f59e0b' }}>
              Goal has been deferred.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoalProgressTracker;