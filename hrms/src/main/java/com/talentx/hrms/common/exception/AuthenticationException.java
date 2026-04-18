package com.talentx.hrms.common.exception;

/**
 * Exception for authentication failures
 */
public class AuthenticationException extends HRMSException {
    
    public AuthenticationException(String message) {
        super(message);
    }
    
    public AuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}

