package com.talentx.hrms.common;

import com.talentx.hrms.common.exception.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Global exception handler for comprehensive error handling across the HRMS application
 */
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
    
    /**
     * Handle validation exceptions with field-level errors
     */
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(ValidationException ex, WebRequest request) {
        logger.warn("Validation error: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(ex.getMessage(), ex.getFieldErrors()));
    }
    
    /**
     * Handle method argument validation errors (from @Valid annotations)
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentNotValid(MethodArgumentNotValidException ex, WebRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = error instanceof FieldError fieldError ? fieldError.getField() : error.getObjectName();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        
        logger.warn("Method argument validation failed: {}", fieldErrors);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("Validation failed", fieldErrors));
    }
    
    /**
     * Handle bind exceptions (form binding errors)
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Object>> handleBindException(BindException ex, WebRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = error instanceof FieldError fieldError ? fieldError.getField() : error.getObjectName();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });
        
        logger.warn("Bind exception: {}", fieldErrors);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("Binding failed", fieldErrors));
    }
    
    /**
     * Handle constraint violation exceptions (Bean Validation)
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(ConstraintViolationException ex, WebRequest request) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (ConstraintViolation<?> violation : ex.getConstraintViolations()) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            fieldErrors.put(fieldName, errorMessage);
        }
        
        logger.warn("Constraint violation: {}", fieldErrors);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("Validation constraints violated", fieldErrors));
    }
    
    /**
     * Handle entity not found exceptions
     */
    @ExceptionHandler({EntityNotFoundException.class, com.talentx.hrms.common.exception.EntityNotFoundException.class})
    public ResponseEntity<ApiResponse<Object>> handleEntityNotFound(Exception ex, WebRequest request) {
        logger.warn("Entity not found: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(ex.getMessage()));
    }
    
    /**
     * Handle authentication exceptions
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthentication(AuthenticationException ex, WebRequest request) {
        logger.warn("Authentication failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Authentication failed: " + ex.getMessage()));
    }
    
    /**
     * Handle Spring Security BadCredentialsException
     */
    @ExceptionHandler(org.springframework.security.authentication.BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentials(org.springframework.security.authentication.BadCredentialsException ex, WebRequest request) {
        logger.warn("Bad credentials: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Invalid username or password"));
    }
    
    /**
     * Handle Spring Security AuthenticationException
     */
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleSpringAuthenticationException(org.springframework.security.core.AuthenticationException ex, WebRequest request) {
        logger.warn("Spring Security authentication failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error("Authentication failed: " + ex.getMessage()));
    }
    
    /**
     * Handle authorization exceptions
     */
    @ExceptionHandler({AuthorizationException.class, AccessDeniedException.class})
    public ResponseEntity<ApiResponse<Object>> handleAuthorization(Exception ex, WebRequest request) {
        logger.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error("Access denied"));
    }
    
    /**
     * Handle compliance violation exceptions
     */
    @ExceptionHandler(ComplianceViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleComplianceViolation(ComplianceViolationException ex, WebRequest request) {
        logger.error("Compliance violation: {} (Rule: {}, Type: {})", 
                    ex.getMessage(), ex.getRuleCode(), ex.getViolationType());
        
        Map<String, String> details = new HashMap<>();
        if (ex.getRuleCode() != null && !ex.getRuleCode().isEmpty()) {
            details.put("ruleCode", ex.getRuleCode());
        }
        if (ex.getViolationType() != null && !ex.getViolationType().isEmpty()) {
            details.put("violationType", ex.getViolationType());
        }
        
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(ex.getMessage(), details.isEmpty() ? null : details));
    }
    
    /**
     * Handle illegal argument exceptions
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalArgument(IllegalArgumentException ex, WebRequest request) {
        logger.warn("Illegal argument: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("Invalid argument: " + ex.getMessage()));
    }
    
    /**
     * Handle illegal state exceptions
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>> handleIllegalState(IllegalStateException ex, WebRequest request) {
        logger.warn("Illegal state: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error("Invalid operation: " + ex.getMessage()));
    }
    
    /**
     * Handle missing request parameter exceptions
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Object>> handleMissingRequestParameter(MissingServletRequestParameterException ex, WebRequest request) {
        logger.warn("Missing request parameter: {}", ex.getMessage());
        String message = String.format("Required parameter '%s' is missing", ex.getParameterName());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(message));
    }
    
    /**
     * Handle method argument type mismatch exceptions
     */
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodArgumentTypeMismatch(MethodArgumentTypeMismatchException ex, WebRequest request) {
        logger.warn("Method argument type mismatch: {}", ex.getMessage());
        String expectedType = ex.getRequiredType() != null ? ex.getRequiredType().getSimpleName() : "valid value";
        String message = String.format("Invalid value '%s' for parameter '%s'. Expected type: %s",
                                      ex.getValue(), ex.getName(), expectedType);
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(message));
    }
    
    /**
     * Handle HTTP message not readable exceptions (malformed JSON, etc.)
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex, WebRequest request) {
        logger.warn("HTTP message not readable: {}", ex.getMessage());
        String message = "Invalid request format. Please check your JSON syntax and field values.";
        if (ex.getMostSpecificCause() != null && ex.getMostSpecificCause().getMessage() != null) {
            String causeMessage = ex.getMostSpecificCause().getMessage();
            if (causeMessage.contains("LocalDate")) {
                message = "Invalid date format. Use ISO format like " + Instant.now().toString().substring(0, 10) + ".";
            } else if (causeMessage.contains("from String")) {
                message = "Invalid enum or field value in request payload.";
            }
        }
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(message));
    }
    
    /**
     * Handle generic runtime exceptions
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> handleRuntimeException(RuntimeException ex, WebRequest request) {
        logger.error("Runtime exception [{}]: {}", ex.getClass().getSimpleName(), ex.getMessage(), ex);

        // Return actual message in dev mode for easier debugging
        String message = ex.getMessage() != null
            ? ex.getMessage()
            : "An unexpected server error occurred.";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(message));
    }
    
    /**
     * Handle all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex, WebRequest request) {
        logger.error("Unexpected error [{}]: {}", ex.getClass().getSimpleName(), ex.getMessage(), ex);

        String message = ex.getMessage() != null ? ex.getMessage() : "An unexpected server error occurred.";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(message));
    }
}

