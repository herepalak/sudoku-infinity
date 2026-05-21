package com.sudokuinfinity.repository;

import com.sudokuinfinity.entity.Puzzle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PuzzleRepository extends JpaRepository<Puzzle, Long> {

    Optional<Puzzle> findBySeed(String seed);

    Optional<Puzzle> findByIsDailyChallengeAndDailyDate(Boolean isDaily, LocalDate date);

    List<Puzzle> findByIsStoryModeAndStoryChapter(Boolean isStory, Integer chapter);

    Page<Puzzle> findByDifficultyAndVariant(String difficulty, String variant, Pageable pageable);

    @Query("SELECT p FROM Puzzle p WHERE p.difficulty = :diff AND p.variant = :variant ORDER BY RANDOM() LIMIT 1")
    Optional<Puzzle> findRandomByDifficultyAndVariant(@Param("diff") String difficulty, @Param("variant") String variant);

    @Query("SELECT COUNT(p) FROM Puzzle p WHERE p.isStoryMode = true AND p.storyChapter = :chapter")
    int countStoryLevelsInChapter(@Param("chapter") Integer chapter);

    List<Puzzle> findByIsStoryModeOrderByStoryChapterAscStoryLevelAsc(Boolean isStory);
}
