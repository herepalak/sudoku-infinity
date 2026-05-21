package com.sudokuinfinity.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "achievements")
public class Achievement {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "achievement_key", nullable = false, length = 60) private String achievementKey;
    @Column(name = "achievement_name", nullable = false, length = 80) private String achievementName;
    @Column(name = "achievement_desc", length = 200) private String achievementDesc;
    @Column(name = "icon", length = 10) private String icon;
    @Column(name = "xp_reward") private Integer xpReward = 0;
    @Column(name = "rarity", length = 20) private String rarity;
    @CreationTimestamp @Column(name = "earned_at", updatable = false) private LocalDateTime earnedAt;

    public Achievement() {}

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getAchievementKey() { return achievementKey; }
    public void setAchievementKey(String achievementKey) { this.achievementKey = achievementKey; }
    public String getAchievementName() { return achievementName; }
    public void setAchievementName(String achievementName) { this.achievementName = achievementName; }
    public String getAchievementDesc() { return achievementDesc; }
    public void setAchievementDesc(String achievementDesc) { this.achievementDesc = achievementDesc; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public Integer getXpReward() { return xpReward; }
    public void setXpReward(Integer xpReward) { this.xpReward = xpReward; }
    public String getRarity() { return rarity; }
    public void setRarity(String rarity) { this.rarity = rarity; }
    public LocalDateTime getEarnedAt() { return earnedAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Achievement a = new Achievement();
        public Builder user(User v) { a.user = v; return this; }
        public Builder achievementKey(String v) { a.achievementKey = v; return this; }
        public Builder achievementName(String v) { a.achievementName = v; return this; }
        public Builder achievementDesc(String v) { a.achievementDesc = v; return this; }
        public Builder icon(String v) { a.icon = v; return this; }
        public Builder xpReward(Integer v) { a.xpReward = v; return this; }
        public Builder rarity(String v) { a.rarity = v; return this; }
        public Achievement build() { return a; }
    }
}