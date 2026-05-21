package com.sudokuinfinity.util;

import org.springframework.stereotype.Component;

import java.util.*;

/**
 * Core Sudoku Engine
 * Handles: generation, solving, validation, hint computation
 */
@Component
public class SudokuEngine {

    private static final int SIZE = 9;
    private static final int BOX = 3;

    // ─────────────────────────────────────────────────────────────────
    //  PUBLIC API
    // ─────────────────────────────────────────────────────────────────

    /**
     * Generate a complete valid Sudoku puzzle + solution from a seed.
     * Returns int[2][81]: [0]=puzzle (0=empty), [1]=solution
     */
    public int[][] generatePuzzle(String seed, String difficulty) {
        Random rng = new Random(seed.hashCode());
        int[] solution = generateSolution(rng);
        int[] puzzle   = removeCells(solution.clone(), difficulty, rng);
        return new int[][]{puzzle, solution};
    }

    /**
     * Validate a full 9x9 board.
     */
    public boolean isBoardValid(int[] board) {
        for (int i = 0; i < SIZE; i++) {
            if (!isRowValid(board, i))  return false;
            if (!isColValid(board, i))  return false;
            if (!isBoxValid(board, i))  return false;
        }
        return true;
    }

    /**
     * Check whether a single cell placement is legal.
     */
    public boolean isValidPlacement(int[] board, int index, int value) {
        int row = index / SIZE;
        int col = index % SIZE;
        // row check
        for (int c = 0; c < SIZE; c++)
            if (c != col && board[row * SIZE + c] == value) return false;
        // col check
        for (int r = 0; r < SIZE; r++)
            if (r != row && board[r * SIZE + col] == value) return false;
        // box check
        int br = (row / BOX) * BOX, bc = (col / BOX) * BOX;
        for (int r = br; r < br + BOX; r++)
            for (int c = bc; c < bc + BOX; c++)
                if ((r != row || c != col) && board[r * SIZE + c] == value) return false;
        return true;
    }

    /**
     * Get all valid candidates for an empty cell.
     */
    public List<Integer> getCandidates(int[] board, int index) {
        List<Integer> candidates = new ArrayList<>();
        if (board[index] != 0) return candidates;
        for (int v = 1; v <= 9; v++)
            if (isValidPlacement(board, index, v))
                candidates.add(v);
        return candidates;
    }

    /**
     * Solve board using backtracking. Returns solved board or null.
     */
    public int[] solve(int[] board) {
        int[] copy = board.clone();
        if (solveBacktrack(copy)) return copy;
        return null;
    }

    /**
     * Count solutions (cap at 2 — used to check uniqueness).
     */
    public int countSolutions(int[] board) {
        int[] copy = board.clone();
        return countSolutionsHelper(copy, 0);
    }

    /**
     * AI Hint: return the best hint strategy (cell index + value + explanation).
     */
    public HintResult getHint(int[] board, int[] solution) {
        // Strategy 1: Naked Single
        for (int i = 0; i < SIZE * SIZE; i++) {
            if (board[i] != 0) continue;
            List<Integer> cands = getCandidates(board, i);
            if (cands.size() == 1) {
                return new HintResult(i, cands.get(0),
                    "Naked Single",
                    String.format("Cell R%dC%d has only one possible value: %d. All other digits appear in the same row, column, or box.",
                        i/SIZE+1, i%SIZE+1, cands.get(0)));
            }
        }
        // Strategy 2: Hidden Single in row
        for (int row = 0; row < SIZE; row++) {
            for (int val = 1; val <= 9; val++) {
                int found = -1, count = 0;
                for (int col = 0; col < SIZE; col++) {
                    int idx = row * SIZE + col;
                    if (board[idx] == 0 && isValidPlacement(board, idx, val)) {
                        found = idx; count++;
                    }
                }
                if (count == 1) {
                    return new HintResult(found, val,
                        "Hidden Single (Row)",
                        String.format("%d can only go in one place in Row %d.", val, row+1));
                }
            }
        }
        // Strategy 3: Hidden Single in column
        for (int col = 0; col < SIZE; col++) {
            for (int val = 1; val <= 9; val++) {
                int found = -1, count = 0;
                for (int row = 0; row < SIZE; row++) {
                    int idx = row * SIZE + col;
                    if (board[idx] == 0 && isValidPlacement(board, idx, val)) {
                        found = idx; count++;
                    }
                }
                if (count == 1) {
                    return new HintResult(found, val,
                        "Hidden Single (Column)",
                        String.format("%d can only go in one place in Column %d.", val, col+1));
                }
            }
        }
        // Fallback: just reveal a random empty cell from solution
        List<Integer> empties = new ArrayList<>();
        for (int i = 0; i < SIZE*SIZE; i++) if (board[i] == 0) empties.add(i);
        if (!empties.isEmpty()) {
            int idx = empties.get(new Random().nextInt(empties.size()));
            return new HintResult(idx, solution[idx],
                "Revelation",
                String.format("This cell's value has been revealed directly from the solution."));
        }
        return null;
    }

