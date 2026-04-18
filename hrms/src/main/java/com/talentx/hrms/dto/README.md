# DTO Package Structure

This document outlines the Data Transfer Object (DTO) package structure for the HRMS application.

## Existing DTO Packages

### 1. auth/
- JwtResponse.java
- LoginRequest.java

### 2. employee/
- EmployeeRequest.java
- EmployeeResponse.java

### 3. leave/
- LeaveRequestCreateDTO.java
- LeaveRequestResponseDTO.java

### 4. payroll/
- PayrollRunDTO.java

### 5. recruitment/
- ApplicationDTO.java
- JobPostingDTO.java

## New DTO Packages (Task 1.2)

### 6. organization/
- OrganizationRequest.java
- OrganizationResponse.java
- DepartmentRequest.java
- DepartmentResponse.java
- LocationRequest.java
- LocationResponse.java

### 7. attendance/
- AttendanceRecordRequest.java
- AttendanceRecordResponse.java

## Remaining DTOs to be Created (Future Tasks)

The following DTO packages will be created in subsequent tasks as part of the implementation plan:

### 8. user/ (Access Control)
- UserRequest.java
- UserResponse.java
- RoleRequest.java
- RoleResponse.java
- PermissionResponse.java

### 9. shift/
- ShiftRequest.java
- ShiftResponse.java
- EmployeeShiftRequest.java
- EmployeeShiftResponse.java

### 10. holiday/
- HolidayRequest.java
- HolidayResponse.java

### 11. document/
- DocumentRequest.java
- DocumentResponse.java
- DocumentUploadRequest.java

### 12. compliance/
- ComplianceJurisdictionRequest.java
- ComplianceJurisdictionResponse.java
- ComplianceRuleRequest.java
- ComplianceRuleResponse.java
- ComplianceCheckResponse.java

### 13. performance/
- PerformanceReviewCycleRequest.java
- PerformanceReviewCycleResponse.java
- PerformanceReviewRequest.java
- PerformanceReviewResponse.java
- GoalRequest.java
- GoalResponse.java

### 14. skill/
- SkillRequest.java
- SkillResponse.java
- EmployeeSkillRequest.java
- EmployeeSkillResponse.java

### 15. training/
- TrainingProgramRequest.java
- TrainingProgramResponse.java
- TrainingEnrollmentRequest.java
- TrainingEnrollmentResponse.java

### 16. benefit/
- BenefitPlanRequest.java
- BenefitPlanResponse.java
- EmployeeBenefitRequest.java
- EmployeeBenefitResponse.java

### 17. asset/
- AssetRequest.java
- AssetResponse.java
- AssetAssignmentRequest.java
- AssetAssignmentResponse.java

### 18. expense/
- ExpenseRequest.java
- ExpenseResponse.java

### 19. exit/
- EmployeeExitRequest.java
- EmployeeExitResponse.java

### 20. history/
- EmploymentHistoryRequest.java
- EmploymentHistoryResponse.java

### 21. bank/
- BankDetailsRequest.java
- BankDetailsResponse.java

### 22. audit/
- AuditLogResponse.java

### 23. notification/
- SystemNotificationResponse.java

## DTO Naming Conventions

- **Request DTOs**: Used for creating or updating entities (e.g., `EntityRequest.java`)
- **Response DTOs**: Used for returning entity data to clients (e.g., `EntityResponse.java`)
- **Specialized DTOs**: For specific operations (e.g., `DocumentUploadRequest.java`)

## Validation

All Request DTOs use Jakarta Bean Validation annotations:
- `@NotNull`: Field cannot be null
- `@NotBlank`: String field cannot be null or empty
- `@Size`: Limits string length
- `@Email`: Validates email format
- `@Valid`: Validates nested objects

## Mapping

DTOs are mapped to/from entities using:
- Manual mapping in service layer
- MapStruct (if configured)
- Custom mapper classes (e.g., `EmployeeMapper.java`)
