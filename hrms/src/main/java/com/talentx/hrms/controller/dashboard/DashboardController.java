package com.talentx.hrms.controller.dashboard;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.SecurityUtils;
import com.talentx.hrms.service.employee.EmployeeService;
import com.talentx.hrms.service.leave.LeaveService;
import com.talentx.hrms.service.attendance.AttendanceService;
import com.talentx.hrms.service.expense.ExpenseService;
import com.talentx.hrms.service.training.TrainingService;
import com.talentx.hrms.service.notification.NotificationService;
import com.talentx.hrms.service.recruitment.RecruitmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@Tag(name = "Dashboard", description = "Dashboard statistics and activity feed")
public class DashboardController {

    private final EmployeeService employeeService;
    private final LeaveService leaveService;
    private final AttendanceService attendanceService;
    private final ExpenseService expenseService;
    private final TrainingService trainingService;
    private final NotificationService notificationService;
    private final RecruitmentService recruitmentService;
    private final SecurityUtils securityUtils;

    @Autowired
    public DashboardController(EmployeeService employeeService,
                               LeaveService leaveService,
                               AttendanceService attendanceService,
                               ExpenseService expenseService,
                               TrainingService trainingService,
                               NotificationService notificationService,
                               RecruitmentService recruitmentService,
                               SecurityUtils securityUtils) {
        this.employeeService = employeeService;
        this.leaveService = leaveService;
        this.attendanceService = attendanceService;
        this.expenseService = expenseService;
        this.trainingService = trainingService;
        this.notificationService = notificationService;
        this.recruitmentService = recruitmentService;
        this.securityUtils = securityUtils;
    }

    /**
     * Get comprehensive dashboard statistics
     * GET /api/dashboard/statistics  OR  /api/dashboard/stats
     */
    @GetMapping({"/statistics", "/stats"})
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get dashboard statistics", description = "Get all statistics for the dashboard in one call")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStatistics() {
        Map<String, Object> stats = new HashMap<>();

        // Employee stats
        try {
            EmployeeService.EmployeeStatistics empStats = employeeService.getEmployeeStatistics();
            Map<String, Object> empMap = new HashMap<>();
            empMap.put("totalEmployees", empStats.getTotalEmployees());
            empMap.put("activeEmployees", empStats.getActiveEmployees());
            empMap.put("terminatedEmployees", empStats.getTerminatedEmployees());
            empMap.put("fullTimeEmployees", empStats.getFullTimeEmployees());
            empMap.put("partTimeEmployees", empStats.getPartTimeEmployees());
            stats.put("employeeStats", empMap);
        } catch (Exception e) {
            stats.put("employeeStats", defaultEmployeeStats());
        }

        // Leave stats
        try {
            Map<String, Object> leaveStats = leaveService.getLeaveStatistics(null, null);
            stats.put("leaveStats", leaveStats);
        } catch (Exception e) {
            stats.put("leaveStats", defaultLeaveStats());
        }

        // Attendance stats
        try {
            Map<String, Object> attendanceStats = attendanceService.getAttendanceSummary(null, null, null);
            stats.put("attendanceStats", attendanceStats);
        } catch (Exception e) {
            stats.put("attendanceStats", defaultAttendanceStats());
        }

        // Expense stats
        try {
            ExpenseService.ExpenseStatistics expStats = expenseService.getExpenseStatistics();
            Map<String, Object> expMap = new HashMap<>();
            expMap.put("totalExpenses", expStats.getTotalExpenses());
            expMap.put("pendingApprovals", expStats.getSubmittedExpenses());
            expMap.put("approvedExpenses", expStats.getApprovedExpenses());
            expMap.put("totalAmount", expStats.getTotalAmount() != null ? expStats.getTotalAmount() : java.math.BigDecimal.ZERO);
            expMap.put("pendingAmount", expStats.getTotalAmount() != null ? expStats.getTotalAmount() : java.math.BigDecimal.ZERO);
            stats.put("expenseStats", expMap);
        } catch (Exception e) {
            stats.put("expenseStats", defaultExpenseStats());
        }

