package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.employee.EmployeeResponse;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.enums.EmploymentStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class EmployeeMapper {

    public EmployeeResponse toResponse(Employee employee) {
        if (employee == null) {
            return null;
        }

        EmployeeResponse response = new EmployeeResponse();
        
        // Basic employee information
        response.setId(employee.getId());
        response.setEmployeeNumber(employee.getEmployeeNumber());
        response.setFirstName(employee.getFirstName());
        response.setMiddleName(employee.getMiddleName());
        response.setLastName(employee.getLastName());
        response.setFullName(buildFullName(employee.getFirstName(), employee.getMiddleName(), employee.getLastName()));
        response.setEmail(employee.getEmail());
        response.setPhone(employee.getPhone());
        response.setMobile(employee.getMobile());
        response.setDateOfBirth(employee.getDateOfBirth());
        response.setGender(employee.getGender());
        response.setNationality(employee.getNationality());
        response.setMaritalStatus(employee.getMaritalStatus());
        // response.setSocialSecurityNumber(employee.getSocialSecurityNumber()); // Field not in DB schema
        // response.setTaxId(employee.getTaxId()); // Field not in DB schema
        
        // Employment information
        response.setHireDate(employee.getHireDate());
        response.setTerminationDate(employee.getTerminationDate());
        // response.setTerminationReason(employee.getTerminationReason()); // Field not in DB schema
        response.setEmploymentStatus(employee.getEmploymentStatus());
        response.setEmploymentType(employee.getEmploymentType());
        response.setJobTitle(employee.getJobTitle());
        response.setJobLevel(employee.getJobLevel());
        response.setSalary(employee.getSalary());
        response.setSalaryCurrency(employee.getSalaryCurrency());
        // response.setHourlyRate(employee.getHourlyRate()); // Field not in DB schema
        response.setProbationEndDate(employee.getProbationEndDate());
        // response.setConfirmationDate(employee.getConfirmationDate()); // Field not in DB schema
        
        // Status flags
        response.setActive(employee.getEmploymentStatus() == EmploymentStatus.ACTIVE);
        // response.setOnProbation(isOnProbation(employee)); // Method not in DTO
        
        // Organization information
        if (employee.getOrganization() != null) {
            response.setOrganizationId(employee.getOrganization().getId());
            response.setOrganizationName(employee.getOrganization().getName());
        }
        
        // Department information
        if (employee.getDepartment() != null) {
            response.setDepartmentId(employee.getDepartment().getId());
            response.setDepartmentName(employee.getDepartment().getName());
            response.setDepartmentCode(employee.getDepartment().getCode());
        }
        
        // Location information
        if (employee.getLocation() != null) {
            response.setLocationId(employee.getLocation().getId());
            response.setLocationName(employee.getLocation().getName());
            // response.setLocationCode(null); // Location table doesn't have code field per Database.txt and method doesn't exist in DTO
        }
        
        // Manager information — safe lazy access
        if (employee.getManager() != null) {
            try {
                response.setManagerId(employee.getManager().getId());
                response.setManagerName(buildFullName(
                    employee.getManager().getFirstName(),
                    employee.getManager().getMiddleName(),
                    employee.getManager().getLastName()
                ));
                response.setManagerEmployeeNumber(employee.getManager().getEmployeeNumber());
            } catch (Exception e) { /* lazy proxy not initialized */ }
        }
        
        // User account information
        if (employee.getUser() != null) {
            response.setUserId(employee.getUser().getId());
            response.setUsername(employee.getUser().getUsername());
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
    
    private boolean isOnProbation(Employee employee) {
        if (employee.getProbationEndDate() == null) {
            return false;
        }
        
        LocalDate today = LocalDate.now();
        LocalDate probationEndDate = employee.getProbationEndDate().toLocalDate();
        return today.isBefore(probationEndDate) || today.isEqual(probationEndDate);
    }
}

