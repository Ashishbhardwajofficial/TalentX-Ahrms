package com.talentx.hrms.service.auth;

import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.security.Permission;
import com.talentx.hrms.entity.security.Role;
import com.talentx.hrms.entity.security.RolePermission;
import com.talentx.hrms.entity.security.UserRole;
import com.talentx.hrms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        return new CustomUserPrincipal(user, getAuthorities(user));
    }

    private Collection<? extends GrantedAuthority> getAuthorities(User user) {
        Set<GrantedAuthority> authorities = new HashSet<>();
        
        // Load user roles and permissions
        for (UserRole userRole : user.getUserRoles()) {
            Role role = userRole.getRole();
            
            // Add role as authority (with ROLE_ prefix for Spring Security)
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()));
            
            // Add permissions from this role
            for (RolePermission rolePermission : role.getRolePermissions()) {
                Permission permission = rolePermission.getPermission();
                authorities.add(new SimpleGrantedAuthority(permission.getName().toUpperCase()));
            }
        }
        
        return authorities;
    }

    public static class CustomUserPrincipal implements UserDetails {
        private final User user;
        private final Collection<? extends GrantedAuthority> authorities;

        public CustomUserPrincipal(User user, Collection<? extends GrantedAuthority> authorities) {
            this.user = user;
            this.authorities = authorities;
        }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() {
            return authorities;
        }

        @Override
        public String getPassword() {
            return user.getPasswordHash();
        }

        @Override
        public String getUsername() {
            return user.getUsername();
        }

        @Override
        public boolean isAccountNonExpired() {
            return user.isAccountNonExpired();
        }

        @Override
        public boolean isAccountNonLocked() {
            return user.isAccountNonLocked();
        }

        @Override
        public boolean isCredentialsNonExpired() {
            return user.isCredentialsNonExpired();
        }

        @Override
        public boolean isEnabled() {
            return user.isEnabled();
        }

        // Additional methods to access the underlying User entity
        public User getUser() {
            return user;
        }

        public Long getUserId() {
            return user.getId();
        }

        public String getEmail() {
            return user.getEmail();
        }

        public String getFullName() {
            return user.getFullName();
        }

        public Long getOrganizationId() {
            return user.getOrganization() != null ? user.getOrganization().getId() : null;
        }
    }
}

