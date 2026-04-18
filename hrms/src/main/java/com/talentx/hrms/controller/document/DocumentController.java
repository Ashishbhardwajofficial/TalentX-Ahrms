package com.talentx.hrms.controller.document;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.SecurityUtils;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.document.DocumentRequest;
import com.talentx.hrms.dto.document.DocumentResponse;
import com.talentx.hrms.dto.document.DocumentSearchParams;
import com.talentx.hrms.dto.document.DocumentSignRequest;
import com.talentx.hrms.entity.document.Document;
import com.talentx.hrms.service.document.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/documents")
@Tag(name = "Document Management", description = "Document upload, storage, and management operations")
public class DocumentController {

    private final DocumentService documentService;

    @Autowired
    private SecurityUtils securityUtils;

    @Autowired
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    /**
     * Upload a new document
     */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Upload document", description = "Upload a new document with metadata")
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @Parameter(description = "Document file") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Employee ID (optional)") @RequestParam(required = false) Long employeeId,
            @Parameter(description = "Document type") @RequestParam Document.DocumentType documentType,
            @Parameter(description = "Document title") @RequestParam String title,
            @Parameter(description = "Document description") @RequestParam(required = false) String description,
            @Parameter(description = "Issue date") @RequestParam(required = false) LocalDate issueDate,
            @Parameter(description = "Expiry date") @RequestParam(required = false) LocalDate expiryDate,
            @Parameter(description = "Is confidential") @RequestParam(defaultValue = "false") Boolean isConfidential,
            @Parameter(description = "Requires signature") @RequestParam(defaultValue = "false") Boolean requiresSignature,
            @Parameter(description = "Is public") @RequestParam(defaultValue = "false") Boolean isPublic) {
        
        try {
            // Get current user ID from security context
            Long currentUserId = getCurrentUserId();
            
            // Create document request
            DocumentRequest request = new DocumentRequest();
            request.setOrganizationId(organizationId);
            request.setEmployeeId(employeeId);
            request.setDocumentType(documentType);
            request.setTitle(title);
            request.setDescription(description);
            request.setIssueDate(issueDate);
            request.setExpiryDate(expiryDate);
            request.setIsConfidential(isConfidential);
            request.setRequiresSignature(requiresSignature);
            request.setIsPublic(isPublic);
            
            DocumentResponse document = documentService.uploadDocument(file, request, currentUserId);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Document uploaded successfully", document));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get document metadata by ID
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get document metadata", description = "Retrieve document metadata by ID")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocument(@PathVariable Long id) {
        try {
            Long currentUserId = getCurrentUserId();
            DocumentResponse document = documentService.getDocument(id, currentUserId);
            return ResponseEntity.ok(ApiResponse.success("Document retrieved successfully", document));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Download document file
     */
    @GetMapping("/{id:\\d+}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Download document", description = "Download document file by ID")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        try {
            Long currentUserId = getCurrentUserId();
            Resource resource = documentService.downloadDocument(id, currentUserId);
            
            // Get document metadata for filename
            DocumentResponse document = documentService.getDocument(id, currentUserId);
            
            return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION, 
                       "attachment; filename=\"" + document.getFileName() + "\"")
                .body(resource);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Update document metadata
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Update document metadata", description = "Update document metadata by ID")
    public ResponseEntity<ApiResponse<DocumentResponse>> updateDocument(
            @PathVariable Long id, 
            @Valid @RequestBody DocumentRequest request) {
        try {
            Long currentUserId = getCurrentUserId();
            DocumentResponse document = documentService.updateDocument(id, request, currentUserId);
            return ResponseEntity.ok(ApiResponse.success("Document updated successfully", document));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete document
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Delete document", description = "Delete document by ID")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable Long id) {
        try {
            Long currentUserId = getCurrentUserId();
            documentService.deleteDocument(id, currentUserId);
            return ResponseEntity.ok(ApiResponse.success("Document deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Sign document
     */
    @PostMapping("/{id:\\d+}/sign")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Sign document", description = "Sign a document that requires signature")
    public ResponseEntity<ApiResponse<DocumentResponse>> signDocument(
            @PathVariable Long id,
            @Valid @RequestBody DocumentSignRequest signRequest) {
        try {
            // Set current user as signer if not specified
            if (signRequest.getSignedBy() == null) {
                signRequest.setSignedBy(getCurrentUserId());
            }
            
            DocumentResponse document = documentService.signDocument(id, signRequest);
            return ResponseEntity.ok(ApiResponse.success("Document signed successfully", document));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * List/search documents with pagination
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "List/search documents", description = "List or search documents with pagination and filtering")
    public ResponseEntity<ApiResponse<Page<DocumentResponse>>> searchDocuments(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Document title") @RequestParam(required = false) String title,
            @Parameter(description = "Document description") @RequestParam(required = false) String description,
            @Parameter(description = "File name") @RequestParam(required = false) String fileName,
            @Parameter(description = "Document type") @RequestParam(required = false) Document.DocumentType documentType,
            @Parameter(description = "Employee ID") @RequestParam(required = false) Long employeeId,
            @Parameter(description = "Is confidential") @RequestParam(required = false) Boolean isConfidential,
            @Parameter(description = "Is public") @RequestParam(required = false) Boolean isPublic,
            @Parameter(description = "Requires signature") @RequestParam(required = false) Boolean requiresSignature,
            @Parameter(description = "Is signed") @RequestParam(required = false) Boolean isSigned,
            @Parameter(description = "Expiry date from") @RequestParam(required = false) LocalDate expiryDateFrom,
            @Parameter(description = "Expiry date to") @RequestParam(required = false) LocalDate expiryDateTo,
            @Parameter(description = "Issue date from") @RequestParam(required = false) LocalDate issueDateFrom,
            @Parameter(description = "Issue date to") @RequestParam(required = false) LocalDate issueDateTo,
            @Parameter(description = "File type") @RequestParam(required = false) String fileType,
            @Parameter(description = "Minimum file size") @RequestParam(required = false) Long minFileSize,
            @Parameter(description = "Maximum file size") @RequestParam(required = false) Long maxFileSize,
            @Parameter(description = "Uploaded by user ID") @RequestParam(required = false) Long uploadedBy,
            @Parameter(description = "Signed by user ID") @RequestParam(required = false) Long signedBy,
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection) {
        
        try {
            Long currentUserId = getCurrentUserId();
            
            // Create search parameters
            DocumentSearchParams searchParams = new DocumentSearchParams();
            searchParams.setTitle(title);
            searchParams.setDescription(description);
            searchParams.setFileName(fileName);
            searchParams.setDocumentType(documentType);
            searchParams.setEmployeeId(employeeId);
            searchParams.setIsConfidential(isConfidential);
            searchParams.setIsPublic(isPublic);
            searchParams.setRequiresSignature(requiresSignature);
            searchParams.setIsSigned(isSigned);
            searchParams.setExpiryDateFrom(expiryDateFrom);
            searchParams.setExpiryDateTo(expiryDateTo);
            searchParams.setIssueDateFrom(issueDateFrom);
            searchParams.setIssueDateTo(issueDateTo);
            searchParams.setFileType(fileType);
            searchParams.setMinFileSize(minFileSize);
            searchParams.setMaxFileSize(maxFileSize);
            searchParams.setUploadedBy(uploadedBy);
            searchParams.setSignedBy(signedBy);
            
            // Create pagination request
            PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);
            
            Page<DocumentResponse> documents = documentService.searchDocuments(
                organizationId, searchParams, paginationRequest, currentUserId);
            
            return ResponseEntity.ok(ApiResponse.success("Documents retrieved successfully", documents));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get documents expiring — alias for /expiring-soon, matches frontend /documents/expiring
     */
    @GetMapping("/expiring")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get expiring documents")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getDocumentsExpiring(
            @RequestParam(required = false) Long organizationId,
            @RequestParam(defaultValue = "30") int daysAhead) {
        try {
            long orgId = organizationId != null ? organizationId : securityUtils.getCurrentUserOrgId();
            List<DocumentResponse> documents = documentService.getDocumentsExpiringSoon(orgId, daysAhead);
            return ResponseEntity.ok(ApiResponse.success("Expiring documents retrieved successfully", documents));
        } catch (RuntimeException e) {
            return ResponseEntity.ok(ApiResponse.success("Expiring documents retrieved", java.util.List.of()));
        }
    }

    /**
     * Get documents expiring soon
     */
    @GetMapping("/expiring-soon")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get documents expiring soon", description = "Get documents that are expiring within specified days")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getDocumentsExpiringSoon(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Days ahead to check") @RequestParam(defaultValue = "30") int daysAhead) {
        try {
            List<DocumentResponse> documents = documentService.getDocumentsExpiringSoon(organizationId, daysAhead);
            return ResponseEntity.ok(ApiResponse.success("Expiring documents retrieved successfully", documents));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get expired documents
     */
    @GetMapping("/expired")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get expired documents", description = "Get documents that have already expired")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getExpiredDocuments(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId) {
        try {
            List<DocumentResponse> documents = documentService.getExpiredDocuments(organizationId);
            return ResponseEntity.ok(ApiResponse.success("Expired documents retrieved successfully", documents));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get unsigned documents requiring signature
     */
    @GetMapping("/unsigned")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Get unsigned documents", description = "Get documents that require signature but are not yet signed")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getUnsignedDocuments(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId) {
        try {
            List<DocumentResponse> documents = documentService.getUnsignedDocuments(organizationId);
            return ResponseEntity.ok(ApiResponse.success("Unsigned documents retrieved successfully", documents));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get all versions of a document
     */
    @GetMapping("/versions")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get document versions", description = "Get all versions of a document by title and employee")
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getDocumentVersions(
            @Parameter(description = "Organization ID") @RequestParam Long organizationId,
            @Parameter(description = "Employee ID") @RequestParam Long employeeId,
            @Parameter(description = "Document title") @RequestParam String title) {
        try {
            Long currentUserId = getCurrentUserId();
            List<DocumentResponse> documents = documentService.getDocumentVersions(
                organizationId, employeeId, title, currentUserId);
            return ResponseEntity.ok(ApiResponse.success("Document versions retrieved successfully", documents));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get current user ID from security context via CustomUserPrincipal
     */
    private Long getCurrentUserId() {
        Long userId = securityUtils.getCurrentUserId();
        if (userId == null) {
            throw new RuntimeException("Unable to determine current user");
        }
        return userId;
    }
}

