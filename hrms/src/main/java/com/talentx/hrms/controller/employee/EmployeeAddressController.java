package com.talentx.hrms.controller.employee;

import com.talentx.hrms.common.ApiResponse;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.employee.EmployeeAddress;
import com.talentx.hrms.entity.enums.AddressType;
import com.talentx.hrms.repository.EmployeeAddressRepository;
import com.talentx.hrms.repository.EmployeeRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employee-addresses")
@Tag(name = "Employee Addresses", description = "Employee address management")
public class EmployeeAddressController {

    private final EmployeeAddressRepository employeeAddressRepository;
    private final EmployeeRepository employeeRepository;

    @Autowired
    public EmployeeAddressController(EmployeeAddressRepository employeeAddressRepository,
                                     EmployeeRepository employeeRepository) {
        this.employeeAddressRepository = employeeAddressRepository;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/employee/{employeeId:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get addresses by employee")
    public ResponseEntity<ApiResponse<List<EmployeeAddress>>> getByEmployee(@PathVariable Long employeeId) {
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        List<EmployeeAddress> addresses = employeeAddressRepository.findByEmployeeOrderByIsPrimaryDesc(employee);
        return ResponseEntity.ok(ApiResponse.success("Addresses retrieved", addresses));
    }

    @GetMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get address by ID")
    public ResponseEntity<ApiResponse<EmployeeAddress>> getById(@PathVariable Long id) {
        EmployeeAddress address = employeeAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        return ResponseEntity.ok(ApiResponse.success("Address retrieved", address));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Create employee address")
    public ResponseEntity<ApiResponse<EmployeeAddress>> create(@RequestBody AddressRequest request) {
        Employee employee = employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if (Boolean.TRUE.equals(request.getIsPrimary())) {
            employeeAddressRepository.findByEmployeeAndIsPrimaryTrue(employee)
                    .ifPresent(existing -> { existing.setIsPrimary(false); employeeAddressRepository.save(existing); });
        }

        EmployeeAddress address = new EmployeeAddress();
        address.setEmployee(employee);
        if (request.getAddressType() != null) {
            try { address.setAddressType(AddressType.valueOf(request.getAddressType())); } catch (Exception ignored) {}
        }
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setStateProvince(request.getStateProvince());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);

        EmployeeAddress saved = employeeAddressRepository.save(address);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Address created", saved));
    }

    @PutMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Update employee address")
    public ResponseEntity<ApiResponse<EmployeeAddress>> update(@PathVariable Long id,
                                                                @RequestBody AddressRequest request) {
        EmployeeAddress address = employeeAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (request.getAddressType() != null) {
            try { address.setAddressType(AddressType.valueOf(request.getAddressType())); } catch (Exception ignored) {}
        }
        if (request.getAddressLine1() != null) address.setAddressLine1(request.getAddressLine1());
        if (request.getAddressLine2() != null) address.setAddressLine2(request.getAddressLine2());
        if (request.getCity() != null) address.setCity(request.getCity());
        if (request.getStateProvince() != null) address.setStateProvince(request.getStateProvince());
        if (request.getPostalCode() != null) address.setPostalCode(request.getPostalCode());
        if (request.getCountry() != null) address.setCountry(request.getCountry());
        if (request.getIsPrimary() != null) address.setIsPrimary(request.getIsPrimary());

        EmployeeAddress saved = employeeAddressRepository.save(address);
        return ResponseEntity.ok(ApiResponse.success("Address updated", saved));
    }

    @DeleteMapping("/{id:\\d+}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Delete employee address")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        employeeAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        employeeAddressRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Address deleted"));
    }

    @PutMapping("/{id:\\d+}/set-primary")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    @Operation(summary = "Set address as primary")
    public ResponseEntity<ApiResponse<EmployeeAddress>> setPrimary(@PathVariable Long id) {
        EmployeeAddress address = employeeAddressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        employeeAddressRepository.findByEmployeeAndIsPrimaryTrue(address.getEmployee())
                .ifPresent(existing -> { existing.setIsPrimary(false); employeeAddressRepository.save(existing); });

        address.setIsPrimary(true);
        EmployeeAddress saved = employeeAddressRepository.save(address);
        return ResponseEntity.ok(ApiResponse.success("Primary address updated", saved));
    }

    // Request DTO
    public static class AddressRequest {
        private Long employeeId;
        private String addressType;
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String stateProvince;
        private String postalCode;
        private String country;
        private Boolean isPrimary;

        public Long getEmployeeId() { return employeeId; }
        public void setEmployeeId(Long employeeId) { this.employeeId = employeeId; }
        public String getAddressType() { return addressType; }
        public void setAddressType(String addressType) { this.addressType = addressType; }
        public String getAddressLine1() { return addressLine1; }
        public void setAddressLine1(String addressLine1) { this.addressLine1 = addressLine1; }
        public String getAddressLine2() { return addressLine2; }
        public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }
        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }
        public String getStateProvince() { return stateProvince; }
        public void setStateProvince(String stateProvince) { this.stateProvince = stateProvince; }
        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }
        public Boolean getIsPrimary() { return isPrimary; }
        public void setIsPrimary(Boolean isPrimary) { this.isPrimary = isPrimary; }
    }
}
