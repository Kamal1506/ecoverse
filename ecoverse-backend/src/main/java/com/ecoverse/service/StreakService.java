package com.ecoverse.service;

import com.ecoverse.entity.User;
import com.ecoverse.entity.UserStreak;
import com.ecoverse.repository.UserStreakRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Slf4j
@Service
@RequiredArgsConstructor
public class StreakService {

    private final UserStreakRepository streakRepository;

    // Called on every login — updates streak and returns current streak
    @Transactional
    public UserStreak updateStreak(User user) {
        UserStreak streak = streakRepository.findByUserId(user.getId())
                .orElse(UserStreak.builder().user(user).build());

        LocalDate today     = LocalDate.now();
        LocalDate lastLogin = streak.getLastLoginDate();

        if (lastLogin == null) {
            // First ever login
            streak.setCurrentStreak(1);
        } else if (lastLogin.equals(today)) {
            // Already logged in today — no change
        } else if (lastLogin.equals(today.minusDays(1))) {
            // Consecutive day — increment
            streak.setCurrentStreak(streak.getCurrentStreak() + 1);
        } else {
            // Missed a day — reset
            streak.setCurrentStreak(1);
        }

        streak.setLastLoginDate(today);
        if (streak.getCurrentStreak() > streak.getLongestStreak()) {
            streak.setLongestStreak(streak.getCurrentStreak());
        }

        return streakRepository.save(streak);
    }

    @Transactional(readOnly = true)
    public UserStreak getStreak(Long userId) {
        return streakRepository.findByUserId(userId)
                .orElse(UserStreak.builder().currentStreak(0).longestStreak(0).build());
    }
}