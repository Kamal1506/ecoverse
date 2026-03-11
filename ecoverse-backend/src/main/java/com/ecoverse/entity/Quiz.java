package com.ecoverse.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "quiz")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String title;

    @Column(length = 300)
    private String description;

    @Column(name = "xp_reward", nullable = false)
    @Builder.Default
    private Integer xpReward = 100;

    // Feature 4: Difficulty tier — BEGINNER / INTERMEDIATE / EXPERT
    @Column(nullable = false, length = 15)
    @Builder.Default
    private String difficulty = "BEGINNER";

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}