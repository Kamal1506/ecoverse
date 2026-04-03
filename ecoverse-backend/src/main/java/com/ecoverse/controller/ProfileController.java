package com.ecoverse.controller;

import com.ecoverse.dto.AttemptDTO.ResultHistoryItem;
import com.ecoverse.dto.ProfileUpdateRequest;
import com.ecoverse.entity.User;
import com.ecoverse.entity.UserStreak;
import com.ecoverse.repository.UserRepository;
import com.ecoverse.service.BadgeService;
import com.ecoverse.service.ProfileImageService;
import com.ecoverse.service.QuizAttemptService;
import com.ecoverse.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository      userRepository;
    private final BadgeService        badgeService;
    private final StreakService       streakService;
    private final QuizAttemptService  attemptService;
    private final ProfileImageService profileImageService;

    // GET /api/profile/me - full profile with streak + badges + history
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyProfile(
            @AuthenticationPrincipal UserDetails ud) {

        User user = userRepository.findByEmailIgnoreCase(ud.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserStreak streak = streakService.getStreak(user.getId());
        List<Map<String, Object>> badges = badgeService.getBadgesForUser(user.getId());
        List<ResultHistoryItem> history  = attemptService.getMyResults(user.getId());

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("name",          user.getName());
        profile.put("email",         user.getEmail());
        profile.put("pictureUrl",    user.getPictureUrl());
        profile.put("nationality",   user.getNationality());
        profile.put("bio",           user.getBio());
        profile.put("totalXp",       user.getTotalXp());
        profile.put("currentStreak", streak.getCurrentStreak());
        profile.put("longestStreak", streak.getLongestStreak());
        profile.put("badges",        badges);
        profile.put("history",       history);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/me")
    public ResponseEntity<Map<String, Object>> updateMyProfile(
            @AuthenticationPrincipal UserDetails ud,
            @RequestBody ProfileUpdateRequest request) {

        User user = userRepository.findByEmailIgnoreCase(ud.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String name = trimToNull(request.getName());
        if (name != null) {
            if (name.length() < 2 || name.length() > 80) {
                throw new IllegalArgumentException("Name must be 2 to 80 characters");
            }
            user.setName(name);
        }

        String nationality = trimToNull(request.getNationality());
        if (nationality != null && nationality.length() > 80) {
            throw new IllegalArgumentException("Nationality cannot exceed 80 characters");
        }
        user.setNationality(nationality);

        String bio = trimToNull(request.getBio());
        if (bio != null && bio.length() > 500) {
            throw new IllegalArgumentException("Bio cannot exceed 500 characters");
        }
        user.setBio(bio);

        String pictureUrl = trimToNull(request.getPictureUrl());
        user.setPictureUrl(pictureUrl);

        User saved = userRepository.save(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("name",        saved.getName());
        response.put("email",       saved.getEmail());
        response.put("pictureUrl",  saved.getPictureUrl());
        response.put("nationality", saved.getNationality());
        response.put("bio",         saved.getBio());
        return ResponseEntity.ok(response);
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    @PostMapping("/me/photo")
    public ResponseEntity<Map<String, Object>> uploadMyPhoto(
            @AuthenticationPrincipal UserDetails ud,
            @RequestParam("file") MultipartFile file) {

        User user = userRepository.findByEmailIgnoreCase(ud.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String imageUrl = profileImageService.uploadProfilePhoto(file, user.getId());
        user.setPictureUrl(imageUrl);
        userRepository.save(user);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("pictureUrl", imageUrl);
        return ResponseEntity.ok(response);
    }
}
