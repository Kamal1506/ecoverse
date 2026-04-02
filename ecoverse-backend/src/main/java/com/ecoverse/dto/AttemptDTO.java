package com.ecoverse.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class AttemptDTO {

    @Data @NoArgsConstructor @AllArgsConstructor
    public static class AttemptRequest {
        @NotEmpty(message = "Answers map cannot be empty")
        private Map<Long, String> answers;
        // questionId -> true if hint was used on that question (costs 50% XP)
        private Map<Long, Boolean> hintsUsed;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AttemptReviewItem {
        private Long    questionId;
        private String  questionText;
        private String  selectedOption; // A/B/C/D or null
        private String  selectedText;   // option text or null
        private String  correctOption;  // A/B/C/D
        private String  correctText;    // option text
        private boolean correct;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AttemptResponse {
        private Long          resultId;
        private int           score;
        private int           totalQuestions;
        private int           percentage;
        private String        rank;
        private int           xpEarned;
        private int           totalXp;
        private double        multiplier;       // streak bonus
        private boolean       isFirstAttempt;
        private List<String>  newBadges;        // newly earned badge names
        private List<AttemptReviewItem> review; // per-question breakdown
        private String        message;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
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
