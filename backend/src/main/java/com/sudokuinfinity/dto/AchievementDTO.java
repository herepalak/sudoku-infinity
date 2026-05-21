package com.sudokuinfinity.dto;
import lombok.*;
import java.time.LocalDateTime;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AchievementDTO {
    public Long id;
    public String achievementKey;
    public String achievementName;
    public String achievementDesc;
    public String icon;
    public Integer xpReward;
    public String rarity;
    public LocalDateTime earnedAt;
}
