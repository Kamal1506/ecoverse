package com.ecoverse.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity @Table(name = "user_streak")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class UserStreak {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "current_streak", nullable = false) @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "longest_streak", nullable = false) @Builder.Default
    private Integer longestStreak = 0;

    @Column(name = "last_login_date")
    private LocalDate lastLoginDate;

    public double getXpMultiplier() {
        if (currentStreak >= 7) return 2.0;
        if (currentStreak >= 3) return 1.5;
        return 1.0;
    }
}