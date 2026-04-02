package com.ecoverse.dto;

import jakarta.validation.constraints.*;
import lombok.*;

public class AuthDTO {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class RegisterRequest {
        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 50)
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;
    }

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String  token;
        private String  name;
        private String  email;
        private String  role;
        private Integer totalXp;
        private Integer currentStreak;
        private Integer longestStreak;
        private String  provider;       // "LOCAL" or "GOOGLE"
        private String  pictureUrl;     // Google profile picture
        private String  message;
    }
}