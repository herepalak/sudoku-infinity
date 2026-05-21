package com.sudokuinfinity.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_leaderboard",
       uniqueConstraints = @UniqueConstraint(columnNames = {"daily_date", "user_id"}))
public class DailyLeaderboard {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "daily_date", nullable = false) private LocalDate dailyDate;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Column(name = "solve_time_seconds", nullable = false) private Long solveTimeSeconds;
    @Column(name = "mistakes") private Integer mistakes = 0;
    @Column(name = "hints_used") private Integer hintsUsed = 0;
    @Column(name = "score", nullable = false) private Integer score;
    @Column(name = "rank") private Integer rank;
    @CreationTimestamp @Column(name = "submitted_at", updatable = false) private LocalDateTime submittedAt;

    public DailyLeaderboard() {}

    public Long getId() { return id; }
    public LocalDate getDailyDate() { return dailyDate; }
    public void setDailyDate(LocalDate dailyDate) { this.dailyDate = dailyDate; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Long getSolveTimeSeconds() { return solveTimeSeconds; }
    public void setSolveTimeSeconds(Long solveTimeSeconds) { this.solveTimeSeconds = solveTimeSeconds; }
    public Integer getMistakes() { return mistakes; }
    public void setMistakes(Integer mistakes) { this.mistakes = mistakes; }
    public Integer getHintsUsed() { return hintsUsed; }
    public void setHintsUsed(Integer hintsUsed) { this.hintsUsed = hintsUsed; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getRank() { return rank; }
    public void setRank(Integer rank) { this.rank = rank; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final DailyLeaderboard d = new DailyLeaderboard();
        public Builder dailyDate(LocalDate v) { d.dailyDate = v; return this; }
        public Builder user(User v) { d.user = v; return this; }
        public Builder solveTimeSeconds(Long v) { d.solveTimeSeconds = v; return this; }
        public Builder mistakes(Integer v) { d.mistakes = v; return this; }
        public Builder hintsUsed(Integer v) { d.hintsUsed = v; return this; }
        public Builder score(Integer v) { d.score = v; return this; }
        public DailyLeaderboard build() { return d; }
    }
}