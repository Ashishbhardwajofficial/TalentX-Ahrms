package com.talentx.hrms.common.exception;

/**
 * Exception for resource not found errors
 */
public class EntityNotFoundException extends HRMSException {
    
    public EntityNotFoundException(String message) {
        super(message);
    }
    
    public EntityNotFoundException(String entityType, Long id) {
        super(String.format("%s with id %d not found", entityType, id));
    }
    
    public EntityNotFoundException(String entityType, String identifier) {
        super(String.format("%s with identifier '%s' not found", entityType, identifier));
    }
}

