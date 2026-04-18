package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.recruitment.Candidate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<Candidate, Long> {
    
    // Find candidate by email
    Optional<Candidate> findByEmail(String email);
    
    // Check if candidate exists by email
    boolean existsByEmail(String email);
    
    // Find candidates by organization
    List<Candidate> findByOrganization(Organization organization);
    
    // Find candidates by organization with pagination
    Page<Candidate> findByOrganization(Organization organization, Pageable pageable);
    
    // Find candidates by name (first or last name)
    @Query("SELECT c FROM Candidate c WHERE " +
           "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Candidate> findByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);
    
    // Find candidates by current title (actual entity field)
    @Query("SELECT c FROM Candidate c WHERE LOWER(c.currentTitle) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<Candidate> findByCurrentTitleContaining(@Param("title") String title);
    
    // Find candidates by experience range (actual entity field: yearsOfExperience)
    @Query("SELECT c FROM Candidate c WHERE c.yearsOfExperience BETWEEN :minExperience AND :maxExperience")
    List<Candidate> findByExperienceRange(@Param("minExperience") Integer minExperience, 
                                         @Param("maxExperience") Integer maxExperience);
    
    // Find candidates by expected salary range
    @Query("SELECT c FROM Candidate c WHERE c.expectedSalary BETWEEN :minSalary AND :maxSalary")
    List<Candidate> findByExpectedSalaryRange(@Param("minSalary") BigDecimal minSalary, 
                                             @Param("maxSalary") BigDecimal maxSalary);
    
    // Find candidates by source (actual entity field)
    List<Candidate> findBySource(Candidate.CandidateSource source);
    
    // Find candidates with applications
    @Query("SELECT DISTINCT c FROM Candidate c LEFT JOIN FETCH c.applications WHERE c.id = :id")
    Optional<Candidate> findByIdWithApplications(@Param("id") Long id);
    
    // Search candidates with comprehensive criteria (using actual entity fields)
    @Query("SELECT c FROM Candidate c WHERE " +
           "(:name IS NULL OR LOWER(c.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:email IS NULL OR LOWER(c.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:currentTitle IS NULL OR LOWER(c.currentTitle) LIKE LOWER(CONCAT('%', :currentTitle, '%'))) AND " +
           "(:minExperience IS NULL OR c.yearsOfExperience >= :minExperience) AND " +
           "(:maxExperience IS NULL OR c.yearsOfExperience <= :maxExperience) AND " +
           "(:source IS NULL OR c.source = :source)")
    Page<Candidate> findBySearchCriteria(@Param("name") String name,
                                        @Param("email") String email,
                                        @Param("currentTitle") String currentTitle,
                                        @Param("minExperience") Integer minExperience,
                                        @Param("maxExperience") Integer maxExperience,
                                        @Param("source") Candidate.CandidateSource source,
                                        Pageable pageable);
    
    // Count candidates by source
    @Query("SELECT c.source, COUNT(c) FROM Candidate c GROUP BY c.source")
    List<Object[]> countCandidatesBySource();
    
    // Count candidates by experience range (using actual entity field)
    @Query("SELECT " +
           "CASE " +
           "WHEN c.yearsOfExperience < 2 THEN 'Entry Level' " +
           "WHEN c.yearsOfExperience < 5 THEN 'Junior' " +
           "WHEN c.yearsOfExperience < 10 THEN 'Mid Level' " +
           "ELSE 'Senior' " +
           "END as experienceLevel, COUNT(c) " +
           "FROM Candidate c " +
           "WHERE c.yearsOfExperience IS NOT NULL " +
           "GROUP BY " +
           "CASE " +
           "WHEN c.yearsOfExperience < 2 THEN 'Entry Level' " +
           "WHEN c.yearsOfExperience < 5 THEN 'Junior' " +
           "WHEN c.yearsOfExperience < 10 THEN 'Mid Level' " +
           "ELSE 'Senior' " +
           "END")
    List<Object[]> countCandidatesByExperienceLevel();
}

