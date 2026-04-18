package com.talentx.hrms.repository;

import com.talentx.hrms.entity.security.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {
    
    // Find by name
    Optional<Permission> findByName(String name);
    
    // Find by code
    Optional<Permission> findByCode(String code);
    
    // Find permissions by category
    List<Permission> findByCategory(String category);
    
    // Get all distinct categories
    @Query("SELECT DISTINCT p.category FROM Permission p WHERE p.category IS NOT NULL ORDER BY p.category")
    List<String> findAllCategories();
    
    // Check if permission name exists
    boolean existsByName(String name);
    
    // Check if permission code exists
    boolean existsByCode(String code);
    
    // Count permissions
    long count();
}

