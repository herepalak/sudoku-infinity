package com.sudokuinfinity.dto;
import lombok.*;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PowerUpResponse {
    public String powerUpType;
    public List<Integer> affectedCells;
    public List<Integer> revealedValues;
    public String message;
}
