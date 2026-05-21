package com.sudokuinfinity.repository;

import com.sudokuinfinity.entity.Achievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    List<Achievement> findByUserIdOrderByEarnedAtDesc(Long userId);
    Optional<Achievement> findByUserIdAndAchievementKey(Long userId, String key);
    boolean existsByUserIdAndAchievementKey(Long userId, String key);
}
