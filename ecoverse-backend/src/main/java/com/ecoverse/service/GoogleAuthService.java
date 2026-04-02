package com.ecoverse.service;

import com.ecoverse.dto.AuthDTO.AuthResponse;
import com.ecoverse.entity.User;
import com.ecoverse.entity.UserStreak;
import com.ecoverse.repository.UserRepository;
import com.ecoverse.security.JwtUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private final UserRepository      userRepository;
    private final JwtUtil             jwtUtil;
    private final UserDetailsService  userDetailsService;
    private final StreakService        streakService;

    @Value("${google.client-id}")
    private String googleClientId;

    @Transactional
    public AuthResponse authenticateGoogleUser(String idTokenString) {
        // Step 1: Verify the token with Google
        GoogleIdToken.Payload payload = verifyToken(idTokenString);
        if (payload == null) {
            throw new IllegalArgumentException("Invalid Google token. Please try again.");
        }

        // Step 2: Extract user info from verified token
        String email      = payload.getEmail();
        String name       = (String) payload.get("name");
        String pictureUrl = (String) payload.get("picture");

        // Step 3: Find existing user or create new one
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            // New user — auto-register via Google
            user = User.builder()
                    .name(name != null ? name : email.split("@")[0])
                    .email(email)
                    .password(null)           // No password for Google users
                    .role(User.Role.USER)
                    .provider("GOOGLE")
                    .pictureUrl(pictureUrl)
                    .totalXp(0)
                    .build();
            userRepository.save(user);
            log.info("New Google user registered: {}", email);
        } else {
            // Existing user — keep custom profile photo; only fill when empty
            String existing = user.getPictureUrl();
            boolean missing = existing == null || existing.trim().isEmpty();
            if (missing && pictureUrl != null && !pictureUrl.trim().isEmpty()) {
                user.setPictureUrl(pictureUrl);
                userRepository.save(user);
            }
            log.info("Google user logged in: {}", email);
        }

        // Step 4: Update streak and generate our JWT
        UserStreak streak = streakService.updateStreak(user);
        UserDetails ud    = userDetailsService.loadUserByUsername(user.getEmail());
        String jwt = jwtUtil.generateToken(user.getEmail());

        String msg = user.getProvider().equals("GOOGLE") && streak.getCurrentStreak() > 1
                ? "Day " + streak.getCurrentStreak() + " streak! \uD83D\uDD25"
                : "Welcome to EcoVerse, " + user.getName() + "! \uD83C\uDF0D";

        return AuthResponse.builder()
                .token(jwt)
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().normalized())
                .totalXp(user.getTotalXp())
                .currentStreak(streak.getCurrentStreak())
                .longestStreak(streak.getLongestStreak())
                .provider(user.getProvider())
                .pictureUrl(user.getPictureUrl())
                .message(msg)
                .build();
    }

    private GoogleIdToken.Payload verifyToken(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory()
            )
            .setAudience(Collections.singletonList(googleClientId))
            .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                return idToken.getPayload();
            }
        } catch (Exception e) {
            log.error("Google token verification failed: {}", e.getMessage());
        }
        return null;
    }
}
