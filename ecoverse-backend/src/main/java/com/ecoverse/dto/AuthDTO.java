package com.ecoverse.dto;

import com.ecoverse.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

// ─── Nested DTOs in one file for Sprint 1 clarity ─────────────────────────
// In later sprints, split into separate files if this grows large.

public class AuthDTO {

    // ── POST /api/auth/register ──────────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegisterRequest {

        @NotBlank(message = "Name is required")
        @Size(min = 2, max = 100, message = "Name must be 2–100 characters")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email address")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        // Optional. Accepts ADMIN/USER or ROLE_ADMIN/ROLE_USER.
        // If omitted, backend defaults to ROLE_USER.
        private String role;
    }

    // ── POST /api/auth/login ─────────────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoginRequest {

        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email address")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;
    }

    // ── Response returned after register OR login ────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthResponse {
        private String token;
        private String name;
        private String email;
        private String role;
        private Integer totalXp;
        private String message;
    }
}
