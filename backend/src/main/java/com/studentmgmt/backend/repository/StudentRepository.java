package com.studentmgmt.backend.repository;

import com.studentmgmt.backend.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface StudentRepository extends JpaRepository<Student, UUID> {
}