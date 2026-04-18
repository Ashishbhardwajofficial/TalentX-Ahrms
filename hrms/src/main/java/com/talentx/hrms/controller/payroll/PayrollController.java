package com.talentx.hrms.controller.payroll;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.payroll.PayrollRunDTO;
import com.talentx.hrms.entity.enums.PayrollStatus;
import com.talentx.hrms.entity.payroll.PayrollRun;
import com.talentx.hrms.service.payroll.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/payroll")
@Tag(name = "Payroll Management", description = "Payroll processing and management operations")
public class PayrollController {

    private final PayrollService payrollService;

    @Autowired
    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    /**
     * Get all payroll runs with pagination
     */
    @GetMapping("/runs")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Get all payroll runs", description = "Retrieve all payroll runs with pagination and filtering")
    public ResponseEntity<ApiResponse<Page<PayrollRunDTO>>> getAllPayrollRuns(
            @Parameter(description = "Payroll status filter") @RequestParam(required = false) PayrollStatus status,
            @Parameter(description = "Year filter") @RequestParam(required = false) Integer year,
            @Parameter(description = "Month filter") @RequestParam(required = false) Integer month,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(defaultValue = "createdAt") String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "desc") String sortDirection) {
        
        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
        Page<PayrollRunDTO> payrollRuns = payrollService.getAllPayrollRuns(status, year, month, paginationRequest);
        
        return ResponseEntity.ok(ApiResponse.success("Payroll runs retrieved successfully", payrollRuns));
    }

    /**
     * Get payroll run by ID
     */
    @GetMapping("/runs/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Get payroll run by ID", description = "Retrieve a specific payroll run by ID")
    public ResponseEntity<ApiResponse<PayrollRunDTO>> getPayrollRun(@PathVariable Long id) {
        try {
            PayrollRunDTO payrollRun = payrollService.getPayrollRun(id);
            return ResponseEntity.ok(ApiResponse.success("Payroll run retrieved successfully", payrollRun));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Create new payroll run
     */
    @PostMapping("/runs")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Create payroll run", description = "Create a new payroll run")
    public ResponseEntity<ApiResponse<PayrollRunDTO>> createPayrollRun(@Valid @RequestBody PayrollRunDTO request) {
        try {
            PayrollRunDTO payrollRun = payrollService.createPayrollRun(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Payroll run created successfully", payrollRun));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update payroll run (before processing)
     */
    @PutMapping("/runs/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Update payroll run", description = "Update a draft payroll run")
    public ResponseEntity<ApiResponse<PayrollRunDTO>> updatePayrollRun(
            @PathVariable Long id,
            @Valid @RequestBody PayrollRunDTO request) {
        try {
            PayrollRunDTO payrollRun = payrollService.updatePayrollRun(id, request);
            return ResponseEntity.ok(ApiResponse.success("Payroll run updated successfully", payrollRun));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Process payroll run
     */
    @PostMapping("/runs/{id:\\d+}/process")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Process payroll run", description = "Process payroll calculations for a payroll run")
    public ResponseEntity<ApiResponse<PayrollRunDTO>> processPayrollRun(@PathVariable Long id) {
        try {
            PayrollRunDTO payrollRun = payrollService.processPayrollRun(id);
            return ResponseEntity.ok(ApiResponse.success("Payroll run processed successfully", payrollRun));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Approve payroll run
     */
    @PostMapping("/runs/{id:\\d+}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Approve payroll run", description = "Approve a processed payroll run")
    public ResponseEntity<ApiResponse<PayrollRunDTO>> approvePayrollRun(
            @PathVariable Long id,
            @Parameter(description = "Approval comments") @RequestParam(required = false) String comments) {
        try {
            PayrollRunDTO payrollRun = payrollService.approvePayrollRunWithComments(id, comments);
            return ResponseEntity.ok(ApiResponse.success("Payroll run approved successfully", payrollRun));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Reject payroll run
     */
    @PostMapping("/runs/{id:\\d+}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Reject payroll run", description = "Reject a processed payroll run")
    public ResponseEntity<ApiResponse<PayrollRunDTO>> rejectPayrollRun(
            @PathVariable Long id,
            @Parameter(description = "Rejection reason") @RequestParam String reason) {
        try {
            PayrollRunDTO payrollRun = payrollService.rejectPayrollRun(id, reason);
            return ResponseEntity.ok(ApiResponse.success("Payroll run rejected successfully", payrollRun));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete payroll run (draft only)
     */
    @DeleteMapping("/runs/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete payroll run", description = "Delete a draft payroll run")
    public ResponseEntity<ApiResponse<Void>> deletePayrollRun(@PathVariable Long id) {
        try {
            payrollService.deletePayrollRun(id);
            return ResponseEntity.ok(ApiResponse.success("Payroll run deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get payroll items for a payroll run
     */
    @GetMapping("/runs/{id:\\d+}/items")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Get payroll items", description = "Get payroll items for a specific payroll run")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPayrollItems(@PathVariable Long id) {
        List<Map<String, Object>> payrollItems = payrollService.getPayrollItems(id);
        return ResponseEntity.ok(ApiResponse.success("Payroll items retrieved successfully", payrollItems));
    }

    /**
     * Get employee payslips for a payroll run
     */
    @GetMapping("/runs/{id:\\d+}/payslips")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Get payslips", description = "Get payslips for a specific payroll run")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPayslips(@PathVariable Long id) {
        List<Map<String, Object>> payslips = payrollService.getPayslips(id);
        return ResponseEntity.ok(ApiResponse.success("Payslips retrieved successfully", payslips));
    }

    /**
     * Get employee payslip by ID
     */
    @GetMapping("/payslips/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN') or @payrollService.isCurrentUserPayslip(#id)")
    @Operation(summary = "Get payslip by ID", description = "Get a specific payslip by ID")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPayslip(@PathVariable Long id) {
        try {
            Map<String, Object> payslip = payrollService.getPayslip(id);
            return ResponseEntity.ok(ApiResponse.success("Payslip retrieved successfully", payslip));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Download payslip as PDF
     */
    @GetMapping("/payslips/{id:\\d+}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN') or @payrollService.isCurrentUserPayslip(#id)")
    @Operation(summary = "Download payslip", description = "Download payslip as PDF")
    public ResponseEntity<Resource> downloadPayslip(@PathVariable Long id) {
        try {
            String pdfPath = payrollService.generatePayslipPdf(id);
            Path filePath = Paths.get(pdfPath);
            Resource resource = new UrlResource(filePath.toUri());
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"payslip_" + id + ".pdf\"")
                .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get employee payslips
     */
    @GetMapping("/employee/{employeeId:\\d+}/payslips")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN') or @payrollService.isCurrentUser(#employeeId)")
    @Operation(summary = "Get employee payslips", description = "Get payslips for a specific employee")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEmployeePayslips(
            @PathVariable Long employeeId,
            @Parameter(description = "Year filter") @RequestParam(required = false) Integer year,
            @Parameter(description = "Month filter") @RequestParam(required = false) Integer month) {
        
        List<Map<String, Object>> payslips = payrollService.getEmployeePayslips(employeeId, year, month);
        return ResponseEntity.ok(ApiResponse.success("Employee payslips retrieved successfully", payslips));
    }

    /**
     * Get current user's payslips
     */
    @GetMapping("/my-payslips")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my payslips", description = "Get payslips for current user")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMyPayslips(
            @Parameter(description = "Year filter") @RequestParam(required = false) Integer year,
            @Parameter(description = "Month filter") @RequestParam(required = false) Integer month) {
        
        List<Map<String, Object>> payslips = payrollService.getCurrentUserPayslips(year, month);
        return ResponseEntity.ok(ApiResponse.success("My payslips retrieved successfully", payslips));
    }

    /**
     * Generate payroll report
     */
    @GetMapping("/runs/{id:\\d+}/report")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Generate payroll report", description = "Generate comprehensive payroll report")
    public ResponseEntity<Resource> generatePayrollReport(@PathVariable Long id) {
        try {
            Resource reportPdf = payrollService.generatePayrollReport(id);
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"payroll_report_" + id + ".pdf\"")
                .body(reportPdf);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Get payroll statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Get payroll statistics", description = "Get comprehensive payroll statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPayrollStatistics(
            @Parameter(description = "Year filter") @RequestParam(required = false) Integer year,
            @Parameter(description = "Month filter") @RequestParam(required = false) Integer month,
            @Parameter(description = "Department ID filter") @RequestParam(required = false) Long departmentId) {
        
        Map<String, Object> statistics = payrollService.getPayrollStatistics(year, month, departmentId);
        return ResponseEntity.ok(ApiResponse.success("Payroll statistics retrieved successfully", statistics));
    }

    /**
     * Get pending payroll runs
     */
    @GetMapping("/runs/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Get pending payroll runs", description = "Get payroll runs pending approval")
    public ResponseEntity<ApiResponse<List<PayrollRunDTO>>> getPendingPayrollRuns() {
        List<PayrollRunDTO> pendingRuns = payrollService.getPendingPayrollRuns();
        return ResponseEntity.ok(ApiResponse.success("Pending payroll runs retrieved successfully", pendingRuns));
    }

    /**
     * Validate payroll run before processing
     */
    @PostMapping("/runs/{id:\\d+}/validate")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Validate payroll run", description = "Validate payroll run data before processing")
    public ResponseEntity<ApiResponse<Map<String, Object>>> validatePayrollRun(@PathVariable Long id) {
        Map<String, Object> validationResult = payrollService.validatePayrollRun(id);
        return ResponseEntity.ok(ApiResponse.success("Payroll run validation completed", validationResult));
    }

    /**
     * Get payroll calendar
     */
    @GetMapping("/calendar")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Get payroll calendar", description = "Get payroll calendar for a specific year")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getPayrollCalendar(
            @Parameter(description = "Year") @RequestParam(required = false) Integer year) {
        
        List<Map<String, Object>> calendar = payrollService.getPayrollCalendar(year);
        return ResponseEntity.ok(ApiResponse.success("Payroll calendar retrieved successfully", calendar));
    }

    /**
     * Export payroll data as CSV — matches frontend /payroll/export
     */
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'PAYROLL_ADMIN')")
    @Operation(summary = "Export payroll data", description = "Export payroll runs as CSV")
    public ResponseEntity<byte[]> exportPayrollData(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) com.talentx.hrms.entity.enums.PayrollStatus status) {
        try {
            PaginationRequest paginationRequest = new PaginationRequest(0, 10000, "payDate", "desc");
            Page<PayrollRunDTO> runs = payrollService.getAllPayrollRuns(status, year, month, paginationRequest);

            StringBuilder csv = new StringBuilder();
            csv.append("ID,Name,Pay Period Start,Pay Period End,Pay Date,Status,Employee Count,Total Gross Pay,Total Deductions,Total Net Pay\n");
            for (PayrollRunDTO run : runs.getContent()) {
                csv.append(run.getId()).append(",")
                   .append(run.getName() != null ? run.getName().replace(",", " ") : "").append(",")
                   .append(run.getPayPeriodStart()).append(",")
                   .append(run.getPayPeriodEnd()).append(",")
                   .append(run.getPayDate()).append(",")
                   .append(run.getStatus()).append(",")
                   .append(run.getEmployeeCount() != null ? run.getEmployeeCount() : 0).append(",")
                   .append(run.getTotalGrossPay() != null ? run.getTotalGrossPay() : 0).append(",")
                   .append(run.getTotalDeductions() != null ? run.getTotalDeductions() : 0).append(",")
                   .append(run.getTotalNetPay() != null ? run.getTotalNetPay() : 0).append("\n");
            }

            byte[] bytes = csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
            return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"payroll-export.csv\"")
                .header(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv")
                .body(bytes);
        } catch (RuntimeException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

