package com.talentx.hrms.common.exception;

/**
 * Exception for permission denied errors
 */
public class AuthorizationException extends HRMSException {
    
    public AuthorizationException(String message) {
        super(message);
    }
    
    public AuthorizationException(String message, Throwable cause) {
        super(message, cause);
    }
}

