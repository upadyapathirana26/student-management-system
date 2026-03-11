package com.studentmgmt.backend.controller;

import com.studentmgmt.backend.entity.Course;
import com.studentmgmt.backend.repository.CourseRepository;
import com.studentmgmt.backend.service.FileStorageService; // Import this
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
    private FileStorageService storageService; // Inject service

    // GET All
    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // GET Image by Filename
    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws MalformedURLException {
        Path file = storageService.getFile(filename);
        Resource resource = new UrlResource(file.toUri());

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG) // Or detect dynamically
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    // POST Create (Changed to accept MultipartFile)
    @PostMapping
    public Course createCourse(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("credits") int credits,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        Course course = new Course();
        course.setTitle(title);
        course.setDescription(description);
        course.setCredits(credits);

        if (imageFile != null && !imageFile.isEmpty()) {
            try {
                String filename = storageService.saveFile(imageFile);
                course.setImageFilename(filename);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        return courseRepository.save(course);
    }

    // PUT Update (Changed to accept MultipartFile)
    @PutMapping("/{id}")
    public Course updateCourse(
            @PathVariable UUID id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("credits") int credits,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        return courseRepository.findById(id).map(course -> {
            course.setTitle(title);
            course.setDescription(description);
            course.setCredits(credits);

            if (imageFile != null && !imageFile.isEmpty()) {
                try {
                    String filename = storageService.saveFile(imageFile);
                    course.setImageFilename(filename);
                } catch (Exception e) { e.printStackTrace(); }
            }
            return courseRepository.save(course);
        }).orElseThrow(() -> new RuntimeException("Course not found"));
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void deleteCourse(@PathVariable UUID id) {
        courseRepository.deleteById(id);
    }
}