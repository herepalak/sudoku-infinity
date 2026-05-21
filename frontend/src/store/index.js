import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../utils/api'

// ─────────────────────────────────────────────────────────────────
//  AUTH STORE
// ─────────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      login: async (usernameOrEmail, password) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/login', { usernameOrEmail, password })
          set({ user: data.user, token: data.token, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return data
        } catch (e) {
          set({ isLoading: false })
          throw e
        }
      },

      register: async (username, email, password, displayName) => {
        set({ isLoading: true })
        try {
          const { data } = await api.post('/auth/register', { username, email, password, displayName })
          set({ user: data.user, token: data.token, isLoading: false })
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
          return data
        } catch (e) {
          set({ isLoading: false })
          throw e
        }
      },

      logout: () => {
        set({ user: null, token: null })
        delete api.defaults.headers.common['Authorization']
      },

      refreshUser: async () => {
        try {
          const { data } = await api.get('/auth/me')
          set({ user: data })
        } catch {}
      },

      updatePreferences: async (prefs) => {
        await api.put('/users/me/preferences', prefs)
        set(state => ({ user: { ...state.user, ...prefs } }))
      }
    }),
    {
      name: 'sudoku-auth',
      partialize: state => ({ token: state.token, user: state.user })
    }
  )
)

// ─────────────────────────────────────────────────────────────────
//  THEME STORE
// ─────────────────────────────────────────────────────────────────
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'NEON',
      setTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme)
        set({ theme })
      },
      initTheme: (theme) => {
        document.documentElement.setAttribute('data-theme', theme || 'NEON')
        set({ theme: theme || 'NEON' })
      }
    }),
    { name: 'sudoku-theme' }
  )
)

