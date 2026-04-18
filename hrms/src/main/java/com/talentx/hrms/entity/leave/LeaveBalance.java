package com.talentx.hrms.entity.leave;

import com.talentx.hrms.common.BaseEntity;
import com.talentx.hrms.entity.employee.Employee;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "leave_balances", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"employee_id", "leave_type_id", "year"})
})
@Getter
@Setter
@AttributeOverride(name = "id", column = @Column(name = "leave_balance_id"))
public class LeaveBalance extends BaseEntity {

    @NotNull(message = "Employee is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @NotNull(message = "Leave type is required")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @NotNull(message = "Year is required")
    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "allocated_days", precision = 5, scale = 2)
    private BigDecimal allocatedDays = BigDecimal.ZERO;

    @Column(name = "used_days", precision = 5, scale = 2)
    private BigDecimal usedDays = BigDecimal.ZERO;

    @Column(name = "pending_days", precision = 5, scale = 2)
    private BigDecimal pendingDays = BigDecimal.ZERO;

    @Column(name = "available_days", precision = 5, scale = 2, insertable = false, updatable = false)
    private BigDecimal availableDays;

    @Column(name = "carried_forward_days", precision = 5, scale = 2)
    private BigDecimal carriedForwardDays = BigDecimal.ZERO;

    // Constructors
    public LeaveBalance() {}

    public LeaveBalance(Employee employee, LeaveType leaveType, Integer year) {
        this.employee = employee;
        this.leaveType = leaveType;
        this.year = year;
    }

    // Business logic methods
    public BigDecimal getRemainingDays() {
        BigDecimal total = allocatedDays.add(carriedForwardDays);
        return total.subtract(usedDays).subtract(pendingDays);
    }

    public void setCarryForwardDays(BigDecimal days) {
        this.carriedForwardDays = days;
    }

    public boolean canTakeLeave(BigDecimal requestedDays) {
        BigDecimal remaining = getRemainingDays();
        return remaining.compareTo(requestedDays) >= 0;
    }
}

