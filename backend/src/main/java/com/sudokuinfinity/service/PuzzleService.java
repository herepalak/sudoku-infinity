package com.sudokuinfinity.service;

import com.sudokuinfinity.dto.PuzzleDTO;
import com.sudokuinfinity.entity.GameSession;
import com.sudokuinfinity.entity.Puzzle;
import com.sudokuinfinity.entity.User;
import com.sudokuinfinity.repository.GameSessionRepository;
import com.sudokuinfinity.repository.PuzzleRepository;
import com.sudokuinfinity.repository.UserRepository;
import com.sudokuinfinity.util.SudokuEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@SuppressWarnings("unused")
@Service
@RequiredArgsConstructor
@Slf4j
public class PuzzleService {

    private final PuzzleRepository puzzleRepository;
    private final GameSessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final SudokuEngine engine;

    // ─────────────────────────────────────────────────────────────────
    //  GET OR GENERATE
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public PuzzleDTO getOrGeneratePuzzle(String difficulty, String variant, String username) {
        String seed = generateSeed(difficulty, variant);
        Puzzle puzzle = puzzleRepository.findBySeed(seed).orElseGet(() ->
            generateAndSave(seed, difficulty, variant, false)
        );
        puzzle.setTimesPlayed(puzzle.getTimesPlayed() + 1);
        puzzleRepository.save(puzzle);

        User user = userRepository.findByUsername(username).orElseThrow();
        GameSession session = sessionRepository
            .findByUserIdAndPuzzleIdAndStatus(user.getId(), puzzle.getId(), "IN_PROGRESS")
            .orElseGet(() -> createSession(user, puzzle));

        return toPuzzleDTO(puzzle, session.getId());
    }

    @Transactional
    @Cacheable("daily-puzzle")
    public PuzzleDTO getDailyChallenge(String username) {
        LocalDate today = LocalDate.now();
        Puzzle puzzle = puzzleRepository.findByIsDailyChallengeAndDailyDate(true, today)
            .orElseGet(() -> {
                String seed = "DAILY-" + today.format(DateTimeFormatter.ISO_LOCAL_DATE);
                Puzzle p = generateAndSave(seed, "HARD", "CLASSIC", false);
                p.setIsDailyChallenge(true);
                p.setDailyDate(today);
                return puzzleRepository.save(p);
            });

        if (username != null) {
            User user = userRepository.findByUsername(username).orElseThrow();
            GameSession session = sessionRepository
                .findByUserIdAndPuzzleIdAndStatus(user.getId(), puzzle.getId(), "IN_PROGRESS")
                .orElseGet(() -> createSession(user, puzzle));
            return toPuzzleDTO(puzzle, session.getId());
        }
        return toPuzzleDTO(puzzle, null);
    }

    public List<PuzzleDTO> getStoryPuzzles(Integer chapter) {
        return puzzleRepository.findByIsStoryModeAndStoryChapter(true, chapter)
            .stream().map(p -> toPuzzleDTO(p, null)).toList();
    }

    public List<PuzzleDTO> getAllStoryPuzzles() {
        return puzzleRepository.findByIsStoryModeOrderByStoryChapterAscStoryLevelAsc(true)
            .stream().map(p -> toPuzzleDTO(p, null)).toList();
    }

    // ─────────────────────────────────────────────────────────────────
    //  INFINITE LEVELS
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public PuzzleDTO getInfiniteLevel(long levelNumber, String difficulty) {
        String seed = "INFINITE-" + difficulty + "-" + levelNumber;
        Puzzle puzzle = puzzleRepository.findBySeed(seed)
            .orElseGet(() -> generateAndSave(seed, difficulty, "CLASSIC", false));
        return toPuzzleDTO(puzzle, null);
    }

    // ─────────────────────────────────────────────────────────────────
    //  DAILY PUZZLE GENERATOR (runs at midnight)
    // ─────────────────────────────────────────────────────────────────

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void generateTomorrowsDailyPuzzle() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        String seed = "DAILY-" + tomorrow.format(DateTimeFormatter.ISO_LOCAL_DATE);
        if (puzzleRepository.findBySeed(seed).isEmpty()) {
            Puzzle p = generateAndSave(seed, "HARD", "CLASSIC", false);
            p.setIsDailyChallenge(true);
            p.setDailyDate(tomorrow);
            puzzleRepository.save(p);
            log.info("Generated daily puzzle for {}", tomorrow);
        }
    }

    // ─────────────────────────────────────────────────────────────────
    //  PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────

    private Puzzle generateAndSave(String seed, String difficulty, String variant, boolean isStory) {
        int[][] result = engine.generatePuzzle(seed, difficulty);
        int[] puzzleArr  = result[0];
        int[] solutionArr = result[1];

        StringBuilder puzzleStr   = new StringBuilder();
        StringBuilder solutionStr = new StringBuilder();
        for (int i = 0; i < 81; i++) {
            puzzleStr.append(puzzleArr[i]);
            solutionStr.append(solutionArr[i]);
        }

        int givens = (int) puzzleStr.chars().filter(c -> c != '0').count();
        int estTime = switch (difficulty.toUpperCase()) {
            case "EASY" -> 300; case "MEDIUM" -> 600; case "HARD" -> 900;
            case "EXPERT" -> 1200; case "MASTER" -> 1800; case "LEGEND" -> 2700;
            default -> 600;
        };

        Puzzle puzzle = Puzzle.builder()
            .seed(seed)
            .puzzleData(puzzleStr.toString())
            .solutionData(solutionStr.toString())
            .difficulty(difficulty.toUpperCase())
            .variant(variant.toUpperCase())
            .givenCount(givens)
            .estimatedSolveTimeSeconds(estTime)
            .isStoryMode(isStory)
            .build();

        return puzzleRepository.save(puzzle);
    }

    private GameSession createSession(User user, Puzzle puzzle) {
        GameSession session = GameSession.builder()
            .user(user)
            .puzzle(puzzle)
            .currentBoard(puzzle.getPuzzleData())
            .status("IN_PROGRESS")
            .build();
        return sessionRepository.save(session);
    }

    private String generateSeed(String difficulty, String variant) {
        // Deterministic seed based on day and difficulty so same puzzle is served
        // for same difficulty/variant within the same day, but changes daily
        LocalDate today = LocalDate.now();
        return difficulty.toUpperCase() + "-" + variant.toUpperCase() + "-" +
               today.format(DateTimeFormatter.ISO_LOCAL_DATE) + "-" +
               Math.abs((difficulty + variant + today).hashCode() % 100000);
    }

    public static PuzzleDTO toPuzzleDTO(Puzzle p, Long sessionId) {
        return PuzzleDTO.builder()
            .id(p.getId())
            .seed(p.getSeed())
            .puzzleData(p.getPuzzleData())
            .difficulty(p.getDifficulty())
            .variant(p.getVariant())
            .givenCount(p.getGivenCount())
            .estimatedSolveTimeSeconds(p.getEstimatedSolveTimeSeconds())
            .isStoryMode(p.getIsStoryMode())
            .storyChapter(p.getStoryChapter())
            .storyLevel(p.getStoryLevel())
            .storyTitle(p.getStoryTitle())
            .storyLore(p.getStoryLore())
            .cageData(p.getCageData())
            .sessionId(sessionId)
            .build();
    }
}
