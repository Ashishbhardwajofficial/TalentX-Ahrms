package com.talentx.hrms.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Validation annotation for phone number format
 */
@Documented
@Constraint(validatedBy = PhoneNumberValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPhoneNumber {
    
    String message() default "Phone number must be in valid format";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}

