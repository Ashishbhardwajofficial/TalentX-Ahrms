package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.exit.ExitResponse;
import com.talentx.hrms.entity.exit.EmployeeExit;
import org.springframework.stereotype.Component;

/**
 * Mapper for converting between EmployeeExit entities and DTOs
 */
@Component
public class ExitMapper {

    /**
     * Convert EmployeeExit entity to ExitResponse DTO
     */
    public ExitResponse toResponse(EmployeeExit exit) {
        if (exit == null) {
            return null;
        }

        ExitResponse response = new ExitResponse();
        
        // Basic exit information
        response.setId(exit.getId());
        response.setResignationDate(exit.getResignationDate());
        response.setLastWorkingDay(exit.getLastWorkingDay());
        response.setExitReason(exit.getExitReason());
        response.setStatus(exit.getStatus());
        response.setApprovedAt(exit.getApprovedAt());
        response.setNotes(exit.getNotes());
        response.setCreatedAt(exit.getCreatedAt());
        response.setUpdatedAt(exit.getUpdatedAt());
        
        // Employee information
        if (exit.getEmployee() != null) {
            response.setEmployeeId(exit.getEmployee().getId());
            response.setEmployeeName(buildFullName(
                exit.getEmployee().getFirstName(),
                exit.getEmployee().getMiddleName(),
                exit.getEmployee().getLastName()
            ));
            response.setEmployeeNumber(exit.getEmployee().getEmployeeNumber());
            response.setJobTitle(exit.getEmployee().getJobTitle());
            
            // Department information
            if (exit.getEmployee().getDepartment() != null) {
                response.setDepartmentName(exit.getEmployee().getDepartment().getName());
            }
        }
        
        // Approver information
        if (exit.getApprovedBy() != null) {
            response.setApprovedById(exit.getApprovedBy().getId());
            response.setApprovedByName(buildFullName(
                exit.getApprovedBy().getFirstName(),
                exit.getApprovedBy().getMiddleName(),
                exit.getApprovedBy().getLastName()
            ));
        }
        
        return response;
    }
    
    /**
     * Build full name from first, middle, and last names
     */
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

