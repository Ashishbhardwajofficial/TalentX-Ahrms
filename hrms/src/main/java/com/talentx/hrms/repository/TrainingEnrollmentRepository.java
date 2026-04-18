package com.talentx.hrms.repository;

import com.talentx.hrms.entity.training.TrainingEnrollment;
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
public interface TrainingEnrollmentRepository extends JpaRepository<TrainingEnrollment, Long> {
    
    // Find by employee
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.employee.id = :employeeId")
    List<TrainingEnrollment> findByEmployeeId(@Param("employeeId") Long employeeId);
    
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.employee.id = :employeeId")
    Page<TrainingEnrollment> findByEmployeeId(@Param("employeeId") Long employeeId, Pageable pageable);
    
    // Find by training program
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.trainingProgram.id = :trainingProgramId")
    List<TrainingEnrollment> findByTrainingProgramId(@Param("trainingProgramId") Long trainingProgramId);
    
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.trainingProgram.id = :trainingProgramId")
    Page<TrainingEnrollment> findByTrainingProgramId(@Param("trainingProgramId") Long trainingProgramId, Pageable pageable);
    
    // Find by employee and program (should be unique)
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.employee.id = :employeeId AND te.trainingProgram.id = :trainingProgramId")
    Optional<TrainingEnrollment> findByEmployeeIdAndTrainingProgramId(@Param("employeeId") Long employeeId, @Param("trainingProgramId") Long trainingProgramId);
    
    // Find by status
    List<TrainingEnrollment> findByStatus(TrainingEnrollment.EnrollmentStatus status);
    Page<TrainingEnrollment> findByStatus(TrainingEnrollment.EnrollmentStatus status, Pageable pageable);
    
    // Find by employee and status
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.employee.id = :employeeId AND te.status = :status")
    List<TrainingEnrollment> findByEmployeeIdAndStatus(@Param("employeeId") Long employeeId, @Param("status") TrainingEnrollment.EnrollmentStatus status);
    
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.employee.id = :employeeId AND te.status = :status")
    Page<TrainingEnrollment> findByEmployeeIdAndStatus(@Param("employeeId") Long employeeId, @Param("status") TrainingEnrollment.EnrollmentStatus status, Pageable pageable);
    
    // Find by training program and status
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.trainingProgram.id = :trainingProgramId AND te.status = :status")
    List<TrainingEnrollment> findByTrainingProgramIdAndStatus(@Param("trainingProgramId") Long trainingProgramId, @Param("status") TrainingEnrollment.EnrollmentStatus status);
    
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.trainingProgram.id = :trainingProgramId AND te.status = :status")
    Page<TrainingEnrollment> findByTrainingProgramIdAndStatus(@Param("trainingProgramId") Long trainingProgramId, @Param("status") TrainingEnrollment.EnrollmentStatus status, Pageable pageable);
    
    // Find overdue enrollments
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.dueDate < :currentDate AND te.status NOT IN ('COMPLETED', 'CANCELLED', 'EXPIRED')")
    List<TrainingEnrollment> findOverdueEnrollments(@Param("currentDate") LocalDate currentDate);
    
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.dueDate < :currentDate AND te.status NOT IN ('COMPLETED', 'CANCELLED', 'EXPIRED')")
    Page<TrainingEnrollment> findOverdueEnrollments(@Param("currentDate") LocalDate currentDate, Pageable pageable);
    
    // Find enrollments due soon
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.dueDate BETWEEN :startDate AND :endDate AND te.status NOT IN ('COMPLETED', 'CANCELLED', 'EXPIRED')")
    List<TrainingEnrollment> findEnrollmentsDueSoon(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Find completed enrollments
    List<TrainingEnrollment> findByStatusAndCompletionDateIsNotNull(TrainingEnrollment.EnrollmentStatus status);
    
    // Find enrollments by date range
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.enrolledDate BETWEEN :startDate AND :endDate")
    List<TrainingEnrollment> findByEnrolledDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.enrolledDate BETWEEN :startDate AND :endDate")
    Page<TrainingEnrollment> findByEnrolledDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate, Pageable pageable);
    
