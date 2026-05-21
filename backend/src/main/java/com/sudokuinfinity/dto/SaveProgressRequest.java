package com.sudokuinfinity.dto;
import lombok.*;
import jakarta.validation.constraints.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SaveProgressRequest {
    @NotNull public Long sessionId;
    @NotBlank public String currentBoard;
    public String notesData;
    @NotNull public Long elapsedSeconds;
    public Integer mistakesCount;
}
