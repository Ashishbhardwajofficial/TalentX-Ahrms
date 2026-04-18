package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.document.DocumentResponse;
import com.talentx.hrms.entity.document.Document;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
public class DocumentMapper {

    public DocumentResponse toResponse(Document document) {
        if (document == null) {
            return null;
        }

        DocumentResponse response = new DocumentResponse();
        response.setId(document.getId());
        response.setOrganizationId(document.getOrganization().getId());
        response.setOrganizationName(document.getOrganization().getName());
        
        if (document.getEmployee() != null) {
            response.setEmployeeId(document.getEmployee().getId());
            response.setEmployeeName(document.getEmployee().getFirstName() + " " + document.getEmployee().getLastName());
        }
        
        response.setDocumentType(document.getDocumentType());
        response.setTitle(document.getTitle());
        response.setDescription(document.getDescription());
        response.setFileName(document.getFileName());
        response.setFileSize(document.getFileSize());
        response.setFileType(document.getFileType());
        response.setFileUrl(document.getFileUrl());
        response.setStoragePath(document.getStoragePath());
        response.setVersion(document.getDocumentVersion());
        response.setIsConfidential(document.getIsConfidential());
        response.setRequiresSignature(document.getRequiresSignature());
        response.setSignedAt(document.getSignedAt());
        
        if (document.getSignedBy() != null) {
            response.setSignedBy(document.getSignedBy().getId());
            response.setSignedByName(document.getSignedBy().getEmail()); // Assuming User has email field
        }
        
        response.setIssueDate(document.getIssueDate());
        response.setExpiryDate(document.getExpiryDate());
        response.setIsPublic(document.getIsPublic());
        
        if (document.getUploadedBy() != null) {
            response.setUploadedBy(document.getUploadedBy().getId());
            response.setUploadedByName(document.getUploadedBy().getEmail()); // Assuming User has email field
        }
        
        if (document.getCreatedAt() != null) {
            response.setCreatedAt(document.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }
        if (document.getUpdatedAt() != null) {
            response.setUpdatedAt(document.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }

        // Set computed fields
        response.setIsSigned(document.isSigned());
        response.setIsExpired(document.isExpired());
        response.setIsExpiringSoon(document.isExpiringSoon(30)); // 30 days ahead
        
        if (document.getExpiryDate() != null) {
            long daysUntilExpiry = ChronoUnit.DAYS.between(LocalDate.now(), document.getExpiryDate());
            response.setDaysUntilExpiry((int) daysUntilExpiry);
        }

        return response;
    }
}

