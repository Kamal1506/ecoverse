package com.ecoverse.controller;

import com.ecoverse.dto.QuizDTO.*;
import com.ecoverse.service.CsvUploadService;
import com.ecoverse.service.CsvUploadService.CsvUploadResult;
import com.ecoverse.service.QuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final QuizService       quizService;
    private final CsvUploadService  csvUploadService;

    // ── POST /api/quizzes ─────────────────────────────────────────────────────
    // Admin creates a quiz manually with questions
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizDetailResponse> createQuiz(
            @Valid @RequestBody CreateQuizRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(quizService.createQuiz(request));
    }

    // ── POST /api/quizzes/upload ──────────────────────────────────────────────
    // Admin bulk-creates quizzes from a CSV file
    // Must be declared BEFORE /{id} to avoid route conflict
    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> uploadCsv(
            @RequestParam("file") MultipartFile file) {

        CsvUploadResult result = csvUploadService.uploadFromCsv(file);

        // Build a descriptive response message
        String message = String.format(
            "Upload complete! Created %d quiz%s with %d question%s.",
            result.quizzesCreated(),
            result.quizzesCreated() == 1 ? "" : "zes",
            result.questionsCreated(),
            result.questionsCreated() == 1 ? "" : "s"
        );

        Map<String, Object> response = new java.util.LinkedHashMap<>();
        response.put("message",          message);
        response.put("quizzesCreated",   result.quizzesCreated());
        response.put("questionsCreated", result.questionsCreated());
        response.put("skippedRows",      result.skippedRows());

        if (!result.skippedDuplicateTitles().isEmpty()) {
            response.put("skippedDuplicates", result.skippedDuplicateTitles());
            response.put("warning",
                "Some quizzes were skipped because their titles already exist in the database.");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── GET /api/quizzes ──────────────────────────────────────────────────────
    // Both ADMIN and USER — list all quizzes (summary, no answers)
    @GetMapping
    public ResponseEntity<List<QuizSummaryResponse>> getAllQuizzes() {
        return ResponseEntity.ok(quizService.getAllQuizzes());
    }

    // ── GET /api/quizzes/{id} ─────────────────────────────────────────────────
    // Admin only — full detail including correct answers
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuizDetailResponse> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    // ── GET /api/quizzes/{id}/questions ───────────────────────────────────────
    // Players — questions WITHOUT correct answers
    @GetMapping("/{id}/questions")
    public ResponseEntity<List<QuestionPlayerResponse>> getQuestionsForPlayer(
            @PathVariable Long id) {

        QuizDetailResponse quiz = quizService.getQuizById(id);

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
                .toList();

        return ResponseEntity.ok(playerQuestions);
    }

    // ── DELETE /api/quizzes/{id} ──────────────────────────────────────────────
    // Admin only — deletes quiz and all its questions (cascade)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok(Map.of("message", "Quiz deleted successfully"));
    }
}