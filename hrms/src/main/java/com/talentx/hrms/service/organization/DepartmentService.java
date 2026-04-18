package com.talentx.hrms.service.organization;

import com.talentx.hrms.common.PaginationRequest;
import com.talentx.hrms.common.exception.EntityNotFoundException;
import com.talentx.hrms.dto.organization.DepartmentRequest;
import com.talentx.hrms.dto.organization.DepartmentResponse;
import com.talentx.hrms.entity.core.Department;
import com.talentx.hrms.entity.core.Organization;
import com.talentx.hrms.entity.core.User;
import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.repository.DepartmentRepository;
import com.talentx.hrms.repository.EmployeeRepository;
import com.talentx.hrms.repository.OrganizationRepository;
import com.talentx.hrms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;

    @Autowired
    public DepartmentService(DepartmentRepository departmentRepository,
                           OrganizationRepository organizationRepository,
                           UserRepository userRepository,
                           EmployeeRepository employeeRepository) {
        this.departmentRepository = departmentRepository;
        this.organizationRepository = organizationRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
    }

    /**
     * Create a new department
     */
    public DepartmentResponse createDepartment(DepartmentRequest request) {
        // Get organization
        Organization organization = organizationRepository.findById(request.getOrganizationId())
            .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + request.getOrganizationId()));

        // Validate unique constraints
        if (departmentRepository.existsByCodeAndOrganization(request.getCode(), organization)) {
            throw new RuntimeException("Department with this code already exists in the organization");
        }

        departmentRepository.findByNameAndOrganization(request.getName(), organization)
            .ifPresent(existing -> {
                throw new RuntimeException("Department with this name already exists in the organization");
            });

        // Create department entity
        Department department = new Department();
        department.setOrganization(organization);
        mapRequestToEntity(request, department);

        // Set parent department if provided
        if (request.getParentDepartmentId() != null) {
            Department parentDepartment = departmentRepository.findById(request.getParentDepartmentId())
                .orElseThrow(() -> new EntityNotFoundException("Parent department not found with id: " + request.getParentDepartmentId()));
            
            // Validate parent department belongs to same organization
            if (!parentDepartment.getOrganization().getId().equals(organization.getId())) {
                throw new RuntimeException("Parent department must belong to the same organization");
            }
            
            department.setParentDepartment(parentDepartment);
        }

        // Set manager if provided
        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                .orElseThrow(() -> new EntityNotFoundException("Manager not found with id: " + request.getManagerId()));
            department.setManager(manager);
        }

        // Save department
        department = departmentRepository.save(department);

        return mapEntityToResponse(department);
    }

    /**
     * Update an existing department
     */
    public DepartmentResponse updateDepartment(Long id, DepartmentRequest request) {
        Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + id));

        Organization organization = organizationRepository.findById(request.getOrganizationId())
            .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + request.getOrganizationId()));

        // Validate unique constraints (excluding current department)
        departmentRepository.findByCodeAndOrganization(request.getCode(), organization)
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new RuntimeException("Department with this code already exists in the organization");
                }
            });

        departmentRepository.findByNameAndOrganization(request.getName(), organization)
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new RuntimeException("Department with this name already exists in the organization");
                }
            });

        // Update department entity
        mapRequestToEntity(request, department);

        // Update parent department if provided
        if (request.getParentDepartmentId() != null) {
            // Prevent circular reference
            if (request.getParentDepartmentId().equals(id)) {
                throw new RuntimeException("Department cannot be its own parent");
            }
            
            Department parentDepartment = departmentRepository.findById(request.getParentDepartmentId())
                .orElseThrow(() -> new EntityNotFoundException("Parent department not found with id: " + request.getParentDepartmentId()));
            
            // Validate parent department belongs to same organization
            if (!parentDepartment.getOrganization().getId().equals(organization.getId())) {
                throw new RuntimeException("Parent department must belong to the same organization");
            }
            
            // Check if setting this parent would create a circular hierarchy
            if (isCircularHierarchy(id, request.getParentDepartmentId())) {
                throw new RuntimeException("Cannot set parent department: would create circular hierarchy");
            }
            
            department.setParentDepartment(parentDepartment);
        } else {
            department.setParentDepartment(null);
        }

        // Update manager if provided
        if (request.getManagerId() != null) {
            Employee manager = employeeRepository.findById(request.getManagerId())
                .orElseThrow(() -> new EntityNotFoundException("Manager not found with id: " + request.getManagerId()));
            department.setManager(manager);
        } else {
            department.setManager(null);
        }

        // Save department
        department = departmentRepository.save(department);

        return mapEntityToResponse(department);
    }

    /**
     * Get department by ID
     */
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartment(Long id) {
        Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + id));

        return mapEntityToResponse(department);
    }

    /**
     * Get all departments with pagination
     */
    @Transactional(readOnly = true)
    public Page<DepartmentResponse> getDepartments(Long organizationId, PaginationRequest paginationRequest) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + organizationId));

        Pageable pageable = createPageable(paginationRequest);
        Page<Department> departments = departmentRepository.findByOrganization(organization, pageable);

        return departments.map(this::mapEntityToResponse);
    }

    /**
     * Search departments by name
     */
    @Transactional(readOnly = true)
    public Page<DepartmentResponse> searchDepartments(Long organizationId, String name, PaginationRequest paginationRequest) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + organizationId));

        Pageable pageable = createPageable(paginationRequest);
        Page<Department> departments = departmentRepository.findByOrganizationAndNameContainingIgnoreCase(
            organization, name, pageable);

        return departments.map(this::mapEntityToResponse);
    }

    /**
     * Get root departments (departments without parent)
     */
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getRootDepartments(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + organizationId));

        List<Department> departments = departmentRepository.findByOrganizationAndParentDepartmentIsNull(organization);
        return departments.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get sub-departments of a parent department
     */
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getSubDepartments(Long parentDepartmentId) {
        Department parentDepartment = departmentRepository.findById(parentDepartmentId)
            .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + parentDepartmentId));

        List<Department> subDepartments = departmentRepository.findByParentDepartment(parentDepartment);
        return subDepartments.stream()
            .map(this::mapEntityToResponse)
            .collect(Collectors.toList());
    }

    /**
     * Get department hierarchy tree
     * Returns all departments organized in a hierarchical structure
     */
    @Transactional(readOnly = true)
    public List<DepartmentHierarchyNode> getDepartmentHierarchy(Long organizationId) {
        Organization organization = organizationRepository.findById(organizationId)
            .orElseThrow(() -> new EntityNotFoundException("Organization not found with id: " + organizationId));

        // Get all root departments
        List<Department> rootDepartments = departmentRepository.findByOrganizationAndParentDepartmentIsNull(organization);

        // Build hierarchy tree
        return rootDepartments.stream()
            .map(this::buildHierarchyNode)
            .collect(Collectors.toList());
    }

    /**
     * Delete department
     */
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Department not found with id: " + id));

        // Check if department has sub-departments
        long subDepartmentCount = departmentRepository.countByParentDepartment(department);
        if (subDepartmentCount > 0) {
            throw new RuntimeException("Cannot delete department with existing sub-departments");
        }

        // Note: In a real application, you might also want to check for employees in this department
        // For now, we'll allow deletion

        departmentRepository.delete(department);
    }

    /**
     * Check if setting a parent would create a circular hierarchy
     */
    private boolean isCircularHierarchy(Long departmentId, Long proposedParentId) {
        if (departmentId.equals(proposedParentId)) {
            return true;
        }

        Department proposedParent = departmentRepository.findById(proposedParentId).orElse(null);
        if (proposedParent == null) {
            return false;
        }

        // Traverse up the hierarchy to check if we encounter the department
        Department current = proposedParent;
        while (current != null) {
            if (current.getId().equals(departmentId)) {
                return true;
            }
            current = current.getParentDepartment();
        }

        return false;
    }

    /**
     * Build hierarchy node recursively
     */
    private DepartmentHierarchyNode buildHierarchyNode(Department department) {
        DepartmentHierarchyNode node = new DepartmentHierarchyNode();
        node.setId(department.getId());
        node.setName(department.getName());
        node.setCode(department.getCode());
        node.setDescription(department.getDescription());
        node.setCostCenter(department.getCostCenter());
        
        if (department.getManager() != null) {
            node.setManagerId(department.getManager().getId());
            node.setManagerName(department.getManager().getUsername());
        }

        // Recursively build children
        List<Department> children = departmentRepository.findByParentDepartment(department);
        if (!children.isEmpty()) {
            List<DepartmentHierarchyNode> childNodes = children.stream()
                .map(this::buildHierarchyNode)
                .collect(Collectors.toList());
            node.setChildren(childNodes);
        }

        return node;
    }

    /**
     * Map request DTO to entity
     */
    private void mapRequestToEntity(DepartmentRequest request, Department department) {
        department.setName(request.getName());
        department.setCode(request.getCode());
        department.setDescription(request.getDescription());
        department.setCostCenter(request.getCostCenter());
    }

    /**
     * Map entity to response DTO
     */
    private DepartmentResponse mapEntityToResponse(Department department) {
        DepartmentResponse response = new DepartmentResponse();
        response.setId(department.getId());
        response.setOrganizationId(department.getOrganization().getId());
        response.setName(department.getName());
        response.setCode(department.getCode());
        response.setDescription(department.getDescription());
        response.setCostCenter(department.getCostCenter());

        if (department.getParentDepartment() != null) {
            response.setParentDepartmentId(department.getParentDepartment().getId());
            response.setParentDepartmentName(department.getParentDepartment().getName());
        }

        if (department.getManager() != null) {
            response.setManagerId(department.getManager().getId());
            response.setManagerName(department.getManager().getUsername());
        }

        if (department.getCreatedAt() != null) {
            response.setCreatedAt(department.getCreatedAt());
        }
        if (department.getUpdatedAt() != null) {
            response.setUpdatedAt(department.getUpdatedAt());
        }

        return response;
    }

    /**
     * Create pageable from pagination request
     */
    private Pageable createPageable(PaginationRequest paginationRequest) {
        Sort sort = Sort.unsorted();
        if (paginationRequest.getSortBy() != null && !paginationRequest.getSortBy().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(paginationRequest.getSortDirection()) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, paginationRequest.getSortBy());
        }

        return PageRequest.of(paginationRequest.getPage(), paginationRequest.getSize(), sort);
    }

    /**
     * Department hierarchy node for tree representation
     */
    public static class DepartmentHierarchyNode {
        private Long id;
        private String name;
        private String code;
        private String description;
        private String costCenter;
        private Long managerId;
        private String managerName;
        private List<DepartmentHierarchyNode> children = new ArrayList<>();

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public String getCostCenter() { return costCenter; }
        public void setCostCenter(String costCenter) { this.costCenter = costCenter; }

        public Long getManagerId() { return managerId; }
        public void setManagerId(Long managerId) { this.managerId = managerId; }

        public String getManagerName() { return managerName; }
        public void setManagerName(String managerName) { this.managerName = managerName; }

        public List<DepartmentHierarchyNode> getChildren() { return children; }
        public void setChildren(List<DepartmentHierarchyNode> children) { this.children = children; }
    }
}

