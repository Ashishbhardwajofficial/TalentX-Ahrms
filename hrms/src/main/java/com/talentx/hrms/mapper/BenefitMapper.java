package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.benefits.BenefitPlanResponse;
import com.talentx.hrms.dto.benefits.EmployeeBenefitResponse;
import com.talentx.hrms.entity.benefits.BenefitPlan;
import com.talentx.hrms.entity.benefits.EmployeeBenefit;
import com.talentx.hrms.entity.enums.BenefitPlanType;
import com.talentx.hrms.entity.enums.BenefitStatus;
import com.talentx.hrms.entity.enums.CoverageLevel;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class BenefitMapper {

    public BenefitPlanResponse toBenefitPlanResponse(BenefitPlan benefitPlan) {
        if (benefitPlan == null) {
            return null;
        }

        BenefitPlanResponse response = new BenefitPlanResponse();
        
        // Basic benefit plan information
        response.setId(benefitPlan.getId());
        response.setName(benefitPlan.getName());
        // Convert entity's inner enum to external enum — use name() directly since they now match
        if (benefitPlan.getPlanType() != null) {
            try {
                response.setPlanType(com.talentx.hrms.entity.enums.BenefitPlanType.valueOf(benefitPlan.getPlanType().name()));
            } catch (IllegalArgumentException e) {
                // Unknown plan type — skip
            }
        }
        response.setDescription(benefitPlan.getDescription());
        response.setProvider(benefitPlan.getProviderName());
        response.setEmployeeCost(benefitPlan.getEmployeeCost());
        response.setEmployerCost(benefitPlan.getEmployerCost());
        // Note: costFrequency field doesn't exist, setting to null
        response.setCostFrequency(null);
        response.setEffectiveDate(benefitPlan.getEffectiveDate());
        response.setExpiryDate(benefitPlan.getExpirationDate());
        response.setActive(benefitPlan.isActive());
        if (benefitPlan.getCreatedAt() != null) {
            response.setCreatedAt(benefitPlan.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }
        if (benefitPlan.getUpdatedAt() != null) {
            response.setUpdatedAt(benefitPlan.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }
        
        // Organization information — safe lazy access
        if (benefitPlan.getOrganization() != null) {
            try {
                response.setOrganizationId(benefitPlan.getOrganization().getId());
                response.setOrganizationName(benefitPlan.getOrganization().getName());
            } catch (Exception e) { /* lazy proxy not initialized */ }
        }
        
        // Enrollment count — safe lazy access
        try {
            if (benefitPlan.getEmployeeBenefits() != null) {
                response.setEnrollmentCount(benefitPlan.getEmployeeBenefits().size());
            } else {
                response.setEnrollmentCount(0);
            }
        } catch (Exception e) {
            response.setEnrollmentCount(0);
        }
        
        return response;
    }

    public EmployeeBenefitResponse toEmployeeBenefitResponse(EmployeeBenefit employeeBenefit) {
        if (employeeBenefit == null) {
            return null;
        }

        EmployeeBenefitResponse response = new EmployeeBenefitResponse();
        
        // Basic employee benefit information
        response.setId(employeeBenefit.getId());
        response.setEnrollmentDate(employeeBenefit.getEnrollmentDate());
        response.setEffectiveDate(employeeBenefit.getEffectiveDate());
        response.setTerminationDate(employeeBenefit.getTerminationDate());
        // Note: terminationReason field doesn't exist, extracting from notes
        response.setTerminationReason(extractTerminationReasonFromNotes(employeeBenefit.getNotes()));
        // Note: status field doesn't exist, deriving from isActive
        response.setStatus(employeeBenefit.getIsActive() ? BenefitStatus.ACTIVE : BenefitStatus.TERMINATED);
        // Convert entity's inner enum to external enum
        if (employeeBenefit.getCoverageLevel() != null) {
            response.setCoverageLevel(CoverageLevel.valueOf(employeeBenefit.getCoverageLevel().name()));
        }
        // Note: beneficiaries field doesn't exist, extracting from notes
        response.setBeneficiaries(extractBeneficiariesFromNotes(employeeBenefit.getNotes()));
        if (employeeBenefit.getCreatedAt() != null) {
            response.setCreatedAt(employeeBenefit.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }
        if (employeeBenefit.getUpdatedAt() != null) {
            response.setUpdatedAt(employeeBenefit.getUpdatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        }
        
        // Employee information — safe lazy access
        if (employeeBenefit.getEmployee() != null) {
            try {
                response.setEmployeeId(employeeBenefit.getEmployee().getId());
                response.setEmployeeName(buildFullName(
                    employeeBenefit.getEmployee().getFirstName(),
                    employeeBenefit.getEmployee().getMiddleName(),
                    employeeBenefit.getEmployee().getLastName()
                ));
                response.setEmployeeNumber(employeeBenefit.getEmployee().getEmployeeNumber());
            } catch (Exception e) { /* lazy proxy not initialized */ }
        }
        
        // Benefit plan information
        if (employeeBenefit.getBenefitPlan() != null) {
            BenefitPlan plan = employeeBenefit.getBenefitPlan();
            response.setBenefitPlanId(plan.getId());
            response.setBenefitPlanName(plan.getName());
            // Convert entity's inner enum to external enum — safe conversion
            if (plan.getPlanType() != null) {
                try {
                    response.setPlanType(com.talentx.hrms.entity.enums.BenefitPlanType.valueOf(plan.getPlanType().name()));
                } catch (IllegalArgumentException e) {
                    // Unknown plan type — skip
                }
            }
            response.setProvider(plan.getProviderName());
            // Note: costFrequency field doesn't exist, setting to null
            response.setCostFrequency(null);
            
            // Calculate costs based on coverage level
            // Convert entity's inner enum to external enum for calculation
            CoverageLevel externalCoverageLevel = employeeBenefit.getCoverageLevel() != null ? 
                CoverageLevel.valueOf(employeeBenefit.getCoverageLevel().name()) : CoverageLevel.EMPLOYEE_ONLY;
            BigDecimal employeeCost = calculateCostByCoverage(plan.getEmployeeCost(), externalCoverageLevel);
            BigDecimal employerCost = calculateCostByCoverage(plan.getEmployerCost(), externalCoverageLevel);
            
            response.setEmployeeCost(employeeCost);
            response.setEmployerCost(employerCost);
            
            if (employeeCost != null && employerCost != null) {
                response.setTotalCost(employeeCost.add(employerCost));
            } else if (employeeCost != null) {
                response.setTotalCost(employeeCost);
            } else if (employerCost != null) {
                response.setTotalCost(employerCost);
            }
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
    
    /**
     * Calculate cost based on coverage level
     */
    private BigDecimal calculateCostByCoverage(BigDecimal baseCost, CoverageLevel coverageLevel) {
        if (baseCost == null || coverageLevel == null) {
            return baseCost;
        }

        // Apply multipliers based on coverage level
        switch (coverageLevel) {
            case EMPLOYEE_ONLY:
                return baseCost;
            case EMPLOYEE_SPOUSE:
                return baseCost.multiply(BigDecimal.valueOf(1.5));
            case EMPLOYEE_CHILDREN:
                return baseCost.multiply(BigDecimal.valueOf(1.3));
            case FAMILY:
                return baseCost.multiply(BigDecimal.valueOf(2.0));
            default:
                return baseCost;
        }
    }
    
    /**
     * Extract termination reason from notes field
     */
    private String extractTerminationReasonFromNotes(String notes) {
        if (notes == null) return null;
        
        String prefix = "Termination reason: ";
        int startIndex = notes.indexOf(prefix);
        if (startIndex == -1) return null;
        
        startIndex += prefix.length();
        int endIndex = notes.indexOf(";", startIndex);
        if (endIndex == -1) {
            return notes.substring(startIndex).trim();
        } else {
            return notes.substring(startIndex, endIndex).trim();
        }
    }
    
    /**
     * Extract beneficiaries from notes field
     */
    private String extractBeneficiariesFromNotes(String notes) {
        if (notes == null) return null;
        
        String prefix = "Beneficiaries: ";
        int startIndex = notes.indexOf(prefix);
        if (startIndex == -1) return null;
        
        startIndex += prefix.length();
        int endIndex = notes.indexOf(";", startIndex);
        if (endIndex == -1) {
            return notes.substring(startIndex).trim();
        } else {
            return notes.substring(startIndex, endIndex).trim();
        }
    }
}

