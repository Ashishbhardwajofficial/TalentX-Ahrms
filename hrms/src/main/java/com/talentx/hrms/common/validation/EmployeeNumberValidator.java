package com.talentx.hrms.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

/**
 * Validator for employee number format: EMP-YYYY-NNNN
 */
public class EmployeeNumberValidator implements ConstraintValidator<ValidEmployeeNumber, String> {
    
    private static final Pattern EMPLOYEE_NUMBER_PATTERN = Pattern.compile("^EMP-\\d{4}-\\d{4}$");
    
    @Override
    public void initialize(ValidEmployeeNumber constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return false;
        }
        
        return EMPLOYEE_NUMBER_PATTERN.matcher(value.trim()).matches();
    }
}

