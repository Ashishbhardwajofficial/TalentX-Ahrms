package com.talentx.hrms.common.audit;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to mark methods for automatic audit logging
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Auditable {
    
    /**
     * The action being performed (CREATE, UPDATE, DELETE, etc.)
     */
    String action();
    
    /**
     * The entity type being operated on
     */
    String entityType();
    
    /**
     * The module this operation belongs to
     */
    String module() default "";
    
    /**
     * The severity level of this operation
     */
    String severity() default "MEDIUM";
    
    /**
     * Whether this operation involves sensitive data
     */
    boolean sensitive() default false;
    
    /**
     * Description of the operation
     */
    String description() default "";
}