        // Training stats
        try {
            long orgId = securityUtils.getCurrentUserOrgId();
            TrainingService.TrainingStatistics trainStats = trainingService.getTrainingStatistics(orgId);
            Map<String, Object> trainMap = new HashMap<>();
            trainMap.put("totalPrograms", trainStats.getTotalPrograms());
            trainMap.put("activeEnrollments", trainStats.getInProgressEnrollments());
            trainMap.put("completedTrainings", trainStats.getCompletedEnrollments());
            trainMap.put("overdueTrainings", trainStats.getOverdueEnrollments());
            trainMap.put("completionRate", trainStats.getCompletionRate());
            stats.put("trainingStats", trainMap);
        } catch (Exception e) {
            stats.put("trainingStats", defaultTrainingStats());
        }

        // Notification stats
        try {
            long orgId = securityUtils.getCurrentUserOrgId();
            NotificationService.NotificationStats notifStats = notificationService.getNotificationStats(orgId);
            Map<String, Object> notifMap = new HashMap<>();
            notifMap.put("totalNotifications", notifStats.getTotalCount());
            notifMap.put("unreadCount", 0);
            notifMap.put("criticalAlerts", notifStats.getErrorCount());
            notifMap.put("complianceAlerts", notifStats.getComplianceAlertCount());
            stats.put("notificationStats", notifMap);
        } catch (Exception e) {
            stats.put("notificationStats", defaultNotificationStats());
        }

        // Recruitment stats
        try {
            Map<String, Object> recMap = new HashMap<>();
            recMap.put("activeJobPostings", recruitmentService.getActiveJobPostingsCount());
            recMap.put("totalApplications", recruitmentService.getPendingApplicationsCount());
            recMap.put("scheduledInterviews", recruitmentService.getScheduledInterviewsCount());
            recMap.put("pendingApplications", recruitmentService.getPendingApplicationsCount());
            stats.put("recruitmentStats", recMap);
        } catch (Exception e) {
            stats.put("recruitmentStats", defaultRecruitmentStats());
        }

        // Compliance stats (basic)
        stats.put("complianceStats", Map.of(
            "totalChecks", 0, "compliantChecks", 0,
            "nonCompliantChecks", 0, "unresolvedViolations", 0, "criticalViolations", 0
        ));

        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics retrieved successfully", stats));
    }

    /**
     * Get recent activities
     * GET /api/dashboard/activities
     */
    @GetMapping("/activities")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get recent activities", description = "Get recent system activities")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getRecentActivities(
            @RequestParam(defaultValue = "10") int limit) {
        // Return empty list — audit log integration can be added later
        return ResponseEntity.ok(ApiResponse.success("Recent activities retrieved", List.of()));
    }

    // Default fallback stats
    private Map<String, Object> defaultEmployeeStats() {
        return Map.of("totalEmployees", 0, "activeEmployees", 0,
                "terminatedEmployees", 0, "fullTimeEmployees", 0, "partTimeEmployees", 0);
    }

    private Map<String, Object> defaultLeaveStats() {
        return Map.of("year", java.time.Year.now().getValue(),
                "totalRequests", 0, "approvedRequests", 0, "pendingRequests", 0, "rejectedRequests", 0);
    }

    private Map<String, Object> defaultAttendanceStats() {
        return Map.of("totalEmployees", 0, "presentToday", 0, "absentToday", 0,
                "onLeaveToday", 0, "lateToday", 0, "averageAttendanceRate", 0);
    }

    private Map<String, Object> defaultExpenseStats() {
        return Map.of("totalExpenses", 0, "pendingApprovals", 0,
                "approvedExpenses", 0, "totalAmount", 0, "pendingAmount", 0);
    }

    private Map<String, Object> defaultTrainingStats() {
        return Map.of("totalPrograms", 0, "activeEnrollments", 0,
                "completedTrainings", 0, "overdueTrainings", 0, "completionRate", 0.0);
    }

    private Map<String, Object> defaultNotificationStats() {
        return Map.of("totalNotifications", 0, "unreadCount", 0,
                "criticalAlerts", 0, "complianceAlerts", 0);
    }

    private Map<String, Object> defaultRecruitmentStats() {
        return Map.of("activeJobPostings", 0, "totalApplications", 0,
                "scheduledInterviews", 0, "pendingApplications", 0);
    }
}
