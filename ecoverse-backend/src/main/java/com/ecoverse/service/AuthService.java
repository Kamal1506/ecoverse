package com.ecoverse.service;

import com.ecoverse.dto.AuthDTO.AuthResponse;
import com.ecoverse.dto.AuthDTO.LoginRequest;
import com.ecoverse.dto.AuthDTO.RegisterRequest;
import com.ecoverse.entity.User;
import com.ecoverse.repository.UserRepository;
import com.ecoverse.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtUtil               jwtUtil;

    // ── Register ─────────────────────────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "An account with email '" + normalizedEmail + "' already exists.");
        }

        User user = User.builder()
                .name(request.getName())
                .email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER)   // self-registered users are always USER
                .totalXp(0)
                .build();

        try {
            userRepository.save(user);
        } catch (DataIntegrityViolationException ex) {
            // Backward compatibility for legacy schemas that still enforce ROLE_* enum values.
            user.setRole(User.Role.ROLE_USER);
            userRepository.save(user);
        }
        log.info("New player registered: {}", user.getEmail());

        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().normalized())   // ✅ sends "USER" or "ADMIN"
                .totalXp(user.getTotalXp())
                .message("Welcome to EcoVerse, " + user.getName() + "!")
                .build();
    }

    // ── Login ─────────────────────────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String rawPassword = request.getPassword();

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        boolean passwordMatches = passwordEncoder.matches(rawPassword, user.getPassword());

        // Backward compatibility for legacy plaintext passwords; auto-upgrade to BCrypt after successful login.
        if (!passwordMatches && rawPassword.equals(user.getPassword())) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            userRepository.save(user);
            passwordMatches = true;
        }

        if (!passwordMatches) {
            throw new BadCredentialsException("Email or password is incorrect.");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        log.info("Player logged in: {} ({})", user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().normalized())   // ✅ sends "USER" or "ADMIN"
                .totalXp(user.getTotalXp())
                .message("Welcome back, " + user.getName() + "!")
                .build();
    }
}
