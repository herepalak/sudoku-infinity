package com.sudokuinfinity.repository;

import com.sudokuinfinity.entity.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {

    Optional<GameSession> findByUserIdAndPuzzleIdAndStatus(Long userId, Long puzzleId, String status);

    List<GameSession> findByUserIdAndStatusOrderByUpdatedAtDesc(Long userId, String status);

    @Query("SELECT AVG(gs.elapsedSeconds) FROM GameSession gs WHERE gs.user.id = :userId AND gs.status = 'COMPLETED'")
    Double findAvgSolveTimeByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(gs) FROM GameSession gs WHERE gs.user.id = :userId AND gs.status = 'COMPLETED'")
    Long countCompletedByUserId(@Param("userId") Long userId);

    List<GameSession> findTop5ByUserIdAndStatusOrderByScoreDesc(Long userId, String status);
}
