package com.talentx.hrms.service.audit;

import com.talentx.hrms.entity.analytics.AuditLog;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.repository.AuditLogRepository;
import com.talentx.hrms.service.auth.AuthService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service for tracking data changes and user activities through audit logging
 */
@Service
@Transactional
public class AuditLogService {
    
    private static final Logger logger = LoggerFactory.getLogger(AuditLogService.class);
    
    private final AuditLogRepository auditLogRepository;
    private final AuthService authService;
    private final ObjectMapper objectMapper;
    
    @Autowired
    public AuditLogService(AuditLogRepository auditLogRepository,
                          AuthService authService,
                          ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.authService = authService;
        this.objectMapper = objectMapper;
    }
    
    /**
     * Log a data change operation
     */
    @Async
    public void logDataChange(String action, String entityType, String entityId, 
                             String entityName, Object oldValues, Object newValues) {
        try {
            User currentUser = getCurrentUser();
            
            AuditLog auditLog = new AuditLog(currentUser, action, entityType, entityId);
            auditLog.setEntityName(entityName);
            auditLog.setOldValues(serializeToJson(oldValues));
            auditLog.setNewValues(serializeToJson(newValues));
            auditLog.setStatus("SUCCESS");
            auditLog.setSeverity(determineSeverity(action, entityType));
            auditLog.setModule(determineModule(entityType));
            
            enrichWithRequestInfo(auditLog);
            
            auditLogRepository.save(auditLog);
            
        } catch (Exception e) {
            logger.error("Failed to log data change: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Log a user authentication event
     */
    @Async
    public void logAuthentication(String username, String action, boolean success, String errorMessage) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setTimestamp(Instant.now());
            auditLog.setUsername(username);
            auditLog.setAction(action);
            auditLog.setEntityType("User");
            auditLog.setStatus(success ? "SUCCESS" : "FAILURE");
            auditLog.setSeverity(success ? "LOW" : "MEDIUM");
            auditLog.setModule("AUTHENTICATION");
            auditLog.setErrorMessage(errorMessage);
            
            enrichWithRequestInfo(auditLog);
            
            auditLogRepository.save(auditLog);
            
        } catch (Exception e) {
            logger.error("Failed to log authentication event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Log a security event (access denied, permission violations, etc.)
     */
    @Async
    public void logSecurityEvent(String action, String description, String severity) {
        try {
            User currentUser = getCurrentUser();
            
            AuditLog auditLog = new AuditLog();
            auditLog.setTimestamp(Instant.now());
            auditLog.setUser(currentUser);
            auditLog.setUsername(currentUser != null ? currentUser.getUsername() : "anonymous");
            auditLog.setAction(action);
            auditLog.setEntityType("Security");
            auditLog.setDescription(description);
            auditLog.setStatus("FAILURE");
            auditLog.setSeverity(severity);
            auditLog.setModule("SECURITY");
            
            enrichWithRequestInfo(auditLog);
            
            auditLogRepository.save(auditLog);
            
        } catch (Exception e) {
            logger.error("Failed to log security event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Log a system event (startup, shutdown, configuration changes, etc.)
     */
    @Async
    public void logSystemEvent(String action, String description, String severity, Map<String, Object> additionalData) {
        try {
            AuditLog auditLog = new AuditLog();
            auditLog.setTimestamp(Instant.now());
            auditLog.setAction(action);
            auditLog.setEntityType("System");
            auditLog.setDescription(description);
            auditLog.setStatus("SUCCESS");
            auditLog.setSeverity(severity);
            auditLog.setModule("SYSTEM");
            auditLog.setAdditionalData(serializeToJson(additionalData));
            
            auditLogRepository.save(auditLog);
            
        } catch (Exception e) {
            logger.error("Failed to log system event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Log a compliance event
     */
    @Async
    public void logComplianceEvent(String action, String ruleCode, String violationType, 
                                  String entityType, String entityId, String description) {
        try {
            User currentUser = getCurrentUser();
            
            AuditLog auditLog = new AuditLog(currentUser, action, entityType, entityId);
            auditLog.setDescription(description);
            auditLog.setStatus("SUCCESS");
            auditLog.setSeverity("HIGH");
            auditLog.setModule("COMPLIANCE");
            auditLog.setSubModule(ruleCode);
            
            Map<String, Object> additionalData = Map.of(
                "ruleCode", ruleCode,
                "violationType", violationType
            );
            auditLog.setAdditionalData(serializeToJson(additionalData));
            
            enrichWithRequestInfo(auditLog);
            
            auditLogRepository.save(auditLog);
            
        } catch (Exception e) {
            logger.error("Failed to log compliance event: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Get audit logs with pagination
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }
    
    /**
     * Get audit logs for a specific entity
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getEntityAuditLogs(String entityType, String entityId) {
        return auditLogRepository.findByEntityTypeAndEntityIdOrderByTimestampDesc(entityType, entityId);
    }
    
    /**
     * Get audit logs for a specific user
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getUserAuditLogs(Long userId, Pageable pageable) {
        return auditLogRepository.findByUserIdOrderByTimestampDesc(userId, pageable);
    }
    
    /**
     * Get audit logs by date range
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getAuditLogsByDateRange(Instant startDate, Instant endDate) {
        return auditLogRepository.findByTimestampBetweenOrderByTimestampDesc(startDate, endDate);
    }
    
    /**
     * Get security events
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getSecurityEvents(Pageable pageable) {
        return auditLogRepository.findByModuleOrderByTimestampDesc("SECURITY", pageable);
    }
    
    /**
     * Get failed login attempts
     */
    @Transactional(readOnly = true)
    public List<AuditLog> getFailedLoginAttempts(String username, Instant since) {
        return auditLogRepository.findByUsernameAndActionAndStatusAndTimestampAfterOrderByTimestampDesc(
            username, "FAILED_LOGIN", "FAILURE", since);
    }
    
    /**
     * Clean up old audit logs based on retention policy
     */
    @Transactional
    public void cleanupOldAuditLogs() {
        try {
            Instant cutoffDate = Instant.now().minusSeconds(90 * 24 * 60 * 60); // 90 days default
            int deletedCount = auditLogRepository.deleteByTimestampBefore(cutoffDate);
            logger.info("Cleaned up {} old audit log entries", deletedCount);
        } catch (Exception e) {
            logger.error("Failed to cleanup old audit logs: {}", e.getMessage(), e);
        }
    }
    
    // Helper methods
    
    private User getCurrentUser() {
        try {
            return authService.getCurrentUser();
        } catch (Exception e) {
            return null; // Anonymous user or system operation
        }
    }
    
    private void enrichWithRequestInfo(AuditLog auditLog) {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                auditLog.setIpAddress(getClientIpAddress(request));
                auditLog.setUserAgent(request.getHeader("User-Agent"));
                auditLog.setSessionId(request.getSession(false) != null ? request.getSession().getId() : null);
            }
        } catch (Exception e) {
            // Ignore if request context is not available
        }
    }
    
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }
    
    private String serializeToJson(Object object) {
        if (object == null) {
            return null;
        }
        
        try {
            return objectMapper.writeValueAsString(object);
        } catch (JsonProcessingException e) {
            logger.warn("Failed to serialize object to JSON: {}", e.getMessage());
            return object.toString();
        }
    }
    
    private String determineSeverity(String action, String entityType) {
        if ("DELETE".equalsIgnoreCase(action)) {
            return "HIGH";
        }
        
        if ("Employee".equalsIgnoreCase(entityType) || 
            "User".equalsIgnoreCase(entityType) ||
            "PayrollRun".equalsIgnoreCase(entityType)) {
            return "MEDIUM";
        }
        
        return "LOW";
    }
    
    private String determineModule(String entityType) {
        if (entityType == null) {
            return "UNKNOWN";
        }
        
        String lowerEntityType = entityType.toLowerCase();
        
        if (lowerEntityType.contains("employee") || lowerEntityType.contains("department")) {
            return "EMPLOYEE";
        } else if (lowerEntityType.contains("payroll") || lowerEntityType.contains("salary")) {
            return "PAYROLL";
        } else if (lowerEntityType.contains("leave") || lowerEntityType.contains("attendance")) {
            return "LEAVE";
        } else if (lowerEntityType.contains("job") || lowerEntityType.contains("candidate") || 
                   lowerEntityType.contains("application") || lowerEntityType.contains("interview")) {
            return "RECRUITMENT";
        } else if (lowerEntityType.contains("user") || lowerEntityType.contains("role") || 
                   lowerEntityType.contains("permission")) {
            return "SECURITY";
        } else if (lowerEntityType.contains("compliance")) {
            return "COMPLIANCE";
        }
        
        return "GENERAL";
    }
}

