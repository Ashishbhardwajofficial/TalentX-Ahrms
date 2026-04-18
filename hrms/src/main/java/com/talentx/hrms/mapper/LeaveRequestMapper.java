package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.leave.LeaveRequestResponseDTO;
import com.talentx.hrms.entity.leave.LeaveRequest;
import org.springframework.stereotype.Component;

@Component
public class LeaveRequestMapper {

    public LeaveRequestResponseDTO toResponseDTO(LeaveRequest leaveRequest) {
        if (leaveRequest == null) {
            return null;
        }

        LeaveRequestResponseDTO response = new LeaveRequestResponseDTO();

        // Basic leave request information
        response.setId(leaveRequest.getId());
        response.setStartDate(leaveRequest.getStartDate());
        response.setEndDate(leaveRequest.getEndDate());
        response.setTotalDays(leaveRequest.getTotalDays());
        response.setIsHalfDay(leaveRequest.getIsHalfDay());
        response.setHalfDayPeriod(leaveRequest.getHalfDayPeriod());
        response.setReason(leaveRequest.getReason());
        response.setStatus(leaveRequest.getStatus());
        response.setContactDetails(leaveRequest.getContactDetails());
        response.setEmergencyContact(leaveRequest.getEmergencyContact());
        response.setIsEmergency(leaveRequest.getIsEmergency());
        response.setAppliedAt(leaveRequest.getAppliedAt());
        response.setAttachmentPath(leaveRequest.getAttachmentPath());
        response.setCancellationReason(leaveRequest.getCancellationReason());
        response.setCancelledAt(
                leaveRequest.getCancelledAt() != null ? leaveRequest.getCancelledAt().toInstant() : null);
        response.setReviewedAt(leaveRequest.getReviewedAt() != null ? leaveRequest.getReviewedAt().toInstant() : null);
        response.setReviewComments(leaveRequest.getReviewComments());

        // Employee information — safe lazy access
        if (leaveRequest.getEmployee() != null) {
            try {
                response.setEmployeeId(leaveRequest.getEmployee().getId());
                response.setEmployeeNumber(leaveRequest.getEmployee().getEmployeeNumber());
                response.setEmployeeName(buildEmployeeName(leaveRequest.getEmployee()));
                response.setEmployeeEmail(leaveRequest.getEmployee().getEmail());
                // Department information from employee
                try {
                    if (leaveRequest.getEmployee().getDepartment() != null) {
                        response.setDepartmentId(leaveRequest.getEmployee().getDepartment().getId());
                        response.setDepartmentName(leaveRequest.getEmployee().getDepartment().getName());
                    }
                } catch (Exception e) { /* lazy dept */ }
            } catch (Exception e) { /* lazy employee proxy */ }
        }

        // Leave type information — safe lazy access
        if (leaveRequest.getLeaveType() != null) {
            try {
                response.setLeaveTypeId(leaveRequest.getLeaveType().getId());
                response.setLeaveTypeName(leaveRequest.getLeaveType().getName());
                response.setLeaveTypeCode(leaveRequest.getLeaveType().getCode());
                response.setLeaveTypeCategory(
                        leaveRequest.getLeaveType().getCategory() != null ? leaveRequest.getLeaveType().getCategory().name() : null);
                response.setLeaveTypeIsPaid(leaveRequest.getLeaveType().getIsPaid());
            } catch (Exception e) { /* lazy leave type */ }
        }

        // Reviewer information — safe lazy access
        if (leaveRequest.getReviewedBy() != null) {
            try {
                response.setReviewedById(leaveRequest.getReviewedBy().getId());
                response.setReviewedByName(buildEmployeeName(leaveRequest.getReviewedBy()));
                response.setReviewedByEmployeeNumber(leaveRequest.getReviewedBy().getEmployeeNumber());
            } catch (Exception e) { /* lazy reviewer */ }
        }

        return response;
    }

    private String buildEmployeeName(com.talentx.hrms.entity.employee.Employee employee) {
        if (employee == null) {
            return null;
        }

        StringBuilder name = new StringBuilder();

        if (employee.getFirstName() != null && !employee.getFirstName().trim().isEmpty()) {
            name.append(employee.getFirstName().trim());
        }

        if (employee.getMiddleName() != null && !employee.getMiddleName().trim().isEmpty()) {
            if (name.length() > 0) {
                name.append(" ");
            }
            name.append(employee.getMiddleName().trim());
        }

        if (employee.getLastName() != null && !employee.getLastName().trim().isEmpty()) {
            if (name.length() > 0) {
                name.append(" ");
            }
            name.append(employee.getLastName().trim());
        }

        return name.toString();
    }
}
