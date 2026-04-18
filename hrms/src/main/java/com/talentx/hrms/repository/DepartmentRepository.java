package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Department;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    
    // Find by name and organization
    Optional<Department> findByNameAndOrganization(String name, Organization organization);
    
    // Find by code and organization
    Optional<Department> findByCodeAndOrganization(String code, Organization organization);
    
    // Find all departments by organization
    List<Department> findByOrganization(Organization organization);
    
    // Find all departments by organization with pagination
    Page<Department> findByOrganization(Organization organization, Pageable pageable);
    
    // Find root departments (no parent) by organization
    List<Department> findByOrganizationAndParentDepartmentIsNull(Organization organization);
    
    // Find sub-departments by parent department
    List<Department> findByParentDepartment(Department parentDepartment);
    
    // Find departments by manager
    List<Department> findByManager(User manager);
    
    // Search departments by name within organization
    @Query("SELECT d FROM Department d WHERE d.organization = :organization AND " +
           "LOWER(d.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Department> findByOrganizationAndNameContainingIgnoreCase(@Param("organization") Organization organization, 
                                                                  @Param("name") String name, 
                                                                  Pageable pageable);
    
    // Find departments by cost center
    List<Department> findByOrganizationAndCostCenter(Organization organization, String costCenter);
    
    // Get department hierarchy (department with all sub-departments)
    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.subDepartments WHERE d.id = :id")
    Optional<Department> findByIdWithSubDepartments(@Param("id") Long id);
    
    // Count departments by organization
    long countByOrganization(Organization organization);
    
    // Count sub-departments by parent
    long countByParentDepartment(Department parentDepartment);
    
    // Find departments with employees count
    @Query("SELECT d, COUNT(e) FROM Department d LEFT JOIN Employee e ON e.department = d " +
           "WHERE d.organization = :organization GROUP BY d")
    List<Object[]> findDepartmentsWithEmployeeCount(@Param("organization") Organization organization);
    
    // Check if department code exists in organization
    boolean existsByCodeAndOrganization(String code, Organization organization);
}

