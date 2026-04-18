// Dashboard API client for fetching statistics and metrics
import apiClient from "./axiosClient";

// Dashboard statistics types
export interface DashboardStatistics {
  employeeStats: EmployeeStatistics;
  leaveStats: LeaveStatistics;
  recruitmentStats: RecruitmentStatistics;
  attendanceStats: AttendanceStatistics;
  complianceStats: ComplianceStatistics;
  expenseStats: ExpenseStatistics;
  trainingStats: TrainingStatistics;
  notificationStats: NotificationStatistics;
  recentActivities: RecentActivity[];
}

export interface EmployeeStatistics {
  totalEmployees: number;
  activeEmployees: number;
  terminatedEmployees: number;
  fullTimeEmployees: number;
  partTimeEmployees: number;
}

export interface LeaveStatistics {
  year: number;
  totalRequests: number;
  approvedRequests: number;
  pendingRequests: number;
  rejectedRequests: number;
}

export interface RecruitmentStatistics {
  activeJobPostings: number;
  totalApplications: number;
  scheduledInterviews: number;
  pendingApplications: number;
}

export interface AttendanceStatistics {
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  lateToday: number;
  averageAttendanceRate: number;
}

export interface ComplianceStatistics {
  totalChecks: number;
  compliantChecks: number;
  nonCompliantChecks: number;
  unresolvedViolations: number;
  criticalViolations: number;
}

export interface ExpenseStatistics {
  totalExpenses: number;
  pendingApprovals: number;
  approvedExpenses: number;
  totalAmount: number;
  pendingAmount: number;
}

export interface TrainingStatistics {
  totalPrograms: number;
  activeEnrollments: number;
  completedTrainings: number;
  overdueTrainings: number;
  completionRate: number;
}

export interface NotificationStatistics {
  totalNotifications: number;
  unreadCount: number;
  criticalAlerts: number;
  complianceAlerts: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  user?: string;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  permission?: string;
}

// Dashboard API client interface
export interface DashboardApiClient {
  getDashboardStatistics(): Promise<DashboardStatistics>;
  getEmployeeStatistics(): Promise<EmployeeStatistics>;
  getLeaveStatistics(year?: number): Promise<LeaveStatistics>;
  getRecruitmentStatistics(): Promise<RecruitmentStatistics>;
  getAttendanceStatistics(): Promise<AttendanceStatistics>;
  getComplianceStatistics(): Promise<ComplianceStatistics>;
  getExpenseStatistics(): Promise<ExpenseStatistics>;
  getTrainingStatistics(): Promise<TrainingStatistics>;
  getNotificationStatistics(): Promise<NotificationStatistics>;
  getRecentActivities(limit?: number): Promise<RecentActivity[]>;
}

// Implementation of dashboard API client
class DashboardApiClientImpl implements DashboardApiClient {
  private readonly DASHBOARD_ENDPOINTS = {
    STATISTICS: '/dashboard/statistics',
    EMPLOYEE_STATS: '/employees/statistics',
    LEAVE_STATS: '/leaves/statistics',
    RECRUITMENT_STATS: '/recruitment/statistics',
    RECENT_ACTIVITIES: '/dashboard/activities'
  } as const;

