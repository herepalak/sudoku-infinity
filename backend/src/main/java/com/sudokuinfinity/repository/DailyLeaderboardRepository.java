package com.sudokuinfinity.repository;

import com.sudokuinfinity.entity.DailyLeaderboard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyLeaderboardRepository extends JpaRepository<DailyLeaderboard, Long> {

    List<DailyLeaderboard> findByDailyDateOrderByScoreDesc(LocalDate date);

    Optional<DailyLeaderboard> findByDailyDateAndUserId(LocalDate date, Long userId);

    @Query("SELECT dl FROM DailyLeaderboard dl WHERE dl.dailyDate = :date ORDER BY dl.score DESC LIMIT :limit")
    List<DailyLeaderboard> findTopByDate(@Param("date") LocalDate date, @Param("limit") int limit);

    boolean existsByDailyDateAndUserId(LocalDate date, Long userId);
}
