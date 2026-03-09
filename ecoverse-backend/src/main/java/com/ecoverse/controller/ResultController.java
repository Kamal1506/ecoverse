package com.ecoverse.controller;

import com.ecoverse.dto.AttemptDTO.*;
import com.ecoverse.entity.User;
import com.ecoverse.repository.UserRepository;
import com.ecoverse.service.QuizAttemptService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ResultController {

    private final QuizAttemptService quizAttemptService;
    private final UserRepository     userRepository;

    // ── POST /api/quizzes/{id}/attempt ───────────────────────────────────────
    // Player submits answers → gets score, rank, XP
    @PostMapping("/quizzes/{quizId}/attempt")
    public ResponseEntity<AttemptResponse> submitAttempt(
            @PathVariable Long quizId,
            @Valid @RequestBody AttemptRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = resolveUserId(userDetails);
        AttemptResponse response = quizAttemptService.submitAttempt(
                quizId, userId, request);
        return ResponseEntity.ok(response);
    }

    // ── GET /api/results/me ──────────────────────────────────────────────────
    // Player gets their own result history
    @GetMapping("/results/me")
    public ResponseEntity<List<ResultHistoryItem>> getMyResults(
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = resolveUserId(userDetails);
        return ResponseEntity.ok(quizAttemptService.getMyResults(userId));
    }

    // ── Helper: get userId from Spring Security's UserDetails ────────────────
    private Long resolveUserId(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return user.getId();
    }
}