package com.talentx.hrms.repository;

import com.talentx.hrms.entity.skills.Skill;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    
    // Find skill by name (case-insensitive)
    Optional<Skill> findByNameIgnoreCase(String name);
    
    // Find skills by category
    List<Skill> findByCategory(String category);
    
    // Find skills by category with pagination
    Page<Skill> findByCategory(String category, Pageable pageable);
    
    // Find skills by name containing (case-insensitive)
    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Skill> findByNameContainingIgnoreCase(@Param("name") String name);
    
    // Find skills by name containing with pagination
    @Query("SELECT s FROM Skill s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Skill> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);
    
    // Find skills by category containing (case-insensitive)
    @Query("SELECT s FROM Skill s WHERE LOWER(s.category) LIKE LOWER(CONCAT('%', :category, '%'))")
    List<Skill> findByCategoryContainingIgnoreCase(@Param("category") String category);
    
    // Search skills with comprehensive criteria
    @Query("SELECT s FROM Skill s WHERE " +
           "(:name IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:category IS NULL OR LOWER(s.category) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
           "(:description IS NULL OR LOWER(s.description) LIKE LOWER(CONCAT('%', :description, '%')))")
    Page<Skill> findBySearchCriteria(@Param("name") String name,
                                    @Param("category") String category,
                                    @Param("description") String description,
                                    Pageable pageable);
    
    // Get all distinct categories
    @Query("SELECT DISTINCT s.category FROM Skill s WHERE s.category IS NOT NULL ORDER BY s.category")
    List<String> findDistinctCategories();
    
    // Count skills by category
    long countByCategory(String category);
    
    // Check if skill name exists (case-insensitive)
    boolean existsByNameIgnoreCase(String name);
    
    // Find active skills only
    List<Skill> findByActiveTrue();
    
    // Find active skills with pagination
    Page<Skill> findByActiveTrue(Pageable pageable);
    
    // Find skills ordered by name
    List<Skill> findAllByOrderByNameAsc();
    
    // Find skills by category ordered by name
    List<Skill> findByCategoryOrderByNameAsc(String category);
    
    // Find most popular skills (skills with most employee associations)
    @Query("SELECT s FROM Skill s " +
           "LEFT JOIN EmployeeSkill es ON s.id = es.skill.id " +
           "GROUP BY s.id " +
           "ORDER BY COUNT(es.id) DESC")
    List<Skill> findMostPopularSkills(Pageable pageable);
    
    // Find skills not assigned to any employee
    @Query("SELECT s FROM Skill s WHERE s.id NOT IN " +
           "(SELECT DISTINCT es.skill.id FROM EmployeeSkill es)")
    List<Skill> findUnusedSkills();
}

