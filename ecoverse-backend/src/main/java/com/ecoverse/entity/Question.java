package com.ecoverse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "question")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "question_text", nullable = false, length = 500)
    private String questionText;

    @Column(name = "option_a", nullable = false, length = 200)
    private String optionA;
    @Column(name = "option_b", nullable = false, length = 200)
    private String optionB;
    @Column(name = "option_c", nullable = false, length = 200)
    private String optionC;
    @Column(name = "option_d", nullable = false, length = 200)
    private String optionD;

    @Column(name = "correct_option", nullable = false, length = 1)
    private String correctOption;

    // Feature 5: Hint — optional clue, costs 50% XP if used
    @Column(length = 300)
    private String hint;

    // Feature 6: Explanation shown after answer
    @Column(length = 500)
    private String explanation;
}