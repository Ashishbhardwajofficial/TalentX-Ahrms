export type StatusType = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'critical';

export interface StatusConfig {
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  label: string;
}

export const STATUS_COLORS: Record<StatusType, StatusConfig> = {
  critical: {
    color: 'var(--color-danger-700)',
    bgColor: 'var(--color-danger-50)',
    borderColor: 'var(--color-danger-500)',
    icon: '🚨',
    label: 'Critical',
  },
  danger: {
    color: 'var(--color-danger-700)',
    bgColor: 'var(--color-danger-50)',
    borderColor: 'var(--color-danger-500)',
    icon: '✕',
    label: 'Danger',
  },
  warning: {
    color: 'var(--color-warning-700)',
    bgColor: 'var(--color-warning-50)',
    borderColor: 'var(--color-warning-500)',
    icon: '⚠',
    label: 'Warning',
  },
  success: {
    color: 'var(--color-success-700)',
    bgColor: 'var(--color-success-50)',
    borderColor: 'var(--color-success-500)',
    icon: '✓',
    label: 'Success',
  },
  info: {
    color: 'var(--color-info-700)',
    bgColor: 'var(--color-info-50)',
    borderColor: 'var(--color-info-500)',
    icon: 'ℹ',
    label: 'Info',
  },
  neutral: {
    color: 'var(--color-secondary-700)',
    bgColor: 'var(--color-secondary-50)',
    borderColor: 'var(--color-secondary-300)',
    icon: '○',
    label: 'Neutral',
  },
};

export const getStatusColor = (status: StatusType): string => {
  return STATUS_COLORS[status]?.color || STATUS_COLORS.neutral.color;
};

export const getStatusBgColor = (status: StatusType): string => {
  return STATUS_COLORS[status]?.bgColor || STATUS_COLORS.neutral.bgColor;
};

export const getStatusBorderColor = (status: StatusType): string => {
  return STATUS_COLORS[status]?.borderColor || STATUS_COLORS.neutral.borderColor;
};

export const getStatusIcon = (status: StatusType): string => {
  return STATUS_COLORS[status]?.icon || STATUS_COLORS.neutral.icon;
};

export const getStatusLabel = (status: StatusType): string => {
  return STATUS_COLORS[status]?.label || STATUS_COLORS.neutral.label;
};

/**
 * Determine status based on a numeric value and thresholds
 */
export const getStatusFromValue = (
  value: number,
  thresholds: {
    critical?: number;
    danger?: number;
    warning?: number;
    success?: number;
  }
): StatusType => {
  if (thresholds.critical !== undefined && value >= thresholds.critical) {
    return 'critical';
  }
  if (thresholds.danger !== undefined && value >= thresholds.danger) {
    return 'danger';
  }
  if (thresholds.warning !== undefined && value >= thresholds.warning) {
    return 'warning';
  }
  if (thresholds.success !== undefined && value >= thresholds.success) {
    return 'success';
  }
  return 'neutral';
};

/**
 * Determine status based on a percentage (0-100)
 */
export const getStatusFromPercentage = (
  percentage: number,
  inverted: boolean = false
): StatusType => {
  if (inverted) {
    // Lower is better (e.g., error rate)
    if (percentage >= 90) return 'critical';
    if (percentage >= 75) return 'danger';
    if (percentage >= 50) return 'warning';
    if (percentage >= 25) return 'info';
    return 'success';
  } else {
    // Higher is better (e.g., completion rate)
    if (percentage >= 90) return 'success';
    if (percentage >= 75) return 'info';
    if (percentage >= 50) return 'warning';
    if (percentage >= 25) return 'danger';
    return 'critical';
  }
};
