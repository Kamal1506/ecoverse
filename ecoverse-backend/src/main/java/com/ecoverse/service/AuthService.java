package com.ecoverse.service;

import com.ecoverse.dto.AuthDTO.*;
import com.ecoverse.entity.User;
import com.ecoverse.repository.UserRepository;
import com.ecoverse.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository       userRepository;
    private final PasswordEncoder      passwordEncoder;
    private final JwtUtil              jwtUtil;
    private final AuthenticationManager authenticationManager;

    // ── Register a new player ────────────────────────────────────────────────
    public AuthResponse register(RegisterRequest request) {

        // Reject duplicate emails
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                    "An account with email '" + request.getEmail() + "' already exists.");
        }

        // Build and save user — password is BCrypt hashed
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.ROLE_USER)   // all self-registered users are players
                .totalXp(0)
                .build();

        userRepository.save(user);
        log.info("New player registered: {}", user.getEmail());

        // Generate JWT and return
        String token = jwtUtil.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .totalXp(user.getTotalXp())
                .message("Welcome to EcoVerse, " + user.getName() + "!")
                .build();
    }

    // ── Login an existing user ───────────────────────────────────────────────
    public AuthResponse login(LoginRequest request) {

        // This throws BadCredentialsException automatically if email/password wrong
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Credentials are valid — load full user
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String token = jwtUtil.generateToken(user.getEmail());

        log.info("Player logged in: {} ({})", user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .totalXp(user.getTotalXp())
                .message("Welcome back, " + user.getName() + "!")
                .build();
    }
}
