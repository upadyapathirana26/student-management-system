package com.studentmgmt.backend.controller;

import com.studentmgmt.backend.dto.AuthDTOs.LoginRequest;
import com.studentmgmt.backend.dto.AuthDTOs.RegisterRequest;
import com.studentmgmt.backend.entity.Student;
import com.studentmgmt.backend.entity.User;
import com.studentmgmt.backend.repository.StudentRepository;
import com.studentmgmt.backend.repository.UserRepository;
import com.studentmgmt.backend.service.CustomUserDetailsService;
import com.studentmgmt.backend.util.JwtUtil;
import jakarta.validation.Valid;
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

    @PostMapping("/register")
    public Map<String, String> register(@RequestBody @Valid RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with this email");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPasswordHash()));
        user.setRole("USER"); // Hardcoded for security
        userRepository.save(user);

        if (studentRepository.findByEmail(request.getEmail()).isEmpty()) {
            Student student = new Student();
            student.setEmail(request.getEmail());
            student.setFirstName(request.getFirstName());
            student.setLastName(request.getLastName());
            student.setCourseId(null);
            studentRepository.save(student);
        } else {
            System.err.println("Warning: Student record already exists for " + request.getEmail());
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration successful! Please log in.");
        return response;
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody @Valid LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPasswordHash())
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }

        final UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());

        Optional<User> existingUserOpt = userRepository.findByEmail(loginRequest.getEmail());
        if (existingUserOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User existingUser = existingUserOpt.get();
        final String jwt = jwtUtil.generateToken(loginRequest.getEmail(), existingUser.getRole());

        Map<String, String> response = new HashMap<>();
        response.put("token", jwt);
        response.put("role", existingUser.getRole());
        response.put("email", existingUser.getEmail());

        return response;
    }
}