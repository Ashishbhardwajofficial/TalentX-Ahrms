package com.talentx.hrms.dto.skill;

import jakarta.validation.constraints.NotBlank;

public class SkillCreateDTO {
    
    @NotBlank(message = "Skill name is required")
    private String name;
    
    private String category;
    
    private String description;
    
    // Constructors
    public SkillCreateDTO() {}
    
    public SkillCreateDTO(String name, String category, String description) {
        this.name = name;
        this.category = category;
        this.description = description;
    }
    
    // Getters and Setters
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public String getCategory() {
        return category;
    }
    
    public void setCategory(String category) {
        this.category = category;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}

