package com.ecoverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "result")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Result {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(nullable = false)
    private Integer score;          // number of correct answers

    @Column(name = "xp_earned", nullable = false)
    private Integer xpEarned;       // XP awarded for this attempt

    @Column(nullable = false)
    private Integer percentage;     // 0–100

    @Column(name = "`rank`", length = 1, nullable = false)
    private String rank;            // S / A / B / C

    @Column(name = "total_questions", nullable = false)
    private Integer totalQuestions;

    @CreationTimestamp
    @Column(name = "attempted_at", updatable = false)
    private LocalDateTime attemptedAt;
}
