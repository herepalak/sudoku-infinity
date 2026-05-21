package com.sudokuinfinity.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class HintResponse {
    public Integer cellIndex;
    public Integer value;
    public String strategy;
    public String explanation;
}
