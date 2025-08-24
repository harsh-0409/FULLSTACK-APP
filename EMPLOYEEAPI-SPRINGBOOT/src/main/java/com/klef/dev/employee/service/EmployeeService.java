package com.klef.dev.employee.service;

import com.klef.dev.employee.entity.Employee;
import java.util.List;

public interface EmployeeService {
    Employee addEmployee(Employee employee);
    List<Employee> getAllEmployees();
    Employee getEmployeeById(int id);
    Employee updateEmployee(Employee employee);
    void deleteEmployeeById(int id);
}
