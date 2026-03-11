package com.ecoverse.service;

import com.ecoverse.dto.AttemptDTO.*;
import com.ecoverse.entity.*;
import com.ecoverse.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuizAttemptService {

    private final QuizRepository        quizRepository;
    private final QuestionRepository    questionRepository;
    private final ResultRepository      resultRepository;
    private final UserRepository        userRepository;
    private final StreakService         streakService;
    private final BadgeService          badgeService;
    private final UserStreakRepository  userStreakRepository;

    @Transactional
    public AttemptResponse submitAttempt(Long quizId, Long userId, AttemptRequest request) {
        if (request == null || request.getAnswers() == null) {
            throw new IllegalArgumentException("Answers are required");
        }

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Feature 3: Replay protection — check if first attempt
        boolean isFirstAttempt = !resultRepository.existsByUserIdAndQuizId(userId, quizId);

        List<Question> questions = questionRepository.findByQuizId(quizId);
        if (questions.isEmpty()) throw new IllegalArgumentException("Quiz has no questions");

        Map<Long, String> correctAnswers = questions.stream()
                .collect(Collectors.toMap(Question::getId, Question::getCorrectOption));

        int correctCount = 0;
        for (Map.Entry<Long, String> entry : request.getAnswers().entrySet()) {
            String selected = entry.getValue() != null ? entry.getValue().toUpperCase().trim() : "";
            String correct  = correctAnswers.get(entry.getKey());
            if (correct != null && correct.equals(selected)) correctCount++;
        }

        int totalQuestions = questions.size();
        int percentage     = (int) Math.round((double) correctCount / totalQuestions * 100);
        String rank        = calcRank(percentage);

        // Feature 1: Apply streak XP multiplier (only on first attempt to prevent abuse)
        double multiplier = 1.0;
        if (isFirstAttempt) {
            multiplier = userStreakRepository.findByUserId(userId)
                    .map(UserStreak::getXpMultiplier).orElse(1.0);
        }
        int xpEarned = isFirstAttempt
                ? (int) Math.round(correctCount * quiz.getXpReward() * multiplier)
                : 0;   // Feature 3: No XP on replay

        List<AttemptReviewItem> review = questions.stream()
                .map(q -> {
                    String selectedRaw = request.getAnswers().get(q.getId());
                    String selected = selectedRaw != null ? selectedRaw.toUpperCase().trim() : null;
                    String correct = q.getCorrectOption() != null ? q.getCorrectOption().toUpperCase().trim() : null;
                    boolean isCorrect = selected != null && correct != null && correct.equals(selected);

                    return AttemptReviewItem.builder()
                            .questionId(q.getId())
                            .questionText(q.getQuestionText())
                            .selectedOption(selected)
                            .selectedText(optionText(q, selected))
                            .correctOption(correct)
                            .correctText(optionText(q, correct))
                            .correct(isCorrect)
                            .build();
                })
                .toList();

        Result result = Result.builder()
                .user(user).quiz(quiz).score(correctCount)
                .totalQuestions(totalQuestions).percentage(percentage)
                .rank(rank).xpEarned(xpEarned).build();
        resultRepository.save(result);

        // Feature 3: Only add XP on first attempt
        if (isFirstAttempt) {
            user.setTotalXp(user.getTotalXp() + xpEarned);
            userRepository.save(user);
        }

        // Feature 2: Evaluate badges
        List<Badge> newBadges = badgeService.evaluateAndAward(user, result);

        return AttemptResponse.builder()
                .resultId(result.getId()).score(correctCount)
                .totalQuestions(totalQuestions).percentage(percentage)
                .rank(rank).xpEarned(xpEarned).totalXp(user.getTotalXp())
                .multiplier(multiplier).isFirstAttempt(isFirstAttempt)
                .newBadges(newBadges.stream()
                        .map(b -> b.getIcon() + " " + b.getName())
                        .collect(Collectors.toList()))
                .review(review)
                .message(buildMessage(rank, user.getName(), isFirstAttempt, multiplier))
                .build();
    }

    @Transactional(readOnly = true)
    public List<ResultHistoryItem> getMyResults(Long userId) {
        return resultRepository.findByUserIdOrderByAttemptedAtDesc(userId).stream()
                .map(r -> ResultHistoryItem.builder()
                        .resultId(r.getId()).quizTitle(r.getQuiz().getTitle())
                        .score(r.getScore()).totalQuestions(r.getTotalQuestions())
                        .percentage(r.getPercentage()).rank(r.getRank())
                        .xpEarned(r.getXpEarned()).attemptedAt(r.getAttemptedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private String calcRank(int pct) {
        if (pct >= 90) return "S";
        if (pct >= 75) return "A";
        if (pct >= 50) return "B";
        return "C";
    }

    private String buildMessage(String rank, String name, boolean first, double mult) {
        String base = switch (rank) {
            case "S" -> "LEGENDARY! " + name + " is an EcoVerse master! \uD83C\uDF0D";
            case "A" -> "EXCELLENT! " + name + " knows their eco-facts! \uD83C\uDF3F";
            case "B" -> "GOOD JOB! " + name + " is on the right path! \u267B\uFE0F";
            default  -> "KEEP LEARNING! Every mission makes you stronger! \uD83D\uDCAA";
        };
        if (!first) base += " (Replay — no XP awarded)";
        else if (mult > 1.0) base += " (Streak bonus " + mult + "x applied!)";
        return base;
    }

    private String optionText(Question q, String opt) {
        if (q == null || opt == null) return null;
        return switch (opt) {
            case "A" -> q.getOptionA();
            case "B" -> q.getOptionB();
            case "C" -> q.getOptionC();
            case "D" -> q.getOptionD();
            default -> null;
        };
    }
}
