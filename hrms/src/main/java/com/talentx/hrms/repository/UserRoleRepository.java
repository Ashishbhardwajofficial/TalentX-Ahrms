package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.security.Role;
import com.talentx.hrms.entity.security.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, Long> {
    
    List<UserRole> findByUser(User user);
    
    List<UserRole> findByRole(Role role);
    
    Optional<UserRole> findByUserAndRole(User user, Role role);
    
    boolean existsByUserAndRole(User user, Role role);
    
    void deleteByUserAndRole(User user, Role role);
}
