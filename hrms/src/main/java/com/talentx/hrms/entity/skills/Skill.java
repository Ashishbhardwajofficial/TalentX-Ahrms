package com.talentx.hrms.entity.skills;

import com.talentx.hrms.common.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "skills")
@AttributeOverride(name = "id", column = @Column(name = "skill_id"))
@Getter
@Setter
public class Skill extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @Column(name = "category", length = 100)
    private String category;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Constructors
    public Skill() {}

    public Skill(String name, String category, String description) {
        this.name = name;
        this.category = category;
        this.description = description;
    }
}

