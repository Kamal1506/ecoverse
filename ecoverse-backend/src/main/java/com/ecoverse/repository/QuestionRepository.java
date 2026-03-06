package com.ecoverse.repository;

import com.ecoverse.entity.Question;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    // Fetch all questions for a quiz — used in quiz attempt (Sprint 4)
    List<Question> findByQuizId(Long quizId);

    // Count questions per quiz — used in analytics (Sprint 5)
    long countByQuizId(Long quizId);
}