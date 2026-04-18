package com.talentx.hrms.controller.user;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.dto.user.RoleAssignmentRequest;
import com.talentx.hrms.dto.user.UserRequest;
import com.talentx.hrms.dto.user.UserResponse;
import com.talentx.hrms.dto.user.UserUpdateRequest;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.security.UserRole;
import com.talentx.hrms.mapper.UserMapper;
import com.talentx.hrms.service.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/users")
@Tag(name = "User Management", description = "User CRUD operations and role management")
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;

    @Autowired
    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
    }

    /**
     * Get all users with pagination
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get all users", description = "Retrieve all users with pagination and sorting")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @Parameter(description = "Page number (0-based)") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size") @RequestParam(defaultValue = "10") int size,
            @Parameter(description = "Sort field") @RequestParam(required = false) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)") @RequestParam(defaultValue = "asc") String sortDirection,
            @Parameter(description = "Search by name") @RequestParam(required = false) String name) {

        PaginationRequest paginationRequest = new PaginationRequest(page, size, sortBy, sortDirection);

        Page<UserResponse> userResponses;
        if (name != null && !name.trim().isEmpty()) {
            userResponses = userService.searchUsers(name, paginationRequest);
        } else {
            userResponses = userService.getUsers(paginationRequest);
        }

        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", userResponses));
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get user by ID", description = "Retrieve a specific user by their ID")
    public ResponseEntity<ApiResponse<UserResponse>> getUser(@PathVariable Long id) {
        try {
            User user = userService.getUser(id);
            UserResponse response = userMapper.toResponse(user);
            return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Create new user
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Create user", description = "Create a new user account")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest request) {
        try {
            User user = userService.createUser(
                request.getUsername(),
                request.getEmail(),
                request.getPassword(),
                request.getOrganizationId()
            );
            
            // Update additional fields if provided
            if (request.getFirstName() != null || request.getLastName() != null || request.getPhone() != null) {
                user = userService.updateUser(
                    user.getId(),
                    user.getEmail(),
                    request.getFirstName(),
                    request.getLastName(),
                    request.getPhone()
                );
            }
            
            UserResponse response = userMapper.toResponse(user);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("User created successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Update user
     */
    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Update user", description = "Update an existing user account")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id, 
            @Valid @RequestBody UserUpdateRequest request) {
        try {
            User user = userService.updateUser(
                id,
                request.getEmail(),
                request.getFirstName(),
                request.getLastName(),
                request.getPhone()
            );
            
            UserResponse response = userMapper.toResponse(user);
            return ResponseEntity.ok(ApiResponse.success("User updated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Delete user
     */
    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete user", description = "Delete a user account (admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Assign role to user
     */
    @PostMapping("/{id:\\d+}/roles")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Assign role to user", description = "Assign a role to a user")
    public ResponseEntity<ApiResponse<UserResponse>> assignRole(
            @PathVariable Long id,
            @Valid @RequestBody RoleAssignmentRequest request) {
        try {
            userService.assignRole(id, request.getRoleId());
            User user = userService.getUser(id);
            UserResponse response = userMapper.toResponse(user);
            return ResponseEntity.ok(ApiResponse.success("Role assigned successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Remove role from user
     */
    @DeleteMapping("/{id:\\d+}/roles/{roleId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Remove role from user", description = "Remove a role from a user")
    public ResponseEntity<ApiResponse<UserResponse>> removeRole(
            @PathVariable Long id,
            @PathVariable Long roleId) {
        try {
            userService.removeRole(id, roleId);
            User user = userService.getUser(id);
            UserResponse response = userMapper.toResponse(user);
            return ResponseEntity.ok(ApiResponse.success("Role removed successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Activate user
     */
    @RequestMapping(value = "/{id:\\d+}/activate", method = {RequestMethod.POST, RequestMethod.PUT})
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Activate user", description = "Activate a user account")
    public ResponseEntity<ApiResponse<UserResponse>> activateUser(@PathVariable Long id) {
        try {
            User user = userService.activateUser(id);
            UserResponse response = userMapper.toResponse(user);
            return ResponseEntity.ok(ApiResponse.success("User activated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Deactivate user
     */
    @RequestMapping(value = "/{id:\\d+}/deactivate", method = {RequestMethod.POST, RequestMethod.PUT})
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Deactivate user", description = "Deactivate a user account")
    public ResponseEntity<ApiResponse<UserResponse>> deactivateUser(@PathVariable Long id) {
        try {
            User user = userService.deactivateUser(id);
            UserResponse response = userMapper.toResponse(user);
            return ResponseEntity.ok(ApiResponse.success("User deactivated successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Lock user account
     */
    @PostMapping("/{id:\\d+}/lock")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Lock user account", description = "Lock a user account")
    public ResponseEntity<ApiResponse<UserResponse>> lockUser(@PathVariable Long id) {
        try {
            User user = userService.lockUser(id);
            UserResponse response = userMapper.toResponse(user);
            return ResponseEntity.ok(ApiResponse.success("User account locked successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Unlock user account
     */
    @PostMapping("/{id:\\d+}/unlock")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Unlock user account", description = "Unlock a user account")
    public ResponseEntity<ApiResponse<UserResponse>> unlockUser(@PathVariable Long id) {
        try {
            User user = userService.unlockUser(id);
            UserResponse response = userMapper.toResponse(user);
            return ResponseEntity.ok(ApiResponse.success("User account unlocked successfully", response));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * Get active users
     */
    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get active users", description = "Retrieve all active users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getActiveUsers() {
        List<User> users = userService.getActiveUsers();
        List<UserResponse> responses = users.stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Active users retrieved successfully", responses));
    }

    /**
     * Get users by role
     */
    @GetMapping("/role/{roleName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get users by role", description = "Retrieve users with a specific role")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getUsersByRole(@PathVariable String roleName) {
        List<User> users = userService.getUsersByRole(roleName);
        List<UserResponse> responses = users.stream()
            .map(userMapper::toResponse)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", responses));
    }

    /**
     * Get user statistics
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @Operation(summary = "Get user statistics", description = "Get comprehensive user statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStatistics() {
        UserService.UserStatistics stats = userService.getUserStatistics();
        
        Map<String, Object> statisticsMap = Map.of(
            "totalUsers", stats.getTotalUsers(),
            "activeUsers", stats.getActiveUsers(),
            "lockedUsers", stats.getLockedUsers(),
            "expiredUsers", stats.getExpiredUsers()
        );
        
        return ResponseEntity.ok(ApiResponse.success("User statistics retrieved successfully", statisticsMap));
    }
}

