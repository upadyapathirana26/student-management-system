package com.studentmgmt.backend.service.impl;

import com.studentmgmt.backend.entity.Course;
import com.studentmgmt.backend.repository.CourseRepository;
import com.studentmgmt.backend.service.CourseService;
import com.studentmgmt.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Service
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private FileStorageService storageService;

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public Course getCourseById(UUID id) {
        return courseRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Override
    public Course createCourse(String title, String description, int credits, MultipartFile imageFile) {
        validateCourseData(title, description, credits);

        Course course = new Course();
        course.setTitle(title.trim());
        course.setDescription(description.trim());
        course.setCredits(credits);

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String filename = storageService.saveFile(imageFile);
                course.setImageFilename(filename);
            } catch (Exception e) {
                throw new RuntimeException("Failed to store image: " + e.getMessage());
            }
        }

        return courseRepository.save(course);
    }

    @Override
    public Course updateCourse(UUID id, String title, String description, int credits, MultipartFile imageFile) {
        validateCourseData(title, description, credits);

        return courseRepository.findById(id).map(course -> {
            course.setTitle(title.trim());
            course.setDescription(description.trim());
            course.setCredits(credits);

            if (imageFile != null && !imageFile.isEmpty()) {
                try {
                    String filename = storageService.saveFile(imageFile);
                    course.setImageFilename(filename);
                } catch (Exception e) {
                    throw new RuntimeException("Failed to store image: " + e.getMessage());
                }
            }
            return courseRepository.save(course);
        }).orElseThrow(() -> new RuntimeException("Course not found"));
    }

    @Override
    public void deleteCourse(UUID id) {
        if (!courseRepository.existsById(id)) {
            throw new RuntimeException("Course not found");
        }
        courseRepository.deleteById(id);
    }

    // Helper method to avoid code duplication
    private void validateCourseData(String title, String description, int credits) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Course title is required");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Course description is required");
        }
        if (credits < 0 || credits > 20) {
            throw new IllegalArgumentException("Credits must be between 0 and 20");
        }
    }
}