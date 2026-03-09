package com.ecoverse.service;

import com.ecoverse.dto.AttemptDTO.AnswerReviewItem;
import com.ecoverse.dto.AttemptDTO.AttemptRequest;
import com.ecoverse.dto.AttemptDTO.AttemptResponse;
import com.ecoverse.dto.AttemptDTO.ResultHistoryItem;
import com.ecoverse.entity.Question;
import com.ecoverse.entity.Quiz;
import com.ecoverse.entity.Result;
import com.ecoverse.entity.User;
import com.ecoverse.repository.QuestionRepository;
import com.ecoverse.repository.QuizRepository;
import com.ecoverse.repository.ResultRepository;
import com.ecoverse.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Service
public class QuizAttemptService {

    private static final Logger log = LoggerFactory.getLogger(QuizAttemptService.class);

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final ResultRepository resultRepository;
    private final UserRepository userRepository;

    public QuizAttemptService(
            QuizRepository quizRepository,
            QuestionRepository questionRepository,
            ResultRepository resultRepository,
            UserRepository userRepository
    ) {
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
        this.resultRepository = resultRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public AttemptResponse submitAttempt(Long quizId, Long userId, AttemptRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found with id: " + quizId));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        List<Question> questions = questionRepository.findByQuizId(quizId);
        if (questions.isEmpty()) {
            throw new IllegalArgumentException("This quiz has no questions.");
        }

        Map<Long, String> correctAnswers = questions.stream()
                .collect(Collectors.toMap(Question::getId, Question::getCorrectOption));

        Map<Long, String> submitted = request.getAnswers();
        if (submitted == null || submitted.isEmpty()) {
            throw new IllegalArgumentException("No answers submitted.");
        }

        int correctCount = 0;
        for (Map.Entry<Long, String> entry : submitted.entrySet()) {
            Long questionId = entry.getKey();
            String selectedOption = entry.getValue() != null ? entry.getValue().toUpperCase().trim() : "";
            String correctOption = correctAnswers.get(questionId);

            if (correctOption != null && correctOption.equals(selectedOption)) {
                correctCount++;
            }
        }

        int totalQuestions = questions.size();
        int percentage = (int) Math.round((double) correctCount / totalQuestions * 100);
        String rank = calculateRank(percentage);
        int xpPerCorrect = quiz.getXpReward() != null ? quiz.getXpReward() : 100;
        int xpEarned = correctCount * xpPerCorrect;
        List<AnswerReviewItem> answerReview = buildAnswerReview(questions, submitted);

        Result result = Result.builder()
                .user(user)
                .quiz(quiz)
                .score(correctCount)
                .totalQuestions(totalQuestions)
                .percentage(percentage)
                .rank(rank)
                .xpEarned(xpEarned)
                .build();
        resultRepository.save(result);

        int currentTotalXp = user.getTotalXp() != null ? user.getTotalXp() : 0;
        int newTotalXp = currentTotalXp + xpEarned;
        user.setTotalXp(newTotalXp);
        userRepository.save(user);

        log.info("Attempt: user={} quiz='{}' score={}/{} rank={} xp=+{}",
                user.getEmail(), quiz.getTitle(), correctCount, totalQuestions, rank, xpEarned);

        return AttemptResponse.builder()
                .resultId(result.getId())
                .score(correctCount)
                .totalQuestions(totalQuestions)
                .percentage(percentage)
                .rank(rank)
                .xpEarned(xpEarned)
                .totalXp(newTotalXp)
                .message(buildMessage(rank, user.getName()))
                .answerReview(answerReview)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ResultHistoryItem> getMyResults(Long userId) {
        return resultRepository.findByUserIdOrderByAttemptedAtDesc(userId)
                .stream()
                .map(r -> ResultHistoryItem.builder()
                        .resultId(r.getId())
                        .quizTitle(r.getQuiz().getTitle())
                        .score(r.getScore())
                        .totalQuestions(r.getTotalQuestions())
                        .percentage(r.getPercentage())
                        .rank(r.getRank())
                        .xpEarned(r.getXpEarned())
                        .attemptedAt(r.getAttemptedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private String calculateRank(int percentage) {
        if (percentage >= 90) return "S";
        if (percentage >= 75) return "A";
        if (percentage >= 50) return "B";
        return "C";
    }

    private String buildMessage(String rank, String name) {
        switch (rank) {
            case "S":
                return "LEGENDARY! " + name + " is an EcoVerse master!";
            case "A":
                return "EXCELLENT! " + name + " knows their eco-facts!";
            case "B":
                return "GOOD JOB! " + name + " is on the right path!";
            default:
                return "KEEP LEARNING! Every mission makes you stronger, " + name + "!";
        }
    }

    private List<AnswerReviewItem> buildAnswerReview(List<Question> questions, Map<Long, String> submitted) {
        return IntStream.range(0, questions.size())
                .mapToObj(index -> {
                    Question q = questions.get(index);
                    String selectedOption = normalizeOption(submitted.get(q.getId()));
                    String correctOption = normalizeOption(q.getCorrectOption());
                    boolean isCorrect = selectedOption != null && selectedOption.equals(correctOption);

                    return AnswerReviewItem.builder()
                            .questionId(q.getId())
                            .questionNumber(index + 1)
                            .questionText(q.getQuestionText())
                            .yourOption(selectedOption)
                            .yourAnswerText(optionTextFor(q, selectedOption))
                            .correctOption(correctOption)
                            .correctAnswerText(optionTextFor(q, correctOption))
                            .correct(isCorrect)
                            .build();
                })
                .collect(Collectors.toList());
    }

    private String normalizeOption(String value) {
        if (value == null) return null;
        String cleaned = value.trim();
        if (cleaned.isEmpty()) return null;
        return cleaned.toUpperCase();
    }

    private String optionTextFor(Question q, String optionLetter) {
        if (optionLetter == null) return null;
        switch (optionLetter) {
            case "A":
                return q.getOptionA();
            case "B":
                return q.getOptionB();
            case "C":
                return q.getOptionC();
            case "D":
                return q.getOptionD();
            default:
                return null;
        }
    }
}
