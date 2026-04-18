package com.talentx.hrms.controller.notification;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.SecurityUtils;
import com.talentx.hrms.dto.notification.NotificationCreateRequest;
import com.talentx.hrms.entity.analytics.SystemNotification;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.repository.OrganizationRepository;
import com.talentx.hrms.repository.UserRepository;
import com.talentx.hrms.service.notification.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for notification management
 */
@RestController
@RequestMapping("/notifications")
@Tag(name = "Notification Management", description = "System notification operations")
public class NotificationController {

    private final NotificationService notificationService;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;

    @Autowired
    private SecurityUtils securityUtils;

    @Autowired
    public NotificationController(NotificationService notificationService,
                                  OrganizationRepository organizationRepository,
                                  UserRepository userRepository) {
        this.notificationService = notificationService;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
    }

    /**
     * Create notification
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Create notification", description = "Create a notification for a user or organization")
    public ResponseEntity<ApiResponse<SystemNotification>> createNotification(
            @Valid @RequestBody NotificationCreateRequest request) {
        try {
            Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new RuntimeException("Organization not found"));
            User user = request.getUserId() != null
                ? userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("User not found"))
                : null;

            SystemNotification notification = notificationService.createNotification(
                organization,
                user,
                request.getNotificationType(),
                request.getTitle(),
                request.getMessage(),
                request.getActionUrl(),
                request.getExpiresAt()
            );

            return ResponseEntity.ok(ApiResponse.success("Notification created successfully", notification));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get user notifications with pagination
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get user notifications", description = "Get notifications for the current user with pagination")
    public ResponseEntity<ApiResponse<List<SystemNotification>>> getUserNotifications(
            @Parameter(description = "User ID") @RequestParam Long userId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        try {
            List<SystemNotification> notifications = notificationService.getUserNotifications(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully", notifications));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get unread notifications for a user
     */
    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get unread notifications", description = "Get all unread notifications for a user")
    public ResponseEntity<ApiResponse<List<SystemNotification>>> getUnreadNotifications(
            @Parameter(description = "User ID") @RequestParam Long userId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        try {
            List<SystemNotification> notifications = notificationService.getUnreadNotifications(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Unread notifications retrieved successfully", notifications));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get unread notification count — matches frontend /notifications/unread-count?userId=
     * If userId not provided, auto-resolves from current authenticated user
     */
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadCount(
            @RequestParam(required = false) Long userId) {
        try {
            // Auto-resolve userId from current user if not provided
            Long resolvedUserId = userId;
            if (resolvedUserId == null) {
                resolvedUserId = securityUtils.getCurrentUserId();
            }
            long count = resolvedUserId != null
                ? notificationService.countUnreadNotifications(resolvedUserId)
                : 0L;
            return ResponseEntity.ok(ApiResponse.success("Unread count retrieved",
                Map.of("count", count, "unreadCount", count)));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(ApiResponse.success("Unread count retrieved",
                Map.of("count", 0L, "unreadCount", 0L)));
        }
    }

    /**
     * Get unread notification count (alternate path)
     */
    @GetMapping("/unread/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get unread notification count", description = "Get the count of unread notifications for a user")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getUnreadNotificationCount(
            @Parameter(description = "User ID") @RequestParam Long userId) {
        try {
            long count = notificationService.countUnreadNotifications(userId);
            Map<String, Long> response = Map.of("unreadCount", count);
            return ResponseEntity.ok(ApiResponse.success("Unread notification count retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get high priority notifications
     */
    @GetMapping("/high-priority")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get high priority notifications", description = "Get high priority notifications for a user")
    public ResponseEntity<ApiResponse<List<SystemNotification>>> getHighPriorityNotifications(
            @Parameter(description = "User ID") @RequestParam Long userId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<SystemNotification> notifications = notificationService.getHighPriorityNotifications(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("High priority notifications retrieved successfully", notifications));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get recent notifications (last 24 hours)
     */
    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get recent notifications", description = "Get notifications from the last 24 hours for a user")
    public ResponseEntity<ApiResponse<List<SystemNotification>>> getRecentNotifications(
            @Parameter(description = "User ID") @RequestParam Long userId) {
        
        try {
            List<SystemNotification> notifications = notificationService.getRecentNotifications(userId);
            return ResponseEntity.ok(ApiResponse.success("Recent notifications retrieved successfully", notifications));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get notifications by type
     */
    @GetMapping("/type/{notificationType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get notifications by type", description = "Get notifications of a specific type for a user")
    public ResponseEntity<ApiResponse<List<SystemNotification>>> getNotificationsByType(
            @PathVariable String notificationType,
            @Parameter(description = "User ID") @RequestParam Long userId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "20") int size) {
        
        try {
            List<SystemNotification> notifications = notificationService.getNotificationsByType(userId, notificationType, page, size);
            return ResponseEntity.ok(ApiResponse.success("Notifications by type retrieved successfully", notifications));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get global notifications for organization
     */
    @GetMapping("/global")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get global notifications", description = "Get global notifications for an organization")
    public ResponseEntity<ApiResponse<List<SystemNotification>>> getGlobalNotifications(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size) {
        
        try {
            List<SystemNotification> notifications = notificationService.getGlobalNotifications(organizationId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Global notifications retrieved successfully", notifications));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get notification by ID
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get notification by ID", description = "Retrieve a specific notification by its ID")
    public ResponseEntity<ApiResponse<SystemNotification>> getNotification(@PathVariable Long id) {
        try {
            SystemNotification notification = notificationService.getNotificationById(id);
            return ResponseEntity.ok(ApiResponse.success("Notification retrieved successfully", notification));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Mark notification as read
     */
    @PutMapping("/{id:\\d+}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Mark notification as read", description = "Mark a specific notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        try {
            notificationService.markAsRead(id);
            return ResponseEntity.ok(ApiResponse.success("Notification marked as read successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    @PutMapping("/read-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Mark all notifications as read", description = "Mark all notifications as read for a user")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> markAllAsRead(
            @Parameter(description = "User ID") @RequestParam Long userId) {
        
        try {
            int updatedCount = notificationService.markAllAsRead(userId);
            Map<String, Integer> response = Map.of("updatedCount", updatedCount);
            return ResponseEntity.ok(ApiResponse.success("All notifications marked as read successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete notification
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Delete notification", description = "Delete a specific notification")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        try {
            notificationService.deleteNotification(id);
            return ResponseEntity.ok(ApiResponse.success("Notification deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get notification statistics — matches frontend /notifications/stats
     */
    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get notification stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long organizationId) {
        try {
            long orgId = organizationId != null ? organizationId : securityUtils.getCurrentUserOrgId();
            NotificationService.NotificationStats stats = notificationService.getNotificationStats(orgId);
            long unread = userId != null ? notificationService.countUnreadNotifications(userId) : 0L;
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("totalNotifications", stats.getTotalCount());
            map.put("unreadCount", unread);
            map.put("byType", Map.of(
                "INFO", stats.getInfoCount(),
                "WARNING", stats.getWarningCount(),
                "ERROR", stats.getErrorCount(),
                "COMPLIANCE_ALERT", stats.getComplianceAlertCount(),
                "APPROVAL_REQUEST", stats.getApprovalRequestCount()
            ));
            return ResponseEntity.ok(ApiResponse.success("Stats retrieved", map));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(ApiResponse.success("Stats retrieved", Map.of("totalNotifications", 0, "unreadCount", 0)));
        }
    }

    /**
     * Get unread notifications by user path — matches frontend /notifications/user/{userId}/unread
     */
    @GetMapping("/user/{userId:\\d+}/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get unread notifications for user")
    public ResponseEntity<ApiResponse<List<SystemNotification>>> getUnreadByUserPath(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<SystemNotification> notifications = notificationService.getUnreadNotifications(userId, page, size);
            return ResponseEntity.ok(ApiResponse.success("Unread notifications retrieved", notifications));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(ApiResponse.success("Unread notifications retrieved", List.of()));
        }
    }

    /**
     * Get notification statistics for organization
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get notification statistics", description = "Get comprehensive notification statistics for an organization")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotificationStatistics(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId) {
        
        try {
            NotificationService.NotificationStats stats = notificationService.getNotificationStats(organizationId);
            
            Map<String, Object> statisticsMap = Map.of(
                "totalCount", stats.getTotalCount(),
                "infoCount", stats.getInfoCount(),
                "warningCount", stats.getWarningCount(),
                "errorCount", stats.getErrorCount(),
                "complianceAlertCount", stats.getComplianceAlertCount(),
                "approvalRequestCount", stats.getApprovalRequestCount()
            );
            
            return ResponseEntity.ok(ApiResponse.success("Notification statistics retrieved successfully", statisticsMap));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cleanup expired notifications (admin only)
     */
    @DeleteMapping("/cleanup/expired")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cleanup expired notifications", description = "Remove expired notifications from the system")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> cleanupExpiredNotifications() {
        try {
            int deletedCount = notificationService.cleanupExpiredNotifications();
            Map<String, Integer> response = Map.of("deletedCount", deletedCount);
            return ResponseEntity.ok(ApiResponse.success("Expired notifications cleaned up successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Cleanup old read notifications (admin only)
     */
    @DeleteMapping("/cleanup/old-read")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Cleanup old read notifications", description = "Remove old read notifications from the system")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> cleanupOldReadNotifications(
            @Parameter(description = "Days old threshold") @RequestParam(defaultValue = "90") int daysOld) {
        
        try {
            int deletedCount = notificationService.cleanupOldReadNotifications(daysOld);
            Map<String, Integer> response = Map.of("deletedCount", deletedCount);
            return ResponseEntity.ok(ApiResponse.success("Old read notifications cleaned up successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }
}

