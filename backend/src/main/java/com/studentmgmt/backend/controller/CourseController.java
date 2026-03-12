package com.studentmgmt.backend.controller;

import com.studentmgmt.backend.entity.Course;
import com.studentmgmt.backend.repository.CourseRepository;
import com.studentmgmt.backend.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses")
@CrossOrigin(origins = "*")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private FileStorageService storageService;

    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }
    // ADD THIS METHOD - Get Single Course by ID
    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable UUID id) {
        return courseRepository.findById(id)
                .map(course -> ResponseEntity.ok().body(course))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws MalformedURLException {
        Path file = storageService.getFile(filename);
        Resource resource = new UrlResource(file.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    // POST Create with Validation
    @PostMapping
    public Course createCourse(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("credits") int credits,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        // --- MANUAL VALIDATION ---
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Course title is required");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Course description is required");
        }
        if (credits < 0 || credits > 20) {
            throw new IllegalArgumentException("Credits must be between 0 and 20");
        }
        // -------------------------

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

    // PUT Update with Validation
    @PutMapping("/{id}")
    public Course updateCourse(
            @PathVariable UUID id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("credits") int credits,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        // --- MANUAL VALIDATION ---
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Course title is required");
        }
        if (description == null || description.trim().isEmpty()) {
            throw new IllegalArgumentException("Course description is required");
        }
        if (credits < 0 || credits > 20) {
            throw new IllegalArgumentException("Credits must be between 0 and 20");
        }
        // -------------------------

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

    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable UUID id) {
        courseRepository.deleteById(id);
    }
}