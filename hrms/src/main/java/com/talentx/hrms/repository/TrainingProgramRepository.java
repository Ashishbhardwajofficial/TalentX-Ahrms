package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.training.TrainingEnrollment;
import com.talentx.hrms.entity.training.TrainingProgram;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingProgramRepository extends JpaRepository<TrainingProgram, Long> {
    
    // Find by organization
    List<TrainingProgram> findByOrganization(Organization organization);
    Page<TrainingProgram> findByOrganization(Organization organization, Pageable pageable);
    
    // Find active programs by organization (using actual entity field: isActive)
    List<TrainingProgram> findByOrganizationAndIsActiveTrue(Organization organization);
    Page<TrainingProgram> findByOrganizationAndIsActiveTrue(Organization organization, Pageable pageable);
    
    // Find by training type
    List<TrainingProgram> findByOrganizationAndTrainingType(Organization organization, TrainingProgram.TrainingType trainingType);
    Page<TrainingProgram> findByOrganizationAndTrainingType(Organization organization, TrainingProgram.TrainingType trainingType, Pageable pageable);
    
    // Find by delivery method
    List<TrainingProgram> findByOrganizationAndDeliveryMethod(Organization organization, TrainingProgram.DeliveryMethod deliveryMethod);
    
    // Find mandatory programs
    List<TrainingProgram> findByOrganizationAndIsMandatoryTrue(Organization organization);
    Page<TrainingProgram> findByOrganizationAndIsMandatoryTrue(Organization organization, Pageable pageable);
    
    // Find by title containing (case-insensitive)
    @Query("SELECT tp FROM TrainingProgram tp WHERE tp.organization = :organization AND LOWER(tp.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    List<TrainingProgram> findByOrganizationAndTitleContainingIgnoreCase(@Param("organization") Organization organization, @Param("title") String title);
    
    @Query("SELECT tp FROM TrainingProgram tp WHERE tp.organization = :organization AND LOWER(tp.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<TrainingProgram> findByOrganizationAndTitleContainingIgnoreCase(@Param("organization") Organization organization, @Param("title") String title, Pageable pageable);
    
    // Find by provider
    List<TrainingProgram> findByOrganizationAndProvider(Organization organization, String provider);
    
    // Search with comprehensive criteria (using actual entity fields)
    @Query("SELECT tp FROM TrainingProgram tp WHERE tp.organization = :organization AND " +
           "(:title IS NULL OR LOWER(tp.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:trainingType IS NULL OR tp.trainingType = :trainingType) AND " +
           "(:deliveryMethod IS NULL OR tp.deliveryMethod = :deliveryMethod) AND " +
           "(:isMandatory IS NULL OR tp.isMandatory = :isMandatory) AND " +
           "(:provider IS NULL OR LOWER(tp.provider) LIKE LOWER(CONCAT('%', :provider, '%'))) AND " +
           "(:isActive IS NULL OR tp.isActive = :isActive)")
    Page<TrainingProgram> findBySearchCriteria(@Param("organization") Organization organization,
                                              @Param("title") String title,
                                              @Param("trainingType") TrainingProgram.TrainingType trainingType,
                                              @Param("deliveryMethod") TrainingProgram.DeliveryMethod deliveryMethod,
                                              @Param("isMandatory") Boolean isMandatory,
                                              @Param("provider") String provider,
                                              @Param("isActive") Boolean isActive,
                                              Pageable pageable);
    
    // Get distinct training types for organization
    @Query("SELECT DISTINCT tp.trainingType FROM TrainingProgram tp WHERE tp.organization = :organization AND tp.trainingType IS NOT NULL ORDER BY tp.trainingType")
    List<TrainingProgram.TrainingType> findDistinctTrainingTypesByOrganization(@Param("organization") Organization organization);
    
    // Get distinct providers for organization
    @Query("SELECT DISTINCT tp.provider FROM TrainingProgram tp WHERE tp.organization = :organization AND tp.provider IS NOT NULL ORDER BY tp.provider")
    List<String> findDistinctProvidersByOrganization(@Param("organization") Organization organization);
    
    // Count programs by type
    long countByOrganizationAndTrainingType(Organization organization, TrainingProgram.TrainingType trainingType);
    
    // Count active programs
    long countByOrganizationAndIsActiveTrue(Organization organization);
    
    // Count mandatory programs
    long countByOrganizationAndIsMandatoryTrue(Organization organization);
    
    // Check if title exists for organization (case-insensitive)
    boolean existsByOrganizationAndTitleIgnoreCase(Organization organization, String title);
    
    // Methods using organizationId (Long) instead of Organization object
    @Query("SELECT CASE WHEN COUNT(tp) > 0 THEN true ELSE false END FROM TrainingProgram tp WHERE tp.organization.id = :organizationId AND LOWER(tp.title) = LOWER(:title)")
    boolean existsByOrganizationIdAndTitleIgnoreCase(@Param("organizationId") Long organizationId, @Param("title") String title);
    
    @Query("SELECT tp FROM TrainingProgram tp WHERE tp.organization.id = :organizationId AND tp.isActive = true")
    Page<TrainingProgram> findByOrganizationIdAndActiveTrue(@Param("organizationId") Long organizationId, Pageable pageable);
    
    @Query("SELECT tp FROM TrainingProgram tp WHERE tp.organization.id = :organizationId AND tp.trainingType = :trainingType")
    Page<TrainingProgram> findByOrganizationIdAndTrainingType(@Param("organizationId") Long organizationId, 
                                                              @Param("trainingType") TrainingProgram.TrainingType trainingType, 
                                                              Pageable pageable);
    
    @Query("SELECT tp FROM TrainingProgram tp WHERE tp.organization.id = :organizationId AND tp.isMandatory = true")
    Page<TrainingProgram> findByOrganizationIdAndIsMandatoryTrue(@Param("organizationId") Long organizationId, Pageable pageable);
    
    @Query("SELECT tp FROM TrainingProgram tp WHERE tp.organization.id = :organizationId AND tp.isActive = true " +
           "ORDER BY (SELECT COUNT(te) FROM TrainingEnrollment te WHERE te.trainingProgram = tp) DESC")
    List<TrainingProgram> findMostPopularPrograms(@Param("organizationId") Long organizationId, Pageable pageable);
    
    @Query("SELECT COUNT(tp) FROM TrainingProgram tp WHERE tp.organization.id = :organizationId AND tp.isActive = true")
    long countByOrganizationIdAndActiveTrue(@Param("organizationId") Long organizationId);
    
    @Query("SELECT COUNT(tp) FROM TrainingProgram tp WHERE tp.organization.id = :organizationId AND tp.isMandatory = true")
    long countByOrganizationIdAndIsMandatoryTrue(@Param("organizationId") Long organizationId);
}

