package com.talentx.hrms.common;

import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Utility to resolve the current authenticated user's organization ID.
 * Eliminates hardcoded organizationId = 1L across controllers.
 */
@Component
public class SecurityUtils {

    private final UserRepository userRepository;

    @Autowired
    public SecurityUtils(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Returns the organization ID of the currently authenticated user.
     * Falls back to the provided default if user/org cannot be resolved.
     */
    public Long getCurrentUserOrgId(Long fallback) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
                return fallback;
            }
            String username = auth.getName();
            return userRepository.findByUsername(username)
                    .map(User::getOrganization)
                    .map(org -> org != null ? org.getId() : fallback)
                    .orElse(fallback);
        } catch (Exception e) {
            return fallback;
        }
    }

    /** Convenience — defaults to 1L if org cannot be resolved */
    public Long getCurrentUserOrgId() {
        return getCurrentUserOrgId(1L);
    }

    /**
     * Returns the user ID of the currently authenticated user.
     */
    public Long getCurrentUserId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return null;
            Object principal = auth.getPrincipal();
            if (principal instanceof com.talentx.hrms.service.auth.UserDetailsServiceImpl.CustomUserPrincipal) {
                return ((com.talentx.hrms.service.auth.UserDetailsServiceImpl.CustomUserPrincipal) principal).getUserId();
            }
            String username = auth.getName();
            if (username != null && !username.equals("anonymousUser")) {
                return userRepository.findByUsername(username).map(User::getId).orElse(null);
            }
        } catch (Exception e) {
            // ignore
        }
        return null;
    }
}
