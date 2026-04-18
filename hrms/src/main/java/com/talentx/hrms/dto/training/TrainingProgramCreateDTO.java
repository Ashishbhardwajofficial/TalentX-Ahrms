package com.talentx.hrms.dto.training;

import com.talentx.hrms.entity.training.TrainingProgram.DeliveryMethod;
import com.talentx.hrms.entity.training.TrainingProgram.TrainingType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class TrainingProgramCreateDTO {
    
    @NotNull(message = "Organization ID is required")
    private Long organizationId;
    
    @NotBlank(message = "Title is required")
    private String title;
    
    private String description;
    
    private TrainingType trainingType;
    
    private DeliveryMethod deliveryMethod;
    
    private BigDecimal durationHours;
    
    private BigDecimal costPerParticipant;
    
    private Integer maxParticipants;
    
    private String provider;
    
    private String externalUrl;
    
    private Boolean isMandatory = false;
    
    // Constructors
    public TrainingProgramCreateDTO() {}
    
    // Getters and Setters
    public Long getOrganizationId() {
        return organizationId;
    }
    
    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public TrainingType getTrainingType() {
        return trainingType;
    }
    
    public void setTrainingType(TrainingType trainingType) {
        this.trainingType = trainingType;
    }
    
    public DeliveryMethod getDeliveryMethod() {
        return deliveryMethod;
    }
    
    public void setDeliveryMethod(DeliveryMethod deliveryMethod) {
        this.deliveryMethod = deliveryMethod;
    }
    
    public BigDecimal getDurationHours() {
        return durationHours;
    }
    
    public void setDurationHours(BigDecimal durationHours) {
        this.durationHours = durationHours;
    }
    
    public BigDecimal getCostPerParticipant() {
        return costPerParticipant;
    }
    
    public void setCostPerParticipant(BigDecimal costPerParticipant) {
        this.costPerParticipant = costPerParticipant;
    }
    
    public Integer getMaxParticipants() {
        return maxParticipants;
    }
    
    public void setMaxParticipants(Integer maxParticipants) {
        this.maxParticipants = maxParticipants;
    }
    
    public String getProvider() {
        return provider;
    }
    
    public void setProvider(String provider) {
        this.provider = provider;
    }
    
    public String getExternalUrl() {
        return externalUrl;
    }
    
    public void setExternalUrl(String externalUrl) {
        this.externalUrl = externalUrl;
    }
    
    public Boolean getIsMandatory() {
        return isMandatory;
    }
    
    public void setIsMandatory(Boolean isMandatory) {
        this.isMandatory = isMandatory;
    }
}

