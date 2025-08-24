package com.klef.dev.employee.controller;

import com.klef.dev.employee.entity.Employee;
import com.klef.dev.employee.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employeeapi")
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeService employeeService;

    @GetMapping("/")
    public String home() {
        return "Employee API - Jenkins Full Stack Demo";
    }

    @PostMapping("/add")
    public ResponseEntity<Employee> addEmployee(@RequestBody Employee employee) {
        Employee saved = employeeService.addEmployee(employee);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        return new ResponseEntity<>(employeeService.getAllEmployees(), HttpStatus.OK);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getEmployeeById(@PathVariable int id) {
        Employee emp = employeeService.getEmployeeById(id);
        if (emp != null) return new ResponseEntity<>(emp, HttpStatus.OK);
        return new ResponseEntity<>("Employee with ID " + id + " not found.", HttpStatus.NOT_FOUND);
    }

    @PutMapping("/update")
    public ResponseEntity<?> updateEmployee(@RequestBody Employee employee) {
        Employee existing = employeeService.getEmployeeById(employee.getId());
        if (existing != null) {
            Employee updated = employeeService.updateEmployee(employee);
            return new ResponseEntity<>(updated, HttpStatus.OK);
        }
        return new ResponseEntity<>("Cannot update. Employee with ID " + employee.getId() + " not found.", HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteEmployee(@PathVariable int id) {
        Employee existing = employeeService.getEmployeeById(id);
        if (existing != null) {
            employeeService.deleteEmployeeById(id);
            return new ResponseEntity<>("Employee with ID " + id + " deleted successfully.", HttpStatus.OK);
        }
        return new ResponseEntity<>("Cannot delete. Employee with ID " + id + " not found.", HttpStatus.NOT_FOUND);
    }
}
