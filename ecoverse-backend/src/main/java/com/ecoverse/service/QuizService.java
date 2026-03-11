package com.ecoverse.service;

import com.ecoverse.dto.QuizDTO.*;
import com.ecoverse.entity.Question;
import com.ecoverse.entity.Quiz;
import com.ecoverse.repository.QuestionRepository;
import com.ecoverse.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository     quizRepository;
    private final QuestionRepository questionRepository;

    @Transactional
    public QuizDetailResponse createQuiz(CreateQuizRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Quiz title is required");
        }
        if (request.getQuestions() == null || request.getQuestions().isEmpty()) {
            throw new IllegalArgumentException("Quiz must contain at least one question");
        }

        if (quizRepository.existsByTitle(request.getTitle())) {
            throw new IllegalArgumentException(
                "A quiz titled \"" + request.getTitle() + "\" already exists.");
        }

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .xpReward(request.getXpReward() != null ? request.getXpReward() : 100)
                .difficulty(request.getDifficulty() != null ? request.getDifficulty().toUpperCase() : "BEGINNER")
                .build();
        quiz = quizRepository.save(quiz);

        final Quiz savedQuiz = quiz;
        List<Question> questions = request.getQuestions().stream()
                .map(q -> Question.builder()
                        .quiz(savedQuiz)
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .correctOption(q.getCorrectOption() != null ? q.getCorrectOption().toUpperCase() : null)
                        .hint(q.getHint())
                        .explanation(q.getExplanation())
                        .build())
                .collect(Collectors.toList());
        questionRepository.saveAll(questions);

        return toDetailResponse(quiz, questions);
    }

	    @Transactional(readOnly = true)
	    public List<QuizSummaryResponse> getAllQuizzes() {
	        return quizRepository.findAllByOrderByCreatedAtDesc().stream()
	                .map(q -> QuizSummaryResponse.builder()
	                        .id(q.getId())
	                        .title(q.getTitle())
	                        .description(q.getDescription())
	                        .xpReward(q.getXpReward())
	                        .difficulty(q.getDifficulty())
	                        .questionCount(Math.toIntExact(questionRepository.countByQuizId(q.getId())))
	                        .createdAt(q.getCreatedAt())
	                        .build())
	                .collect(Collectors.toList());
	    }

    @Transactional(readOnly = true)
    public QuizDetailResponse getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found: " + id));
        List<Question> questions = questionRepository.findByQuizId(id);
        return toDetailResponse(quiz, questions);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        if (!quizRepository.existsById(id))
            throw new IllegalArgumentException("Quiz not found: " + id);
        quizRepository.deleteById(id);
    }

    private QuizDetailResponse toDetailResponse(Quiz quiz, List<Question> questions) {
        return QuizDetailResponse.builder()
                .id(quiz.getId())
                .title(quiz.getTitle())
                .description(quiz.getDescription())
                .xpReward(quiz.getXpReward())
                .difficulty(quiz.getDifficulty())
                .questions(questions.stream()
                        .map(q -> QuestionResponse.builder()
                                .id(q.getId())
                                .questionText(q.getQuestionText())
                                .optionA(q.getOptionA()).optionB(q.getOptionB())
                                .optionC(q.getOptionC()).optionD(q.getOptionD())
                                .correctOption(q.getCorrectOption())
                                .hint(q.getHint())
                                .explanation(q.getExplanation())
                                .build())
                        .collect(Collectors.toList()))
                .createdAt(quiz.getCreatedAt())
                .build();
    }
}
