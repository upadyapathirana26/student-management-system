package com.studentmgmt.backend.controller;

import com.studentmgmt.backend.entity.Course;
import com.studentmgmt.backend.entity.Enrollment;
import com.studentmgmt.backend.entity.Student;
import com.studentmgmt.backend.repository.CourseRepository;
import com.studentmgmt.backend.repository.EnrollmentRepository;
import com.studentmgmt.backend.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

import java.util.*;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }


    // GET MY COURSES (For Student Dashboard)
    @GetMapping("/my-courses")
    public List<Course> getMyCourses(@RequestParam String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        return enrollments.stream()
                .map(Enrollment::getCourse)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudent(@PathVariable UUID id) {
        return studentRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Student createStudent(@RequestBody @Valid StudentRequest request) {
        Student student = new Student();
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());

        Student savedStudent = studentRepository.save(student);

        // Handle Multiple Course Enrollments
        if (request.getCourseIds() != null) {
            for (String courseIdStr : request.getCourseIds()) {
                try {
                    UUID courseId = UUID.fromString(courseIdStr);
                    if (courseRepository.existsById(courseId)) {
                        Course course = new Course();
                        course.setId(courseId);

                        Enrollment enrollment = new Enrollment();
                        enrollment.setStudent(savedStudent);
                        enrollment.setCourse(course);
                        enrollmentRepository.save(enrollment);
                    }
                } catch (IllegalArgumentException e) { /* Skip invalid IDs */ }
            }
        }

        return savedStudent;
    }
    // ADDED
    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Student> updateStudent(@PathVariable UUID id, @RequestBody @Valid StudentRequest request) {
        return studentRepository.findById(id).map(student -> {
            student.setFirstName(request.getFirstName());
            student.setLastName(request.getLastName());
            student.setEmail(request.getEmail());

            // 1. Delete old enrollments
            enrollmentRepository.deleteByStudentId(id);

            // 2. FORCE THE DELETE TO HAPPEN NOW (This fixes the crash)
            enrollmentRepository.flush();

            // 3. Add new enrollments
            if (request.getCourseIds() != null) {
                for (String courseIdStr : request.getCourseIds()) {
                    try {
                        UUID courseId = UUID.fromString(courseIdStr);
                        if (courseRepository.existsById(courseId)) {
                            Course course = courseRepository.findById(courseId).get();
                            Enrollment enrollment = new Enrollment();
                            enrollment.setStudent(student);
                            enrollment.setCourse(course);
                            enrollmentRepository.save(enrollment);
                        }
                    } catch (Exception e) { /* Ignore bad IDs */ }
                }
            }

            return ResponseEntity.ok(studentRepository.save(student));
        }).orElse(ResponseEntity.notFound().build());
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        if (studentRepository.existsById(id)) {
            studentRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // DTO to handle List of Course IDs
    public static class StudentRequest {

        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private List<String> courseIds;

        // Getters and Setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public List<String> getCourseIds() { return courseIds; }
        public void setCourseIds(List<String> courseIds) { this.courseIds = courseIds; }
    }
}