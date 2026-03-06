package com.ecoverse.service;

import com.ecoverse.dto.QuizDTO.CreateQuizRequest;
import com.ecoverse.dto.QuizDTO.QuestionRequest;
import com.ecoverse.dto.QuizDTO.QuizDetailResponse;
import com.ecoverse.dto.QuizDTO.QuizSummaryResponse;
import com.ecoverse.entity.Question;
import com.ecoverse.entity.Quiz;
import com.ecoverse.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;

    @Transactional
    public QuizDetailResponse createQuiz(CreateQuizRequest request) {
        if (quizRepository.existsByTitle(request.getTitle())) {
            throw new IllegalArgumentException("Quiz title already exists: " + request.getTitle());
        }

        Quiz quiz = Quiz.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .xpReward(request.getXpReward())
                .build();

        List<Question> questions = request.getQuestions().stream()
                .map(q -> toQuestionEntity(q, quiz))
                .toList();
        quiz.setQuestions(questions);

        Quiz saved = quizRepository.save(quiz);
        return QuizDetailResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public List<QuizSummaryResponse> getAllQuizzes() {
        return quizRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(QuizSummaryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public QuizDetailResponse getQuizById(Long id) {
        Quiz quiz = quizRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Quiz not found with id: " + id));
        return QuizDetailResponse.from(quiz);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        if (!quizRepository.existsById(id)) {
            throw new IllegalArgumentException("Quiz not found with id: " + id);
        }
        quizRepository.deleteById(id);
    }

    private Question toQuestionEntity(QuestionRequest request, Quiz quiz) {
        return Question.builder()
                .quiz(quiz)
                .questionText(request.getQuestionText())
                .optionA(request.getOptionA())
                .optionB(request.getOptionB())
                .optionC(request.getOptionC())
                .optionD(request.getOptionD())
                .correctOption(request.getCorrectOption().toUpperCase())
                .build();
    }
}
