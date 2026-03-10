package com.studentmgmt.backend.controller;

import com.studentmgmt.backend.entity.Course;
import com.studentmgmt.backend.repository.CourseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    // Get All Courses
    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // Create Course
    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseRepository.save(course);
    }

    // Get Course by ID
    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable UUID id) {
        return courseRepository.findById(id).orElse(null);
    }

    // UPDATE: Update an existing course
    @PutMapping("/{id}")
    public Course updateCourse(@PathVariable UUID id, @RequestBody Course courseDetails) {
        return courseRepository.findById(id).map(course -> {
            course.setTitle(courseDetails.getTitle());
            course.setDescription(courseDetails.getDescription());
            course.setCredits(courseDetails.getCredits());
            return courseRepository.save(course);
        }).orElseThrow(() -> new RuntimeException("Course not found with id " + id));
    }



    // Delete Course
    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable UUID id) {
        courseRepository.deleteById(id);
    }
}