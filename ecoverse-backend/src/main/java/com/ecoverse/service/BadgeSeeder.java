package com.ecoverse.service;

import com.ecoverse.entity.Badge;
import com.ecoverse.repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

// Seeds the 6 default badges on startup if they don't exist yet
@Slf4j
@Component
@RequiredArgsConstructor
public class BadgeSeeder implements CommandLineRunner {

    private final BadgeRepository badgeRepository;

    @Override
    public void run(String... args) {
        if (badgeRepository.count() > 0) return; // already seeded

        List<Badge> badges = List.of(
            Badge.builder().code("FIRST_STEP").name("First Step")
                .description("Complete your very first quiz mission")
                .icon("\uD83C\uDF31").conditionType("ATTEMPT_COUNT").conditionValue(1)
                .rarity("COMMON").build(),

            Badge.builder().code("ECO_EXPLORER").name("Eco Explorer")
                .description("Complete 5 quiz missions")
                .icon("\uD83E\uDDED").conditionType("ATTEMPT_COUNT").conditionValue(5)
                .rarity("COMMON").build(),

            Badge.builder().code("PERFECTIONIST").name("Perfectionist")
                .description("Score 100% on any quiz")
                .icon("\uD83C\uDF1F").conditionType("PERFECT_SCORE").conditionValue(100)
                .rarity("RARE").build(),

            Badge.builder().code("LEGENDARY_RANK").name("Legendary")
                .description("Achieve S rank on any quiz")
                .icon("\uD83D\uDC51").conditionType("RANK_S").conditionValue(0)
                .rarity("RARE").build(),

            Badge.builder().code("STREAK_WARRIOR").name("Streak Warrior")
                .description("Maintain a 3-day login streak")
                .icon("\uD83D\uDD25").conditionType("STREAK").conditionValue(3)
                .rarity("EPIC").build(),

            Badge.builder().code("XP_MASTER").name("XP Master")
                .description("Earn 1000 total XP")
                .icon("\u26A1").conditionType("XP_TOTAL").conditionValue(1000)
                .rarity("EPIC").build()
        );

        badgeRepository.saveAll(badges);
        log.info("Seeded {} badges", badges.size());
    }
}