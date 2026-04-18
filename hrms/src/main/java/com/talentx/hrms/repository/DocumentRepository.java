package com.talentx.hrms.repository;

import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.document.Document;
import com.talentx.hrms.entity.employee.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    
    // Find documents by organization
    List<Document> findByOrganization(Organization organization);
    
    // Find documents by organization with pagination
    Page<Document> findByOrganization(Organization organization, Pageable pageable);
    
    // Find documents by employee
    List<Document> findByEmployee(Employee employee);
    
    // Find documents by employee with pagination
    Page<Document> findByEmployee(Employee employee, Pageable pageable);
    
    // Find documents by organization and employee
    List<Document> findByOrganizationAndEmployee(Organization organization, Employee employee);
    
    // Find documents by document type
    List<Document> findByOrganizationAndDocumentType(Organization organization, Document.DocumentType documentType);
    
    // Find documents by document type with pagination
    Page<Document> findByOrganizationAndDocumentType(Organization organization, Document.DocumentType documentType, Pageable pageable);
    
    // Find public documents
    List<Document> findByOrganizationAndIsPublicTrue(Organization organization);
    
    // Find confidential documents
    List<Document> findByOrganizationAndIsConfidentialTrue(Organization organization);
    
    // Find documents requiring signature
    List<Document> findByOrganizationAndRequiresSignatureTrue(Organization organization);
    
    // Find signed documents
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND d.signedAt IS NOT NULL")
    List<Document> findSignedDocuments(@Param("organization") Organization organization);
    
    // Find unsigned documents that require signature
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND d.requiresSignature = true AND d.signedAt IS NULL")
    List<Document> findUnsignedDocuments(@Param("organization") Organization organization);
    
    // Find documents expiring soon
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND d.expiryDate IS NOT NULL AND d.expiryDate BETWEEN CURRENT_DATE AND :endDate")
    List<Document> findDocumentsExpiringSoon(@Param("organization") Organization organization, @Param("endDate") LocalDate endDate);
    
    // Find expired documents
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND d.expiryDate IS NOT NULL AND d.expiryDate < CURRENT_DATE")
    List<Document> findExpiredDocuments(@Param("organization") Organization organization);
    
    // Find documents by expiry date range
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND d.expiryDate BETWEEN :startDate AND :endDate")
    List<Document> findByOrganizationAndExpiryDateBetween(@Param("organization") Organization organization, 
                                                         @Param("startDate") LocalDate startDate, 
                                                         @Param("endDate") LocalDate endDate);
    
    // Find documents by issue date range
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND d.issueDate BETWEEN :startDate AND :endDate")
    List<Document> findByOrganizationAndIssueDateBetween(@Param("organization") Organization organization, 
                                                        @Param("startDate") LocalDate startDate, 
                                                        @Param("endDate") LocalDate endDate);
    
    // Search documents by title
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND LOWER(d.title) LIKE LOWER(CONCAT('%', :title, '%'))")
    Page<Document> findByOrganizationAndTitleContainingIgnoreCase(@Param("organization") Organization organization, 
                                                                 @Param("title") String title, 
                                                                 Pageable pageable);
    
    // Search documents by description
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND LOWER(d.description) LIKE LOWER(CONCAT('%', :description, '%'))")
    Page<Document> findByOrganizationAndDescriptionContainingIgnoreCase(@Param("organization") Organization organization, 
                                                                        @Param("description") String description, 
                                                                        Pageable pageable);
    
    // Search documents by file name
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND LOWER(d.fileName) LIKE LOWER(CONCAT('%', :fileName, '%'))")
    Page<Document> findByOrganizationAndFileNameContainingIgnoreCase(@Param("organization") Organization organization, 
                                                                    @Param("fileName") String fileName, 
                                                                    Pageable pageable);
    
    // Comprehensive document search
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND " +
           "(:title IS NULL OR LOWER(d.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:description IS NULL OR LOWER(d.description) LIKE LOWER(CONCAT('%', :description, '%'))) AND " +
           "(:fileName IS NULL OR LOWER(d.fileName) LIKE LOWER(CONCAT('%', :fileName, '%'))) AND " +
           "(:documentType IS NULL OR d.documentType = :documentType) AND " +
           "(:employee IS NULL OR d.employee = :employee) AND " +
           "(:isConfidential IS NULL OR d.isConfidential = :isConfidential) AND " +
           "(:isPublic IS NULL OR d.isPublic = :isPublic) AND " +
           "(:requiresSignature IS NULL OR d.requiresSignature = :requiresSignature) AND " +
           "(:isSigned IS NULL OR (:isSigned = true AND d.signedAt IS NOT NULL) OR (:isSigned = false AND d.signedAt IS NULL))")
    Page<Document> findBySearchCriteria(@Param("organization") Organization organization,
                                       @Param("title") String title,
                                       @Param("description") String description,
                                       @Param("fileName") String fileName,
                                       @Param("documentType") Document.DocumentType documentType,
                                       @Param("employee") Employee employee,
                                       @Param("isConfidential") Boolean isConfidential,
                                       @Param("isPublic") Boolean isPublic,
                                       @Param("requiresSignature") Boolean requiresSignature,
                                       @Param("isSigned") Boolean isSigned,
                                       Pageable pageable);
    
    // Find documents by version
    List<Document> findByOrganizationAndVersion(Organization organization, Integer version);
    
    // Find latest version of documents with same title and employee
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND d.employee = :employee AND d.title = :title ORDER BY d.version DESC")
    List<Document> findLatestVersionByEmployeeAndTitle(@Param("organization") Organization organization, 
                                                      @Param("employee") Employee employee, 
                                                      @Param("title") String title);
    
    // Find all versions of a document by title and employee
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND d.employee = :employee AND d.title = :title ORDER BY d.version ASC")
    List<Document> findAllVersionsByEmployeeAndTitle(@Param("organization") Organization organization, 
                                                    @Param("employee") Employee employee, 
                                                    @Param("title") String title);
    
    // Find documents uploaded by user
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND d.uploadedBy.id = :userId")
    List<Document> findByOrganizationAndUploadedBy(@Param("organization") Organization organization, 
                                                  @Param("userId") Long userId);
    
    // Find documents signed by user
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND d.signedBy.id = :userId")
    List<Document> findByOrganizationAndSignedBy(@Param("organization") Organization organization, 
                                                @Param("userId") Long userId);
    
    // Count documents by organization
    long countByOrganization(Organization organization);
    
    // Count documents by employee
    long countByEmployee(Employee employee);
    
    // Count documents by type
    long countByOrganizationAndDocumentType(Organization organization, Document.DocumentType documentType);
    
    // Count confidential documents
    long countByOrganizationAndIsConfidentialTrue(Organization organization);
    
    // Count public documents
    long countByOrganizationAndIsPublicTrue(Organization organization);
    
    // Count documents requiring signature
    long countByOrganizationAndRequiresSignatureTrue(Organization organization);
    
    // Count signed documents
    @Query("SELECT COUNT(d) FROM Document d WHERE d.organization = :organization AND d.signedAt IS NOT NULL")
    long countSignedDocuments(@Param("organization") Organization organization);
    
    // Count unsigned documents
    @Query("SELECT COUNT(d) FROM Document d WHERE d.organization = :organization AND d.requiresSignature = true AND d.signedAt IS NULL")
    long countUnsignedDocuments(@Param("organization") Organization organization);
    
    // Count expired documents
    @Query("SELECT COUNT(d) FROM Document d WHERE d.organization = :organization AND d.expiryDate IS NOT NULL AND d.expiryDate < CURRENT_DATE")
    long countExpiredDocuments(@Param("organization") Organization organization);
    
    // Count documents expiring soon
    @Query("SELECT COUNT(d) FROM Document d WHERE d.organization = :organization AND d.expiryDate IS NOT NULL AND d.expiryDate BETWEEN CURRENT_DATE AND :endDate")
    long countDocumentsExpiringSoon(@Param("organization") Organization organization, @Param("endDate") LocalDate endDate);
    
    // Check if document exists by title and employee
    boolean existsByOrganizationAndEmployeeAndTitle(Organization organization, Employee employee, String title);
    
    // Check if document exists by file name and organization
    boolean existsByOrganizationAndFileName(Organization organization, String fileName);
    
    // Find document with full details
    @Query("SELECT DISTINCT d FROM Document d " +
           "LEFT JOIN FETCH d.employee " +
           "LEFT JOIN FETCH d.uploadedBy " +
           "LEFT JOIN FETCH d.signedBy " +
           "WHERE d.id = :id")
    Optional<Document> findByIdWithFullDetails(@Param("id") Long id);
    
    // Find documents accessible to user (public or employee-specific)
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND " +
           "(d.isPublic = true OR d.employee.id = :employeeId OR d.uploadedBy.id = :userId)")
    Page<Document> findAccessibleDocuments(@Param("organization") Organization organization, 
                                          @Param("employeeId") Long employeeId, 
                                          @Param("userId") Long userId, 
                                          Pageable pageable);
    
    // Find documents by file type
    List<Document> findByOrganizationAndFileType(Organization organization, String fileType);
    
    // Find documents by size range
    @Query("SELECT d FROM Document d WHERE d.organization = :organization AND d.fileSize BETWEEN :minSize AND :maxSize")
    List<Document> findByOrganizationAndFileSizeBetween(@Param("organization") Organization organization, 
                                                       @Param("minSize") Long minSize, 
                                                       @Param("maxSize") Long maxSize);
}

