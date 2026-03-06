package com.ecoverse.repository;

import com.ecoverse.entity.Quiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    // Check for duplicate quiz titles before saving
    boolean existsByTitle(String title);

    // Used by admin to list all quizzes ordered by newest first
    List<Quiz> findAllByOrderByCreatedAtDesc();
}