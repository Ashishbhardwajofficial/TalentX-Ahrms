import { useState, useEffect, useCallback } from 'react';
import dashboardApi, { DashboardStatistics } from '../api/dashboardApi';

// Storage key - must match StorageService
const TOKEN_KEY = 'hrms_token';

export interface DashboardDataState {
  data: DashboardStatistics | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useDashboardData = (): DashboardDataState => {
  const [data, setData] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    // Check if token exists before making API call
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.warn('No auth token found, skipping dashboard data fetch');
      setLoading(false);
      setError('Authentication required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const statistics = await dashboardApi.getDashboardStatistics();
      setData(statistics);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      // Don't set error for auth errors - let the interceptor handle redirect
      if (err.name !== 'AuthenticationError') {
        setError(err.message || 'Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch if token exists
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};

// Helper function to calculate trend from current and previous values
export const calculateTrend = (current: number, previous: number): { direction: 'up' | 'down' | 'neutral'; value: number } => {
  if (previous === 0) {
    return { direction: 'neutral', value: 0 };
  }

  const percentChange = ((current - previous) / previous) * 100;

  if (Math.abs(percentChange) < 0.1) {
    return { direction: 'neutral', value: 0 };
  }

  return {
    direction: percentChange > 0 ? 'up' : 'down',
    value: Math.abs(Math.round(percentChange * 10) / 10),
  };
};

// Helper function to determine status based on value and thresholds
export const determineStatus = (
  value: number,
  thresholds: { critical?: number; warning?: number; success?: number }
): 'critical' | 'danger' | 'warning' | 'success' | 'info' | 'neutral' => {
  if (thresholds.critical !== undefined && value >= thresholds.critical) {
    return 'critical';
  }
  if (thresholds.warning !== undefined && value >= thresholds.warning) {
    return 'warning';
  }
  if (thresholds.success !== undefined && value >= thresholds.success) {
    return 'success';
  }
  return 'info';
};
