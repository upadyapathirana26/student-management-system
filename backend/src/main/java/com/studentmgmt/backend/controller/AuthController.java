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

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allow frontend to access
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
    private StudentRepository studentRepository; // Inject Student Repository

    @Autowired
    private PasswordEncoder passwordEncoder;

    // REGISTER ENDPOINT
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody RegisterRequest request) {
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
                // Check if student already exists for this email (safety check)
                if (studentRepository.findByEmail(request.getEmail()).isEmpty()) {
                    Student student = new Student();
                    student.setEmail(request.getEmail());
                    student.setFirstName(request.getFirstName() != null && !request.getFirstName().isEmpty() ? request.getFirstName() : "New");
                    student.setLastName(request.getLastName() != null && !request.getLastName().isEmpty() ? request.getLastName() : "Student");
                    student.setCourseId(null); // Unassigned initially

                    studentRepository.save(student);
                }
            } catch (Exception e) {
                // Log the error but don't fail the whole registration
                // The user account was created, so they can login.
                // Admin can add their student details later.
                System.err.println("Warning: Failed to create student profile for " + request.getEmail() + ". Error: " + e.getMessage());
                // Optionally throw new RuntimeException("User created, but student profile failed.");
            }
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration successful! Please log in.");
        return response;
    }

    // LOGIN ENDPOINT
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User loginRequest) {
        try {
            // 1. Authenticate credentials
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPasswordHash())
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }

        // 2. Generate Token
        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());

        // Get the actual user entity to retrieve the role
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

    // --- DTO Class to handle Registration Data (Email, Pass, Role, Names) ---
    // This allows us to receive fields that aren't in the User Entity directly
    public static class RegisterRequest {
        private String email;
        private String passwordHash;
        private String role;
        private String firstName;
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
}