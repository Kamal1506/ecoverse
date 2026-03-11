package com.ecoverse.controller;

import com.ecoverse.dto.AttemptDTO.ResultHistoryItem;
import com.ecoverse.entity.User;
import com.ecoverse.entity.UserStreak;
import com.ecoverse.repository.UserRepository;
import com.ecoverse.service.BadgeService;
import com.ecoverse.service.QuizAttemptService;
import com.ecoverse.service.StreakService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository      userRepository;
    private final BadgeService        badgeService;
    private final StreakService       streakService;
    private final QuizAttemptService  attemptService;

    // GET /api/profile/me — full profile with streak + badges + history
    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyProfile(
            @AuthenticationPrincipal UserDetails ud) {

        User user = userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        UserStreak streak = streakService.getStreak(user.getId());
        List<Map<String, Object>> badges = badgeService.getBadgesForUser(user.getId());
        List<ResultHistoryItem> history  = attemptService.getMyResults(user.getId());

        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("name",          user.getName());
        profile.put("email",         user.getEmail());
        profile.put("totalXp",       user.getTotalXp());
        profile.put("currentStreak", streak.getCurrentStreak());
        profile.put("longestStreak", streak.getLongestStreak());
        profile.put("badges",        badges);
        profile.put("history",       history);
        return ResponseEntity.ok(profile);
    }
}