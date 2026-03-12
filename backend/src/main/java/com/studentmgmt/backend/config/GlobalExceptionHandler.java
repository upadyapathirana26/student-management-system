package com.studentmgmt.backend.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.dao.DataIntegrityViolationException;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // 1. Handle Validation Errors (e.g., empty fields, bad email)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );
        return ResponseEntity.badRequest().body(errors);
    }

    // 2. Handle Duplicate Entry Errors (e.g., Email already exists)
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateKeyException(DataIntegrityViolationException ex) {
        Map<String, String> error = new HashMap<>();
        String message = "Database error occurred.";

        if (ex.getRootCause() != null && ex.getRootCause().getMessage().contains("duplicate key")) {
            if (ex.getRootCause().getMessage().contains("email")) {
                message = "A student with this email already exists.";
            } else if (ex.getRootCause().getMessage().contains("enrollments")) {
                message = "Student is already enrolled in this course.";
            }
        }
        error.put("error", message);
        return ResponseEntity.status(409).body(error); // 409 Conflict
    }

    // 3. Handle Generic Errors
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception e) {
        Map<String, String> error = new HashMap<>();
        error.put("error", "Server Error: " + e.getMessage());
        return ResponseEntity.status(500).body(error);
    }
}