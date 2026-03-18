package com.studentmgmt.backend.controller;

import com.studentmgmt.backend.dto.StudentDTOs.StudentRequest;
import com.studentmgmt.backend.entity.Course;
import com.studentmgmt.backend.entity.Enrollment;
import com.studentmgmt.backend.entity.Student;
import com.studentmgmt.backend.repository.CourseRepository;
import com.studentmgmt.backend.repository.EnrollmentRepository;
import com.studentmgmt.backend.repository.StudentRepository;
import com.studentmgmt.backend.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    @Autowired
    private StudentService studentService;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<Student> getAllStudents() {
        return studentService.getAllStudents();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudent(@PathVariable UUID id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @GetMapping("/my-courses")
    public List<Course> getMyCourses(@RequestParam String email) {
        Student student = studentRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        return enrollments.stream()
                .map(Enrollment::getCourse)
                .toList();
    }

    @PostMapping
    public Student createStudent(@RequestBody @Valid StudentRequest request) {
        Student student = new Student();
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());

        Student savedStudent = studentService.createStudent(student);

        if (request.getCourseIds() != null) {
            for (String courseIdStr : request.getCourseIds()) {
                try {
                    UUID courseId = UUID.fromString(courseIdStr);
                    if (courseRepository.existsById(courseId)) {
                        Course course = courseRepository.findById(courseId).get();
                        Enrollment enrollment = new Enrollment();
                        enrollment.setStudent(savedStudent);
                        enrollment.setCourse(course);
                        enrollmentRepository.save(enrollment);
                    }
                } catch (IllegalArgumentException e) {
                    // Skip invalid IDs
                }
            }
        }

        return savedStudent;
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Student> updateStudent(@PathVariable UUID id, @RequestBody @Valid StudentRequest request) {
        return studentRepository.findById(id).map(student -> {
            student.setFirstName(request.getFirstName());
            student.setLastName(request.getLastName());
            student.setEmail(request.getEmail());

            enrollmentRepository.deleteByStudentId(id);
            enrollmentRepository.flush();

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
                    } catch (Exception e) {
                        // Ignore bad IDs
                    }
                }
            }

            return ResponseEntity.ok(studentRepository.save(student));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable UUID id) {
        if (studentRepository.existsById(id)) {
            studentService.deleteStudent(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}