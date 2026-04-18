import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { useDashboardData, calculateTrend, determineStatus } from '../../hooks/useDashboardData';
import { Search, Moon, Sun, Bell } from 'lucide-react';

// New components
import HeroSection from '../../components/dashboard/HeroSection';
import QuickActionsSection from '../../components/dashboard/QuickActionsSection';
import SecondaryMetricsSection from '../../components/dashboard/SecondaryMetricsSection';
import ChartsSection from '../../components/dashboard/ChartsSection';
import RecentActivitySection from '../../components/dashboard/RecentActivitySection';
import UpcomingHolidays from '../../components/dashboard/UpcomingHolidays';
import TeamOutToday from '../../components/dashboard/TeamOutToday';

// Card components
import { HeroMetricCardProps } from '../../components/cards/HeroMetricCard';
import { EnhancedStatCardProps } from '../../components/cards/EnhancedStatCard';
import { ActionCardProps } from '../../components/cards/ActionCard';
import { ChartCardProps } from '../../components/cards/ChartCard';
import { ActivityItem } from '../../components/dashboard/RecentActivitySection';

// Feedback components
import SkeletonStatCard from '../../components/feedback/SkeletonStatCard';
import SkeletonChart from '../../components/feedback/SkeletonChart';
import ErrorState from '../../components/feedback/ErrorState';

// Chart component
import AnalyticsChart, { ChartData } from '../../components/charts/AnalyticsChart';

import PageTransition from '../../components/common/PageTransition';

