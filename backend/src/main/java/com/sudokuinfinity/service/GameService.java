package com.sudokuinfinity.service;

import com.sudokuinfinity.dto.*;
import com.sudokuinfinity.entity.*;
import com.sudokuinfinity.repository.*;
import com.sudokuinfinity.util.ScoreCalculator;
import com.sudokuinfinity.util.SudokuEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private final GameSessionRepository sessionRepository;
    private final PuzzleRepository puzzleRepository;
    private final UserRepository userRepository;
    private final DailyLeaderboardRepository leaderboardRepository;
    private final AchievementRepository achievementRepository;
    private final SudokuEngine engine;
    private final ScoreCalculator scoreCalc;

    // ─────────────────────────────────────────────────────────────────
    //  SAVE PROGRESS
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public GameSessionDTO saveProgress(SaveProgressRequest req, String username) {
        GameSession session = sessionRepository.findById(req.getSessionId()).orElseThrow();
        validateSessionOwner(session, username);

        session.setCurrentBoard(req.getCurrentBoard());
        session.setNotesData(req.getNotesData());
        session.setElapsedSeconds(req.getElapsedSeconds());
        if (req.getMistakesCount() != null) session.setMistakesCount(req.getMistakesCount());
        sessionRepository.save(session);

        return toSessionDTO(session);
    }

    // ─────────────────────────────────────────────────────────────────
    //  COMPLETE PUZZLE
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public CompletePuzzleResponse completePuzzle(CompletePuzzleRequest req, String username) {
        GameSession session = sessionRepository.findById(req.getSessionId()).orElseThrow();
        User user = userRepository.findByUsername(username).orElseThrow();
        validateSessionOwner(session, username);

        Puzzle puzzle = session.getPuzzle();

        // Validate solution
        int[] submitted = boardStringToArray(req.getFinalBoard());
        int[] solution  = boardStringToArray(puzzle.getSolutionData());
        if (!Arrays.equals(submitted, solution)) {
            throw new RuntimeException("Submitted solution is incorrect");
        }

        // Calculate score
        int mistakes  = req.getMistakes() != null ? req.getMistakes() : session.getMistakesCount();
        int hints     = req.getHintsUsed() != null ? req.getHintsUsed() : session.getHintsUsed();
        boolean battle = Boolean.TRUE.equals(req.getIsBattleMode());
        boolean perfect = mistakes == 0 && hints == 0;

        int score = scoreCalc.calculateScore(puzzle.getDifficulty(), req.getElapsedSeconds(), mistakes, hints, battle);
        int xp    = scoreCalc.calculateXP(puzzle.getDifficulty(), score, perfect);
        String rating = getRating(score, puzzle.getDifficulty());

        // Update session
        session.setStatus("COMPLETED");
        session.setElapsedSeconds(req.getElapsedSeconds());
        session.setMistakesCount(mistakes);
        session.setHintsUsed(hints);
        session.setScore(score);
        session.setXpEarned(xp);
        session.setCompletedAt(LocalDateTime.now());
        sessionRepository.save(session);

        // Update user stats
        long newXP = user.getXpPoints() + xp;
        int newLevel = scoreCalc.levelFromXP(newXP);
        user.setXpPoints(newXP);
        user.setLevel(newLevel);
        user.setTotalPuzzlesSolved(user.getTotalPuzzlesSolved() + 1);
        user.setTotalTimePlayedSeconds(user.getTotalTimePlayedSeconds() + req.getElapsedSeconds());
        updateStreak(user);
        userRepository.save(user);

        // Update puzzle stats
        puzzle.setTimesSolved(puzzle.getTimesSolved() + 1);
        double avg = puzzle.getAverageSolveTimeSeconds() == null ? req.getElapsedSeconds() :
            (puzzle.getAverageSolveTimeSeconds() * (puzzle.getTimesSolved()-1) + req.getElapsedSeconds()) / puzzle.getTimesSolved();
        puzzle.setAverageSolveTimeSeconds(avg);
        puzzleRepository.save(puzzle);

        // Check achievements
        List<AchievementDTO> newAchievements = checkAndGrantAchievements(user, session, perfect);

        // Leaderboard entry (daily)
        LeaderboardEntryDTO leaderboard = null;
        if (puzzle.getIsDailyChallenge()) {
            leaderboard = submitToLeaderboard(user, puzzle, req.getElapsedSeconds(), score, mistakes, hints);
        }

        return CompletePuzzleResponse.builder()
            .score(score)
            .xpEarned(xp)
            .newLevel(newLevel)
            .totalXp(newXP)
            .newAchievements(newAchievements)
            .leaderboardEntry(leaderboard)
            .performanceRating(rating)
            .build();
    }

    // ─────────────────────────────────────────────────────────────────
    //  HINT
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public HintResponse getHint(Long sessionId, String username) {
        GameSession session = sessionRepository.findById(sessionId).orElseThrow();
        validateSessionOwner(session, username);

        int[] board    = boardStringToArray(session.getCurrentBoard());
        int[] solution = boardStringToArray(session.getPuzzle().getSolutionData());

        SudokuEngine.HintResult hint = engine.getHint(board, solution);
        if (hint == null) throw new RuntimeException("No hint available");

        session.setHintsUsed(session.getHintsUsed() + 1);
        sessionRepository.save(session);

        return HintResponse.builder()
            .cellIndex(hint.cellIndex())
            .value(hint.value())
            .strategy(hint.strategy())
            .explanation(hint.explanation())
            .build();
    }

    // ─────────────────────────────────────────────────────────────────
    //  POWER-UPS
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public PowerUpResponse usePowerUp(PowerUpRequest req, String username) {
        GameSession session = sessionRepository.findById(req.getSessionId()).orElseThrow();
        validateSessionOwner(session, username);

        int[] board    = boardStringToArray(session.getCurrentBoard());
        int[] solution = boardStringToArray(session.getPuzzle().getSolutionData());
        List<Integer> cells  = new ArrayList<>();
        List<Integer> values = new ArrayList<>();

        return switch (req.getPowerUpType()) {
            case "REVEAL_CELL" -> {
                if (req.getTargetCell() == null) throw new RuntimeException("Target cell required");
                int idx = req.getTargetCell();
                cells.add(idx);
                values.add(solution[idx]);
                board[idx] = solution[idx];
                session.setCurrentBoard(boardArrayToString(board));
                sessionRepository.save(session);
                yield PowerUpResponse.builder()
                    .powerUpType("REVEAL_CELL")
                    .affectedCells(cells)
                    .revealedValues(values)
                    .message("Cell revealed!")
                    .build();
            }
            case "ELIMINATE_WRONG" -> {
                for (int i = 0; i < 81; i++) {
                    if (board[i] != 0 && board[i] != solution[i]) {
                        cells.add(i);
                        values.add(0);
                        board[i] = 0;
                    }
                }
                session.setCurrentBoard(boardArrayToString(board));
                sessionRepository.save(session);
                yield PowerUpResponse.builder()
                    .powerUpType("ELIMINATE_WRONG")
                    .affectedCells(cells)
                    .revealedValues(values)
                    .message(cells.size() + " incorrect cells removed!")
                    .build();
            }
            case "XRAY_ROW" -> {
                if (req.getTargetCell() == null) throw new RuntimeException("Target cell required");
                int row = req.getTargetCell() / 9;
                for (int c = 0; c < 9; c++) {
                    int idx = row * 9 + c;
                    if (board[idx] == 0) { cells.add(idx); values.add(solution[idx]); }
                }
                yield PowerUpResponse.builder()
                    .powerUpType("XRAY_ROW")
                    .affectedCells(cells)
                    .revealedValues(values)
                    .message("Row " + (row+1) + " X-Rayed!")
                    .build();
            }
            case "XRAY_COL" -> {
                if (req.getTargetCell() == null) throw new RuntimeException("Target cell required");
                int col = req.getTargetCell() % 9;
                for (int r = 0; r < 9; r++) {
                    int idx = r * 9 + col;
                    if (board[idx] == 0) { cells.add(idx); values.add(solution[idx]); }
                }
                yield PowerUpResponse.builder()
                    .powerUpType("XRAY_COL")
                    .affectedCells(cells)
                    .revealedValues(values)
                    .message("Column " + (col+1) + " X-Rayed!")
                    .build();
            }
            case "AUTO_NOTES" -> {
                for (int i = 0; i < 81; i++) {
                    if (board[i] == 0) {
                        cells.add(i);
                        values.addAll(engine.getCandidates(board, i));
                    }
                }
                yield PowerUpResponse.builder()
                    .powerUpType("AUTO_NOTES")
                    .affectedCells(cells)
                    .revealedValues(values)
                    .message("All candidates computed!")
                    .build();
            }
            default -> throw new RuntimeException("Unknown power-up: " + req.getPowerUpType());
        };
    }

    // ─────────────────────────────────────────────────────────────────
    //  LEADERBOARD
    // ─────────────────────────────────────────────────────────────────

    public List<LeaderboardEntryDTO> getDailyLeaderboard(LocalDate date) {
        List<DailyLeaderboard> entries = leaderboardRepository.findTopByDate(date, 50);
        List<LeaderboardEntryDTO> result = new ArrayList<>();
        for (int i = 0; i < entries.size(); i++) {
            DailyLeaderboard e = entries.get(i);
            result.add(LeaderboardEntryDTO.builder()
                .rank(i + 1)
                .username(e.getUser().getUsername())
                .displayName(e.getUser().getDisplayName())
                .avatarUrl(e.getUser().getAvatarUrl())
                .solveTimeSeconds(e.getSolveTimeSeconds())
                .score(e.getScore())
                .mistakes(e.getMistakes())
                .hintsUsed(e.getHintsUsed())
                .build());
        }
        return result;
    }

    // ─────────────────────────────────────────────────────────────────
    //  PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────

    private LeaderboardEntryDTO submitToLeaderboard(User user, Puzzle puzzle,
                                                     long time, int score, int mistakes, int hints) {
        LocalDate today = LocalDate.now();
        if (leaderboardRepository.existsByDailyDateAndUserId(today, user.getId())) return null;

        DailyLeaderboard entry = DailyLeaderboard.builder()
            .dailyDate(today)
            .user(user)
            .solveTimeSeconds(time)
            .score(score)
            .mistakes(mistakes)
            .hintsUsed(hints)
            .build();
        leaderboardRepository.save(entry);

        List<DailyLeaderboard> all = leaderboardRepository.findByDailyDateOrderByScoreDesc(today);
        int rank = all.stream().map(DailyLeaderboard::getUser)
            .map(User::getId).toList().indexOf(user.getId()) + 1;

        return LeaderboardEntryDTO.builder()
            .rank(rank).username(user.getUsername())
            .solveTimeSeconds(time).score(score)
            .mistakes(mistakes).hintsUsed(hints).build();
    }

    private List<AchievementDTO> checkAndGrantAchievements(User user, GameSession session, boolean perfect) {
        List<AchievementDTO> earned = new ArrayList<>();
        long totalSolved = sessionRepository.countCompletedByUserId(user.getId());

        Map<String, Object[]> checks = new LinkedHashMap<>();
        checks.put("FIRST_SOLVE",   new Object[]{"First Victory", "Solve your first puzzle", "🏆", 50,  "COMMON",    totalSolved == 1});
        checks.put("SOLVER_10",     new Object[]{"Dedicated Solver", "Solve 10 puzzles",      "⭐", 100, "COMMON",    totalSolved >= 10});
        checks.put("SOLVER_50",     new Object[]{"Puzzle Master",    "Solve 50 puzzles",      "🌟", 250, "RARE",      totalSolved >= 50});
        checks.put("SOLVER_100",    new Object[]{"Century Club",     "Solve 100 puzzles",     "💯", 500, "EPIC",      totalSolved >= 100});
        checks.put("PERFECT_SOLVE", new Object[]{"Flawless",         "No mistakes, no hints", "✨", 75,  "RARE",      perfect});
        checks.put("STREAK_3",      new Object[]{"On a Roll",        "3 day streak",          "🔥", 50,  "COMMON",    user.getCurrentStreak() >= 3});
        checks.put("STREAK_7",      new Object[]{"Week Warrior",     "7 day streak",          "🔥", 150, "RARE",      user.getCurrentStreak() >= 7});
        checks.put("STREAK_30",     new Object[]{"Legendary Streak", "30 day streak",         "⚡", 500, "LEGENDARY", user.getCurrentStreak() >= 30});
        checks.put("SPEED_EASY",    new Object[]{"Speedster",        "Solve Easy in <90s",    "⚡", 100, "RARE",
            session.getPuzzle().getDifficulty().equals("EASY") && session.getElapsedSeconds() < 90});
        checks.put("LEVEL_10",      new Object[]{"Rising Star",      "Reach Level 10",        "🌠", 200, "RARE",      user.getLevel() >= 10});

        for (Map.Entry<String, Object[]> e : checks.entrySet()) {
            String key = e.getKey();
            Object[] v = e.getValue();
            boolean condition = (boolean) v[5];
            if (condition && !achievementRepository.existsByUserIdAndAchievementKey(user.getId(), key)) {
                Achievement ach = Achievement.builder()
                    .user(user).achievementKey(key)
                    .achievementName((String) v[0])
                    .achievementDesc((String) v[1])
                    .icon((String) v[2])
                    .xpReward((int) v[3])
                    .rarity((String) v[4])
                    .build();
                achievementRepository.save(ach);
                user.setXpPoints(user.getXpPoints() + (int) v[3]);
                earned.add(AchievementDTO.builder()
                    .achievementKey(key).achievementName((String) v[0])
                    .achievementDesc((String) v[1]).icon((String) v[2])
                    .xpReward((int) v[3]).rarity((String) v[4]).build());
            }
        }
        return earned;
    }

    private void updateStreak(User user) {
        LocalDate lastChallenge = user.getLastDailyChallengeDate() == null
            ? null : user.getLastDailyChallengeDate().toLocalDate();
        LocalDate today = LocalDate.now();
        if (lastChallenge == null || lastChallenge.isBefore(today.minusDays(1))) {
            user.setCurrentStreak(1);
        } else if (lastChallenge.equals(today.minusDays(1))) {
            user.setCurrentStreak(user.getCurrentStreak() + 1);
        }
        if (user.getCurrentStreak() > user.getLongestStreak()) {
            user.setLongestStreak(user.getCurrentStreak());
        }
        user.setLastDailyChallengeDate(today.atStartOfDay());
    }

    private String getRating(int score, String difficulty) {
        int max = switch (difficulty) {
            case "EASY" -> 1000; case "MEDIUM" -> 2000; case "HARD" -> 4000;
            case "EXPERT" -> 7000; case "MASTER" -> 10000; default -> 2000;
        };
        double pct = (double) score / max;
        if (pct >= 0.95) return "S";
        if (pct >= 0.80) return "A";
        if (pct >= 0.65) return "B";
        if (pct >= 0.50) return "C";
        return "D";
    }

    private void validateSessionOwner(GameSession session, String username) {
        if (!session.getUser().getUsername().equals(username))
            throw new RuntimeException("Access denied");
    }

    private int[] boardStringToArray(String s) {
        int[] arr = new int[81];
        for (int i = 0; i < 81; i++) arr[i] = s.charAt(i) - '0';
        return arr;
    }

    private String boardArrayToString(int[] arr) {
        StringBuilder sb = new StringBuilder();
        for (int v : arr) sb.append(v);
        return sb.toString();
    }

    private GameSessionDTO toSessionDTO(GameSession s) {
        return GameSessionDTO.builder()
            .id(s.getId()).puzzleId(s.getPuzzle().getId())
            .currentBoard(s.getCurrentBoard()).notesData(s.getNotesData())
            .status(s.getStatus()).elapsedSeconds(s.getElapsedSeconds())
            .mistakesCount(s.getMistakesCount()).hintsUsed(s.getHintsUsed())
            .score(s.getScore()).xpEarned(s.getXpEarned())
            .build();
    }
}
