package com.talentx.hrms.dto.document;

import com.talentx.hrms.entity.document.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class DocumentRequest {

    @NotNull(message = "Organization ID is required")
    private Long organizationId;

    private Long employeeId;

    @NotNull(message = "Document type is required")
    private Document.DocumentType documentType;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @NotBlank(message = "File name is required")
    @Size(max = 255, message = "File name must not exceed 255 characters")
    private String fileName;

    private Long fileSize;

    @Size(max = 100, message = "File type must not exceed 100 characters")
    private String fileType;

    @NotBlank(message = "File URL is required")
    @Size(max = 500, message = "File URL must not exceed 500 characters")
    private String fileUrl;

    @Size(max = 500, message = "Storage path must not exceed 500 characters")
    private String storagePath;

    private Integer version = 1;

    private Boolean isConfidential = false;

    private Boolean requiresSignature = false;

    private LocalDate issueDate;

    private LocalDate expiryDate;

    private Boolean isPublic = false;

    private Long uploadedBy;

    // Constructors
    public DocumentRequest() {}

    public DocumentRequest(Long organizationId, Document.DocumentType documentType, String title, 
                          String fileName, String fileUrl) {
        this.organizationId = organizationId;
        this.documentType = documentType;
        this.title = title;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
    }

    // Getters and Setters
    public Long getOrganizationId() {
        return organizationId;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Document.DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(Document.DocumentType documentType) {
        this.documentType = documentType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public String getStoragePath() {
        return storagePath;
    }

    public void setStoragePath(String storagePath) {
        this.storagePath = storagePath;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public Boolean getIsConfidential() {
        return isConfidential;
    }

    public void setIsConfidential(Boolean isConfidential) {
        this.isConfidential = isConfidential;
    }

    public Boolean getRequiresSignature() {
        return requiresSignature;
    }

    public void setRequiresSignature(Boolean requiresSignature) {
        this.requiresSignature = requiresSignature;
    }

    public LocalDate getIssueDate() {
        return issueDate;
    }

    public void setIssueDate(LocalDate issueDate) {
        this.issueDate = issueDate;
    }

    public LocalDate getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDate expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Long getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(Long uploadedBy) {
        this.uploadedBy = uploadedBy;
    }
}

