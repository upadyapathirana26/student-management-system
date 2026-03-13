package com.studentmgmt.backend.service;

import com.studentmgmt.backend.entity.Student;
import java.util.List;
import java.util.UUID;

public interface StudentService {
    List<Student> getAllStudents(); // Returns only non-admin students
    Student getStudentById(UUID id);
    Student createStudent(Student student);
    Student updateStudent(UUID id, Student studentDetails);
    void deleteStudent(UUID id);
}