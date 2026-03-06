package com.ecoverse.dto;

import com.ecoverse.entity.Question;
import com.ecoverse.entity.Quiz;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class QuizDTO {

    // ── Admin: Create quiz request body ─────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateQuizRequest {

        @NotBlank(message = "Quiz title is required")
        @Size(min = 3, max = 200, message = "Title must be 3–200 characters")
        private String title;

        private String description;

        @Min(value = 10, message = "XP reward must be at least 10")
        @Max(value = 1000, message = "XP reward cannot exceed 1000")
        private Integer xpReward = 100;

        @NotEmpty(message = "Quiz must have at least one question")
        @Valid
        private List<QuestionRequest> questions;
    }

    // ── Single question inside CreateQuizRequest ─────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionRequest {

        @NotBlank(message = "Question text is required")
        private String questionText;

        @NotBlank(message = "Option A is required")
        private String optionA;

        @NotBlank(message = "Option B is required")
        private String optionB;

        @NotBlank(message = "Option C is required")
        private String optionC;

        @NotBlank(message = "Option D is required")
        private String optionD;

        @NotBlank(message = "Correct option is required")
        @Pattern(regexp = "[ABCDabcd]", message = "Correct option must be A, B, C, or D")
        private String correctOption;
    }

    // ── Response: Quiz summary (used in list views) ──────────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizSummaryResponse {
        private Long id;
        private String title;
        private String description;
        private Integer xpReward;
        private Integer questionCount;
        private LocalDateTime createdAt;

        // Convert Quiz entity → QuizSummaryResponse
        public static QuizSummaryResponse from(Quiz quiz) {
            return QuizSummaryResponse.builder()
                    .id(quiz.getId())
                    .title(quiz.getTitle())
                    .description(quiz.getDescription())
                    .xpReward(quiz.getXpReward())
                    .questionCount(quiz.getQuestions().size())
                    .createdAt(quiz.getCreatedAt())
                    .build();
        }
    }

    // ── Response: Full quiz with questions (admin view) ──────────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuizDetailResponse {
        private Long id;
        private String title;
        private String description;
        private Integer xpReward;
        private LocalDateTime createdAt;
        private List<QuestionResponse> questions;

        public static QuizDetailResponse from(Quiz quiz) {
            return QuizDetailResponse.builder()
                    .id(quiz.getId())
                    .title(quiz.getTitle())
                    .description(quiz.getDescription())
                    .xpReward(quiz.getXpReward())
                    .createdAt(quiz.getCreatedAt())
                    .questions(quiz.getQuestions().stream()
                            .map(QuestionResponse::from)
                            .collect(Collectors.toList()))
                    .build();
        }
    }

    // ── Response: Question with correct answer (admin only) ──────────────────
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionResponse {
        private Long id;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctOption;   // shown only in admin view

        public static QuestionResponse from(Question q) {
            return QuestionResponse.builder()
                    .id(q.getId())
                    .questionText(q.getQuestionText())
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .correctOption(q.getCorrectOption())
                    .build();
        }
    }

    // ── Response: Question WITHOUT correct answer (player view) ─────────────
    // Used in Sprint 4 — defined here so it's easy to find
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionPlayerResponse {
        private Long id;
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        // correctOption intentionally OMITTED

        public static QuestionPlayerResponse from(Question q) {
            return QuestionPlayerResponse.builder()
                    .id(q.getId())
                    .questionText(q.getQuestionText())
                    .optionA(q.getOptionA())
                    .optionB(q.getOptionB())
                    .optionC(q.getOptionC())
                    .optionD(q.getOptionD())
                    .build();
        }
    }
}