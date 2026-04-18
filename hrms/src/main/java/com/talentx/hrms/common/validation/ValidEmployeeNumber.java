package com.talentx.hrms.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Validation annotation for employee number format
 */
@Documented
@Constraint(validatedBy = EmployeeNumberValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidEmployeeNumber {
    
    String message() default "Employee number must follow the format: EMP-YYYY-NNNN";
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}

