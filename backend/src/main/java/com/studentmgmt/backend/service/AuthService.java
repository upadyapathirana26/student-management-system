package com.studentmgmt.backend.service;

import java.util.Map;

public interface AuthService {
    Map<String, String> register(String email, String password, String firstName, String lastName);
    Map<String, String> login(String email, String password);
}