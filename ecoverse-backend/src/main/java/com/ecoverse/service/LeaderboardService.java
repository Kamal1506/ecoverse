package com.ecoverse.service;

import com.ecoverse.repository.ResultRepository;
import com.ecoverse.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository   userRepository;
    private final ResultRepository resultRepository;

    // ── Top 20 players by totalXp ────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLeaderboard() {
        List<Object[]> rows = resultRepository.findLeaderboard();
        List<Map<String, Object>> board = new ArrayList<>();

        int rank = 1;
        for (Object[] row : rows) {
            if (rank > 20) break;
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("rank",    rank++);
            entry.put("userId",  row[0]);
            entry.put("name",    row[1]);
            entry.put("totalXp", row[2]);
            entry.put("level",   calculateLevel((int) row[2]));
            board.add(entry);
        }
        return board;
    }

    // ── Admin analytics ──────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public Map<String, Object> getAnalytics() {
        long totalUsers    = userRepository.count();
        long totalAttempts = resultRepository.count();

        Map<String, Object> analytics = new LinkedHashMap<>();
        analytics.put("totalUsers",    totalUsers);
        analytics.put("totalAttempts", totalAttempts);
        analytics.put("leaderboard",   getLeaderboard());
        return analytics;
    }

    private int calculateLevel(int xp) {
        if (xp >= 7000) return 6;
        if (xp >= 4500) return 5;
        if (xp >= 2500) return 4;
        if (xp >= 1200) return 3;
        if (xp >= 500)  return 2;
        return 1;
    }
}