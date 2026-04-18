package com.talentx.hrms.mapper;

import com.talentx.hrms.dto.permission.PermissionResponse;
import com.talentx.hrms.entity.security.Permission;
import org.springframework.stereotype.Component;

@Component
public class PermissionMapper {

    public PermissionResponse toResponse(Permission permission) {
        if (permission == null) {
            return null;
        }

        PermissionResponse response = new PermissionResponse();
        response.setId(permission.getId());
        response.setName(permission.getName());
        response.setCode(permission.getCode());
        response.setDescription(permission.getDescription());
        // Map category (DB column) to resource field for frontend compatibility
        response.setResource(permission.getCategory());
        response.setAction(permission.getAction());
        response.setIsSystemPermission(permission.getIsSystemPermission());
        response.setCreatedAt(permission.getCreatedAt() != null ? permission.getCreatedAt().toInstant() : null);
        response.setUpdatedAt(permission.getUpdatedAt() != null ? permission.getUpdatedAt().toInstant() : null);

        return response;
    }
}

