package com.sudokuinfinity.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "game_sessions")
public class GameSession {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "puzzle_id", nullable = false) private Puzzle puzzle;
    @Column(name = "current_board", columnDefinition = "TEXT") private String currentBoard;
    @Column(name = "notes_data", columnDefinition = "TEXT") private String notesData;
    @Column(name = "status", length = 20) private String status = "IN_PROGRESS";
    @Column(name = "elapsed_seconds") private Long elapsedSeconds = 0L;
    @Column(name = "mistakes_count") private Integer mistakesCount = 0;
    @Column(name = "hints_used") private Integer hintsUsed = 0;
    @Column(name = "power_ups_used", columnDefinition = "TEXT") private String powerUpsUsed;
    @Column(name = "score") private Integer score = 0;
    @Column(name = "xp_earned") private Integer xpEarned = 0;
    @Column(name = "is_battle_mode") private Boolean isBattleMode = false;
    @Column(name = "battle_room_id", length = 50) private String battleRoomId;
    @Column(name = "completed_at") private LocalDateTime completedAt;
    @CreationTimestamp @Column(name = "created_at", updatable = false) private LocalDateTime createdAt;
    @UpdateTimestamp @Column(name = "updated_at") private LocalDateTime updatedAt;

    public GameSession() {}

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public Puzzle getPuzzle() { return puzzle; }
    public void setPuzzle(Puzzle puzzle) { this.puzzle = puzzle; }
    public String getCurrentBoard() { return currentBoard; }
    public void setCurrentBoard(String currentBoard) { this.currentBoard = currentBoard; }
    public String getNotesData() { return notesData; }
    public void setNotesData(String notesData) { this.notesData = notesData; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getElapsedSeconds() { return elapsedSeconds; }
    public void setElapsedSeconds(Long elapsedSeconds) { this.elapsedSeconds = elapsedSeconds; }
    public Integer getMistakesCount() { return mistakesCount; }
    public void setMistakesCount(Integer mistakesCount) { this.mistakesCount = mistakesCount; }
    public Integer getHintsUsed() { return hintsUsed; }
    public void setHintsUsed(Integer hintsUsed) { this.hintsUsed = hintsUsed; }
    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }
    public Integer getXpEarned() { return xpEarned; }
    public void setXpEarned(Integer xpEarned) { this.xpEarned = xpEarned; }
    public Boolean getIsBattleMode() { return isBattleMode; }
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private final GameSession s = new GameSession();
        public Builder user(User v) { s.user = v; return this; }
        public Builder puzzle(Puzzle v) { s.puzzle = v; return this; }
        public Builder currentBoard(String v) { s.currentBoard = v; return this; }
        public Builder status(String v) { s.status = v; return this; }
        public Builder elapsedSeconds(Long v) { s.elapsedSeconds = v; return this; }
        public Builder isBattleMode(Boolean v) { s.isBattleMode = v; return this; }
        public GameSession build() { return s; }
    }
}