package com.talentx.hrms.common.audit;

import com.talentx.hrms.service.audit.AuditLogService;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

/**
 * Aspect for automatic audit logging of annotated methods
 */
@Aspect
@Component
public class AuditAspect {
    
    private static final Logger logger = LoggerFactory.getLogger(AuditAspect.class);
    
    @Autowired
    private AuditLogService auditLogService;
    
    private final ThreadLocal<Map<String, Object>> auditContext = new ThreadLocal<>();
    
    /**
     * Before method execution - capture initial state
     */
    @Before("@annotation(auditable)")
    public void beforeAuditableMethod(JoinPoint joinPoint, Auditable auditable) {
        try {
            Map<String, Object> context = new HashMap<>();
            context.put("startTime", System.currentTimeMillis());
            context.put("method", joinPoint.getSignature().getName());
            context.put("args", joinPoint.getArgs());
            context.put("auditable", auditable);
            
            auditContext.set(context);
            
        } catch (Exception e) {
            logger.warn("Failed to capture audit context: {}", e.getMessage());
        }
    }
    
    /**
     * After successful method execution - log the operation
     */
    @AfterReturning(pointcut = "@annotation(auditable)", returning = "result")
    public void afterAuditableMethodSuccess(JoinPoint joinPoint, Auditable auditable, Object result) {
        try {
            Map<String, Object> context = auditContext.get();
            if (context == null) {
                return;
            }
            
            String entityId = extractEntityId(joinPoint.getArgs(), result);
            String entityName = extractEntityName(result);
            
            // For data modification operations, try to capture old and new values
            if (isDataModificationAction(auditable.action())) {
                Object oldValues = extractOldValues(joinPoint.getArgs());
                Object newValues = extractNewValues(result);
                
                auditLogService.logDataChange(
                    auditable.action(),
                    auditable.entityType(),
                    entityId,
                    entityName,
                    oldValues,
                    newValues
                );
            } else {
                // For other operations, log as system event
                Map<String, Object> additionalData = new HashMap<>();
                additionalData.put("method", joinPoint.getSignature().getName());
                additionalData.put("entityId", entityId);
                additionalData.put("entityName", entityName);
                
                auditLogService.logSystemEvent(
                    auditable.action(),
                    auditable.description().isEmpty() ? 
                        "Executed " + auditable.action() + " on " + auditable.entityType() : 
                        auditable.description(),
                    auditable.severity(),
                    additionalData
                );
            }
            
        } catch (Exception e) {
            logger.warn("Failed to log audit event: {}", e.getMessage());
        } finally {
            auditContext.remove();
        }
    }
    
    /**
     * After method throws exception - log the failure
     */
    @AfterThrowing(pointcut = "@annotation(auditable)", throwing = "exception")
    public void afterAuditableMethodFailure(JoinPoint joinPoint, Auditable auditable, Throwable exception) {
        try {
            Map<String, Object> context = auditContext.get();
            if (context == null) {
                return;
            }
            
            String entityId = extractEntityId(joinPoint.getArgs(), null);
            
            Map<String, Object> additionalData = new HashMap<>();
            additionalData.put("method", joinPoint.getSignature().getName());
            additionalData.put("entityId", entityId);
            additionalData.put("error", exception.getMessage());
            additionalData.put("exceptionType", exception.getClass().getSimpleName());
            
            auditLogService.logSystemEvent(
                auditable.action() + "_FAILED",
                "Failed to execute " + auditable.action() + " on " + auditable.entityType() + ": " + exception.getMessage(),
                "HIGH",
                additionalData
            );
            
        } catch (Exception e) {
            logger.warn("Failed to log audit failure event: {}", e.getMessage());
        } finally {
            auditContext.remove();
        }
    }
    
    // Helper methods
    
    private boolean isDataModificationAction(String action) {
        return "CREATE".equalsIgnoreCase(action) || 
               "UPDATE".equalsIgnoreCase(action) || 
               "DELETE".equalsIgnoreCase(action);
    }
    
    private String extractEntityId(Object[] args, Object result) {
        // Try to extract ID from method arguments
        for (Object arg : args) {
            if (arg instanceof Long) {
                return arg.toString();
            }
            if (arg instanceof String && arg.toString().matches("\\d+")) {
                return arg.toString();
            }
        }
        
        // Try to extract ID from result
        if (result != null) {
            try {
                Method getIdMethod = result.getClass().getMethod("getId");
                Object id = getIdMethod.invoke(result);
                return id != null ? id.toString() : null;
            } catch (Exception e) {
                // Ignore if getId method doesn't exist
            }
        }
        
        return null;
    }
    
    private String extractEntityName(Object result) {
        if (result == null) {
            return null;
        }
        
        try {
            // Try common name methods
            String[] nameMethodNames = {"getName", "getTitle", "getFirstName", "getUsername", "getEmployeeNumber"};
            
            for (String methodName : nameMethodNames) {
                try {
                    Method method = result.getClass().getMethod(methodName);
                    Object name = method.invoke(result);
                    if (name != null) {
                        return name.toString();
                    }
                } catch (Exception e) {
                    // Continue to next method
                }
            }
            
            // If no name method found, try toString
            return result.toString();
            
        } catch (Exception e) {
            return null;
        }
    }
    
    private Object extractOldValues(Object[] args) {
        // For update operations, the first argument might be the ID and second might be the new data
        // This is a simplified approach - in practice, you might need to fetch old values from database
        if (args.length > 1) {
            return args[1]; // Assuming second argument contains the data
        }
        return null;
    }
    
    private Object extractNewValues(Object result) {
        return result;
    }
}

