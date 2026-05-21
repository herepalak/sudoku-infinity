package com.sudokuinfinity.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "puzzles")
public class Puzzle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "seed", nullable = false, unique = true) private String seed;
    @Column(name = "puzzle_data", nullable = false, columnDefinition = "TEXT") private String puzzleData;
    @Column(name = "solution_data", nullable = false, columnDefinition = "TEXT") private String solutionData;
    @Column(name = "difficulty", nullable = false, length = 20) private String difficulty;
    @Column(name = "variant", nullable = false, length = 30) private String variant = "CLASSIC";
    @Column(name = "given_count") private Integer givenCount;
    @Column(name = "estimated_solve_time_seconds") private Integer estimatedSolveTimeSeconds;
    @Column(name = "is_daily_challenge") private Boolean isDailyChallenge = false;
    @Column(name = "daily_date") private LocalDate dailyDate;
    @Column(name = "is_story_mode") private Boolean isStoryMode = false;
    @Column(name = "story_chapter") private Integer storyChapter;
    @Column(name = "story_level") private Integer storyLevel;
    @Column(name = "story_title", length = 100) private String storyTitle;
    @Column(name = "story_lore", columnDefinition = "TEXT") private String storyLore;
    @Column(name = "cage_data", columnDefinition = "TEXT") private String cageData;
    @Column(name = "times_played") private Integer timesPlayed = 0;
    @Column(name = "times_solved") private Integer timesSolved = 0;
    @Column(name = "average_solve_time_seconds") private Double averageSolveTimeSeconds;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;

    public Puzzle() {}

    public Long getId() { return id; }
    public String getSeed() { return seed; }
    public void setSeed(String seed) { this.seed = seed; }
    public String getPuzzleData() { return puzzleData; }
    public void setPuzzleData(String puzzleData) { this.puzzleData = puzzleData; }
    public String getSolutionData() { return solutionData; }
    public void setSolutionData(String solutionData) { this.solutionData = solutionData; }
    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
    public String getVariant() { return variant; }
    public void setVariant(String variant) { this.variant = variant; }
    public Integer getGivenCount() { return givenCount; }
    public void setGivenCount(Integer givenCount) { this.givenCount = givenCount; }
    public Integer getEstimatedSolveTimeSeconds() { return estimatedSolveTimeSeconds; }
    public void setEstimatedSolveTimeSeconds(Integer estimatedSolveTimeSeconds) { this.estimatedSolveTimeSeconds = estimatedSolveTimeSeconds; }
    public Boolean getIsDailyChallenge() { return isDailyChallenge; }
    public void setIsDailyChallenge(Boolean isDailyChallenge) { this.isDailyChallenge = isDailyChallenge; }
    public LocalDate getDailyDate() { return dailyDate; }
    public void setDailyDate(LocalDate dailyDate) { this.dailyDate = dailyDate; }
    public Boolean getIsStoryMode() { return isStoryMode; }
    public void setIsStoryMode(Boolean isStoryMode) { this.isStoryMode = isStoryMode; }
    public Integer getStoryChapter() { return storyChapter; }
    public void setStoryChapter(Integer storyChapter) { this.storyChapter = storyChapter; }
    public Integer getStoryLevel() { return storyLevel; }
    public void setStoryLevel(Integer storyLevel) { this.storyLevel = storyLevel; }
    public String getStoryTitle() { return storyTitle; }
    public void setStoryTitle(String storyTitle) { this.storyTitle = storyTitle; }
    public String getStoryLore() { return storyLore; }
    public void setStoryLore(String storyLore) { this.storyLore = storyLore; }
    public String getCageData() { return cageData; }
    public void setCageData(String cageData) { this.cageData = cageData; }
    public Integer getTimesPlayed() { return timesPlayed; }
    public void setTimesPlayed(Integer timesPlayed) { this.timesPlayed = timesPlayed; }
    public Integer getTimesSolved() { return timesSolved; }
    public void setTimesSolved(Integer timesSolved) { this.timesSolved = timesSolved; }
    public Double getAverageSolveTimeSeconds() { return averageSolveTimeSeconds; }
    public void setAverageSolveTimeSeconds(Double averageSolveTimeSeconds) { this.averageSolveTimeSeconds = averageSolveTimeSeconds; }
    public LocalDateTime getCreatedAt() { return createdAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final Puzzle p = new Puzzle();
        public Builder seed(String v) { p.seed = v; return this; }
        public Builder puzzleData(String v) { p.puzzleData = v; return this; }
        public Builder solutionData(String v) { p.solutionData = v; return this; }
        public Builder difficulty(String v) { p.difficulty = v; return this; }
        public Builder variant(String v) { p.variant = v; return this; }
        public Builder givenCount(Integer v) { p.givenCount = v; return this; }
        public Builder estimatedSolveTimeSeconds(Integer v) { p.estimatedSolveTimeSeconds = v; return this; }
        public Builder isDailyChallenge(Boolean v) { p.isDailyChallenge = v; return this; }
        public Builder dailyDate(LocalDate v) { p.dailyDate = v; return this; }
        public Builder isStoryMode(Boolean v) { p.isStoryMode = v; return this; }
        public Builder storyChapter(Integer v) { p.storyChapter = v; return this; }
        public Builder storyLevel(Integer v) { p.storyLevel = v; return this; }
        public Builder storyTitle(String v) { p.storyTitle = v; return this; }
        public Builder storyLore(String v) { p.storyLore = v; return this; }
        public Builder cageData(String v) { p.cageData = v; return this; }
        public Puzzle build() { return p; }
    }
}