import { useEffect } from 'react'
import { useGameStore } from '../../store'
import styles from './GameTimer.module.css'

function formatTime(s) {
  const m = Math.floor(s / 60); const sec = s % 60
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
}

export default function GameTimer() {
  const { elapsedSeconds, status, tick, mistakesCount, hintsUsed } = useGameStore()
  useEffect(() => {
    if (status !== 'PLAYING') return
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [status, tick])
  return (
    <div className={styles.timerRow}>
      <div className={styles.stat}>
        <span className={styles.statLabel}>TIME</span>
        <span className={`${styles.statValue} ${styles.time}`}>{formatTime(elapsedSeconds)}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>MISTAKES</span>
        <span className={`${styles.statValue} ${mistakesCount > 0 ? styles.mistakes : ''}`}>{mistakesCount}</span>
      </div>
      <div className={styles.stat}>
        <span className={styles.statLabel}>HINTS</span>
        <span className={styles.statValue}>{hintsUsed}</span>
      </div>
      {status === 'PAUSED' && <div className={styles.pausedBadge}>⏸ PAUSED</div>}
    </div>
  )
}
