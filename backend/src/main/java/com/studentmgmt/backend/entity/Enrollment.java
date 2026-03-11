package com.studentmgmt.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "enrollments")
public class Enrollment {
    @Id
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    @JsonIgnore // ADDED THIS to prevent infinite loop
    private Student student;

    @ManyToOne
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "enrolled_at")
    private LocalDateTime enrolledAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) this.id = UUID.randomUUID();
        this.enrolledAt = LocalDateTime.now();
    }
}