    // Find enrollments by completion date range
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.completionDate BETWEEN :startDate AND :endDate")
    List<TrainingEnrollment> findByCompletionDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    // Search with comprehensive criteria
    @Query("SELECT te FROM TrainingEnrollment te WHERE " +
           "(:employeeId IS NULL OR te.employee.id = :employeeId) AND " +
           "(:trainingProgramId IS NULL OR te.trainingProgram.id = :trainingProgramId) AND " +
           "(:status IS NULL OR te.status = :status) AND " +
           "(:startDate IS NULL OR te.enrolledDate >= :startDate) AND " +
           "(:endDate IS NULL OR te.enrolledDate <= :endDate) AND " +
           "(:assignedById IS NULL OR te.assignedBy.id = :assignedById)")
    Page<TrainingEnrollment> findBySearchCriteria(@Param("employeeId") Long employeeId,
                                                 @Param("trainingProgramId") Long trainingProgramId,
                                                 @Param("status") TrainingEnrollment.EnrollmentStatus status,
                                                 @Param("startDate") LocalDate startDate,
                                                 @Param("endDate") LocalDate endDate,
                                                 @Param("assignedById") Long assignedById,
                                                 Pageable pageable);
    
    // Count enrollments by status
    long countByStatus(TrainingEnrollment.EnrollmentStatus status);
    
    // Count enrollments by employee
    @Query("SELECT COUNT(te) FROM TrainingEnrollment te WHERE te.employee.id = :employeeId")
    long countByEmployeeId(@Param("employeeId") Long employeeId);
    
    // Count enrollments by training program
    @Query("SELECT COUNT(te) FROM TrainingEnrollment te WHERE te.trainingProgram.id = :trainingProgramId")
    long countByTrainingProgramId(@Param("trainingProgramId") Long trainingProgramId);
    
    // Count completed enrollments by employee
    @Query("SELECT COUNT(te) FROM TrainingEnrollment te WHERE te.employee.id = :employeeId AND te.status = :status")
    long countByEmployeeIdAndStatus(@Param("employeeId") Long employeeId, @Param("status") TrainingEnrollment.EnrollmentStatus status);
    
    // Check if employee is already enrolled in program
    @Query("SELECT CASE WHEN COUNT(te) > 0 THEN true ELSE false END FROM TrainingEnrollment te WHERE te.employee.id = :employeeId AND te.trainingProgram.id = :trainingProgramId")
    boolean existsByEmployeeIdAndTrainingProgramId(@Param("employeeId") Long employeeId, @Param("trainingProgramId") Long trainingProgramId);
    
    // Find enrollments with certificates
    List<TrainingEnrollment> findByStatusAndCertificateUrlIsNotNull(TrainingEnrollment.EnrollmentStatus status);
    
    // Find enrollments by assigned by
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.assignedBy.id = :assignedById")
    List<TrainingEnrollment> findByAssignedById(@Param("assignedById") Long assignedById);
    
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.assignedBy.id = :assignedById")
    Page<TrainingEnrollment> findByAssignedById(@Param("assignedById") Long assignedById, Pageable pageable);
    
    // Get enrollment statistics by program
    @Query("SELECT te.trainingProgram.id, te.status, COUNT(te) FROM TrainingEnrollment te " +
           "WHERE te.trainingProgram.id = :trainingProgramId " +
           "GROUP BY te.trainingProgram.id, te.status")
    List<Object[]> getEnrollmentStatisticsByProgram(@Param("trainingProgramId") Long trainingProgramId);
    
    // Get enrollment statistics by employee
    @Query("SELECT te.status, COUNT(te) FROM TrainingEnrollment te " +
           "WHERE te.employee.id = :employeeId " +
           "GROUP BY te.status")
    List<Object[]> getEnrollmentStatisticsByEmployee(@Param("employeeId") Long employeeId);
    
    // Find enrollments with scores
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.score IS NOT NULL AND te.passingScore IS NOT NULL")
    List<TrainingEnrollment> findEnrollmentsWithScores();
    
    // Find failed enrollments (score below passing score)
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.score IS NOT NULL AND te.passingScore IS NOT NULL AND te.score < te.passingScore")
    List<TrainingEnrollment> findFailedEnrollments();
    
    // Find passed enrollments (score at or above passing score)
    @Query("SELECT te FROM TrainingEnrollment te WHERE te.score IS NOT NULL AND te.passingScore IS NOT NULL AND te.score >= te.passingScore")
    List<TrainingEnrollment> findPassedEnrollments();
    
    // Get average score by training program
    @Query("SELECT AVG(te.score) FROM TrainingEnrollment te WHERE te.trainingProgram.id = :trainingProgramId AND te.score IS NOT NULL")
    Double getAverageScoreByProgram(@Param("trainingProgramId") Long trainingProgramId);
    
    // Get completion rate by training program
    @Query("SELECT " +
           "COUNT(CASE WHEN te.status = 'COMPLETED' THEN 1 END) * 100.0 / COUNT(te) " +
           "FROM TrainingEnrollment te WHERE te.trainingProgram.id = :trainingProgramId")
    Double getCompletionRateByProgram(@Param("trainingProgramId") Long trainingProgramId);
}
