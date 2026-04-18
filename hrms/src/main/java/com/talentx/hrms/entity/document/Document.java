package com.talentx.hrms.entity.document;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "documents")
@AttributeOverride(name = "id", column = @Column(name = "document_id"))
@Getter
@Setter
public class Document extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organization_id", nullable = false)
    @NotNull
    private Organization organization;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false)
    @NotNull
    private DocumentType documentType;

    @Column(name = "title", nullable = false)
    @NotBlank
    @Size(max = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_name", nullable = false)
    @NotBlank
    @Size(max = 255)
    private String fileName;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "file_type")
    @Size(max = 100)
    private String fileType;

    @Column(name = "file_url", nullable = false)
    @NotBlank
    @Size(max = 500)
    private String fileUrl;

    @Column(name = "storage_path")
    @Size(max = 500)
    private String storagePath;

    @Column(name = "is_confidential", nullable = false)
    private Boolean isConfidential = false;

    @Column(name = "requires_signature", nullable = false)
    private Boolean requiresSignature = false;

    @Column(name = "signed_at")
    private LocalDateTime signedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "signed_by")
    private User signedBy;

    @Column(name = "issue_date")
    private LocalDate issueDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    // Constructors
    public Document() {}

    public Document(Organization organization, DocumentType documentType, String title, 
                   String fileName, String fileUrl, User uploadedBy) {
        this.organization = organization;
        this.documentType = documentType;
        this.title = title;
        this.fileName = fileName;
        this.fileUrl = fileUrl;
        this.uploadedBy = uploadedBy;
    }

    // Utility methods
    public boolean isSigned() {
        return signedAt != null && signedBy != null;
    }

    public boolean isExpired() {
        return expiryDate != null && expiryDate.isBefore(LocalDate.now());
    }

    public boolean isExpiringSoon(int daysAhead) {
        if (expiryDate == null) return false;
        LocalDate checkDate = LocalDate.now().plusDays(daysAhead);
        return expiryDate.isBefore(checkDate) || expiryDate.isEqual(checkDate);
    }

    // Getter and setter for document revision number — delegates to BaseEntity's version (optimistic lock)
    public Integer getDocumentVersion() {
        return super.getVersion() != null ? super.getVersion().intValue() : 1;
    }

    public void setDocumentVersion(Integer documentVersion) {
        super.setVersion(documentVersion != null ? documentVersion.longValue() : null);
    }

    public enum DocumentType {
        CONTRACT,
        POLICY,
        CERTIFICATE,
        ID_PROOF,
        RESUME,
        PERFORMANCE_REVIEW,
        OTHER
    }
}

