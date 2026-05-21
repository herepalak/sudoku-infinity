package com.sudokuinfinity.util;

import org.springframework.stereotype.Component;

@Component
public class ScoreCalculator {

    /**
     * Calculate score for completing a puzzle.
     * Base score modified by difficulty, time, mistakes, and hints.
     */
    public int calculateScore(String difficulty, long elapsedSeconds,
                              int mistakes, int hintsUsed, boolean isBattleMode) {
        int base = switch (difficulty.toUpperCase()) {
            case "EASY"   -> 500;
            case "MEDIUM" -> 1000;
            case "HARD"   -> 2000;
            case "EXPERT" -> 3500;
            case "MASTER" -> 5000;
            case "LEGEND" -> 8000;
            default       -> 1000;
        };

        // Time bonus: faster = more points
        int expectedTime = switch (difficulty.toUpperCase()) {
            case "EASY"   -> 300;
            case "MEDIUM" -> 600;
            case "HARD"   -> 900;
            case "EXPERT" -> 1200;
            case "MASTER" -> 1800;
            case "LEGEND" -> 2400;
            default       -> 600;
        };

        double timeMultiplier = elapsedSeconds > 0
            ? Math.max(0.5, Math.min(2.0, (double) expectedTime / elapsedSeconds))
            : 1.0;

        // Deductions
        int mistakePenalty = mistakes * 50;
        int hintPenalty    = hintsUsed * 100;

        int score = (int) (base * timeMultiplier) - mistakePenalty - hintPenalty;
        score = Math.max(score, 50); // minimum score

        // Battle mode bonus
        if (isBattleMode) score = (int)(score * 1.5);

        return score;
    }

    /**
     * XP earned from a game.
     */
    public int calculateXP(String difficulty, int score, boolean isPerfect) {
        int baseXP = switch (difficulty.toUpperCase()) {
            case "EASY"   -> 10;
            case "MEDIUM" -> 25;
            case "HARD"   -> 50;
            case "EXPERT" -> 80;
            case "MASTER" -> 120;
            case "LEGEND" -> 200;
            default       -> 25;
        };

        int xp = baseXP + (score / 100);
        if (isPerfect) xp = (int)(xp * 1.5);
        return xp;
    }

    /**
     * Calculate user level from XP.
     */
    public int levelFromXP(long xp) {
        // Level formula: level = floor(sqrt(xp / 100)) + 1
        return (int) Math.floor(Math.sqrt(xp / 100.0)) + 1;
    }

    /**
     * XP needed for next level.
     */
    public long xpForNextLevel(int currentLevel) {
        return (long) Math.pow(currentLevel, 2) * 100;
    }
}