const EnhancedDashboardPage: React.FC = () => {
  const { data: statistics, loading, error, refetch } = useDashboardData();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  // Show error toast when error occurs
  React.useEffect(() => {
    if (error) {
      toast.error('Failed to load dashboard', {
        description: error,
        action: {
          label: 'Retry',
          onClick: refetch,
        },
      });
    }
  }, [error, toast, refetch]);

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-secondary-900">Dashboard</h1>
            <p className="text-secondary-500 mt-1">Loading your dashboard...</p>
          </div>
        </div>

        {/* Skeleton Loaders */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="premium-card p-6 h-80">
              <SkeletonChart height={250} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <ErrorState
          variant="network"
          error={error}
          onRetry={refetch}
        />
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="dashboard-page">
        <ErrorState
          variant="generic"
          title="No Data Available"
          description="Unable to load dashboard statistics. Please try again."
          onRetry={refetch}
        />
      </div>
    );
  }

  // Hero Metrics (4 most critical metrics)
  const heroMetrics: HeroMetricCardProps[] = [
    {
      title: 'Total Employees',
      value: statistics.employeeStats.totalEmployees.toString(),
      icon: '👥',
      status: 'success',
      trend: {
        direction: 'up',
        value: 5.2,
        label: 'vs last month',
      },
      subtitle: `${statistics.employeeStats.activeEmployees} active`,
      onClick: () => navigate('/employees'),
    },
    {
      title: 'Attendance Today',
      value: `${Math.round((statistics.attendanceStats.presentToday / statistics.employeeStats.totalEmployees) * 100)}%`,
      icon: '⏰',
      status: statistics.attendanceStats.absentToday > 10 ? 'warning' : 'success',
      trend: {
        direction: statistics.attendanceStats.absentToday > 10 ? 'down' : 'up',
        value: 2.1,
        label: 'attendance rate',
      },
      subtitle: `${statistics.attendanceStats.presentToday} present, ${statistics.attendanceStats.absentToday} absent`,
      onClick: () => navigate('/attendance'),
    },
    {
      title: 'Pending Approvals',
      value: (statistics.leaveStats.pendingRequests + statistics.expenseStats.pendingApprovals).toString(),
      icon: '⏳',
      status: determineStatus(statistics.leaveStats.pendingRequests, { warning: 5, critical: 10 }),
      trend: {
        direction: 'neutral',
        value: 0,
      },
      subtitle: `${statistics.leaveStats.pendingRequests} leave, ${statistics.expenseStats.pendingApprovals} expenses`,
      onClick: () => navigate('/leave'),
    },
    {
      title: 'Compliance Alerts',
      value: statistics.complianceStats.criticalViolations.toString(),
      icon: '🚨',
      status: statistics.complianceStats.criticalViolations > 0 ? 'critical' : 'success',
      trend: {
        direction: statistics.complianceStats.criticalViolations > 0 ? 'up' : 'down',
        value: statistics.complianceStats.criticalViolations,
      },
      subtitle: `${statistics.complianceStats.unresolvedViolations} total violations`,
      onClick: () => navigate('/compliance'),
    },
  ];

  // Quick Actions (6 primary actions)
  const quickActions: ActionCardProps[] = [
    {
      title: 'Add Employee',
      description: 'Create a new employee record',
      icon: '👤',
      onClick: () => navigate('/employees/new'),
    },
    {
      title: 'Request Leave',
      description: 'Submit a new leave request',
      icon: '📅',
      onClick: () => navigate('/leave'),
      ...(statistics.leaveStats.pendingRequests > 0 && { badge: statistics.leaveStats.pendingRequests }),
    },
    {
      title: 'Submit Expense',
      description: 'Create a new expense claim',
      icon: '💳',
      onClick: () => navigate('/expenses'),
      ...(statistics.expenseStats.pendingApprovals > 0 && { badge: statistics.expenseStats.pendingApprovals }),
    },
    {
      title: 'Check Attendance',
      description: 'View attendance records',
      icon: '⏰',
      onClick: () => navigate('/attendance'),
    },
    {
      title: 'Compliance Dashboard',
      description: 'Check compliance status',
      icon: '⚖️',
      onClick: () => navigate('/compliance'),
      ...(statistics.complianceStats.criticalViolations > 0 && { badge: statistics.complianceStats.criticalViolations }),
    },
    {
      title: 'Training Programs',
      description: 'Browse available training',
      icon: '📚',
      onClick: () => navigate('/training'),
    },
  ];

  // Secondary Metrics (8-12 supporting metrics)
  const secondaryMetrics: EnhancedStatCardProps[] = [
    {
      title: 'Active Employees',
      value: statistics.employeeStats.activeEmployees.toString(),
      icon: '✓',
      status: 'success',
      context: 'Currently employed',
      onClick: () => navigate('/employees'),
    },
    {
      title: 'Full Time',
      value: statistics.employeeStats.fullTimeEmployees.toString(),
      icon: '👔',
      status: 'info',
      context: 'Full-time employees',
      onClick: () => navigate('/employees'),
    },
    {
      title: 'Part Time',
      value: statistics.employeeStats.partTimeEmployees.toString(),
      icon: '⏱️',
      status: 'info',
      context: 'Part-time employees',
      onClick: () => navigate('/employees'),
    },
    {
      title: 'On Leave Today',
      value: statistics.attendanceStats.onLeaveToday.toString(),
      icon: '🏖️',
      status: 'neutral',
      context: 'Employees on leave',
      onClick: () => navigate('/leave'),
    },
    {
      title: 'Late Today',
      value: statistics.attendanceStats.lateToday.toString(),
      icon: '⏰',
      status: statistics.attendanceStats.lateToday > 5 ? 'warning' : 'neutral',
      context: 'Late arrivals',
      onClick: () => navigate('/attendance'),
    },
    {
      title: 'Leave Requests',
      value: statistics.leaveStats.totalRequests.toString(),
      icon: '📅',
      status: 'info',
      trend: {
        direction: 'up',
        value: 12,
        label: 'vs last month',
      },
      onClick: () => navigate('/leave'),
    },
    {
      title: 'Total Expenses',
      value: `$${(statistics.expenseStats.totalAmount / 1000).toFixed(1)}k`,
      icon: '💰',
      status: 'info',
      context: 'This month',
      onClick: () => navigate('/expenses'),
    },
    {
      title: 'Active Training',
      value: statistics.trainingStats.activeEnrollments.toString(),
      icon: '📚',
      status: 'success',
      context: 'Ongoing programs',
      onClick: () => navigate('/training'),
    },
    {
      title: 'Overdue Training',
      value: statistics.trainingStats.overdueTrainings.toString(),
      icon: '⚠️',
      status: statistics.trainingStats.overdueTrainings > 0 ? 'warning' : 'success',
      context: 'Needs attention',
      onClick: () => navigate('/training'),
    },
    {
      title: 'Unread Notifications',
      value: statistics.notificationStats.unreadCount.toString(),
      icon: '🔔',
      status: 'info',
      context: 'New updates',
      onClick: () => navigate('/notifications'),
    },
    {
      title: 'Active Job Postings',
      value: statistics.recruitmentStats.activeJobPostings.toString(),
      icon: '📢',
      status: 'info',
      context: 'Open positions',
      onClick: () => navigate('/recruitment'),
    },
    {
      title: 'Terminated',
      value: statistics.employeeStats.terminatedEmployees.toString(),
      icon: '❌',
      status: 'neutral',
      context: 'Past employees',
      onClick: () => navigate('/employees'),
    },
  ];

  // Chart Data
  const employeeTypeData: ChartData[] = [
    { label: 'Full Time', value: statistics.employeeStats.fullTimeEmployees, color: '#4f46e5' },
    { label: 'Part Time', value: statistics.employeeStats.partTimeEmployees, color: '#10b981' },
  ];

  const employeeStatusData: ChartData[] = [
    { label: 'Active', value: statistics.employeeStats.activeEmployees, color: '#10b981' },
    { label: 'Terminated', value: statistics.employeeStats.terminatedEmployees, color: '#ef4444' },
  ];

  const leaveStatusData: ChartData[] = [
    { label: 'Approved', value: statistics.leaveStats.approvedRequests, color: '#10b981' },
    { label: 'Pending', value: statistics.leaveStats.pendingRequests, color: '#f59e0b' },
    { label: 'Rejected', value: statistics.leaveStats.rejectedRequests, color: '#ef4444' },
  ];

  const attendanceData: ChartData[] = [
    { label: 'Present', value: statistics.attendanceStats.presentToday, color: '#10b981' },
    { label: 'Absent', value: statistics.attendanceStats.absentToday, color: '#ef4444' },
    { label: 'On Leave', value: statistics.attendanceStats.onLeaveToday, color: '#f59e0b' },
    { label: 'Late', value: statistics.attendanceStats.lateToday, color: '#f97316' },
  ];

  // Charts
  const charts: ChartCardProps[] = [
    {
      title: 'Employees by Type',
      children: <AnalyticsChart data={employeeTypeData} type="bar" height={250} />,
    },
    {
      title: 'Employee Status',
      children: <AnalyticsChart data={employeeStatusData} type="pie" height={250} />,
    },
    {
      title: "Today's Attendance",
      children: <AnalyticsChart data={attendanceData} type="pie" height={250} />,
    },
    {
      title: 'Leave Requests Status',
      children: <AnalyticsChart data={leaveStatusData} type="bar" height={250} />,
    },
  ];

  // Recent Activity (mock data - would come from API in real implementation)
  const recentActivity: ActivityItem[] = [
    {
      id: '1',
      type: 'success',
      title: 'New Employee Onboarded',
      description: 'John Doe joined the Engineering team',
      timestamp: '2 hours ago',
      icon: '👤',
    },
    {
      id: '2',
      type: 'warning',
      title: 'Leave Request Pending',
      description: 'Jane Smith requested 3 days leave',
      timestamp: '4 hours ago',
      icon: '📅',
    },
    {
      id: '3',
      type: 'info',
      title: 'Training Completed',
      description: '5 employees completed Safety Training',
      timestamp: '1 day ago',
      icon: '📚',
    },
    {
      id: '4',
      type: 'danger',
      title: 'Compliance Alert',
      description: 'Document expiring in 7 days',
      timestamp: '1 day ago',
      icon: '⚠️',
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-secondary-900">Dashboard</h1>
            <p className="text-secondary-500 mt-1">Welcome back, <span className="font-semibold text-primary-600">{user?.username || 'User'}</span>!</p>
          </div>

          <div className="flex items-center gap-4">
            {/* Global Search Placeholder */}
            <div className="hidden md:flex items-center gap-2 bg-secondary-100 border border-secondary-200 px-4 py-2 rounded-xl text-secondary-500 cursor-pointer hover:bg-secondary-200 transition-all w-64 group">
              <Search className="w-4 h-4 text-secondary-400 group-hover:text-primary-500 transition-colors" />
              <span className="text-sm">Search anything...</span>
              <kbd className="ml-auto text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border border-secondary-300">⌘K</kbd>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2.5 bg-white border border-secondary-200 rounded-xl shadow-sm text-secondary-600 hover:text-primary-600 hover:border-primary-200 transition-all"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="p-2.5 bg-white border border-secondary-200 rounded-xl shadow-sm text-secondary-600 hover:text-primary-600 hover:border-primary-200 transition-all relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-danger-500 border-2 border-white rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Section - 4 Critical Metrics */}
        <HeroSection metrics={heroMetrics} />

        {/* Dynamic Overview Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ChartsSection charts={charts} title="Analytics Overview" />
          </div>
          <div className="space-y-8">
            <UpcomingHolidays />
            <TeamOutToday />
          </div>
        </div>

        {/* Quick Actions Section */}
        <QuickActionsSection actions={quickActions} title="Quick Actions" />

        {/* Secondary Metrics Section */}
        <SecondaryMetricsSection metrics={secondaryMetrics} title="Key Metrics" />

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentActivitySection
            activities={recentActivity}
            title="Recent Activity"
            onViewAll={() => navigate('/activity')}
          />
          <div className="premium-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-secondary-900">System Status</h3>
              <span className="flex items-center gap-1.5 text-xs font-bold text-success-600 uppercase tracking-widest">
                <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
                All Systems Operational
              </span>
            </div>
            <div className="space-y-4">
              <StatusRow label="API Server" status="Operational" />
              <StatusRow label="Database" status="Operational" />
              <StatusRow label="Storage (S3)" status="Operational" />
              <StatusRow label="Auth Service" status="Operational" />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

const StatusRow: React.FC<{ label: string; status: string }> = ({ label, status }) => (
  <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-xl border border-secondary-100">
    <span className="text-sm font-medium text-secondary-700">{label}</span>
    <span className="text-xs font-bold text-success-600">{status}</span>
  </div>
);

export default EnhancedDashboardPage;
