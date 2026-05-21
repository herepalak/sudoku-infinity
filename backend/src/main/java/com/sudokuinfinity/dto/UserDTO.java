package com.sudokuinfinity.dto;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class UserDTO {
    public Long id;
    public String username;
    public String email;
    public String displayName;
    public String avatarUrl;
    public Long xpPoints;
    public Integer level;
    public Integer currentStreak;
    public Integer longestStreak;
    public Integer totalPuzzlesSolved;
    public String preferredTheme;
    public String preferredDifficulty;
    public LocalDateTime createdAt;
    public List<AchievementDTO> recentAchievements;
}
