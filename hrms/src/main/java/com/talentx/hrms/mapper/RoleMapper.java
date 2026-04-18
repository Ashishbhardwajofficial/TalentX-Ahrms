package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.role.RoleResponse;
import com.talentx.hrms.entity.security.Role;
import com.talentx.hrms.entity.security.RolePermission;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class RoleMapper {

    public RoleResponse toResponse(Role role) {
        if (role == null) {
            return null;
        }

        RoleResponse response = new RoleResponse();
        response.setId(role.getId());
        response.setName(role.getName());
        response.setCode(role.getCode());
        response.setDescription(role.getDescription());
        response.setIsSystemRole(role.getIsSystemRole());
        response.setCreatedAt(role.getCreatedAt() != null ? role.getCreatedAt().toInstant() : null);
        response.setUpdatedAt(role.getUpdatedAt() != null ? role.getUpdatedAt().toInstant() : null);

        // Organization info
        if (role.getOrganization() != null) {
            response.setOrganizationId(role.getOrganization().getId());
            response.setOrganizationName(role.getOrganization().getName());
        }

        // Permissions info
        if (role.getRolePermissions() != null && !role.getRolePermissions().isEmpty()) {
            response.setPermissions(role.getRolePermissions().stream()
                .filter(rp -> Boolean.TRUE.equals(rp.isActive()))
                .map(this::toPermissionSummary)
                .collect(Collectors.toList()));
        }

        // User count — count safely without triggering Employee lazy load
        if (role.getUserRoles() != null) {
            try {
                response.setUserCount((int) role.getUserRoles().stream()
                    .filter(ur -> {
                        try { return Boolean.TRUE.equals(ur.isActive()); }
                        catch (Exception e) { return false; }
                    })
                    .count());
            } catch (Exception e) {
                response.setUserCount(0);
            }
        }

        return response;
    }

    private RoleResponse.PermissionSummary toPermissionSummary(RolePermission rolePermission) {
        if (rolePermission == null || rolePermission.getPermission() == null) {
            return null;
        }

        return new RoleResponse.PermissionSummary(
            rolePermission.getPermission().getId(),
            rolePermission.getPermission().getName(),
            rolePermission.getPermission().getDescription(),
            rolePermission.getPermission().getCategory(),  // actual DB column
            rolePermission.getPermission().getCode()       // actual DB column
        );
    }
}

