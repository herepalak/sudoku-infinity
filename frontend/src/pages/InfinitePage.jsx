import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import ReactConfetti from 'react-confetti'
import api from '../utils/api'
import { useGameStore } from '../store'
import Board from '../components/Board/Board'
import Controls from '../components/Board/Controls'
import GameTimer from '../components/Board/GameTimer'
import styles from './InfinitePage.module.css'

const DIFFS = ['EASY','MEDIUM','HARD','EXPERT','MASTER','LEGEND']

export default function InfinitePage() {
  const { loadPuzzle, board, status, sessionId, elapsedSeconds, mistakesCount, hintsUsed, setComplete, puzzle } = useGameStore()
  const [level, setLevel] = useState(1)
  const [diff, setDiff] = useState('MEDIUM')
  const [loading, setLoading] = useState(false)
  const [totalSolved, setTotalSolved] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  const startLevel = async (lvl) => {
    setLoading(true)
    try {
      const { data } = await api.get(`/puzzles/infinite?level=${lvl}&difficulty=${diff}`)
      loadPuzzle(data)
    } catch { toast.error('Failed to load level') }
    setLoading(false)
  }

  const handleHint = async () => {
    if (!sessionId) return
    try {
      const { data } = await api.get(`/game/hint/${sessionId}`)
      useGameStore.getState().applyHint(data.cellIndex, data.value)
      toast(`${data.strategy}: ${data.explanation}`, { icon: '💡', duration: 4000 })
    } catch { toast.error('No hints available') }
  }

  const checkComplete = async () => {
    if (!sessionId || board.filter(v=>v===0).length !== 0 || useGameStore.getState().errors.size > 0) return
    try {
      await api.post('/game/complete', { sessionId, finalBoard: board.join(''), elapsedSeconds, mistakes: mistakesCount, hintsUsed })
      setComplete(); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 4000)
      setTotalSolved(t => t+1)
      toast.success(`Level ${level} complete! Loading level ${level+1}...`, { duration: 2000 })
      setTimeout(() => { setLevel(l => { const nl = l+1; startLevel(nl); return nl }) }, 2000)
    } catch(e) { toast.error(e.response?.data?.message || 'Board has errors!') }
  }

  useState(() => {
    if (status === 'PLAYING' && puzzle && board.filter(v=>v===0).length === 0) checkComplete()
  })

  return (
    <div className={styles.page}>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={200} />}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>∞ Infinite Mode</h1>
          <p className={styles.sub}>Levels never end. How far can you go?</p>
        </div>
        <div className={styles.stats}>
          <div className={styles.stat}><span className={styles.statV}>{level}</span><span className={styles.statL}>Current Level</span></div>
          <div className={styles.stat}><span className={styles.statV}>{totalSolved}</span><span className={styles.statL}>Solved Today</span></div>
        </div>
      </div>

      {!puzzle ? (
        <motion.div className={styles.config} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
          <h2 className={styles.configTitle}>Choose Difficulty</h2>
          <div className={styles.diffGrid}>
            {DIFFS.map(d => (
              <motion.button key={d} className={`${styles.diffBtn} ${diff===d ? styles.diffActive : ''}`} onClick={() => setDiff(d)} whileHover={{ scale:1.04 }} whileTap={{ scale:0.96 }}>
                <span className={styles.diffName}>{d}</span>
              </motion.button>
            ))}
          </div>
          <div className={styles.levelInput}>
            <label>Start from Level</label>
            <input type="number" min={1} value={level} onChange={e => setLevel(Math.max(1, parseInt(e.target.value)||1))} />
          </div>
          <button className="btn btn-primary" onClick={() => startLevel(level)} disabled={loading} style={{ width:'100%', justifyContent:'center', marginTop:'1rem' }}>
            {loading ? 'Loading...' : `▶ Start Level ${level}`}
          </button>
        </motion.div>
      ) : (
        <div className={styles.gameArea}>
          <div className={styles.levelBanner}>
            <span className={styles.levelTag}>LEVEL {level}</span>
            <span className={styles.diffTag}>{diff}</span>
          </div>
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}>
            <GameTimer />
            <Board showErrors={true} />
            <Controls onHint={handleHint} onPause={() => {}} onReset={() => {}} isPaused={false} />
          </div>
          <button className="btn btn-ghost" onClick={() => useGameStore.setState({ puzzle:null, status:'IDLE', board:Array(81).fill(0) })} style={{ display:'block', margin:'1rem auto', fontSize:'0.7rem' }}>
            ← Change Settings
          </button>
        </div>
      )}
    </div>
  )
}
