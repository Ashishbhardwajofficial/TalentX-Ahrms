package com.talentx.hrms.common;

import com.talentx.hrms.common.exception.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import jakarta.persistence.EntityNotFoundException;
import java.util.Map;

/**
 * Helper class for creating consistent error responses across controllers
 * This ensures all error responses follow the same format and use appropriate HTTP status codes
 */
public class ErrorResponseHelper {

    /**
     * Create error response based on exception type with appropriate HTTP status
     */
    public static ResponseEntity<ApiResponse<Object>> createErrorResponse(Exception ex) {
        if (ex instanceof ValidationException) {
            ValidationException validationEx = (ValidationException) ex;
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(validationEx.getMessage(), validationEx.getFieldErrors()));
        }
        
        if (ex instanceof EntityNotFoundException || ex instanceof com.talentx.hrms.common.exception.EntityNotFoundException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(ex.getMessage()));
        }
        
        if (ex instanceof AuthenticationException) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Authentication failed: " + ex.getMessage()));
        }
        
        if (ex instanceof AuthorizationException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Access denied"));
        }
        
        if (ex instanceof ComplianceViolationException) {
            ComplianceViolationException complianceEx = (ComplianceViolationException) ex;
            Map<String, String> details = Map.of(
                "ruleCode", complianceEx.getRuleCode() != null ? complianceEx.getRuleCode() : "",
                "violationType", complianceEx.getViolationType() != null ? complianceEx.getViolationType() : ""
            );
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error(complianceEx.getMessage(), details));
        }
        
        if (ex instanceof IllegalArgumentException) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid argument: " + ex.getMessage()));
        }
        
        if (ex instanceof IllegalStateException) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Invalid operation: " + ex.getMessage()));
        }
        
        // Default case for other RuntimeExceptions
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("An error occurred: " + ex.getMessage()));
    }

    /**
     * Create validation error response with field errors
     */
    public static ResponseEntity<ApiResponse<Object>> createValidationErrorResponse(String message, Map<String, String> fieldErrors) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(message, fieldErrors));
    }

    /**
     * Create not found error response
     */
    public static ResponseEntity<ApiResponse<Object>> createNotFoundResponse(String message) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(message));
    }

    /**
     * Create unauthorized error response
     */
    public static ResponseEntity<ApiResponse<Object>> createUnauthorizedResponse(String message) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(message));
    }

    /**
     * Create forbidden error response
     */
    public static ResponseEntity<ApiResponse<Object>> createForbiddenResponse(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(message));
    }

    /**
     * Create conflict error response
     */
    public static ResponseEntity<ApiResponse<Object>> createConflictResponse(String message) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(message));
    }

    /**
     * Create bad request error response
     */
    public static ResponseEntity<ApiResponse<Object>> createBadRequestResponse(String message) {
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(message));
    }

    /**
     * Create internal server error response
     */
    public static ResponseEntity<ApiResponse<Object>> createInternalServerErrorResponse(String message) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(message));
    }
}

