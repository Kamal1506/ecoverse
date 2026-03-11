package com.ecoverse.entity;
import jakarta.persistence.*;
import lombok.*;

@Entity @Table(name = "badge")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Badge {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;          // FIRST_QUIZ, PERFECT_SCORE, etc.

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 200)
    private String description;

    @Column(nullable = false, length = 4)
    private String icon;          // emoji

    @Column(name = "condition_type", nullable = false, length = 30)
    private String conditionType; // ATTEMPT_COUNT, PERFECT_SCORE, STREAK, XP_TOTAL, SPEED

    @Column(name = "condition_value", nullable = false)
    private Integer conditionValue;

    @Column(nullable = false, length = 10)
    private String rarity;        // COMMON, RARE, EPIC, LEGENDARY
}