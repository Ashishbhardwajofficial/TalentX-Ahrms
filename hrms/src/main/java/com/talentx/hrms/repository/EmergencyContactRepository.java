package com.talentx.hrms.repository;

import com.talentx.hrms.entity.employee.EmergencyContact;
import com.talentx.hrms.entity.employee.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmergencyContactRepository extends JpaRepository<EmergencyContact, Long> {

    List<EmergencyContact> findByEmployee(Employee employee);

    List<EmergencyContact> findByEmployeeOrderByIsPrimaryDesc(Employee employee);

    Optional<EmergencyContact> findByEmployeeAndIsPrimaryTrue(Employee employee);

    long countByEmployee(Employee employee);
}
