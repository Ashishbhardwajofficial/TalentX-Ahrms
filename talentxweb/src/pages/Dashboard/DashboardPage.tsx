import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardApi, {
  DashboardStatistics
} from '../../api/dashboardApi';
import StatCard from '../../components/common/StatCard';
import AnalyticsChart, { ChartData } from '../../components/charts/AnalyticsChart';
import QuickActions, { QuickAction } from '../../components/common/QuickActions';
import NotificationWidget from '../../components/common/NotificationWidget';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import SkeletonStatCard from '../../components/feedback/SkeletonStatCard';
import SkeletonChart from '../../components/feedback/SkeletonChart';
import ErrorState from '../../components/feedback/ErrorState';

const DashboardPage: React.FC = () => {
  const [statistics, setStatistics] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardApi.getDashboardStatistics();
      setStatistics(data);
    } catch (err: any) {
      console.error('Error loading dashboard data:', err);
      const errorMessage = err.message || 'Failed to load dashboard data';
      setError(errorMessage);
      toast.error('Failed to load dashboard', {
        description: errorMessage,
        action: {
          label: 'Retry',
          onClick: loadDashboardData,
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: 'add-employee',
      title: 'Add Employee',
      description: 'Create a new employee record',
      icon: '👤',
      link: '/employees/new',
      color: '#4f46e5'
    },
    {
      id: 'request-leave',
      title: 'Request Leave',
      description: 'Submit a new leave request',
      icon: '📅',
      link: '/leave',
      color: '#10b981'
    },
    {
      id: 'check-attendance',
      title: 'Check Attendance',
      description: 'View attendance records',
      icon: '⏰',
      link: '/attendance',
      color: '#f59e0b'
    },
    {
      id: 'submit-expense',
      title: 'Submit Expense',
      description: 'Create a new expense claim',
      icon: '💳',
      link: '/expenses',
      color: '#8b5cf6'
    },
    {
      id: 'view-compliance',
      title: 'Compliance Dashboard',
      description: 'Check compliance status',
      icon: '⚖️',
      link: '/compliance',
      color: '#ef4444'
    },
    {
      id: 'view-training',
      title: 'Training Programs',
      description: 'Browse available training',
      icon: '📚',
      link: '/training',
      color: '#06b6d4'
    }
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p className="dashboard-welcome">Loading your dashboard...</p>
        </div>

        {/* Skeleton Loaders */}
        <div className="dashboard-stats">
          {Array.from({ length: 14 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>

        <div className="dashboard-charts">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="chart-container">
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
          onRetry={loadDashboardData}
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
          onRetry={loadDashboardData}
        />
      </div>
    );
  }

  // Prepare chart data
  const employeeTypeData: ChartData[] = [
    { label: 'Full Time', value: statistics.employeeStats.fullTimeEmployees, color: '#4f46e5' },
    { label: 'Part Time', value: statistics.employeeStats.partTimeEmployees, color: '#10b981' }
  ];

  const employeeStatusData: ChartData[] = [
    { label: 'Active', value: statistics.employeeStats.activeEmployees, color: '#10b981' },
    { label: 'Terminated', value: statistics.employeeStats.terminatedEmployees, color: '#ef4444' }
  ];

  const leaveStatusData: ChartData[] = [
    { label: 'Approved', value: statistics.leaveStats.approvedRequests, color: '#10b981' },
    { label: 'Pending', value: statistics.leaveStats.pendingRequests, color: '#f59e0b' },
    { label: 'Rejected', value: statistics.leaveStats.rejectedRequests, color: '#ef4444' }
  ];

  const attendanceData: ChartData[] = [
    { label: 'Present', value: statistics.attendanceStats.presentToday, color: '#10b981' },
    { label: 'Absent', value: statistics.attendanceStats.absentToday, color: '#ef4444' },
    { label: 'On Leave', value: statistics.attendanceStats.onLeaveToday, color: '#f59e0b' },
    { label: 'Late', value: statistics.attendanceStats.lateToday, color: '#f97316' }
  ];

  const complianceData: ChartData[] = [
    { label: 'Compliant', value: statistics.complianceStats.compliantChecks, color: '#10b981' },
    { label: 'Non-Compliant', value: statistics.complianceStats.nonCompliantChecks, color: '#ef4444' }
  ];

  const expenseData: ChartData[] = [
    { label: 'Approved', value: statistics.expenseStats.approvedExpenses, color: '#10b981' },
    { label: 'Pending', value: statistics.expenseStats.pendingApprovals, color: '#f59e0b' }
  ];

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-welcome">Welcome back, {user?.username || 'User'}!</p>
      </div>

      {/* Key Metrics */}
      <div className="dashboard-stats">
        {/* Employee Stats */}
        <StatCard
          title="Total Employees"
          value={statistics.employeeStats.totalEmployees}
          icon="👥"
          color="primary"
          onClick={() => navigate('/employees')}
        />
        <StatCard
          title="Active Employees"
          value={statistics.employeeStats.activeEmployees}
          icon="✓"
          color="success"
          onClick={() => navigate('/employees')}
        />

        {/* Attendance Stats */}
        <StatCard
          title="Present Today"
          value={statistics.attendanceStats.presentToday}
          icon="⏰"
          color="success"
          onClick={() => navigate('/attendance')}
        />
        <StatCard
          title="Absent Today"
          value={statistics.attendanceStats.absentToday}
          icon="❌"
          color="danger"
          onClick={() => navigate('/attendance')}
        />

        {/* Leave Stats */}
        <StatCard
          title="Leave Requests"
          value={statistics.leaveStats.totalRequests}
          icon="📅"
          color="info"
          onClick={() => navigate('/leave')}
        />
        <StatCard
          title="Pending Approvals"
          value={statistics.leaveStats.pendingRequests}
          icon="⏳"
          color="warning"
          onClick={() => navigate('/leave')}
        />

        {/* Compliance Stats */}
        <StatCard
          title="Compliance Violations"
          value={statistics.complianceStats.unresolvedViolations}
          icon="⚖️"
          color="danger"
          onClick={() => navigate('/compliance')}
        />
        <StatCard
          title="Critical Alerts"
          value={statistics.complianceStats.criticalViolations}
          icon="🚨"
          color="danger"
          onClick={() => navigate('/compliance')}
        />

        {/* Expense Stats */}
        <StatCard
          title="Pending Expenses"
          value={statistics.expenseStats.pendingApprovals}
          icon="💳"
          color="warning"
          onClick={() => navigate('/expenses')}
        />
        <StatCard
          title="Total Expenses"
          value={`$${statistics.expenseStats.totalAmount.toLocaleString()}`}
          icon="💰"
          color="info"
          onClick={() => navigate('/expenses')}
        />

        {/* Training Stats */}
        <StatCard
          title="Active Training"
          value={statistics.trainingStats.activeEnrollments}
          icon="📚"
          color="primary"
          onClick={() => navigate('/training')}
        />
        <StatCard
          title="Overdue Training"
          value={statistics.trainingStats.overdueTrainings}
          icon="⏰"
          color="warning"
          onClick={() => navigate('/training')}
        />

        {/* Notification Stats */}
        <StatCard
          title="Unread Notifications"
          value={statistics.notificationStats.unreadCount}
          icon="🔔"
          color="info"
          onClick={() => navigate('/notifications')}
        />

        {/* Recruitment Stats */}
        <StatCard
          title="Active Job Postings"
          value={statistics.recruitmentStats.activeJobPostings}
          icon="📢"
          color="primary"
          onClick={() => navigate('/recruitment')}
        />
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts">
        <div className="chart-container">
          <AnalyticsChart
            title="Employees by Type"
            data={employeeTypeData}
            type="bar"
            height={250}
          />
        </div>
        <div className="chart-container">
          <AnalyticsChart
            title="Employee Status"
            data={employeeStatusData}
            type="pie"
            height={250}
          />
        </div>
        <div className="chart-container">
          <AnalyticsChart
            title="Today's Attendance"
            data={attendanceData}
            type="pie"
            height={250}
          />
        </div>
        <div className="chart-container">
          <AnalyticsChart
            title="Leave Requests Status"
            data={leaveStatusData}
            type="bar"
            height={250}
          />
        </div>
        <div className="chart-container">
          <AnalyticsChart
            title="Compliance Status"
            data={complianceData}
            type="pie"
            height={250}
          />
        </div>
        <div className="chart-container">
          <AnalyticsChart
            title="Expense Status"
            data={expenseData}
            type="bar"
            height={250}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-actions">
        <QuickActions actions={quickActions} />
      </div>

      {/* Notifications Widget */}
      <div className="dashboard-notifications">
        {user?.id && (
          <NotificationWidget userId={user.id} maxItems={5} />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;