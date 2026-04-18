package com.talentx.hrms.repository;

import com.talentx.hrms.entity.employee.Employee;
import com.talentx.hrms.entity.employee.EmployeeAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeAddressRepository extends JpaRepository<EmployeeAddress, Long> {

    List<EmployeeAddress> findByEmployee(Employee employee);

    List<EmployeeAddress> findByEmployeeOrderByIsPrimaryDesc(Employee employee);

    Optional<EmployeeAddress> findByEmployeeAndIsPrimaryTrue(Employee employee);

    long countByEmployee(Employee employee);
}
