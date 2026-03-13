package com.studentmgmt.backend.service;

import com.studentmgmt.backend.entity.Course;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface CourseService {
    List<Course> getAllCourses();
    Course getCourseById(UUID id);
    Course createCourse(String title, String description, int credits, MultipartFile imageFile);
    Course updateCourse(UUID id, String title, String description, int credits, MultipartFile imageFile);
    void deleteCourse(UUID id);
}