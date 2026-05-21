import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import ReactConfetti from 'react-confetti'
import api from '../utils/api'
import { useGameStore } from '../store'
import Board from '../components/Board/Board'
import Controls from '../components/Board/Controls'
import GameTimer from '../components/Board/GameTimer'
import styles from './DailyPage.module.css'

export default function DailyPage() {
  const { loadPuzzle, board, status, sessionId, elapsedSeconds, mistakesCount, hintsUsed, setComplete } = useGameStore()
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState([])
  const [completionData, setCompletionData] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const [puzzleRes, lbRes] = await Promise.all([api.get('/puzzles/daily'), api.get('/leaderboard/daily')])
        loadPuzzle(puzzleRes.data)
        setLeaderboard(lbRes.data)
      } catch { toast.error('Failed to load daily challenge') }
      setLoading(false)
    }
    init()
  }, [])

  const handleHint = async () => {
    if (!sessionId) return
    try {
      const { data } = await api.get(`/game/hint/${sessionId}`)
      useGameStore.getState().applyHint(data.cellIndex, data.value)
      toast(`${data.strategy}: ${data.explanation}`, { icon: '💡', duration: 4000 })
    } catch { toast.error('No hints available') }
  }

  useEffect(() => {
    if (status !== 'PLAYING' || board.filter(v=>v===0).length !== 0) return
    const checkComplete = async () => {
      try {
        const { data } = await api.post('/game/complete', { sessionId, finalBoard: board.join(''), elapsedSeconds, mistakes: mistakesCount, hintsUsed })
        setComplete(); setCompletionData(data); setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
        const lbRes = await api.get('/leaderboard/daily')
        setLeaderboard(lbRes.data)
      } catch(e) { toast.error(e.response?.data?.message || 'Board has errors!') }
    }
    if (useGameStore.getState().errors.size === 0) checkComplete()
  }, [board])

  if (loading) return <div className={styles.loading}><div className={styles.spinner} />Loading today's challenge...</div>

  return (
    <div className={styles.page}>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={300} />}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Daily Challenge</h1>
          <p className={styles.sub}>{new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</p>
        </div>
        <div className={styles.badge}>🔥 One chance per day</div>
      </div>
      <div className={styles.layout}>
        <div className={styles.boardArea}>
          <GameTimer />
          <Board showErrors={true} />
          <Controls onHint={handleHint} onPause={() => {}} onReset={() => {}} isPaused={false} />
        </div>
        <div className={styles.leaderboard}>
          <h2 className={styles.lbTitle}>🏆 Today's Leaderboard</h2>
          {leaderboard.length === 0 ? (
            <p className={styles.lbEmpty}>Be the first to complete today's puzzle!</p>
          ) : (
            <div className={styles.lbList}>
              {leaderboard.slice(0,20).map((e, i) => (
                <motion.div key={e.username} className={`${styles.lbEntry} ${i < 3 ? styles[`top${i+1}`] : ''}`} initial={{ opacity:0, x: 20 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.04 }}>
                  <span className={styles.rank}>{i < 3 ? ['🥇','🥈','🥉'][i] : `#${i+1}`}</span>
                  <span className={styles.lbName}>{e.displayName || e.username}</span>
                  <div className={styles.lbStats}>
                    <span>{Math.floor(e.solveTimeSeconds/60)}:{String(e.solveTimeSeconds%60).padStart(2,'0')}</span>
                    <span className={styles.lbScore}>{e.score?.toLocaleString()}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
