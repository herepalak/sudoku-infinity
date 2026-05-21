import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eraser, Pencil, RotateCcw, Pause, Play, Lightbulb } from 'lucide-react'
import { useGameStore } from '../../store'
import styles from './Controls.module.css'

export default function Controls({ onHint, onPause, onReset, isPaused }) {
  const { inputNumber, eraseCell, board, given } = useGameStore()
  const [noteMode, setNoteMode] = useState(false)

  const handleNumber = (n) => inputNumber(n, noteMode)

  // Compute how many of each digit are left
  const counts = {}
  for (let i = 1; i <= 9; i++) counts[i] = 9
  board.forEach(v => { if (v > 0) counts[v] = (counts[v] || 0) - 1 })

  return (
    <div className={styles.controls}>
      {/* Action buttons */}
      <div className={styles.actions}>
        <motion.button
          className={`${styles.actionBtn} ${noteMode ? styles.actionBtnActive : ''}`}
          onClick={() => setNoteMode(!noteMode)}
          whileTap={{ scale: 0.93 }}
          title="Toggle Note Mode (pencil marks)"
        >
          <Pencil size={18} />
          <span>Notes</span>
          {noteMode && <span className={styles.badge}>ON</span>}
        </motion.button>

        <motion.button
          className={styles.actionBtn}
          onClick={eraseCell}
          whileTap={{ scale: 0.93 }}
          title="Erase selected cell"
        >
          <Eraser size={18} />
          <span>Erase</span>
        </motion.button>

        <motion.button
          className={`${styles.actionBtn} ${styles.hintBtn}`}
          onClick={onHint}
          whileTap={{ scale: 0.93 }}
          title="Get an AI hint"
        >
          <Lightbulb size={18} />
          <span>Hint</span>
        </motion.button>

        <motion.button
          className={styles.actionBtn}
          onClick={isPaused ? onPause : onPause}
          whileTap={{ scale: 0.93 }}
          title={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? <Play size={18} /> : <Pause size={18} />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </motion.button>

        <motion.button
          className={`${styles.actionBtn} ${styles.resetBtn}`}
          onClick={onReset}
          whileTap={{ scale: 0.93 }}
          title="Reset puzzle"
        >
          <RotateCcw size={18} />
          <span>Reset</span>
        </motion.button>
      </div>

      {/* Number pad */}
      <div className={styles.numPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => {
          const remaining = counts[n] ?? 0
          const completed = remaining <= 0
          return (
            <motion.button
              key={n}
              className={`${styles.numBtn} ${completed ? styles.numBtnDone : ''} ${noteMode ? styles.numBtnNote : ''}`}
              onClick={() => handleNumber(n)}
              disabled={completed}
              whileHover={!completed ? { scale: 1.08, y: -2 } : {}}
              whileTap={!completed ? { scale: 0.92 } : {}}
            >
              <span className={styles.numValue}>{n}</span>
              {!completed && (
                <span className={styles.numRemaining}>{remaining}</span>
              )}
              {completed && (
                <span className={styles.numCheck}>✓</span>
              )}
            </motion.button>
          )
        })}
      </div>

      {noteMode && (
        <p className={styles.noteHint}>
          ✏️ Note mode active — tap to add pencil marks
        </p>
      )}
    </div>
  )
}
