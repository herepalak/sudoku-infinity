package com.sudokuinfinity.config;

import com.sudokuinfinity.entity.Puzzle;
import com.sudokuinfinity.repository.PuzzleRepository;
import com.sudokuinfinity.util.SudokuEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Seeds the database with Story Mode puzzles on startup.
 * Only seeds if story puzzles don't already exist.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class StoryModeSeeder implements CommandLineRunner {

    private final PuzzleRepository puzzleRepository;
    private final SudokuEngine engine;

    // Chapter titles & lore
    private static final String[][] STORY_DATA = {
        // {chapter, level, difficulty, title, lore}
        {"1","1","EASY",   "The Awakening",       "You open your eyes in a strange temple. Ancient runes glow on the walls. A voice echoes: 'Only logic can unlock the gate...'"},
        {"1","2","EASY",   "The First Gate",      "The first gate trembles. Numbers are the language of the universe. You begin to understand."},
        {"1","3","EASY",   "Trial of Numbers",    "The temple guardian watches in silence. Your mind sharpens with each cell you fill."},
        {"1","4","MEDIUM", "The Hidden Path",     "A secret passage opens. The puzzles grow deeper, mirroring the labyrinth of your mind."},
        {"1","5","MEDIUM", "Shadows of Logic",    "Shadows whisper equations. The grid becomes your map through a world without words."},
        {"2","1","MEDIUM", "The Ancient Library", "Chapter II. You enter the Great Library of Numbers. Countless scrolls drift in the air."},
        {"2","2","MEDIUM", "The Scholar's Test",  "A long-dead scholar's ghost appears: 'Show me you are worthy of deeper knowledge.'"},
        {"2","3","HARD",   "Pages of Secrets",    "The scrolls reveal patterns within patterns. The puzzle is fractal — infinite."},
        {"2","4","HARD",   "The Cipher Vault",    "A vault sealed for 10,000 years. Its combination is a Sudoku only the worthy can crack."},
        {"2","5","HARD",   "Forbidden Knowledge", "Some truths are dangerous. You solve anyway."},
        {"3","1","HARD",   "The Storm Begins",    "Chapter III. A storm of digits rages across the sky. Order is the only shelter."},
        {"3","2","EXPERT", "Eye of the Storm",    "In the calm center, a single unsolved grid awaits. The hardest test yet."},
        {"3","3","EXPERT", "Thunder Logic",       "Each cell you fill sends a bolt of lightning across the horizon."},
        {"3","4","EXPERT", "The Last Shelter",    "The storm walls close in. Only the solution can hold them back."},
        {"3","5","MASTER", "Beyond the Tempest",  "You emerge on the other side. Changed. The grid is silent. You are not."},
        {"4","1","MASTER", "The Crystal Palace",  "Chapter IV. Reality is made of light and number. You walk corridors of pure logic."},
        {"4","2","MASTER", "Infinite Reflections","Every cell reflects every other. The puzzle is a mirror of your mind."},
        {"4","3","LEGEND", "The God Equation",    "The final equation was never meant for mortal minds. You attempt it anyway."},
        {"4","4","LEGEND", "Singularity",         "One puzzle. One solution. One truth. Everything converges."},
        {"4","5","LEGEND", "The Infinite Grid",   "You realize: the grid never truly ends. You have only just begun."},
    };

    @Override
    public void run(String... args) {
        long existing = puzzleRepository.findByIsStoryModeOrderByStoryChapterAscStoryLevelAsc(true).size();
        if (existing >= STORY_DATA.length) {
            log.info("Story mode puzzles already seeded ({} levels)", existing);
            return;
        }

        log.info("Seeding {} story mode puzzles...", STORY_DATA.length);
        for (String[] data : STORY_DATA) {
            int chapter   = Integer.parseInt(data[0]);
            int level     = Integer.parseInt(data[1]);
            String diff   = data[2];
            String title  = data[3];
            String lore   = data[4];
            String seed   = "STORY-CH" + chapter + "-L" + level;

            if (puzzleRepository.findBySeed(seed).isPresent()) continue;

            int[][] result = engine.generatePuzzle(seed, diff);
            StringBuilder puzzleStr = new StringBuilder(), solutionStr = new StringBuilder();
            for (int i = 0; i < 81; i++) {
                puzzleStr.append(result[0][i]);
                solutionStr.append(result[1][i]);
            }

            Puzzle puzzle = Puzzle.builder()
                .seed(seed)
                .puzzleData(puzzleStr.toString())
                .solutionData(solutionStr.toString())
                .difficulty(diff)
                .variant("CLASSIC")
                .givenCount((int) puzzleStr.chars().filter(c -> c != '0').count())
                .isStoryMode(true)
                .storyChapter(chapter)
                .storyLevel(level)
                .storyTitle(title)
                .storyLore(lore)
                .estimatedSolveTimeSeconds(switch (diff) {
                    case "EASY" -> 300; case "MEDIUM" -> 600; case "HARD" -> 900;
                    case "EXPERT" -> 1200; case "MASTER" -> 1800; default -> 2700;
                })
                .build();
            puzzleRepository.save(puzzle);
        }
        log.info("Story mode seeding complete.");
    }
}
