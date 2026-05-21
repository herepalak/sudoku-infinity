package com.sudokuinfinity.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LeaderboardEntryDTO {
    public Integer rank;
    public String username;
    public String displayName;
    public String avatarUrl;
    public Long solveTimeSeconds;
    public Integer score;
    public Integer mistakes;
    public Integer hintsUsed;
}
