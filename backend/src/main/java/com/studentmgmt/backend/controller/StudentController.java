package com.studentmgmt.backend.controller;

import com.studentmgmt.backend.entity.Student;
import com.studentmgmt.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*") // Allows requests from Postman and Frontend
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    // GET: Fetch all students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    // POST: Create a new student
    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        // ID is generated automatically by the Entity @PrePersist
        return studentRepository.save(student);
    }

    // GET: Fetch one student by ID
    @GetMapping("/{id}")
    public Student getStudentById(@PathVariable UUID id) {
        return studentRepository.findById(id).orElse(null);
    }
    // UPDATE: Update an existing student
    @PutMapping("/{id}")
    public Student updateStudent(@PathVariable UUID id, @RequestBody Student studentDetails) {
        return studentRepository.findById(id).map(student -> {
            student.setFirstName(studentDetails.getFirstName());
            student.setLastName(studentDetails.getLastName());
            student.setEmail(studentDetails.getEmail());
            student.setCourseId(studentDetails.getCourseId());
            return studentRepository.save(student);
        }).orElseThrow(() -> new RuntimeException("Student not found with id " + id));
    }

    // DELETE: Remove a student
    @DeleteMapping("/{id}")
    public void deleteStudent(@PathVariable UUID id) {
        studentRepository.deleteById(id);
    }
}