    // ─────────────────────────────────────────────────────────────────
    //  INNER CLASSES
    // ─────────────────────────────────────────────────────────────────

    public record HintResult(int cellIndex, int value, String strategy, String explanation) {}

    // ─────────────────────────────────────────────────────────────────
    //  PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────

    private int[] generateSolution(Random rng) {
        int[] board = new int[SIZE * SIZE];
        // Fill diagonal 3x3 boxes independently (no constraint between them)
        for (int b = 0; b < SIZE; b += BOX) fillBox(board, b, b, rng);
        solveBacktrack(board);
        shuffle(board, rng);
        return board;
    }

    private void fillBox(int[] board, int rowStart, int colStart, Random rng) {
        List<Integer> nums = new ArrayList<>(List.of(1,2,3,4,5,6,7,8,9));
        Collections.shuffle(nums, rng);
        int k = 0;
        for (int r = rowStart; r < rowStart + BOX; r++)
            for (int c = colStart; c < colStart + BOX; c++)
                board[r * SIZE + c] = nums.get(k++);
    }

    private void shuffle(int[] board, Random rng) {
        // Shuffle by swapping rows within bands and cols within stacks
        for (int band = 0; band < BOX; band++) {
            for (int i = 0; i < BOX; i++) {
                int a = band*BOX + i;
                int b = band*BOX + rng.nextInt(BOX);
                swapRows(board, a, b);
            }
        }
        for (int stack = 0; stack < BOX; stack++) {
            for (int i = 0; i < BOX; i++) {
                int a = stack*BOX + i;
                int b = stack*BOX + rng.nextInt(BOX);
                swapCols(board, a, b);
            }
        }
    }

    private void swapRows(int[] board, int r1, int r2) {
        for (int c = 0; c < SIZE; c++) {
            int tmp = board[r1*SIZE+c];
            board[r1*SIZE+c] = board[r2*SIZE+c];
            board[r2*SIZE+c] = tmp;
        }
    }

    private void swapCols(int[] board, int c1, int c2) {
        for (int r = 0; r < SIZE; r++) {
            int tmp = board[r*SIZE+c1];
            board[r*SIZE+c1] = board[r*SIZE+c2];
            board[r*SIZE+c2] = tmp;
        }
    }

    private int[] removeCells(int[] board, String difficulty, Random rng) {
        int toRemove = switch (difficulty.toUpperCase()) {
            case "EASY"   -> 36;
            case "MEDIUM" -> 46;
            case "HARD"   -> 52;
            case "EXPERT" -> 56;
            case "MASTER" -> 60;
            case "LEGEND" -> 64;
            default       -> 46;
        };

        List<Integer> indices = new ArrayList<>();
        for (int i = 0; i < SIZE*SIZE; i++) indices.add(i);
        Collections.shuffle(indices, rng);

        int removed = 0;
        for (int idx : indices) {
            if (removed >= toRemove) break;
            int backup = board[idx];
            board[idx] = 0;
            if (countSolutions(board) == 1) {
                removed++;
            } else {
                board[idx] = backup;
            }
        }
        return board;
    }

    private boolean solveBacktrack(int[] board) {
        for (int i = 0; i < SIZE * SIZE; i++) {
            if (board[i] == 0) {
                for (int v = 1; v <= 9; v++) {
                    if (isValidPlacement(board, i, v)) {
                        board[i] = v;
                        if (solveBacktrack(board)) return true;
                        board[i] = 0;
                    }
                }
                return false;
            }
        }
        return true;
    }

    private int countSolutionsHelper(int[] board, int count) {
        if (count >= 2) return count;
        for (int i = 0; i < SIZE * SIZE; i++) {
            if (board[i] == 0) {
                for (int v = 1; v <= 9; v++) {
                    if (isValidPlacement(board, i, v)) {
                        board[i] = v;
                        count = countSolutionsHelper(board, count);
                        board[i] = 0;
                        if (count >= 2) return count;
                    }
                }
                return count;
            }
        }
        return count + 1;
    }

    private boolean isRowValid(int[] board, int row) {
        Set<Integer> seen = new HashSet<>();
        for (int c = 0; c < SIZE; c++) {
            int v = board[row*SIZE+c];
            if (v < 1 || v > 9 || !seen.add(v)) return false;
        }
        return true;
    }

    private boolean isColValid(int[] board, int col) {
        Set<Integer> seen = new HashSet<>();
        for (int r = 0; r < SIZE; r++) {
            int v = board[r*SIZE+col];
            if (v < 1 || v > 9 || !seen.add(v)) return false;
        }
        return true;
    }

    private boolean isBoxValid(int[] board, int box) {
        Set<Integer> seen = new HashSet<>();
        int br = (box/BOX)*BOX, bc = (box%BOX)*BOX;
        for (int r = br; r < br+BOX; r++)
            for (int c = bc; c < bc+BOX; c++) {
                int v = board[r*SIZE+c];
                if (v < 1 || v > 9 || !seen.add(v)) return false;
            }
        return true;
    }
}
