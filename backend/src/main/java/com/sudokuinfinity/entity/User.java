package com.sudokuinfinity.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(unique = true, nullable = false, length = 50) private String username;
    @Column(unique = true, nullable = false, length = 100) private String email;
    @Column(nullable = false) private String password;
    @Column(name = "display_name", length = 80) private String displayName;
    @Column(name = "avatar_url") private String avatarUrl;
    @Column(name = "xp_points") private Long xpPoints = 0L;
    @Column(name = "level") private Integer level = 1;
    @Column(name = "current_streak") private Integer currentStreak = 0;
    @Column(name = "longest_streak") private Integer longestStreak = 0;
    @Column(name = "total_puzzles_solved") private Integer totalPuzzlesSolved = 0;
    @Column(name = "total_time_played_seconds") private Long totalTimePlayedSeconds = 0L;
    @Column(name = "preferred_theme", length = 20) private String preferredTheme = "NEON";
    @Column(name = "preferred_difficulty", length = 20) private String preferredDifficulty = "MEDIUM";
    @Column(name = "last_daily_challenge_date") private LocalDateTime lastDailyChallengeDate;
    @Column(name = "is_active") private Boolean isActive = true;
    @Column(name = "role", length = 20) private String role = "USER";
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GameSession> gameSessions = new ArrayList<>();
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Achievement> achievements = new ArrayList<>();
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at") private LocalDateTime updatedAt;

    public User() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }
    public Long getXpPoints() { return xpPoints; }
    public void setXpPoints(Long xpPoints) { this.xpPoints = xpPoints; }
    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }
    public Integer getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(Integer currentStreak) { this.currentStreak = currentStreak; }
    public Integer getLongestStreak() { return longestStreak; }
    public void setLongestStreak(Integer longestStreak) { this.longestStreak = longestStreak; }
    public Integer getTotalPuzzlesSolved() { return totalPuzzlesSolved; }
    public void setTotalPuzzlesSolved(Integer totalPuzzlesSolved) { this.totalPuzzlesSolved = totalPuzzlesSolved; }
    public Long getTotalTimePlayedSeconds() { return totalTimePlayedSeconds; }
    public void setTotalTimePlayedSeconds(Long totalTimePlayedSeconds) { this.totalTimePlayedSeconds = totalTimePlayedSeconds; }
    public String getPreferredTheme() { return preferredTheme; }
    public void setPreferredTheme(String preferredTheme) { this.preferredTheme = preferredTheme; }
    public String getPreferredDifficulty() { return preferredDifficulty; }
    public void setPreferredDifficulty(String preferredDifficulty) { this.preferredDifficulty = preferredDifficulty; }
    public LocalDateTime getLastDailyChallengeDate() { return lastDailyChallengeDate; }
    public void setLastDailyChallengeDate(LocalDateTime lastDailyChallengeDate) { this.lastDailyChallengeDate = lastDailyChallengeDate; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public List<GameSession> getGameSessions() { return gameSessions; }
    public List<Achievement> getAchievements() { return achievements; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final User u = new User();
        public Builder username(String v) { u.username = v; return this; }
        public Builder email(String v) { u.email = v; return this; }
        public Builder password(String v) { u.password = v; return this; }
        public Builder displayName(String v) { u.displayName = v; return this; }
        public Builder avatarUrl(String v) { u.avatarUrl = v; return this; }
        public Builder xpPoints(Long v) { u.xpPoints = v; return this; }
        public Builder level(Integer v) { u.level = v; return this; }
        public Builder currentStreak(Integer v) { u.currentStreak = v; return this; }
        public Builder longestStreak(Integer v) { u.longestStreak = v; return this; }
        public Builder totalPuzzlesSolved(Integer v) { u.totalPuzzlesSolved = v; return this; }
        public Builder totalTimePlayedSeconds(Long v) { u.totalTimePlayedSeconds = v; return this; }
        public Builder preferredTheme(String v) { u.preferredTheme = v; return this; }
        public Builder preferredDifficulty(String v) { u.preferredDifficulty = v; return this; }
        public Builder isActive(Boolean v) { u.isActive = v; return this; }
        public Builder role(String v) { u.role = v; return this; }
        public User build() { return u; }
    }
}