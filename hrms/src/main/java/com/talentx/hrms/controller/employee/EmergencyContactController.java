package com.talentx.hrms.controller.employee;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.entity.employee.EmergencyContact;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.repository.EmergencyContactRepository;
import com.talentx.hrms.repository.EmployeeRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/emergency-contacts")
@Tag(name = "Emergency Contacts", description = "Employee emergency contact management")
public class EmergencyContactController {

    private final EmergencyContactRepository emergencyContactRepository;
    private final EmployeeRepository employeeRepository;

    @Autowired
    public EmergencyContactController(EmergencyContactRepository emergencyContactRepository,
                                      EmployeeRepository employeeRepository) {
        this.emergencyContactRepository = emergencyContactRepository;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/employee/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get emergency contacts by employee")
    public ResponseEntity<ApiResponse<List<EmergencyContact>>> getByEmployee(@PathVariable Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        List<EmergencyContact> contacts = emergencyContactRepository.findByEmployeeOrderByIsPrimaryDesc(employee);
        return ResponseEntity.ok(ApiResponse.success("Emergency contacts retrieved", contacts));
    }

    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get emergency contact by ID")
    public ResponseEntity<ApiResponse<EmergencyContact>> getById(@PathVariable Long id) {
        EmergencyContact contact = emergencyContactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emergency contact not found"));
        return ResponseEntity.ok(ApiResponse.success("Emergency contact retrieved", contact));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Create emergency contact")
    public ResponseEntity<ApiResponse<EmergencyContact>> create(@Valid @RequestBody EmergencyContactRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // If setting as primary, unset existing primary
        if (Boolean.TRUE.equals(request.getIsPrimary())) {
            emergencyContactRepository.findByEmployeeAndIsPrimaryTrue(employee)
                    .ifPresent(existing -> { existing.setIsPrimary(false); emergencyContactRepository.save(existing); });
        }

        EmergencyContact contact = new EmergencyContact();
        contact.setEmployee(employee);
        contact.setName(request.getName());
        contact.setRelationship(request.getRelationship());
        contact.setPhoneNumber(request.getPhoneNumber());
        contact.setAlternatePhone(request.getAlternatePhone());
        contact.setEmail(request.getEmail());
        contact.setAddress(request.getAddress());
        contact.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);

        EmergencyContact saved = emergencyContactRepository.save(contact);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Emergency contact created", saved));
    }

    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Update emergency contact")
    public ResponseEntity<ApiResponse<EmergencyContact>> update(@PathVariable Long id,
                                                                 @RequestBody EmergencyContactRequest request) {
        EmergencyContact contact = emergencyContactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emergency contact not found"));

        if (request.getName() != null) contact.setName(request.getName());
        if (request.getRelationship() != null) contact.setRelationship(request.getRelationship());
        if (request.getPhoneNumber() != null) contact.setPhoneNumber(request.getPhoneNumber());
        if (request.getAlternatePhone() != null) contact.setAlternatePhone(request.getAlternatePhone());
        if (request.getEmail() != null) contact.setEmail(request.getEmail());
        if (request.getAddress() != null) contact.setAddress(request.getAddress());
        if (request.getIsPrimary() != null) contact.setIsPrimary(request.getIsPrimary());

        EmergencyContact saved = emergencyContactRepository.save(contact);
        return ResponseEntity.ok(ApiResponse.success("Emergency contact updated", saved));
    }

    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Delete emergency contact")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        emergencyContactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emergency contact not found"));
        emergencyContactRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Emergency contact deleted"));
    }

    @PutMapping("/{id:\\d+}/set-primary")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Set contact as primary")
    public ResponseEntity<ApiResponse<EmergencyContact>> setPrimary(@PathVariable Long id) {
        EmergencyContact contact = emergencyContactRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Emergency contact not found"));

        // Unset existing primary
        emergencyContactRepository.findByEmployeeAndIsPrimaryTrue(contact.getEmployee())
                .ifPresent(existing -> { existing.setIsPrimary(false); emergencyContactRepository.save(existing); });

        contact.setIsPrimary(true);
        EmergencyContact saved = emergencyContactRepository.save(contact);
        return ResponseEntity.ok(ApiResponse.success("Primary contact updated", saved));
    }

    // Request DTO
    public static class EmergencyContactRequest {
        private Long employeeId;
        private String name;
        private String relationship;
        private String phoneNumber;
        private String alternatePhone;
        private String email;
        private String address;
        private Boolean isPrimary;

        public Long getEmployeeId() { return employeeId; }
        public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getRelationship() { return relationship; }
        public void setRelationship(String relationship) { this.relationship = relationship; }
        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
        public String getAlternatePhone() { return alternatePhone; }
        public void setAlternatePhone(String alternatePhone) { this.alternatePhone = alternatePhone; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }
        public Boolean getIsPrimary() { return isPrimary; }
        public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
    }
}
