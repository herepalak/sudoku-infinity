package com.sudokuinfinity.dto;
import lombok.*;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CompletePuzzleResponse {
    public Integer score;
    public Integer xpEarned;
    public Integer newLevel;
    public Long totalXp;
    public List<AchievementDTO> newAchievements;
    public LeaderboardEntryDTO leaderboardEntry;
    public String performanceRating;
}
