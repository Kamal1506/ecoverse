package com.ecoverse.service;

import com.ecoverse.entity.*;
import com.ecoverse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository     badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ResultRepository    resultRepository;
    private final UserStreakRepository streakRepository;

    // Evaluate all badges after a quiz attempt — returns newly earned badges
    @Transactional
    public List<Badge> evaluateAndAward(User user, Result result) {
        Set<Long> alreadyEarned = userBadgeRepository.findBadgeIdsByUserId(user.getId());
        List<Badge> allBadges   = badgeRepository.findAll();
        List<Badge> newlyEarned = new ArrayList<>();

        long totalAttempts = resultRepository.findByUserIdOrderByAttemptedAtDesc(user.getId()).size();
        int  currentStreak = streakRepository.findByUserId(user.getId())
                .map(UserStreak::getCurrentStreak).orElse(0);

        for (Badge badge : allBadges) {
            if (alreadyEarned.contains(badge.getId())) continue;

            String conditionType = badge.getConditionType();
            boolean earned = conditionType != null && switch (conditionType) {
                case "ATTEMPT_COUNT"  -> totalAttempts >= badge.getConditionValue();
                case "PERFECT_SCORE"  -> result.getPercentage() == 100;
                case "STREAK"         -> currentStreak >= badge.getConditionValue();
                case "XP_TOTAL"       -> user.getTotalXp() >= badge.getConditionValue();
                case "RANK_S"         -> "S".equals(result.getRank());
                default -> false;
            };

            if (earned) {
                userBadgeRepository.save(UserBadge.builder()
                        .user(user).badge(badge).build());
                newlyEarned.add(badge);
                log.info("Badge earned: {} -> {}", user.getEmail(), badge.getName());
            }
        }
        return newlyEarned;
    }

    // Get all badges with earned status for a user
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getBadgesForUser(Long userId) {
        Set<Long> earnedIds = userBadgeRepository.findBadgeIdsByUserId(userId);
        List<UserBadge> userBadges = userBadgeRepository.findByUserId(userId);
        Map<Long, UserBadge> earnedMap = userBadges.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), ub -> ub));

        return badgeRepository.findAll().stream().map(b -> {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("id",          b.getId());
            entry.put("code",        b.getCode());
            entry.put("name",        b.getName());
            entry.put("description", b.getDescription());
            entry.put("icon",        b.getIcon());
            entry.put("rarity",      b.getRarity());
            entry.put("earned",      earnedIds.contains(b.getId()));
            entry.put("earnedAt",    earnedMap.containsKey(b.getId())
                    ? earnedMap.get(b.getId()).getEarnedAt() : null);
            return entry;
        }).collect(Collectors.toList());
    }
}
