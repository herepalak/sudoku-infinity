package com.sudokuinfinity.dto;
import lombok.*;
import jakarta.validation.constraints.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PowerUpRequest {
    @NotNull public Long sessionId;
    @NotBlank public String powerUpType;
    public Integer targetCell;
}
