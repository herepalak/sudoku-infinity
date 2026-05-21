package com.sudokuinfinity.controller;

import com.sudokuinfinity.dto.*;
import com.sudokuinfinity.service.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// ─────────────────────────────────────────────────────────────────
//  AUTH CONTROLLER
// ─────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(authService.register(req));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(authService.login(req));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> me(@AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(authService.getProfile(ud.getUsername()));
    }
}

// ─────────────────────────────────────────────────────────────────
//  PUZZLE CONTROLLER
// ─────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/puzzles")
@RequiredArgsConstructor
class PuzzleController {

    private final PuzzleService puzzleService;

    @GetMapping("/generate")
    public ResponseEntity<PuzzleDTO> generate(
        @RequestParam(defaultValue = "MEDIUM") String difficulty,
        @RequestParam(defaultValue = "CLASSIC") String variant,
        @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(puzzleService.getOrGeneratePuzzle(difficulty, variant, ud.getUsername()));
    }

    @GetMapping("/daily")
    public ResponseEntity<PuzzleDTO> daily(@AuthenticationPrincipal UserDetails ud) {
        String username = ud != null ? ud.getUsername() : null;
        return ResponseEntity.ok(puzzleService.getDailyChallenge(username));
    }

    @GetMapping("/story")
    public ResponseEntity<List<PuzzleDTO>> allStory() {
        return ResponseEntity.ok(puzzleService.getAllStoryPuzzles());
    }

    @GetMapping("/story/{chapter}")
    public ResponseEntity<List<PuzzleDTO>> storyChapter(@PathVariable Integer chapter) {
        return ResponseEntity.ok(puzzleService.getStoryPuzzles(chapter));
    }

    @GetMapping("/infinite")
    public ResponseEntity<PuzzleDTO> infinite(
        @RequestParam long level,
        @RequestParam(defaultValue = "MEDIUM") String difficulty) {
        return ResponseEntity.ok(puzzleService.getInfiniteLevel(level, difficulty));
    }
}

// ─────────────────────────────────────────────────────────────────
//  GAME CONTROLLER
// ─────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/game")
@RequiredArgsConstructor
class GameController {

    private final GameService gameService;

    @PostMapping("/save")
    public ResponseEntity<GameSessionDTO> save(
        @Valid @RequestBody SaveProgressRequest req,
        @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(gameService.saveProgress(req, ud.getUsername()));
    }

    @PostMapping("/complete")
    public ResponseEntity<CompletePuzzleResponse> complete(
        @Valid @RequestBody CompletePuzzleRequest req,
        @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(gameService.completePuzzle(req, ud.getUsername()));
    }

    @GetMapping("/hint/{sessionId}")
    public ResponseEntity<HintResponse> hint(
        @PathVariable Long sessionId,
        @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(gameService.getHint(sessionId, ud.getUsername()));
    }

    @PostMapping("/powerup")
    public ResponseEntity<PowerUpResponse> powerUp(
        @Valid @RequestBody PowerUpRequest req,
        @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(gameService.usePowerUp(req, ud.getUsername()));
    }
}

// ─────────────────────────────────────────────────────────────────
//  LEADERBOARD CONTROLLER
// ─────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/leaderboard")
@RequiredArgsConstructor
class LeaderboardController {

    private final GameService gameService;

    @GetMapping("/daily")
    public ResponseEntity<List<LeaderboardEntryDTO>> daily(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate target = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(gameService.getDailyLeaderboard(target));
    }
}

// ─────────────────────────────────────────────────────────────────
//  USER CONTROLLER
// ─────────────────────────────────────────────────────────────────
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
class UserController {

    private final AuthService authService;
    private final com.sudokuinfinity.repository.UserRepository userRepository;
    private final com.sudokuinfinity.repository.AchievementRepository achievementRepository;
    private final com.sudokuinfinity.repository.GameSessionRepository sessionRepository;
    private final com.sudokuinfinity.util.ScoreCalculator scoreCalc;

    @GetMapping("/profile/{username}")
    public ResponseEntity<UserDTO> profile(@PathVariable String username) {
        return ResponseEntity.ok(authService.getProfile(username));
    }

    @GetMapping("/me/achievements")
    public ResponseEntity<List<AchievementDTO>> achievements(@AuthenticationPrincipal UserDetails ud) {
        var user = userRepository.findByUsername(ud.getUsername()).orElseThrow();
        return ResponseEntity.ok(
            achievementRepository.findByUserIdOrderByEarnedAtDesc(user.getId())
                .stream().map(a -> AchievementDTO.builder()
                    .id(a.getId())
                    .achievementKey(a.getAchievementKey())
                    .achievementName(a.getAchievementName())
                    .achievementDesc(a.getAchievementDesc())
                    .icon(a.getIcon())
                    .xpReward(a.getXpReward())
                    .rarity(a.getRarity())
                    .earnedAt(a.getEarnedAt())
                    .build())
                .toList()
        );
    }

    @GetMapping("/me/stats")
    public ResponseEntity<UserStatsDTO> stats(@AuthenticationPrincipal UserDetails ud) {
        var user = userRepository.findByUsername(ud.getUsername()).orElseThrow();
        long solved = sessionRepository.countCompletedByUserId(user.getId());
        Double avgTime = sessionRepository.findAvgSolveTimeByUserId(user.getId());

        return ResponseEntity.ok(UserStatsDTO.builder()
            .totalPuzzlesSolved(solved)
            .avgSolveTimeSeconds(avgTime)
            .currentStreak(user.getCurrentStreak())
            .longestStreak(user.getLongestStreak())
            .xpPoints(user.getXpPoints())
            .level(user.getLevel())
            .xpToNextLevel(scoreCalc.xpForNextLevel(user.getLevel()))
            .build());
    }

    @PutMapping("/me/preferences")
    public ResponseEntity<Map<String, String>> updatePrefs(
        @RequestBody Map<String, String> prefs,
        @AuthenticationPrincipal UserDetails ud) {
        var user = userRepository.findByUsername(ud.getUsername()).orElseThrow();
        if (prefs.containsKey("theme")) user.setPreferredTheme(prefs.get("theme"));
        if (prefs.containsKey("difficulty")) user.setPreferredDifficulty(prefs.get("difficulty"));
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("status", "updated"));
    }
}
