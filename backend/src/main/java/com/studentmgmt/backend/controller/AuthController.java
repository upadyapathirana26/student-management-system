package com.studentmgmt.backend.controller;

import com.studentmgmt.backend.entity.Student;
import com.studentmgmt.backend.entity.User;
import com.studentmgmt.backend.repository.StudentRepository;
import com.studentmgmt.backend.repository.UserRepository;
import com.studentmgmt.backend.service.CustomUserDetailsService;
import com.studentmgmt.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

// Validation Imports
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // REGISTER ENDPOINT
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody @Valid RegisterRequest request) {
        // 1. Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with this email");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPasswordHash()));
        user.setRole(request.getRole() != null ? request.getRole() : "USER");

        userRepository.save(user);

        // 2. If Role is USER (Student), also create a Student Record
        if ("USER".equals(user.getRole())) {
            try {
                if (studentRepository.findByEmail(request.getEmail()).isEmpty()) {
                    Student student = new Student();
                    student.setEmail(request.getEmail());
                    student.setFirstName(request.getFirstName() != null && !request.getFirstName().isEmpty() ? request.getFirstName() : "New");
                    student.setLastName(request.getLastName() != null && !request.getLastName().isEmpty() ? request.getLastName() : "Student");
                    student.setCourseId(null);

                    studentRepository.save(student);
                }
            } catch (Exception e) {
                System.err.println("Warning: Failed to create student profile for " + request.getEmail() + ". Error: " + e.getMessage());
            }
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration successful! Please log in.");
        return response;
    }

    // LOGIN ENDPOINT (Updated to use LoginRequest DTO)
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody @Valid LoginRequest loginRequest) {
        try {
            // 1. Authenticate credentials
            // We use the getters from our new DTO class
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPasswordHash())
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }

        // 2. Generate Token
        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());

        Optional<User> existingUserOpt = userRepository.findByEmail(loginRequest.getEmail());
        if (existingUserOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User existingUser = existingUserOpt.get();
        final String jwt = jwtUtil.generateToken(loginRequest.getEmail(), existingUser.getRole());

        // 3. Return Token and Role to Frontend
        Map<String, String> response = new HashMap<>();
        response.put("token", jwt);
        response.put("role", existingUser.getRole());
        response.put("email", existingUser.getEmail());

        return response;
    }

    // --- DTO Class for Registration ---
    public static class RegisterRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String passwordHash;

        @NotBlank(message = "Role is required")
        private String role;

        @NotBlank(message = "First name is required")
        private String firstName;

        @NotBlank(message = "Last name is required")
        private String lastName;

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPasswordHash() { return passwordHash; }
        public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
        public String getRole() { return role; }
        public void setRole(String role) { this.role = role; }
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
    }

    // --- NEW DTO Class for Login ---
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        private String passwordHash;

        // Getters and Setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPasswordHash() { return passwordHash; }
        public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    }
}