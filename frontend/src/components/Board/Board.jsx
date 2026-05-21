import { useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store'
import styles from './Board.module.css'

export default function Board({ noteMode = false, showErrors = true }) {
  const {
    board, given, notes, selected, errors, puzzle,
    selectCell, inputNumber, eraseCell
  } = useGameStore()

  // Keyboard input
  useEffect(() => {
    const handler = (e) => {
      const key = e.key
      if (key >= '1' && key <= '9') inputNumber(parseInt(key), noteMode)
      else if (key === 'Backspace' || key === 'Delete' || key === '0') eraseCell()
      else if (key === 'ArrowUp'    && selected !== null) selectCell(Math.max(0, selected - 9))
      else if (key === 'ArrowDown'  && selected !== null) selectCell(Math.min(80, selected + 9))
      else if (key === 'ArrowLeft'  && selected !== null) selectCell(Math.max(0, selected - 1))
      else if (key === 'ArrowRight' && selected !== null) selectCell(Math.min(80, selected + 1))
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected, noteMode, inputNumber, eraseCell, selectCell])

  const getHighlight = useCallback((index) => {
    if (selected === null) return ''
    const selRow = Math.floor(selected / 9)
    const selCol = selected % 9
    const selBox = Math.floor(selRow / 3) * 3 + Math.floor(selCol / 3)
    const row = Math.floor(index / 9)
    const col = index % 9
    const box = Math.floor(row / 3) * 3 + Math.floor(col / 3)
    if (index === selected) return 'selected'
    if (row === selRow || col === selCol || box === selBox) return 'related'
    if (board[selected] !== 0 && board[index] === board[selected]) return 'same'
    return ''
  }, [selected, board])

  return (
    <div className={styles.boardWrapper}>
      <div className={styles.board} role="grid" aria-label="Sudoku board">
        {board.map((value, index) => {
          const highlight = getHighlight(index)
          const isGiven = given[index]
          const hasError = showErrors && errors.has(index)
          const cellNotes = notes[index]
          const hasNotes = cellNotes && cellNotes.size > 0 && value === 0
          const row = Math.floor(index / 9)
          const col = index % 9

          return (
            <motion.button
              key={index}
              className={`
                ${styles.cell}
                ${highlight === 'selected' ? styles.cellSelected : ''}
                ${highlight === 'related'  ? styles.cellRelated  : ''}
                ${highlight === 'same'     ? styles.cellSame     : ''}
                ${isGiven   ? styles.cellGiven   : ''}
                ${hasError  ? styles.cellError   : ''}
                ${col === 2 || col === 5 ? styles.borderRight  : ''}
                ${row === 2 || row === 5 ? styles.borderBottom : ''}
              `}
              onClick={() => selectCell(index)}
              aria-label={`Row ${row+1} Column ${col+1}${value ? ` value ${value}` : ''}`}
              whileTap={{ scale: 0.95 }}
            >
              {hasNotes ? (
                <div className={styles.notesGrid}>
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <span key={n} className={`${styles.note} ${cellNotes.has(n) ? styles.noteVisible : ''}`}>
                      {cellNotes.has(n) ? n : ''}
                    </span>
                  ))}
                </div>
              ) : value !== 0 ? (
                <motion.span
                  key={`${index}-${value}`}
                  className={styles.cellValue}
                  initial={!isGiven ? { scale: 0.5, opacity: 0 } : {}}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  {value}
                </motion.span>
              ) : null}

              {hasError && (
                <motion.div
                  className={styles.errorDot}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
