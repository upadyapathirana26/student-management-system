package com.studentmgmt.backend.service.impl;

import com.studentmgmt.backend.entity.Student;
import com.studentmgmt.backend.entity.User;
import com.studentmgmt.backend.repository.StudentRepository;
import com.studentmgmt.backend.repository.UserRepository;
import com.studentmgmt.backend.service.StudentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

@Service
public class StudentServiceImpl implements StudentService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private UserRepository userRepository; // Injected to check user roles

    @Override
    public List<Student> getAllStudents() {
        List<Student> allStudents = studentRepository.findAll();

        // Filter out any student whose associated User account has the role "ADMIN"
        return allStudents.stream()
                .filter(student -> {
                    Optional<User> userOpt = userRepository.findByEmail(student.getEmail());
                    // Keep student ONLY if user exists AND role is NOT Admin
                    return userOpt.map(user -> !"ADMIN".equals(user.getRole())).orElse(true);
                })
                .toList();
    }

    @Override
    public Student getStudentById(UUID id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @Override
    public Student createStudent(Student student) {
        return studentRepository.save(student);
    }

    @Override
    public Student updateStudent(UUID id, Student studentDetails) {
        return studentRepository.findById(id).map(student -> {
            student.setFirstName(studentDetails.getFirstName());
            student.setLastName(studentDetails.getLastName());
            student.setEmail(studentDetails.getEmail());
            return studentRepository.save(student);
        }).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @Override
    public void deleteStudent(UUID id) {
        studentRepository.deleteById(id);
    }
}