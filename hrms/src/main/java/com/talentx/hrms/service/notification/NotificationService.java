package com.talentx.hrms.service.notification;

import com.talentx.hrms.entity.analytics.SystemNotification;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.repository.SystemNotificationRepository;
import com.talentx.hrms.common.exception.EntityNotFoundException;
import com.talentx.hrms.common.exception.ValidationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    private final SystemNotificationRepository notificationRepository;

    @Autowired
    public NotificationService(SystemNotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Create a new notification
     */
    public SystemNotification createNotification(Organization organization, User user, String notificationType, 
                                               String title, String message) {
        return createNotification(organization, user, notificationType, title, message, null, null);
    }

    /**
     * Create a new notification with action URL and expiry
     */
    public SystemNotification createNotification(Organization organization, User user, String notificationType, 
                                               String title, String message, String actionUrl, Instant expiresAt) {
        if (organization == null) {
            throw new ValidationException("Organization is required");
        }
        
        if (title == null || title.trim().isEmpty()) {
            throw new ValidationException("Title is required");
        }
        
        if (message == null || message.trim().isEmpty()) {
            throw new ValidationException("Message is required");
        }
        
        if (notificationType == null || notificationType.trim().isEmpty()) {
            throw new ValidationException("Notification type is required");
        }

        SystemNotification notification = new SystemNotification(organization, user, notificationType, title, message);
        notification.setActionUrl(actionUrl);
        notification.setExpiresAt(expiresAt);

        SystemNotification savedNotification = notificationRepository.save(notification);
        
        logger.info("Created notification: {} for user: {} in organization: {}", 
                   savedNotification.getId(), 
                   user != null ? user.getId() : "global", 
                   organization.getId());
        
        return savedNotification;
    }

    /**
     * Create a global notification for all users in an organization
     */
    public SystemNotification createGlobalNotification(Organization organization, String notificationType, 
                                                     String title, String message) {
        return createNotification(organization, null, notificationType, title, message, null, null);
    }

    /**
     * Create a compliance alert notification
     */
    public SystemNotification createComplianceAlert(Organization organization, User user, String title, String message, String actionUrl) {
        Instant expiresAt = Instant.now().plus(30, ChronoUnit.DAYS); // Compliance alerts expire in 30 days
        return createNotification(organization, user, "COMPLIANCE_ALERT", title, message, actionUrl, expiresAt);
    }

    /**
     * Create an approval request notification
     */
    public SystemNotification createApprovalRequest(Organization organization, User user, String title, String message, String actionUrl) {
        Instant expiresAt = Instant.now().plus(7, ChronoUnit.DAYS); // Approval requests expire in 7 days
        return createNotification(organization, user, "APPROVAL_REQUEST", title, message, actionUrl, expiresAt);
    }

    /**
     * Create a document expiry notification
     */
    public SystemNotification createDocumentExpiryNotification(Organization organization, User user, String documentTitle, Instant expiryDate) {
        String title = "Document Expiring Soon";
        String message = String.format("Document '%s' expires on %s", documentTitle, expiryDate.toString());
        String actionUrl = "/documents"; // Could be more specific with document ID
        
        return createNotification(organization, user, "WARNING", title, message, actionUrl, expiryDate);
    }

    /**
     * Get notifications for a user with pagination
     */
    @Transactional(readOnly = true)
    public List<SystemNotification> getUserNotifications(Long userId, int page, int size) {
        if (userId == null) return java.util.Collections.emptyList();
        try {
            Pageable pageable = PageRequest.of(page, size);
            List<SystemNotification> result = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
            return result != null ? result : java.util.Collections.emptyList();
        } catch (Exception e) {
            logger.warn("Failed to fetch notifications for userId={}: {}", userId, e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    /**
     * Get unread notifications for a user
     */
    @Transactional(readOnly = true)
    public List<SystemNotification> getUnreadNotifications(Long userId) {
        return notificationRepository.findUnreadByUserId(userId);
    }

    /**
     * Get unread notifications for a user with pagination
     */
    @Transactional(readOnly = true)
    public List<SystemNotification> getUnreadNotifications(Long userId, int page, int size) {
        if (userId == null) return java.util.Collections.emptyList();
        try {
            Pageable pageable = PageRequest.of(page, size);
            List<SystemNotification> result = notificationRepository.findUnreadByUserId(userId, pageable);
            return result != null ? result : java.util.Collections.emptyList();
        } catch (Exception e) {
            logger.warn("Failed to fetch unread notifications for userId={}: {}", userId, e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    /**
     * Count unread notifications for a user
     */
    @Transactional(readOnly = true)
    public long countUnreadNotifications(Long userId) {
        if (userId == null) return 0L;
        try {
            return notificationRepository.countUnreadByUserId(userId);
        } catch (Exception e) {
            logger.warn("Failed to count unread notifications for userId={}: {}", userId, e.getMessage());
            return 0L;
        }
    }

    /**
     * Get high priority notifications for a user
     */
    @Transactional(readOnly = true)
    public List<SystemNotification> getHighPriorityNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findHighPriorityByUserId(userId, pageable);
    }

    /**
     * Get recent notifications for a user (last 24 hours)
     */
    @Transactional(readOnly = true)
    public List<SystemNotification> getRecentNotifications(Long userId) {
        if (userId == null) return java.util.Collections.emptyList();
        try {
            Instant since = Instant.now().minus(24, ChronoUnit.HOURS);
            List<SystemNotification> result = notificationRepository.findRecentByUserId(userId, since);
            return result != null ? result : java.util.Collections.emptyList();
        } catch (Exception e) {
            logger.warn("Failed to fetch recent notifications for userId={}: {}", userId, e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    /**
     * Mark a notification as read
     */
    public void markAsRead(Long notificationId) {
        Optional<SystemNotification> notificationOpt = notificationRepository.findById(notificationId);
        if (notificationOpt.isEmpty()) {
            throw new EntityNotFoundException("Notification not found with id: " + notificationId);
        }

        SystemNotification notification = notificationOpt.get();
        if (!notification.getIsRead()) {
            notification.markAsRead();
            notificationRepository.save(notification);
            
            logger.info("Marked notification {} as read", notificationId);
        }
    }

    /**
     * Mark all notifications as read for a user
     */
    public int markAllAsRead(Long userId) {
        Instant readAt = Instant.now();
        int updatedCount = notificationRepository.markAllAsReadForUser(userId, readAt);
        
        logger.info("Marked {} notifications as read for user {}", updatedCount, userId);
        return updatedCount;
    }

    /**
     * Delete a notification
     */
    public void deleteNotification(Long notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new EntityNotFoundException("Notification not found with id: " + notificationId);
        }

        notificationRepository.deleteById(notificationId);
        logger.info("Deleted notification {}", notificationId);
    }

    /**
     * Get notification by ID
     */
    @Transactional(readOnly = true)
    public SystemNotification getNotificationById(Long notificationId) {
        return notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + notificationId));
    }

    /**
     * Get notifications by type for a user
     */
    @Transactional(readOnly = true)
    public List<SystemNotification> getNotificationsByType(Long userId, String notificationType, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByUserIdAndNotificationTypeOrderByCreatedAtDesc(userId, notificationType, pageable);
    }

    /**
     * Get global notifications for an organization
     */
    @Transactional(readOnly = true)
    public List<SystemNotification> getGlobalNotifications(Long organizationId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findGlobalNotificationsByOrganization(organizationId, pageable);
    }

    /**
     * Clean up expired notifications
     */
    public int cleanupExpiredNotifications() {
        Instant now = Instant.now();
        int deletedCount = notificationRepository.deleteExpiredNotifications(now);
        
        if (deletedCount > 0) {
            logger.info("Cleaned up {} expired notifications", deletedCount);
        }
        
        return deletedCount;
    }

    /**
     * Clean up old read notifications (older than specified days)
     */
    public int cleanupOldReadNotifications(int daysOld) {
        Instant cutoffDate = Instant.now().minus(daysOld, ChronoUnit.DAYS);
        int deletedCount = notificationRepository.deleteOldReadNotifications(cutoffDate);
        
        if (deletedCount > 0) {
            logger.info("Cleaned up {} old read notifications older than {} days", deletedCount, daysOld);
        }
        
        return deletedCount;
    }

    /**
     * Get notification statistics for an organization
     */
    @Transactional(readOnly = true)
    public NotificationStats getNotificationStats(Long organizationId) {
        // Count total by summing all types — avoids passing null to JPQL query
        long infoCount = notificationRepository.countByOrganizationIdAndNotificationType(organizationId, "INFO");
        long warningCount = notificationRepository.countByOrganizationIdAndNotificationType(organizationId, "WARNING");
        long errorCount = notificationRepository.countByOrganizationIdAndNotificationType(organizationId, "ERROR");
        long complianceAlertCount = notificationRepository.countByOrganizationIdAndNotificationType(organizationId, "COMPLIANCE_ALERT");
        long approvalRequestCount = notificationRepository.countByOrganizationIdAndNotificationType(organizationId, "APPROVAL_REQUEST");
        long successCount = notificationRepository.countByOrganizationIdAndNotificationType(organizationId, "SUCCESS");
        long totalCount = infoCount + warningCount + errorCount + complianceAlertCount + approvalRequestCount + successCount;

        return new NotificationStats(totalCount, infoCount, warningCount, errorCount, complianceAlertCount, approvalRequestCount);
    }

    /**
     * Notification statistics inner class
     */
    public static class NotificationStats {
        private final long totalCount;
        private final long infoCount;
        private final long warningCount;
        private final long errorCount;
        private final long complianceAlertCount;
        private final long approvalRequestCount;

        public NotificationStats(long totalCount, long infoCount, long warningCount, long errorCount, 
                               long complianceAlertCount, long approvalRequestCount) {
            this.totalCount = totalCount;
            this.infoCount = infoCount;
            this.warningCount = warningCount;
            this.errorCount = errorCount;
            this.complianceAlertCount = complianceAlertCount;
            this.approvalRequestCount = approvalRequestCount;
        }

        // Getters
        public long getTotalCount() { return totalCount; }
        public long getInfoCount() { return infoCount; }
        public long getWarningCount() { return warningCount; }
        public long getErrorCount() { return errorCount; }
        public long getComplianceAlertCount() { return complianceAlertCount; }
        public long getApprovalRequestCount() { return approvalRequestCount; }
    }
}

