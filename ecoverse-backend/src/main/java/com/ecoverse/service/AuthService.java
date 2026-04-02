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

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtUtil               jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final StreakService         streakService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()))
            throw new IllegalArgumentException("Email already registered.");

        User user = User.builder()
                .name(request.getName()).email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(User.Role.USER).totalXp(0).build();
        userRepository.save(user);

        UserStreak streak = streakService.updateStreak(user);
        String token = jwtUtil.generateToken(user.getEmail());

        return buildResponse(user, token, streak, "Welcome to EcoVerse, " + user.getName() + "!");
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserStreak streak = streakService.updateStreak(user);
        String token = jwtUtil.generateToken(user.getEmail());

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
                .message(msg).build();
    }
}