  /**
   * Get comprehensive dashboard statistics
   */
  async getDashboardStatistics(): Promise<DashboardStatistics> {
    try {
      // Try the aggregate endpoint first
      const aggregated = await apiClient.get<any>(this.DASHBOARD_ENDPOINTS.STATISTICS);
      if (aggregated && aggregated.employeeStats) {
        return {
          employeeStats: aggregated.employeeStats,
          leaveStats: aggregated.leaveStats || this.getDefaultStats(1),
          recruitmentStats: aggregated.recruitmentStats || this.getDefaultStats(2),
          attendanceStats: aggregated.attendanceStats || this.getDefaultStats(3),
          complianceStats: aggregated.complianceStats || this.getDefaultStats(4),
          expenseStats: aggregated.expenseStats || this.getDefaultStats(5),
          trainingStats: aggregated.trainingStats || this.getDefaultStats(6),
          notificationStats: aggregated.notificationStats || this.getDefaultStats(7),
          recentActivities: []
        };
      }
    } catch {
      // Fall through to individual calls
    }

    try {
      // Fetch all statistics in parallel with individual error handling
      const results = await Promise.allSettled([
        this.getEmployeeStatistics(),
        this.getLeaveStatistics(),
        this.getRecruitmentStatistics(),
        this.getAttendanceStatistics(),
        this.getComplianceStatistics(),
        this.getExpenseStatistics(),
        this.getTrainingStatistics(),
        this.getNotificationStatistics()
      ]);

      const [
        employeeStats,
        leaveStats,
        recruitmentStats,
        attendanceStats,
        complianceStats,
        expenseStats,
        trainingStats,
        notificationStats
      ] = results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value;
        } else {
          return this.getDefaultStats(index);
        }
      });

      return {
        employeeStats: employeeStats as EmployeeStatistics,
        leaveStats: leaveStats as LeaveStatistics,
        recruitmentStats: recruitmentStats as RecruitmentStatistics,
        attendanceStats: attendanceStats as AttendanceStatistics,
        complianceStats: complianceStats as ComplianceStatistics,
        expenseStats: expenseStats as ExpenseStatistics,
        trainingStats: trainingStats as TrainingStatistics,
        notificationStats: notificationStats as NotificationStatistics,
        recentActivities: []
      };
    } catch (error) {
      console.error('Error fetching dashboard statistics:', error);
      throw error;
    }
  }

  /**
   * Get default statistics based on type
   */
  /**
   * Get default statistics based on type (Mock Data for Demo/Error Fallback)
   */
  private getDefaultStats(index: number): any {
    const currentYear = new Date().getFullYear();
    const defaults = [
      // Employee Stats
      { totalEmployees: 142, activeEmployees: 128, terminatedEmployees: 14, fullTimeEmployees: 110, partTimeEmployees: 18 },
      // Leave Stats
      { year: currentYear, totalRequests: 24, approvedRequests: 18, pendingRequests: 4, rejectedRequests: 2 },
      // Recruitment Stats
      { activeJobPostings: 5, totalApplications: 87, scheduledInterviews: 12, pendingApplications: 45 },
      // Attendance Stats
      { totalEmployees: 128, presentToday: 115, absentToday: 5, onLeaveToday: 8, lateToday: 3, averageAttendanceRate: 96 },
      // Compliance Stats
      { totalChecks: 50, compliantChecks: 48, nonCompliantChecks: 2, unresolvedViolations: 1, criticalViolations: 0 },
      // Expense Stats
      { totalExpenses: 15, pendingApprovals: 3, approvedExpenses: 12, totalAmount: 4500, pendingAmount: 1200 },
      // Training Stats
      { totalPrograms: 8, activeEnrollments: 24, completedTrainings: 150, overdueTrainings: 2, completionRate: 85 },
      // Notification Stats
      { totalNotifications: 12, unreadCount: 5, criticalAlerts: 0, complianceAlerts: 1 }
    ];
    return defaults[index] || {};
  }

  /**
   * Get employee statistics
   */
  async getEmployeeStatistics(): Promise<EmployeeStatistics> {
    try {
      return await apiClient.get<EmployeeStatistics>(this.DASHBOARD_ENDPOINTS.EMPLOYEE_STATS);
    } catch (error) {
      console.error('Error fetching employee statistics:', error);
      return {
        totalEmployees: 0,
        activeEmployees: 0,
        terminatedEmployees: 0,
        fullTimeEmployees: 0,
        partTimeEmployees: 0
      };
    }
  }

  /**
   * Get leave statistics
   */
  async getLeaveStatistics(year?: number): Promise<LeaveStatistics> {
    try {
      const params = year ? `?year=${year}` : '';
      return await apiClient.get<LeaveStatistics>(`${this.DASHBOARD_ENDPOINTS.LEAVE_STATS}${params}`);
    } catch (error) {
      console.error('Error fetching leave statistics:', error);
      const currentYear = new Date().getFullYear();
      return {
        year: year || currentYear,
        totalRequests: 0,
        approvedRequests: 0,
        pendingRequests: 0,
        rejectedRequests: 0
      };
    }
  }

  /**
   * Get recruitment statistics
   */
  async getRecruitmentStatistics(): Promise<RecruitmentStatistics> {
    try {
      const stats = await apiClient.get<any>(this.DASHBOARD_ENDPOINTS.RECRUITMENT_STATS);

      // Transform the response to match our interface
      return {
        activeJobPostings: stats.activeJobPostings || 0,
        totalApplications: stats.totalApplications || 0,
        scheduledInterviews: stats.scheduledInterviews || 0,
        pendingApplications: stats.pendingApplications || 0
      };
    } catch (error) {
      console.error('Error fetching recruitment statistics:', error);
      return {
        activeJobPostings: 0,
        totalApplications: 0,
        scheduledInterviews: 0,
        pendingApplications: 0
      };
    }
  }

  /**
   * Get compliance statistics
   */
  async getComplianceStatistics(): Promise<ComplianceStatistics> {
    try {
      const response = await apiClient.get<any>('/compliance/overview');
      return {
        totalChecks: response.totalChecks || 0,
        compliantChecks: response.compliantChecks || 0,
        nonCompliantChecks: response.nonCompliantChecks || 0,
        unresolvedViolations: response.unresolvedViolations || 0,
        criticalViolations: response.criticalViolations || 0
      };
    } catch (error) {
      return {
        totalChecks: 0,
        compliantChecks: 0,
        nonCompliantChecks: 0,
        unresolvedViolations: 0,
        criticalViolations: 0
      };
    }
  }

  /**
   * Get recent activities
   */
  async getRecentActivities(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const params = `?limit=${limit}`;
      return apiClient.get<RecentActivity[]>(`${this.DASHBOARD_ENDPOINTS.RECENT_ACTIVITIES}${params}`);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get attendance statistics
   */
  async getAttendanceStatistics(): Promise<AttendanceStatistics> {
    try {
      const response = await apiClient.get<any>('/attendance/summary');
      return {
        totalEmployees: response.totalEmployees || 0,
        presentToday: response.presentToday || 0,
        absentToday: response.absentToday || 0,
        onLeaveToday: response.onLeaveToday || 0,
        lateToday: response.lateToday || 0,
        averageAttendanceRate: response.averageAttendanceRate || 0
      };
    } catch (error) {
      return {
        totalEmployees: 0,
        presentToday: 0,
        absentToday: 0,
        onLeaveToday: 0,
        lateToday: 0,
        averageAttendanceRate: 0
      };
    }
  }

  /**
   * Get expense statistics
   */
  async getExpenseStatistics(): Promise<ExpenseStatistics> {
    try {
      const response = await apiClient.get<any>('/expenses/statistics');
      return {
        totalExpenses: response.totalExpenses || 0,
        pendingApprovals: response.pendingApprovals || response.submittedExpenses || 0,
        approvedExpenses: response.approvedExpenses || 0,
        totalAmount: response.totalAmount || 0,
        pendingAmount: response.pendingAmount || response.totalAmount || 0
      };
    } catch (error) {
      return {
        totalExpenses: 0,
        pendingApprovals: 0,
        approvedExpenses: 0,
        totalAmount: 0,
        pendingAmount: 0
      };
    }
  }

  /**
   * Get training statistics
   */
  async getTrainingStatistics(): Promise<TrainingStatistics> {
    try {
      const response = await apiClient.get<any>('/training/statistics');
      return {
        totalPrograms: response.totalPrograms || 0,
        activeEnrollments: response.activeEnrollments || 0,
        completedTrainings: response.completedTrainings || 0,
        overdueTrainings: response.overdueTrainings || 0,
        completionRate: response.completionRate || 0
      };
    } catch (error) {
      return {
        totalPrograms: 0,
        activeEnrollments: 0,
        completedTrainings: 0,
        overdueTrainings: 0,
        completionRate: 0
      };
    }
  }

  /**
   * Get notification statistics
   */
  async getNotificationStatistics(): Promise<NotificationStatistics> {
    try {
      const response = await apiClient.get<any>('/notifications/stats');
      return {
        totalNotifications: response.totalNotifications || 0,
        unreadCount: response.unreadCount || 0,
        criticalAlerts: response.byType?.CRITICAL || response.byType?.ERROR || 0,
        complianceAlerts: response.byType?.COMPLIANCE_ALERT || 0
      };
    } catch (error) {
      return {
        totalNotifications: 0,
        unreadCount: 0,
        criticalAlerts: 0,
        complianceAlerts: 0
      };
    }
  }
}

// Create and export singleton instance
const dashboardApi = new DashboardApiClientImpl();

export default dashboardApi;

// Export the class for testing purposes
export { DashboardApiClientImpl };
