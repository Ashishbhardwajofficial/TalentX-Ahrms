package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.employee.BankDetailsRequest;
import com.talentx.hrms.dto.employee.BankDetailsResponse;
import com.talentx.hrms.dto.employee.BankDetailsUpdateRequest;
import com.talentx.hrms.entity.finance.EmployeeBankDetail;
import org.springframework.stereotype.Component;

@Component
public class BankDetailsMapper {

    public BankDetailsResponse toResponse(EmployeeBankDetail bankDetail) {
        if (bankDetail == null) {
            return null;
        }

        BankDetailsResponse response = new BankDetailsResponse();
        
        // Basic bank detail information
        response.setId(bankDetail.getId());
        response.setBankName(bankDetail.getBankName());
        response.setAccountNumber(bankDetail.getAccountNumber());
        response.setMaskedAccountNumber(bankDetail.getMaskedAccountNumber());
        response.setIfscCode(bankDetail.getIfscCode());
        response.setBranchName(bankDetail.getBranchName());
        response.setAccountType(bankDetail.getAccountType());
        response.setIsPrimary(bankDetail.getIsPrimary());
        // Removed: isActive field does not exist in database
        response.setCreatedAt(bankDetail.getCreatedAt());
        response.setUpdatedAt(bankDetail.getUpdatedAt());
        
        // Employee information
        if (bankDetail.getEmployee() != null) {
            response.setEmployeeId(bankDetail.getEmployee().getId());
            response.setEmployeeNumber(bankDetail.getEmployee().getEmployeeNumber());
            response.setEmployeeName(buildEmployeeName(
                bankDetail.getEmployee().getFirstName(),
                bankDetail.getEmployee().getMiddleName(),
                bankDetail.getEmployee().getLastName()
            ));
        }
        
        return response;
    }

    public EmployeeBankDetail toEntity(BankDetailsRequest request) {
        if (request == null) {
            return null;
        }

        EmployeeBankDetail bankDetail = new EmployeeBankDetail();
        
        // Map basic fields
        bankDetail.setBankName(request.getBankName());
        bankDetail.setAccountNumber(request.getAccountNumber());
        bankDetail.setIfscCode(request.getIfscCode());
        bankDetail.setBranchName(request.getBranchName());
        bankDetail.setAccountType(request.getAccountType());
        bankDetail.setIsPrimary(request.getIsPrimary());
        // Removed: isActive field does not exist in database
        
        // Note: Employee entity needs to be set separately in the service layer
        // as it requires repository lookup
        
        return bankDetail;
    }

    public void updateEntity(EmployeeBankDetail bankDetail, BankDetailsUpdateRequest request) {
        if (bankDetail == null || request == null) {
            return;
        }

        // Update basic fields
        bankDetail.setBankName(request.getBankName());
        bankDetail.setAccountNumber(request.getAccountNumber());
        bankDetail.setIfscCode(request.getIfscCode());
        bankDetail.setBranchName(request.getBranchName());
        bankDetail.setAccountType(request.getAccountType());
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

