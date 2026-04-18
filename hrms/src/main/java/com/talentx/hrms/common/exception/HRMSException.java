package com.talentx.hrms.common.exception;

/**
 * Base exception for all HRMS-specific errors
 */
public class HRMSException extends RuntimeException {
    
    public HRMSException(String message) {
        super(message);
    }
    
    public HRMSException(String message, Throwable cause) {
        super(message, cause);
    }
}

