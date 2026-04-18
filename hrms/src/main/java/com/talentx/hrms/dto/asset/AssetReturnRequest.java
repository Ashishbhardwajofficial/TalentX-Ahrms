package com.talentx.hrms.dto.asset;

import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class AssetReturnRequest {

    private LocalDate returnedDate;

    @Size(max = 255, message = "Condition at return must not exceed 255 characters")
    private String conditionAtReturn;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    // Constructors
    public AssetReturnRequest() {}

    public AssetReturnRequest(LocalDate returnedDate, String conditionAtReturn, String notes) {
        this.returnedDate = returnedDate;
        this.conditionAtReturn = conditionAtReturn;
        this.notes = notes;
    }

    // Getters and Setters
    public LocalDate getReturnedDate() {
        return returnedDate;
    }

    public void setReturnedDate(LocalDate returnedDate) {
        this.returnedDate = returnedDate;
    }

    public String getConditionAtReturn() {
        return conditionAtReturn;
    }

    public void setConditionAtReturn(String conditionAtReturn) {
        this.conditionAtReturn = conditionAtReturn;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

