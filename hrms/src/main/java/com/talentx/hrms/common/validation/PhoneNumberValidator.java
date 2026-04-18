package com.talentx.hrms.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

/**
 * Validator for phone number format
 * Supports various international formats
 */
public class PhoneNumberValidator implements ConstraintValidator<ValidPhoneNumber, String> {
    
    // Pattern for international phone numbers (with or without country code)
    private static final Pattern PHONE_PATTERN = Pattern.compile(
        "^[+]?[1-9]\\d{0,3}[\\s.-]?\\(?\\d{1,4}\\)?[\\s.-]?\\d{1,4}[\\s.-]?\\d{1,9}$"
    );
    
    @Override
    public void initialize(ValidPhoneNumber constraintAnnotation) {
        // No initialization needed
    }
    
    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.trim().isEmpty()) {
            return true; // Let other validators handle null/empty checks
        }
        
        String cleanedValue = value.trim().replaceAll("\\s+", " ");
        return PHONE_PATTERN.matcher(cleanedValue).matches();
    }
}

