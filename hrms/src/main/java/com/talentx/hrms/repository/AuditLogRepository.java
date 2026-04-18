package com.talentx.hrms.repository;

import com.talentx.hrms.entity.analytics.AuditLog;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    
    /**
     * Find audit logs by entity type and ID
     */
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, String entityId);
    
    /**
     * Find audit logs by user ID
     */
    @Query("SELECT a FROM AuditLog a WHERE a.user.id = :userId ORDER BY a.timestamp DESC")
    List<AuditLog> findByUserIdOrderByTimestampDesc(@Param("userId") Long userId, Pageable pageable);
    
    /**
     * Find audit logs by timestamp range
     */
    List<AuditLog> findByTimestampBetweenOrderByTimestampDesc(Instant startDate, Instant endDate);
    
    /**
     * Find audit logs by module
     */
    List<AuditLog> findByModuleOrderByTimestampDesc(String module, Pageable pageable);
    
    /**
     * Find audit logs by username, action, status and timestamp
     */
    List<AuditLog> findByUsernameAndActionAndStatusAndTimestampAfterOrderByTimestampDesc(
        String username, String action, String status, Instant timestamp);
    
    /**
     * Find audit logs by action
     */
    List<AuditLog> findByActionOrderByTimestampDesc(String action);
    
    /**
     * Find audit logs by severity
     */
    List<AuditLog> findBySeverityOrderByTimestampDesc(String severity);
    
    /**
     * Find audit logs by organization
     */
    @Query("SELECT a FROM AuditLog a WHERE a.organization.id = :organizationId ORDER BY a.timestamp DESC")
    List<AuditLog> findByOrganizationIdOrderByTimestampDesc(@Param("organizationId") Long organizationId, Pageable pageable);
    
    /**
     * Find security events
     */
    @Query("SELECT a FROM AuditLog a WHERE a.module = 'SECURITY' OR a.action IN ('LOGIN', 'LOGOUT', 'FAILED_LOGIN', 'PERMISSION_DENIED') ORDER BY a.timestamp DESC")
    List<AuditLog> findSecurityEventsOrderByTimestampDesc(Pageable pageable);
    
    /**
     * Find data modification events
     */
    @Query("SELECT a FROM AuditLog a WHERE a.action IN ('CREATE', 'UPDATE', 'DELETE') ORDER BY a.timestamp DESC")
    List<AuditLog> findDataModificationEventsOrderByTimestampDesc(Pageable pageable);
    
    /**
     * Find failed operations
     */
    List<AuditLog> findByStatusOrderByTimestampDesc(String status, Pageable pageable);
    
    /**
     * Count audit logs by action and date range
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.action = :action AND a.timestamp BETWEEN :startDate AND :endDate")
    long countByActionAndTimestampBetween(@Param("action") String action, 
                                         @Param("startDate") Instant startDate, 
                                         @Param("endDate") Instant endDate);
    
    /**
     * Count failed login attempts for a user within time period
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.username = :username AND a.action = 'FAILED_LOGIN' AND a.timestamp > :since")
    long countFailedLoginAttempts(@Param("username") String username, @Param("since") Instant since);
    
    /**
     * Delete old audit logs before specified date
     */
    @Modifying
    @Query("DELETE FROM AuditLog a WHERE a.timestamp < :cutoffDate")
    int deleteByTimestampBefore(@Param("cutoffDate") Instant cutoffDate);
    
    /**
     * Find sensitive data access logs
     */
    @Query("SELECT a FROM AuditLog a WHERE a.isSensitive = true ORDER BY a.timestamp DESC")
    List<AuditLog> findSensitiveDataAccessLogs(Pageable pageable);
    
    /**
     * Find compliance related logs
     */
    List<AuditLog> findByModuleOrderByTimestampDesc(String module);
    
    /**
     * Find high severity events
     */
    @Query("SELECT a FROM AuditLog a WHERE a.severity IN ('HIGH', 'CRITICAL') ORDER BY a.timestamp DESC")
    List<AuditLog> findHighSeverityEventsOrderByTimestampDesc(Pageable pageable);
}

