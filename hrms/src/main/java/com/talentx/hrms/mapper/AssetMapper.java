package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.asset.AssetAssignmentResponse;
import com.talentx.hrms.dto.asset.AssetResponse;
import com.talentx.hrms.entity.assets.Asset;
import com.talentx.hrms.entity.assets.AssetAssignment;
import org.springframework.stereotype.Component;

@Component
public class AssetMapper {

    public AssetResponse toAssetResponse(Asset asset) {
        if (asset == null) {
            return null;
        }

        AssetResponse response = new AssetResponse();
        
        // Basic asset information
        response.setId(asset.getId());
        response.setAssetType(asset.getAssetType());
        response.setAssetTag(asset.getAssetTag());
        response.setSerialNumber(asset.getSerialNumber());
        response.setStatus(asset.getStatus());
        response.setCreatedAt(asset.getCreatedAt());
        response.setUpdatedAt(asset.getUpdatedAt());
        response.setActive(asset.getActive());
        
        // Organization information
        if (asset.getOrganization() != null) {
            response.setOrganizationId(asset.getOrganization().getId());
        }
        
        return response;
    }

    public AssetAssignmentResponse toAssetAssignmentResponse(AssetAssignment assignment) {
        if (assignment == null) {
            return null;
        }

        AssetAssignmentResponse response = new AssetAssignmentResponse();
        
        // Basic assignment information
        response.setId(assignment.getId());
        response.setAssignedDate(assignment.getAssignedDate());
        response.setReturnedDate(assignment.getReturnedDate());
        response.setActive(assignment.getActive());
        response.setCreatedAt(assignment.getCreatedAt());
        response.setUpdatedAt(assignment.getUpdatedAt());
        
        // Asset information
        if (assignment.getAsset() != null) {
            Asset asset = assignment.getAsset();
            response.setAssetId(asset.getId());
            response.setAssetTag(asset.getAssetTag());
            response.setAssetType(asset.getAssetType() != null ? asset.getAssetType().toString() : null);
        }
        
        // Employee information
        if (assignment.getEmployee() != null) {
            response.setEmployeeId(assignment.getEmployee().getId());
            response.setEmployeeName(buildFullName(
                assignment.getEmployee().getFirstName(),
                assignment.getEmployee().getMiddleName(),
                assignment.getEmployee().getLastName()
            ));
            response.setEmployeeNumber(assignment.getEmployee().getEmployeeNumber());
        }
        
        return response;
    }
    
    private String buildFullName(String firstName, String middleName, String lastName) {
        StringBuilder fullName = new StringBuilder();
        
        if (firstName != null && !firstName.trim().isEmpty()) {
            fullName.append(firstName.trim());
        }
        
        if (middleName != null && !middleName.trim().isEmpty()) {
            if (fullName.length() > 0) {
                fullName.append(" ");
            }
            fullName.append(middleName.trim());
        }
        
        if (lastName != null && !lastName.trim().isEmpty()) {
            if (fullName.length() > 0) {
                fullName.append(" ");
            }
            fullName.append(lastName.trim());
        }
        
        return fullName.toString();
    }
}

