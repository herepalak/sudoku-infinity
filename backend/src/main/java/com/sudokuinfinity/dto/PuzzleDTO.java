package com.sudokuinfinity.dto;
import lombok.*;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PuzzleDTO {
    public Long id;
    public String seed;
    public String puzzleData;
    public String difficulty;
    public String variant;
    public Integer givenCount;
    public Integer estimatedSolveTimeSeconds;
    public Boolean isStoryMode;
    public Integer storyChapter;
    public Integer storyLevel;
    public String storyTitle;
    public String storyLore;
    public String cageData;
    public Long sessionId;
}
