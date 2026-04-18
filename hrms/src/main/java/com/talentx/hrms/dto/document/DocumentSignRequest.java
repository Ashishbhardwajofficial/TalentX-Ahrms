package com.talentx.hrms.dto.document;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public class DocumentSignRequest {

    @NotNull(message = "Signer ID is required")
    private Long signedBy;

    private LocalDateTime signedAt;

    private String signatureNotes;

    // Constructors
    public DocumentSignRequest() {}

    public DocumentSignRequest(Long signedBy) {
        this.signedBy = signedBy;
        this.signedAt = LocalDateTime.now();
    }

    public DocumentSignRequest(Long signedBy, LocalDateTime signedAt) {
        this.signedBy = signedBy;
        this.signedAt = signedAt;
    }

    // Getters and Setters
    public Long getSignedBy() {
        return signedBy;
    }

    public void setSignedBy(Long signedBy) {
        this.signedBy = signedBy;
    }

    public LocalDateTime getSignedAt() {
        return signedAt;
    }

    public void setSignedAt(LocalDateTime signedAt) {
        this.signedAt = signedAt;
    }

    public String getSignatureNotes() {
        return signatureNotes;
    }

    public void setSignatureNotes(String signatureNotes) {
        this.signatureNotes = signatureNotes;
    }
}

