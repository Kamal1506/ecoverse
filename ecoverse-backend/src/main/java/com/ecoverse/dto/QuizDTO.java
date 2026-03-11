package com.ecoverse.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class QuizDTO {

    // ── Create quiz request ──────────────────────────────────────────────────
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class CreateQuizRequest {
        @NotBlank(message = "Title is required")
        @Size(max = 100)
        private String title;
        private String description;
        private Integer xpReward = 100;
        private String difficulty = "BEGINNER";   // Feature 4
        @NotEmpty(message = "At least one question required")
        private List<QuestionRequest> questions;
    }

    // ── Question request (from admin form or CSV) ────────────────────────────
    @Data @NoArgsConstructor @AllArgsConstructor
    public static class QuestionRequest {
        @NotBlank private String questionText;
        @NotBlank private String optionA;
        @NotBlank private String optionB;
        @NotBlank private String optionC;
        @NotBlank private String optionD;
        @NotBlank private String correctOption;
        private String hint;          // Feature 5
        private String explanation;   // Feature 6
    }

    // ── Quiz summary (list view — no questions) ──────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuizSummaryResponse {
        private Long          id;
        private String        title;
        private String        description;
        private Integer       xpReward;
        private String        difficulty;
        private Integer       questionCount;
        private LocalDateTime createdAt;
    }

    // ── Quiz detail (admin — includes correct answers) ───────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuizDetailResponse {
        private Long                   id;
        private String                 title;
        private String                 description;
        private Integer                xpReward;
        private String                 difficulty;
        private List<QuestionResponse> questions;
        private LocalDateTime          createdAt;
    }

    // ── Full question (admin — has correctOption) ────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuestionResponse {
        private Long   id;
        private String questionText;
        private String optionA, optionB, optionC, optionD;
        private String correctOption;
        private String hint;
        private String explanation;
    }

    // ── Player question (NO correctOption) ───────────────────────────────────
    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuestionPlayerResponse {
        private Long   id;
        private String questionText;
        private String optionA, optionB, optionC, optionD;
        private String hint;          // hint visible to player
        private String explanation;   // shown AFTER answering
    }
}