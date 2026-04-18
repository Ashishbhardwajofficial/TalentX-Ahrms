package com.talentx.hrms.repository;

import com.talentx.hrms.entity.analytics.SystemNotification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface SystemNotificationRepository extends JpaRepository<SystemNotification, Long> {
    
    /**
     * Find notifications by user ID ordered by creation date (newest first)
     */
    @Query("SELECT n FROM SystemNotification n WHERE n.user.id = :userId ORDER BY n.createdAt DESC")
    List<SystemNotification> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Find unread notifications by user ID
     */
    @Query("SELECT n FROM SystemNotification n WHERE n.user.id = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<SystemNotification> findUnreadByUserId(@Param("userId") Long userId);
    
    /**
     * Find unread notifications by user ID with pagination
     */
    @Query("SELECT n FROM SystemNotification n WHERE n.user.id = :userId AND n.isRead = false ORDER BY n.createdAt DESC")
    List<SystemNotification> findUnreadByUserId(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Count unread notifications for a user
     */
    @Query("SELECT COUNT(n) FROM SystemNotification n WHERE n.user.id = :userId AND n.isRead = false")
    long countUnreadByUserId(@Param("userId") Long userId);
    
    /**
     * Find notifications by organization ID
     */
    @Query("SELECT n FROM SystemNotification n WHERE n.organization.id = :organizationId ORDER BY n.createdAt DESC")
    List<SystemNotification> findByOrganizationIdOrderByCreatedAtDesc(@Param("organizationId") Long organizationId, Pageable pageable);
    
    /**
     * Find notifications by type
     */
    List<SystemNotification> findByNotificationTypeOrderByCreatedAtDesc(String notificationType, Pageable pageable);
    
    /**
     * Find notifications by type for a specific user
     */
    @Query("SELECT n FROM SystemNotification n WHERE n.user.id = :userId AND n.notificationType = :type ORDER BY n.createdAt DESC")
    List<SystemNotification> findByUserIdAndNotificationTypeOrderByCreatedAtDesc(@Param("userId") Long userId, 
                                                                                @Param("type") String notificationType, 
                                                                                Pageable pageable);
    
    /**
     * Find high priority notifications for a user
     */
    @Query("SELECT n FROM SystemNotification n WHERE n.user.id = :userId AND n.notificationType IN ('ERROR', 'COMPLIANCE_ALERT', 'APPROVAL_REQUEST') ORDER BY n.createdAt DESC")
    List<SystemNotification> findHighPriorityByUserId(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Find expired notifications
     */
    @Query("SELECT n FROM SystemNotification n WHERE n.expiresAt IS NOT NULL AND n.expiresAt < :now")
    List<SystemNotification> findExpiredNotifications(@Param("now") Instant now);
    
    /**
     * Find notifications created within a date range
     */
    @Query("SELECT n FROM SystemNotification n WHERE n.createdAt BETWEEN :startDate AND :endDate ORDER BY n.createdAt DESC")
    List<SystemNotification> findByCreatedAtBetween(@Param("startDate") Instant startDate, 
                                                   @Param("endDate") Instant endDate, 
                                                   Pageable pageable);
    
    /**
     * Mark notification as read
     */
    @Modifying
    @Query("UPDATE SystemNotification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :id")
    int markAsRead(@Param("id") Long id, @Param("readAt") Instant readAt);
    
    /**
     * Mark all notifications as read for a user
     */
    @Modifying
    @Query("UPDATE SystemNotification n SET n.isRead = true, n.readAt = :readAt WHERE n.user.id = :userId AND n.isRead = false")
    int markAllAsReadForUser(@Param("userId") Long userId, @Param("readAt") Instant readAt);
    
    /**
     * Delete expired notifications
     */
    @Modifying
    @Query("DELETE FROM SystemNotification n WHERE n.expiresAt IS NOT NULL AND n.expiresAt < :now")
    int deleteExpiredNotifications(@Param("now") Instant now);
    
    /**
     * Delete old read notifications (cleanup)
     */
    @Modifying
    @Query("DELETE FROM SystemNotification n WHERE n.isRead = true AND n.readAt < :cutoffDate")
    int deleteOldReadNotifications(@Param("cutoffDate") Instant cutoffDate);
    
    /**
     * Find notifications for multiple users (for broadcast notifications)
     */
    @Query("SELECT n FROM SystemNotification n WHERE n.user.id IN :userIds ORDER BY n.createdAt DESC")
    List<SystemNotification> findByUserIdIn(@Param("userIds") List<Long> userIds, Pageable pageable);
    
    /**
     * Find global notifications (notifications without specific user)
     */
    @Query("SELECT n FROM SystemNotification n WHERE n.user IS NULL AND n.organization.id = :organizationId ORDER BY n.createdAt DESC")
    List<SystemNotification> findGlobalNotificationsByOrganization(@Param("organizationId") Long organizationId, Pageable pageable);
    
    /**
     * Count notifications by type and organization
     * Note: type must not be null — use countAllByOrganizationId for total count
     */
    @Query("SELECT COUNT(n) FROM SystemNotification n WHERE n.organization.id = :organizationId AND n.notificationType = :type")
    long countByOrganizationIdAndNotificationType(@Param("organizationId") Long organizationId, 
                                                 @Param("type") String notificationType);

    /**
     * Count all notifications for an organization (regardless of type)
     */
    @Query("SELECT COUNT(n) FROM SystemNotification n WHERE n.organization.id = :organizationId")
    long countAllByOrganizationId(@Param("organizationId") Long organizationId);
    
    /**
     * Find recent notifications for a user (last 24 hours)
     */
    @Query("SELECT n FROM SystemNotification n WHERE n.user.id = :userId AND n.createdAt > :since ORDER BY n.createdAt DESC")
    List<SystemNotification> findRecentByUserId(@Param("userId") Long userId, @Param("since") Instant since);
}

