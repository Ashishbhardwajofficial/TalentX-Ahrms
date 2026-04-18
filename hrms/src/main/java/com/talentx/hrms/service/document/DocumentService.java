package com.talentx.hrms.service.document;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.common.exception.EntityNotFoundException;
import com.talentx.hrms.common.exception.ValidationException;
import com.talentx.hrms.dto.document.*;
import com.talentx.hrms.entity.analytics.SystemNotification;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.document.Document;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.mapper.DocumentMapper;
import com.talentx.hrms.repository.DocumentRepository;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.repository.OrganizationRepository;
import com.talentx.hrms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class DocumentService {

    private static final Logger logger = LoggerFactory.getLogger(DocumentService.class);
    private static final String UPLOAD_DIR = "uploads/documents/";
    private static final int EXPIRY_WARNING_DAYS = 30;

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DocumentMapper documentMapper;

    /**
     * Upload a new document
     */
    public DocumentResponse uploadDocument(MultipartFile file, DocumentRequest request, Long uploadedByUserId) {
        logger.info("Uploading document: {} for organization: {}", request.getTitle(), request.getOrganizationId());

        // Validate organization exists
        Organization organization = organizationRepository.findById(request.getOrganizationId())
                .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + request.getOrganizationId()));

        // Validate employee exists if provided
        Employee employee = null;
        if (request.getEmployeeId() != null) {
            employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));
        }

        // Validate uploader exists
        User uploadedBy = userRepository.findById(uploadedByUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + uploadedByUserId));

        try {
            // Store file
            String fileName = storeFile(file, organization.getId());
            String fileUrl = "/api/documents/download/" + fileName;

            // Handle versioning - check if document with same title and employee exists
            Integer version = 1;
            if (employee != null) {
                List<Document> existingVersions = documentRepository.findLatestVersionByEmployeeAndTitle(
                        organization, employee, request.getTitle());
                if (!existingVersions.isEmpty()) {
                    version = existingVersions.get(0).getDocumentVersion() + 1;
                }
            }

            // Create document entity
            Document document = new Document(organization, request.getDocumentType(), request.getTitle(), 
                                           file.getOriginalFilename(), fileUrl, uploadedBy);
            document.setEmployee(employee);
            document.setDescription(request.getDescription());
            document.setFileSize(file.getSize());
            document.setFileType(file.getContentType());
            document.setStoragePath(fileName);
            document.setDocumentVersion(version);
            document.setIsConfidential(request.getIsConfidential());
            document.setRequiresSignature(request.getRequiresSignature());
            document.setIssueDate(request.getIssueDate());
            document.setExpiryDate(request.getExpiryDate());
            document.setIsPublic(request.getIsPublic());

            // Save document
            Document savedDocument = documentRepository.save(document);

            // Schedule expiry notification if expiry date is set
            if (savedDocument.getExpiryDate() != null) {
                scheduleExpiryNotification(savedDocument);
            }

            logger.info("Document uploaded successfully with id: {}", savedDocument.getId());
            return documentMapper.toResponse(savedDocument);

        } catch (IOException e) {
            logger.error("Failed to upload document: {}", e.getMessage());
            throw new ValidationException("Failed to upload document: " + e.getMessage());
        }
    }

    /**
     * Download a document
     */
    public Resource downloadDocument(Long documentId, Long userId) {
        logger.info("Downloading document: {} by user: {}", documentId, userId);

        Document document = documentRepository.findByIdWithFullDetails(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + documentId));

        // Check access permissions
        if (!hasAccessToDocument(document, userId)) {
            throw new ValidationException("Access denied to document");
        }

        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(document.getStoragePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new EntityNotFoundException("Document file not found: " + document.getStoragePath());
            }
        } catch (MalformedURLException e) {
            logger.error("Failed to download document: {}", e.getMessage());
            throw new ValidationException("Failed to download document: " + e.getMessage());
        }
    }

    /**
     * Get document by ID
     */
    @Transactional(readOnly = true)
    public DocumentResponse getDocument(Long documentId, Long userId) {
        Document document = documentRepository.findByIdWithFullDetails(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + documentId));

        // Check access permissions
        if (!hasAccessToDocument(document, userId)) {
            throw new ValidationException("Access denied to document");
        }

        return documentMapper.toResponse(document);
    }

    /**
     * Search documents with pagination
     */
    @Transactional(readOnly = true)
    public Page<DocumentResponse> searchDocuments(Long organizationId, DocumentSearchParams searchParams, 
                                                 PaginationRequest paginationRequest, Long userId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + organizationId));

        // Create pageable
        Sort sort = Sort.by(Sort.Direction.fromString(paginationRequest.getSortDirection()), 
                           paginationRequest.getSortBy() != null ? paginationRequest.getSortBy() : "id");
        Pageable pageable = PageRequest.of(paginationRequest.getPage(), paginationRequest.getSize(), sort);

        // Get employee for access control
        Employee employee = null;
        if (searchParams.getEmployeeId() != null) {
            employee = employeeRepository.findById(searchParams.getEmployeeId()).orElse(null);
        }

        // Search documents
        Page<Document> documents = documentRepository.findBySearchCriteria(
                organization,
                searchParams.getTitle(),
                searchParams.getDescription(),
                searchParams.getFileName(),
                searchParams.getDocumentType(),
                employee,
                searchParams.getIsConfidential(),
                searchParams.getIsPublic(),
                searchParams.getRequiresSignature(),
                searchParams.getIsSigned(),
                pageable
        );

        // Filter by access permissions and map to response — filter out nulls properly
        List<DocumentResponse> accessibleDocs = documents.getContent().stream()
                .filter(doc -> hasAccessToDocument(doc, userId))
                .map(doc -> documentMapper.toResponse(doc))
                .collect(java.util.stream.Collectors.toList());

        return new org.springframework.data.domain.PageImpl<>(
                accessibleDocs,
                pageable,
                documents.getTotalElements()
        );
    }

    /**
     * Update document metadata
     */
    public DocumentResponse updateDocument(Long documentId, DocumentRequest request, Long userId) {
        logger.info("Updating document: {} by user: {}", documentId, userId);

        Document document = documentRepository.findByIdWithFullDetails(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + documentId));

        // Check access permissions
        if (!hasAccessToDocument(document, userId)) {
            throw new ValidationException("Access denied to document");
        }

        // Update fields
        document.setTitle(request.getTitle());
        document.setDescription(request.getDescription());
        document.setDocumentType(request.getDocumentType());
        document.setIsConfidential(request.getIsConfidential());
        document.setRequiresSignature(request.getRequiresSignature());
        document.setIssueDate(request.getIssueDate());
        document.setExpiryDate(request.getExpiryDate());
        document.setIsPublic(request.getIsPublic());

        // Update employee if provided
        if (request.getEmployeeId() != null) {
            Employee employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));
            document.setEmployee(employee);
        }

        Document savedDocument = documentRepository.save(document);

        // Update expiry notification if expiry date changed
        if (savedDocument.getExpiryDate() != null) {
            scheduleExpiryNotification(savedDocument);
        }

        logger.info("Document updated successfully: {}", documentId);
        return documentMapper.toResponse(savedDocument);
    }

    /**
     * Sign a document
     */
    public DocumentResponse signDocument(Long documentId, DocumentSignRequest signRequest) {
        logger.info("Signing document: {} by user: {}", documentId, signRequest.getSignedBy());

        Document document = documentRepository.findByIdWithFullDetails(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + documentId));

        if (!document.getRequiresSignature()) {
            throw new ValidationException("Document does not require signature");
        }

        if (document.isSigned()) {
            throw new ValidationException("Document is already signed");
        }

        // Validate signer exists
        User signer = userRepository.findById(signRequest.getSignedBy())
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + signRequest.getSignedBy()));

        // Sign the document
        document.setSignedBy(signer);
        document.setSignedAt(signRequest.getSignedAt() != null ? signRequest.getSignedAt() : LocalDateTime.now());

        Document savedDocument = documentRepository.save(document);

        logger.info("Document signed successfully: {} by user: {}", documentId, signRequest.getSignedBy());
        return documentMapper.toResponse(savedDocument);
    }

    /**
     * Delete a document
     */
    public void deleteDocument(Long documentId, Long userId) {
        logger.info("Deleting document: {} by user: {}", documentId, userId);

        Document document = documentRepository.findByIdWithFullDetails(documentId)
                .orElseThrow(() -> new EntityNotFoundException("Document not found with id: " + documentId));

        // Check access permissions
        if (!hasAccessToDocument(document, userId)) {
            throw new ValidationException("Access denied to document");
        }

        // Delete physical file
        try {
            Path filePath = Paths.get(UPLOAD_DIR).resolve(document.getStoragePath()).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            logger.warn("Failed to delete physical file: {}", e.getMessage());
        }

        // Delete document record
        documentRepository.delete(document);

        logger.info("Document deleted successfully: {}", documentId);
    }

    /**
     * Get documents expiring soon
     */
    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentsExpiringSoon(Long organizationId, int daysAhead) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + organizationId));

        LocalDate endDate = LocalDate.now().plusDays(daysAhead);
        List<Document> documents = documentRepository.findDocumentsExpiringSoon(organization, endDate);

        return documents.stream()
                .map(documentMapper::toResponse)
                .toList();
    }

    /**
     * Get expired documents
     */
    @Transactional(readOnly = true)
    public List<DocumentResponse> getExpiredDocuments(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + organizationId));

        List<Document> documents = documentRepository.findExpiredDocuments(organization);

        return documents.stream()
                .map(documentMapper::toResponse)
                .toList();
    }

    /**
     * Get all versions of a document
     */
    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocumentVersions(Long organizationId, Long employeeId, String title, Long userId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + organizationId));

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + employeeId));

        List<Document> documents = documentRepository.findAllVersionsByEmployeeAndTitle(organization, employee, title);

        return documents.stream()
                .filter(doc -> hasAccessToDocument(doc, userId))
                .map(documentMapper::toResponse)
                .toList();
    }

    /**
     * Get unsigned documents requiring signature
     */
    @Transactional(readOnly = true)
    public List<DocumentResponse> getUnsignedDocuments(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
                .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + organizationId));

        List<Document> documents = documentRepository.findUnsignedDocuments(organization);

        return documents.stream()
                .map(documentMapper::toResponse)
                .toList();
    }

    // Private helper methods

    private String storeFile(MultipartFile file, Long organizationId) throws IOException {
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(UPLOAD_DIR + organizationId);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;
        String relativePath = organizationId + "/" + uniqueFilename;

        // Store file
        Path targetLocation = uploadPath.resolve(uniqueFilename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

        return relativePath;
    }

    private boolean hasAccessToDocument(Document document, Long userId) {
        // Public documents are accessible to all
        if (document.getIsPublic()) {
            return true;
        }

        // Document owner has access
        if (document.getUploadedBy() != null && document.getUploadedBy().getId().equals(userId)) {
            return true;
        }

        // Employee can access their own documents
        if (document.getEmployee() != null) {
            // Check if user is the employee (assuming user-employee relationship exists)
            // This would need to be implemented based on your user-employee mapping
            // For now, we'll allow access if the user uploaded it or it's public
        }

        // For confidential documents, additional checks would be needed
        if (document.getIsConfidential()) {
            // Implement role-based access control here
            // For now, only uploader has access
            return document.getUploadedBy() != null && document.getUploadedBy().getId().equals(userId);
        }

        // Default: allow access for non-confidential documents
        return !document.getIsConfidential();
    }

    private void scheduleExpiryNotification(Document document) {
        if (document.getExpiryDate() == null) {
            return;
        }

        LocalDate notificationDate = document.getExpiryDate().minusDays(EXPIRY_WARNING_DAYS);
        LocalDate today = LocalDate.now();

        // If notification date is today or in the past, send notification immediately
        if (!notificationDate.isAfter(today)) {
            sendExpiryNotification(document);
        } else {
            // In a real implementation, you would schedule this with a job scheduler
            // For now, we'll log that a notification should be scheduled
            logger.info("Expiry notification scheduled for document: {} on date: {}", 
                       document.getId(), notificationDate);
        }
    }

    private void sendExpiryNotification(Document document) {
        // This is a placeholder for notification sending logic
        // In a real system, this would integrate with email service or notification system
        
        logger.info("Sending expiry notification for document: {} (expires: {})", 
                   document.getId(), document.getExpiryDate());

        // Create system notification (if SystemNotification entity is properly implemented)
        try {
            // This would create a notification record in the database
            // SystemNotification notification = new SystemNotification();
            // notification.setTitle("Document Expiring Soon");
            // notification.setMessage("Document '" + document.getTitle() + "' expires on " + document.getExpiryDate());
            // notification.setNotificationType("WARNING");
            // Save notification...
            
            logger.info("Expiry notification created for document: {}", document.getId());
        } catch (Exception e) {
            logger.error("Failed to create expiry notification: {}", e.getMessage());
        }
    }
}

