package com.studentmgmt.backend.service.impl;

import com.studentmgmt.backend.entity.Student;
import com.studentmgmt.backend.entity.User;
import com.studentmgmt.backend.repository.StudentRepository;
import com.studentmgmt.backend.repository.UserRepository;
import com.studentmgmt.backend.service.AuthService;
import com.studentmgmt.backend.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired private UserRepository userRepository;
    @Autowired private StudentRepository studentRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private AuthenticationManager authenticationManager;
    // Inject your CustomUserDetailsService if you have one
    @Autowired private com.studentmgmt.backend.service.CustomUserDetailsService userDetailsService;

    @Override
    public Map<String, String> register(String email, String password, String firstName, String lastName) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setRole("USER"); // 🔒 HARDCODED TO USER ONLY. No Admin registration allowed.

        userRepository.save(user);

        // Auto-create Student profile for new users
        if (studentRepository.findByEmail(email).isEmpty()) {
            Student student = new Student();
            student.setEmail(email);
            student.setFirstName(firstName != null ? firstName : "New");
            student.setLastName(lastName != null ? lastName : "Student");
            studentRepository.save(student);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Registration successful! Please log in.");
        return response;
    }

    @Override
    public Map<String, String> login(String email, String password) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        Optional<User> existingUserOpt = userRepository.findByEmail(email);

        if (existingUserOpt.isEmpty()) throw new RuntimeException("User not found");

        User existingUser = existingUserOpt.get();
        String token = jwtUtil.generateToken(email, existingUser.getRole());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", existingUser.getRole());
        response.put("email", existingUser.getEmail());
        return response;
    }
}