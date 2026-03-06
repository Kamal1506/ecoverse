package com.ecoverse.controller;

import com.ecoverse.dto.QuizDTO.*;
import com.ecoverse.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService quizService;

    // ── POST /api/quizzes ────────────────────────────────────────────────────
    // Admin creates a quiz manually with questions
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizDetailResponse> createQuiz(
            @Valid @RequestBody CreateQuizRequest request) {

        QuizDetailResponse response = quizService.createQuiz(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── GET /api/quizzes ─────────────────────────────────────────────────────
    // Both ADMIN and USER can list quizzes (summary — no correct answers)
    @GetMapping
    public ResponseEntity<List<QuizSummaryResponse>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    // ── GET /api/quizzes/{id} ─────────────────────────────────────────────────
    // Admin gets full quiz detail including correct answers
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizDetailResponse> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    // ── GET /api/quizzes/{id}/questions ──────────────────────────────────────
    // Player gets questions WITHOUT correct answers (Sprint 4 will use this)
    @GetMapping("/{id}/questions")
    public ResponseEntity<List<QuestionPlayerResponse>> getQuestionsForPlayer(
            @PathVariable Long id) {

        QuizDetailResponse quiz = quizService.getQuizById(id);

        // Map to player-safe response (no correctOption field)
        List<QuestionPlayerResponse> playerQuestions = quiz.getQuestions()
                .stream()
                .map(q -> QuestionPlayerResponse.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(playerQuestions);
    }

    // ── DELETE /api/quizzes/{id} ──────────────────────────────────────────────
    // Admin deletes a quiz (cascades to all questions)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok(Map.of("message", "Quiz deleted successfully"));
    }
}
