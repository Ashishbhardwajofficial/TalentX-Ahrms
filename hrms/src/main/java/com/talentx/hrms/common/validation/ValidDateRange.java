package com.talentx.hrms.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Validation annotation for date range validation (start date before end date)
 */
@Documented
@Constraint(validatedBy = DateRangeValidator.class)
@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidDateRange {
    
    String message() default "Start date must be before end date";
    
    String startDateField() default "startDate";
    
    String endDateField() default "endDate";
    
    boolean allowSameDate() default false;
    
    Class<?>[] groups() default {};
    
    Class<? extends Payload>[] payload() default {};
}

