import { useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '../../store'
import styles from './SudokuBoard.module.css'

export default function SudokuBoard({ readOnly = false }) {
  const {
    board, given, notes, selected, errors, status,
    selectCell, inputNumber, eraseCell
  } = useGameStore()

  // Keyboard input
  useEffect(() => {
    if (readOnly) return
    const handler = (e) => {
      if (status !== 'PLAYING') return
      if (e.key >= '1' && e.key <= '9') {
        inputNumber(parseInt(e.key), e.shiftKey)
      } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
        eraseCell()
      } else if (e.key === 'ArrowUp' && selected !== null) {
        selectCell(Math.max(0, selected - 9))
      } else if (e.key === 'ArrowDown' && selected !== null) {
        selectCell(Math.min(80, selected + 9))
      } else if (e.key === 'ArrowLeft' && selected !== null) {
        selectCell(Math.max(0, selected - 1))
      } else if (e.key === 'ArrowRight' && selected !== null) {
        selectCell(Math.min(80, selected + 1))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selected, status, readOnly])

  const getCellClass = useCallback((index) => {
    const row = Math.floor(index / 9)
    const col = index % 9
    const selRow = selected !== null ? Math.floor(selected / 9) : -1
    const selCol = selected !== null ? selected % 9 : -1
    const selBoxR = selected !== null ? Math.floor(selRow / 3) * 3 : -1
    const selBoxC = selected !== null ? Math.floor(selCol / 3) * 3 : -1
    const boxR = Math.floor(row / 3) * 3
    const boxC = Math.floor(col / 3) * 3

    const isSelected  = index === selected
    const isRelated   = selected !== null && !isSelected &&
                        (row === selRow || col === selCol || (boxR === selBoxR && boxC === selBoxC))
    const isSameNum   = selected !== null && !isSelected &&
                        board[selected] !== 0 && board[index] === board[selected]
    const isError     = errors.has(index)
    const isGiven     = given[index]
    const hasValue    = board[index] !== 0

    let cls = styles.cell
    if (isSelected)      cls += ` ${styles.selected}`
    else if (isSameNum)  cls += ` ${styles.sameNum}`
    else if (isRelated)  cls += ` ${styles.related}`
    if (isError)         cls += ` ${styles.error}`
    if (isGiven)         cls += ` ${styles.given}`
    if (!isGiven && hasValue) cls += ` ${styles.userFilled}`

    return cls
  }, [selected, board, given, errors])

  const getBorderClass = (index) => {
    const row = Math.floor(index / 9)
    const col = index % 9
    let cls = ''
    if (col === 2 || col === 5) cls += ` ${styles.borderRight}`
    if (row === 2 || row === 5) cls += ` ${styles.borderBottom}`
    return cls
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.board}>
        {board.map((value, index) => {
          const noteSet = notes[index]
          const hasNotes = noteSet && noteSet.size > 0 && value === 0

          return (
            <motion.div
              key={index}
              className={`${getCellClass(index)}${getBorderClass(index)}`}
              onClick={() => !readOnly && selectCell(index)}
              whileTap={!readOnly ? { scale: 0.92 } : {}}
            >
              {value !== 0 ? (
                <AnimatePresence mode="wait">
                  <motion.span
                    key={value}
                    className={styles.cellValue}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {value}
                  </motion.span>
                </AnimatePresence>
              ) : hasNotes ? (
                <div className={styles.noteGrid}>
                  {[1,2,3,4,5,6,7,8,9].map(n => (
                    <span key={n} className={styles.noteCell}>
                      {noteSet.has(n) ? n : ''}
                    </span>
                  ))}
                </div>
              ) : null}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
