package com.talentx.hrms.common.exception;

/**
 * Exception for compliance rule violations
 */
public class ComplianceViolationException extends HRMSException {
    
    private final String ruleCode;
    private final String violationType;
    
    public ComplianceViolationException(String message) {
        super(message);
        this.ruleCode = null;
        this.violationType = null;
    }
    
    public ComplianceViolationException(String message, String ruleCode, String violationType) {
        super(message);
        this.ruleCode = ruleCode;
        this.violationType = violationType;
    }
    
    public String getRuleCode() {
        return ruleCode;
    }
    
    public String getViolationType() {
        return violationType;
    }
}

