package com.sudokuinfinity.dto;
import lombok.*;
import jakarta.validation.constraints.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class CompletePuzzleRequest {
    @NotNull public Long sessionId;
    @NotBlank public String finalBoard;
    @NotNull public Long elapsedSeconds;
    public Integer mistakes;
    public Integer hintsUsed;
    public Boolean isBattleMode;
}
