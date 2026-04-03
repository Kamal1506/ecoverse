package com.ecoverse.service;

import com.ecoverse.dto.AuthDTO.*;
import com.ecoverse.entity.User;
import com.ecoverse.entity.UserStreak;
import com.ecoverse.repository.UserRepository;
import com.ecoverse.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtUtil               jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final StreakService         streakService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        String normalizedName = request.getName() == null ? "" : request.getName().trim();

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail))
            throw new IllegalArgumentException("Email already registered.");

        User user = User.builder()
                .name(normalizedName).email(normalizedEmail)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER).provider("LOCAL").totalXp(0).build();
        user = userRepository.save(user);

        UserStreak streak = streakService.updateStreak(user);
        String token = jwtUtil.generateToken(user.getEmail().trim().toLowerCase());

        return buildResponse(user, token, streak, "Welcome to EcoVerse, " + user.getName() + "!");
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail() == null ? "" : request.getEmail().trim().toLowerCase();
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword()));

        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserStreak streak = streakService.updateStreak(user);
        String token = jwtUtil.generateToken(user.getEmail().trim().toLowerCase());

        String msg = streak.getCurrentStreak() > 1
                ? "Day " + streak.getCurrentStreak() + " streak! Keep it up! \uD83D\uDD25"
                : "Welcome back, " + user.getName() + "!";

        return buildResponse(user, token, streak, msg);
    }

    private AuthResponse buildResponse(User user, String token, UserStreak streak, String msg) {
        return AuthResponse.builder()
                .token(token).name(user.getName()).email(user.getEmail())
                .role(user.getRole().normalized()).totalXp(user.getTotalXp())
                .currentStreak(streak.getCurrentStreak())
                .longestStreak(streak.getLongestStreak())
                .provider(user.getProvider())
                .pictureUrl(user.getPictureUrl())
                 .message(msg).build();
    }
}
