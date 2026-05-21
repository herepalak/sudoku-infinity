import { useState } from 'react'
import { motion } from 'framer-motion'
import { Pencil, Eraser, RotateCcw } from 'lucide-react'
import { useGameStore } from '../../store'
import styles from './NumberPad.module.css'

export default function NumberPad({ onHint, onPowerUp }) {
  const { inputNumber, eraseCell, resetGame, board, status } = useGameStore()
  const [noteMode, setNoteMode] = useState(false)

  const numCount = (n) => board.filter(v => v === n).length

  return (
    <div className={styles.wrapper}>
      {/* Mode toggle */}
      <div className={styles.modeRow}>
        <button
          className={`${styles.modeBtn} ${!noteMode ? styles.modeActive : ''}`}
          onClick={() => setNoteMode(false)}
        >
          ✏️ Fill
        </button>
        <button
          className={`${styles.modeBtn} ${noteMode ? styles.modeActive : ''}`}
          onClick={() => setNoteMode(true)}
        >
          <Pencil size={13}/> Notes
        </button>
      </div>

      {/* Number buttons */}
      <div className={styles.numGrid}>
        {[1,2,3,4,5,6,7,8,9].map(n => {
          const count = numCount(n)
          const complete = count >= 9
          return (
            <motion.button
              key={n}
              className={`${styles.numBtn} ${complete ? styles.complete : ''}`}
              onClick={() => inputNumber(n, noteMode)}
              disabled={status !== 'PLAYING'}
              whileTap={{ scale: 0.88 }}
              whileHover={{ scale: 1.05 }}
            >
              <span className={styles.numBtnValue}>{n}</span>
              {!complete && (
                <span className={styles.numBtnCount}>{9 - count} left</span>
              )}
              {complete && <span className={styles.checkmark}>✓</span>}
            </motion.button>
          )
        })}
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        <motion.button
          className={styles.actionBtn}
          onClick={eraseCell}
          disabled={status !== 'PLAYING'}
          whileTap={{ scale: 0.9 }}
          title="Erase"
        >
          <Eraser size={16}/>
          <span>Erase</span>
        </motion.button>

        <motion.button
          className={`${styles.actionBtn} ${styles.hintBtn}`}
          onClick={onHint}
          disabled={status !== 'PLAYING'}
          whileTap={{ scale: 0.9 }}
          title="AI Hint"
        >
          <span>💡</span>
          <span>Hint</span>
        </motion.button>

        <motion.button
          className={styles.actionBtn}
          onClick={resetGame}
          disabled={status !== 'PLAYING'}
          whileTap={{ scale: 0.9 }}
          title="Reset"
        >
          <RotateCcw size={16}/>
          <span>Reset</span>
        </motion.button>
      </div>
    </div>
  )
}
