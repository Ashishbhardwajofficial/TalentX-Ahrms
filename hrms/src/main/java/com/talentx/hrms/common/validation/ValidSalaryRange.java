package com.talentx.hrms.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Validation annotation for salary range validation
 */
@Documented
@Constraint(validatedBy = SalaryRangeValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidSalaryRange {
    
    String message() default "Salary must be within valid range (minimum: {min}, maximum: {max})";
    
    double min() default 0.0;
    
    double max() default Double.MAX_VALUE;
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}

