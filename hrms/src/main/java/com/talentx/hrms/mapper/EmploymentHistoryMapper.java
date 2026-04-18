package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.employee.EmploymentHistoryRequest;
import com.talentx.hrms.dto.employee.EmploymentHistoryResponse;
import com.talentx.hrms.entity.employee.EmployeeEmploymentHistory;
import com.talentx.hrms.entity.enums.EmploymentStatus;
import com.talentx.hrms.entity.enums.EmploymentType;
import org.springframework.stereotype.Component;

@Component
public class EmploymentHistoryMapper {

    public EmploymentHistoryResponse toResponse(EmployeeEmploymentHistory history) {
        if (history == null) {
            return null;
        }

        EmploymentHistoryResponse response = new EmploymentHistoryResponse();
        
        // Basic history information
        response.setId(history.getId());
        response.setEffectiveDate(history.getEffectiveDate());
        response.setEndDate(history.getEndDate());
        response.setJobTitle(history.getJobTitle());
        response.setJobLevel(history.getJobLevel());
        response.setEmploymentStatus(history.getEmploymentStatus() != null ? EmploymentStatus.valueOf(history.getEmploymentStatus()) : null);
        response.setEmploymentType(history.getEmploymentType() != null ? EmploymentType.valueOf(history.getEmploymentType()) : null);
        response.setSalary(history.getSalary());
        response.setSalaryCurrency(history.getSalaryCurrency());
        response.setHourlyRate(history.getHourlyRate());
        response.setChangeType(history.getChangeType());
        response.setChangeReason(history.getChangeReason());
        response.setChangedBy(history.getChangedBy());
        response.setIsCurrent(history.getIsCurrent());
        if (history.getCreatedAt() != null) {
            response.setCreatedAt(history.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }
        if (history.getUpdatedAt() != null) {
            response.setUpdatedAt(history.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }
        
        // Employee information
        if (history.getEmployee() != null) {
            response.setEmployeeId(history.getEmployee().getId());
            response.setEmployeeNumber(history.getEmployee().getEmployeeNumber());
            response.setEmployeeName(buildEmployeeName(
                history.getEmployee().getFirstName(),
                history.getEmployee().getMiddleName(),
                history.getEmployee().getLastName()
            ));
        }
        
        // Department information
        if (history.getDepartment() != null) {
            response.setDepartmentId(history.getDepartment().getId());
            response.setDepartmentName(history.getDepartment().getName());
        }
        
        // Manager information
        if (history.getManager() != null) {
            response.setManagerId(history.getManager().getId());
            response.setManagerName(buildEmployeeName(
                history.getManager().getFirstName(),
                history.getManager().getMiddleName(),
                history.getManager().getLastName()
            ));
        }
        
        return response;
    }

    public EmployeeEmploymentHistory toEntity(EmploymentHistoryRequest request) {
        if (request == null) {
            return null;
        }

        EmployeeEmploymentHistory history = new EmployeeEmploymentHistory();
        
        // Map basic fields
        history.setEffectiveDate(request.getEffectiveDate());
        history.setEndDate(request.getEndDate());
        history.setJobTitle(request.getJobTitle());
        history.setJobLevel(request.getJobLevel());
        // history.setEmploymentStatus(request.getEmploymentStatus()); // Not in DB schema
        // history.setEmploymentType(request.getEmploymentType()); // Not in DB schema
        history.setSalary(request.getSalary());
        history.setSalaryCurrency(request.getSalaryCurrency());
        // history.setHourlyRate(request.getHourlyRate()); // Not in DB schema
        history.setChangeType(request.getChangeType());
        history.setChangeReason(request.getChangeReason());
        history.setChangedBy(request.getChangedBy());
        history.setIsCurrent(request.getIsCurrent());
        
        // Note: Employee, Department, and Manager entities need to be set separately
        // in the service layer as they require repository lookups
        
        return history;
    }

    public void updateEntity(EmployeeEmploymentHistory history, EmploymentHistoryRequest request) {
        if (history == null || request == null) {
            return;
        }

        // Update basic fields
        history.setEffectiveDate(request.getEffectiveDate());
        history.setEndDate(request.getEndDate());
        history.setJobTitle(request.getJobTitle());
        history.setJobLevel(request.getJobLevel());
        // history.setEmploymentStatus(request.getEmploymentStatus()); // Not in DB schema
        // history.setEmploymentType(request.getEmploymentType()); // Not in DB schema
        history.setSalary(request.getSalary());
        history.setSalaryCurrency(request.getSalaryCurrency());
        // history.setHourlyRate(request.getHourlyRate()); // Not in DB schema
        history.setChangeType(request.getChangeType());
        history.setChangeReason(request.getChangeReason());
        history.setChangedBy(request.getChangedBy());
        history.setIsCurrent(request.getIsCurrent());
        
        // Note: Employee, Department, and Manager entities need to be updated separately
        // in the service layer as they require repository lookups
    }

    private String buildEmployeeName(String firstName, String middleName, String lastName) {
        StringBuilder nameBuilder = new StringBuilder();
        
        if (firstName != null && !firstName.trim().isEmpty()) {
            nameBuilder.append(firstName.trim());
        }
        
        if (middleName != null && !middleName.trim().isEmpty()) {
            if (nameBuilder.length() > 0) {
                nameBuilder.append(" ");
            }
            nameBuilder.append(middleName.trim());
        }
        
        if (lastName != null && !lastName.trim().isEmpty()) {
            if (nameBuilder.length() > 0) {
                nameBuilder.append(" ");
            }
            nameBuilder.append(lastName.trim());
        }
        
        return nameBuilder.toString();
    }
}

