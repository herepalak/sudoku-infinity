package com.sudokuinfinity.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class GameSessionDTO {
    public Long id;
    public Long puzzleId;
    public String currentBoard;
    public String notesData;
    public String status;
    public Long elapsedSeconds;
    public Integer mistakesCount;
    public Integer hintsUsed;
    public Integer score;
    public Integer xpEarned;
}
