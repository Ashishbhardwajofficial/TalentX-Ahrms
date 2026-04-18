package com.talentx.hrms.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.math.BigDecimal;

/**
 * Validator for salary range validation
 */
public class SalaryRangeValidator implements ConstraintValidator<ValidSalaryRange, BigDecimal> {
    
    private double min;
    private double max;
    
    @Override
    public void initialize(ValidSalaryRange constraintAnnotation) {
        this.min = constraintAnnotation.min();
        this.max = constraintAnnotation.max();
    }
    
    @Override
    public boolean isValid(BigDecimal value, ConstraintValidatorContext context) {
        if (value == null) {
            return true; // Let other validators handle null checks
        }
        
        double salaryValue = value.doubleValue();
        return salaryValue >= min && salaryValue <= max;
    }
}

