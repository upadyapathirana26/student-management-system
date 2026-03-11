package com.studentmgmt.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Entity
@Table(name = "students")
public class Student {
    @Id
    private UUID id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private UUID courseId;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.id == null) this.id = UUID.randomUUID();
        this.createdAt = LocalDateTime.now();
    }

    //  to handle multiple courses
    @OneToMany(mappedBy = "student", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Enrollment> enrollments;


    // This creates a virtual field "courseIds" in the JSON response
    @Transient
    public List<String> getCourseIds() {
        if (this.enrollments == null) {
            return null;
        }
        return this.enrollments.stream()
                .map(enrollment -> enrollment.getCourse().getId().toString())
                .collect(Collectors.toList());
    }
}
