package com.ecoverse.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AttemptDTO {

    // ── POST /api/quizzes/{id}/attempt ───────────────────────────────────────
    // Player submits: { answers: { "1": "A", "2": "C", "3": "B" ... } }
    // Key = questionId (as string), Value = selected option letter (A/B/C/D)
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttemptRequest {

        @NotEmpty(message = "Answers map cannot be empty")
        private Map<Long, String> answers;  // questionId → selected option
    }

    // ── Response after scoring ────────────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttemptResponse {
        private Long   resultId;
        private int    score;           // correct count
        private int    totalQuestions;
        private int    percentage;      // 0-100
        private String rank;            // S / A / B / C
        private int    xpEarned;
        private int    totalXp;         // user's new total XP
        private String message;         // motivational message
        private List<AnswerReviewItem> answerReview;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerReviewItem {
        private Long    questionId;
        private Integer questionNumber;
        private String  questionText;
        private String  yourOption;
        private String  yourAnswerText;
        private String  correctOption;
        private String  correctAnswerText;
        private boolean correct;
    }

    // ── My Results (player history) ───────────────────────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResultHistoryItem {
        private Long          resultId;
        private String        quizTitle;
        private int           score;
        private int           totalQuestions;
        private int           percentage;
        private String        rank;
        private int           xpEarned;
        private LocalDateTime attemptedAt;
    }
}
