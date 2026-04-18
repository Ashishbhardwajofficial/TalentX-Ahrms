package com.talentx.hrms.dto.document;

import com.talentx.hrms.entity.document.Document;

import java.time.LocalDate;

public class DocumentSearchParams {

    private String title;
    private String description;
    private String fileName;
    private Document.DocumentType documentType;
    private Long employeeId;
    private Boolean isConfidential;
    private Boolean isPublic;
    private Boolean requiresSignature;
    private Boolean isSigned;
    private LocalDate expiryDateFrom;
    private LocalDate expiryDateTo;
    private LocalDate issueDateFrom;
    private LocalDate issueDateTo;
    private String fileType;
    private Long minFileSize;
    private Long maxFileSize;
    private Long uploadedBy;
    private Long signedBy;

    // Constructors
    public DocumentSearchParams() {}

    // Getters and Setters
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

    public Document.DocumentType getDocumentType() {
        return documentType;
    }

    public void setDocumentType(Document.DocumentType documentType) {
        this.documentType = documentType;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public Boolean getIsConfidential() {
        return isConfidential;
    }

    public void setIsConfidential(Boolean isConfidential) {
        this.isConfidential = isConfidential;
    }

    public Boolean getIsPublic() {
        return isPublic;
    }

    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }

    public Boolean getRequiresSignature() {
        return requiresSignature;
    }

    public void setRequiresSignature(Boolean requiresSignature) {
        this.requiresSignature = requiresSignature;
    }

    public Boolean getIsSigned() {
        return isSigned;
    }

    public void setIsSigned(Boolean isSigned) {
        this.isSigned = isSigned;
    }

    public LocalDate getExpiryDateFrom() {
        return expiryDateFrom;
    }

    public void setExpiryDateFrom(LocalDate expiryDateFrom) {
        this.expiryDateFrom = expiryDateFrom;
    }

    public LocalDate getExpiryDateTo() {
        return expiryDateTo;
    }

    public void setExpiryDateTo(LocalDate expiryDateTo) {
        this.expiryDateTo = expiryDateTo;
    }

    public LocalDate getIssueDateFrom() {
        return issueDateFrom;
    }

    public void setIssueDateFrom(LocalDate issueDateFrom) {
        this.issueDateFrom = issueDateFrom;
    }

    public LocalDate getIssueDateTo() {
        return issueDateTo;
    }

    public void setIssueDateTo(LocalDate issueDateTo) {
        this.issueDateTo = issueDateTo;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getMinFileSize() {
        return minFileSize;
    }

    public void setMinFileSize(Long minFileSize) {
        this.minFileSize = minFileSize;
    }

    public Long getMaxFileSize() {
        return maxFileSize;
    }

    public void setMaxFileSize(Long maxFileSize) {
        this.maxFileSize = maxFileSize;
    }

    public Long getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(Long uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public Long getSignedBy() {
        return signedBy;
    }

    public void setSignedBy(Long signedBy) {
        this.signedBy = signedBy;
    }
}

