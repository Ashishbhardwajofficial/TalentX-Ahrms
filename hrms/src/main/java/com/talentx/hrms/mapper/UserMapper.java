package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.user.UserResponse;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.security.UserRole;
import org.springframework.stereotype.Component;

import java.sql.Timestamp;
import java.util.stream.Collectors;

@Component
public class UserMapper {

    public UserResponse toResponse(User user) {
        if (user == null) {
            return null;
        }

        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhone(user.getPhone());
        response.setEmailVerified(user.getEmailVerified());
        response.setAccountLocked(user.getAccountLocked());
        response.setAccountExpired(user.getAccountExpired());
        response.setCredentialsExpired(user.getCredentialsExpired());
        response.setFailedLoginAttempts(user.getFailedLoginAttempts());
        response.setLastLoginAt(user.getLastLoginAt());
        response.setPasswordChangedAt(user.getPasswordChangedAt());
        response.setMustChangePassword(user.getMustChangePassword());
        response.setActive(user.getActive());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());

        // Organization info
        if (user.getOrganization() != null) {
            response.setOrganizationId(user.getOrganization().getId());
            response.setOrganizationName(user.getOrganization().getName());
        }

        // Roles info
        if (user.getUserRoles() != null && !user.getUserRoles().isEmpty()) {
            response.setRoles(user.getUserRoles().stream()
                .map(this::toRoleInfo)
                .filter(r -> r != null)
                .collect(Collectors.toList()));
        }

        return response;
    }

    private UserResponse.RoleInfo toRoleInfo(UserRole userRole) {
        if (userRole == null || userRole.getRole() == null) {
            return null;
        }
        try {
            return new UserResponse.RoleInfo(
                userRole.getRole().getId(),
                userRole.getRole().getName(),
                userRole.getRole().getDescription(),
                userRole.getActive(),
                userRole.getAssignedAt() != null ? Timestamp.from(userRole.getAssignedAt()) : null
            );
        } catch (Exception e) {
            // Role lazy proxy not initialized — return minimal info
            return null;
        }
    }
}

