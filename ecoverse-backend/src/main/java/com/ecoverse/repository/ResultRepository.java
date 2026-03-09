package com.ecoverse.repository;

import com.ecoverse.entity.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResultRepository extends JpaRepository<Result, Long> {

    List<Result> findByUserIdOrderByAttemptedAtDesc(Long userId);

    List<Result> findByQuizId(Long quizId);

    long countByQuizId(Long quizId);

    @Query("SELECT u.id, u.name, u.totalXp FROM User u ORDER BY u.totalXp DESC")
    List<Object[]> findLeaderboard();
}