// ─────────────────────────────────────────────────────────────────
//  GAME STORE
// ─────────────────────────────────────────────────────────────────
export const useGameStore = create((set, get) => ({
  puzzle: null,
  board: Array(81).fill(0),      // current board state
  solution: null,                 // hidden solution (revealed locally from session)
  given: Array(81).fill(false),  // which cells are pre-filled
  notes: Array(81).fill(null).map(() => new Set()), // pencil marks
  selected: null,                 // selected cell index
  sessionId: null,
  elapsedSeconds: 0,
  mistakesCount: 0,
  hintsUsed: 0,
  status: 'IDLE',  // IDLE, PLAYING, PAUSED, COMPLETE
  errors: new Set(),
  powerUpsAvailable: { REVEAL_CELL: 3, ELIMINATE_WRONG: 2, XRAY_ROW: 2, XRAY_COL: 2, AUTO_NOTES: 1 },

  // ── LOAD PUZZLE ──────────────────────────────────────────────────
  loadPuzzle: (puzzleDTO) => {
    const boardArr = puzzleDTO.puzzleData.split('').map(Number)
    const givenArr = boardArr.map(v => v !== 0)
    set({
      puzzle: puzzleDTO,
      board: boardArr,
      given: givenArr,
      notes: Array(81).fill(null).map(() => new Set()),
      selected: null,
      sessionId: puzzleDTO.sessionId,
      elapsedSeconds: 0,
      mistakesCount: 0,
      hintsUsed: 0,
      status: 'PLAYING',
      errors: new Set(),
    })
  },

  // ── CELL SELECTION ───────────────────────────────────────────────
  selectCell: (index) => set({ selected: index }),

  // ── INPUT NUMBER ─────────────────────────────────────────────────
  inputNumber: (value, isNote = false) => {
    const { selected, board, given, notes, puzzle, mistakesCount } = get()
    if (selected === null || given[selected]) return

    if (isNote) {
      const newNotes = notes.map((n, i) => i === selected ? new Set(n) : n)
      if (value === 0) {
        newNotes[selected].clear()
      } else if (newNotes[selected].has(value)) {
        newNotes[selected].delete(value)
      } else {
        newNotes[selected].add(value)
      }
      set({ notes: newNotes })
      return
    }

    const newBoard = [...board]
    const newErrors = new Set(get().errors)
    newBoard[selected] = value

    // Client-side validation
    let mistakes = mistakesCount
    if (value !== 0 && puzzle) {
      // We'll check errors: if another cell in same row/col/box has same value
      const isConflict = checkConflict(newBoard, selected, value)
      if (isConflict) {
        newErrors.add(selected)
        mistakes += 1
      } else {
        newErrors.delete(selected)
      }
    } else {
      newErrors.delete(selected)
    }

    // Clear notes in same row/col/box for this value
    const newNotes = clearRelatedNotes(notes, selected, value)

    set({ board: newBoard, errors: newErrors, mistakesCount: mistakes, notes: newNotes })
  },

  // ── ERASE ─────────────────────────────────────────────────────────
  eraseCell: () => {
    const { selected, given, board, errors } = get()
    if (selected === null || given[selected]) return
    const newBoard = [...board]
    newBoard[selected] = 0
    const newErrors = new Set(errors)
    newErrors.delete(selected)
    const newNotes = get().notes.map((n, i) => i === selected ? new Set() : n)
    set({ board: newBoard, errors: newErrors, notes: newNotes })
  },

  // ── APPLY HINT ────────────────────────────────────────────────────
  applyHint: (cellIndex, value) => {
    const { board, errors, hintsUsed } = get()
    const newBoard = [...board]
    newBoard[cellIndex] = value
    const newErrors = new Set(errors)
    newErrors.delete(cellIndex)
    set({ board: newBoard, errors: newErrors, hintsUsed: hintsUsed + 1, selected: cellIndex })
  },

  // ── TIMER ─────────────────────────────────────────────────────────
  tick: () => set(state => ({ elapsedSeconds: state.elapsedSeconds + 1 })),
  pause: () => set({ status: 'PAUSED' }),
  resume: () => set({ status: 'PLAYING' }),

  // ── RESET ─────────────────────────────────────────────────────────
  resetGame: () => {
    const { puzzle, given } = get()
    if (!puzzle) return
    const boardArr = puzzle.puzzleData.split('').map(Number)
    set({
      board: boardArr,
      notes: Array(81).fill(null).map(() => new Set()),
      errors: new Set(),
      selected: null,
      elapsedSeconds: 0,
      mistakesCount: 0,
      hintsUsed: 0,
      status: 'PLAYING',
    })
  },

  setComplete: () => set({ status: 'COMPLETE' }),

  decrementPowerUp: (type) => set(state => ({
    powerUpsAvailable: {
      ...state.powerUpsAvailable,
      [type]: Math.max(0, (state.powerUpsAvailable[type] || 0) - 1)
    }
  })),

  applyPowerUpResult: (type, cells, values) => {
    if (type === 'REVEAL_CELL' || type === 'ELIMINATE_WRONG') {
      const { board } = get()
      const newBoard = [...board]
      cells.forEach((idx, i) => { newBoard[idx] = values[i] || 0 })
      set({ board: newBoard })
    }
  }
}))

// ─────────────────────────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────────────────────────
function checkConflict(board, index, value) {
  const row = Math.floor(index / 9)
  const col = index % 9
  const boxR = Math.floor(row / 3) * 3
  const boxC = Math.floor(col / 3) * 3

  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row * 9 + c] === value) return true
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r * 9 + col] === value) return true
  }
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      if ((r !== row || c !== col) && board[r * 9 + c] === value) return true
    }
  }
  return false
}

function clearRelatedNotes(notes, index, value) {
  if (value === 0) return notes
  const row = Math.floor(index / 9)
  const col = index % 9
  const boxR = Math.floor(row / 3) * 3
  const boxC = Math.floor(col / 3) * 3
  return notes.map((n, i) => {
    const r = Math.floor(i / 9), c = i % 9
    if (r === row || c === col || (Math.floor(r/3)*3 === boxR && Math.floor(c/3)*3 === boxC)) {
      const nn = new Set(n)
      nn.delete(value)
      return nn
    }
    return n
  })
}
