import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import api from '../utils/api'
import styles from './LeaderboardPage.module.css'

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    setLoading(true)
    api.get(`/leaderboard/daily?date=${date}`)
      .then(r => { setEntries(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [date])

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🏆 Global Leaderboard</h1>
          <p className={styles.sub}>Daily challenge rankings — best scores worldwide</p>
        </div>
        <div className={styles.datePicker}>
          <button className={`${styles.dateBtn} ${date===today ? styles.dateBtnActive : ''}`} onClick={() => setDate(today)}>Today</button>
          <button className={`${styles.dateBtn} ${date===yesterday ? styles.dateBtnActive : ''}`} onClick={() => setDate(yesterday)}>Yesterday</button>
          <input type="date" value={date} max={today} onChange={e => setDate(e.target.value)} className={styles.dateInput} />
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>
          {[...Array(10)].map((_,i) => <div key={i} className={styles.skeleton} style={{ opacity: 1 - i*0.08 }} />)}
        </div>
      ) : entries.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🏜️</div>
          <h2>No entries yet</h2>
          <p>Be the first to complete today's daily challenge!</p>
        </div>
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Rank</span><span>Player</span><span>Time</span>
            <span>Mistakes</span><span>Hints</span><span>Score</span>
          </div>
          {entries.map((e, i) => (
            <motion.div
              key={e.username}
              className={`${styles.row} ${i < 3 ? styles[`top${i+1}`] : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <span className={styles.rank}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}
              </span>
              <span className={styles.player}>
                <div className={styles.avatar}>{(e.displayName || e.username)?.[0]?.toUpperCase()}</div>
                <div>
                  <div className={styles.name}>{e.displayName || e.username}</div>
                  <div className={styles.username}>@{e.username}</div>
                </div>
              </span>
              <span className={styles.time}>
                {String(Math.floor(e.solveTimeSeconds/60)).padStart(2,'0')}:{String(e.solveTimeSeconds%60).padStart(2,'0')}
              </span>
              <span className={`${styles.mistakes} ${e.mistakes > 0 ? styles.hasErrors : ''}`}>
                {e.mistakes === 0 ? '✓ Perfect' : `✗ ${e.mistakes}`}
              </span>
              <span className={styles.hints}>{e.hintsUsed === 0 ? '—' : e.hintsUsed}</span>
              <span className={styles.score}>{e.score?.toLocaleString()}</span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
