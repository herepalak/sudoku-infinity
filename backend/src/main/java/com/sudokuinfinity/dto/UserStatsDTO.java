package com.sudokuinfinity.dto;
import lombok.*;
import java.util.Map;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserStatsDTO {
    public Long totalPuzzlesSolved;
    public Double avgSolveTimeSeconds;
    public Integer currentStreak;
    public Integer longestStreak;
    public Long xpPoints;
    public Integer level;
    public Long xpToNextLevel;
    public Integer rank;
    public Map<String, Integer> solvedByDifficulty;
    public Map<String, Integer> solvedByVariant;
}
