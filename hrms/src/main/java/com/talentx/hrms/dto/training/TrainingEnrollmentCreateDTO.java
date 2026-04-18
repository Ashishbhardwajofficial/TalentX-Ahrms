package com.talentx.hrms.dto.training;

import com.talentx.hrms.entity.training.TrainingEnrollment.EnrollmentStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class TrainingEnrollmentCreateDTO {
    
    @NotNull(message = "Training program ID is required")
    private Long trainingProgramId;
    
    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    
    private LocalDate enrollmentDate;
    
    private LocalDate completionDate;
    
    private EnrollmentStatus status;
    
    private Integer score;
    
    private String feedback;
    
    // Constructors
    public TrainingEnrollmentCreateDTO() {}
    
    // Getters and Setters
    public Long getTrainingProgramId() {
        return trainingProgramId;
    }
    
    public void setTrainingProgramId(Long trainingProgramId) {
        this.trainingProgramId = trainingProgramId;
    }
    
    public Long getEmployeeId() {
        return employeeId;
    }
    
    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
    
    public LocalDate getEnrollmentDate() {
        return enrollmentDate;
    }
    
    public void setEnrollmentDate(LocalDate enrollmentDate) {
        this.enrollmentDate = enrollmentDate;
    }
    
    public LocalDate getCompletionDate() {
        return completionDate;
    }
    
    public void setCompletionDate(LocalDate completionDate) {
        this.completionDate = completionDate;
    }
    
    public EnrollmentStatus getStatus() {
        return status;
    }
    
    public void setStatus(EnrollmentStatus status) {
        this.status = status;
    }
    
    public Integer getScore() {
        return score;
    }
    
    public void setScore(Integer score) {
        this.score = score;
    }
    
    public String getFeedback() {
        return feedback;
    }
    
    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }
}

