import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ReactConfetti from 'react-confetti'
import toast from 'react-hot-toast'
import { useGameStore } from '../store'
import api from '../utils/api'
import Board from '../components/Board/Board'
import Controls from '../components/Board/Controls'
import GameTimer from '../components/Board/GameTimer'
import PowerUps from '../components/Board/PowerUps'
import styles from './GamePage.module.css'

const DIFFICULTIES = ['EASY','MEDIUM','HARD','EXPERT','MASTER','LEGEND']
const VARIANTS = ['CLASSIC','DIAGONAL','KILLER']

export default function GamePage() {
  const { puzzle, board, status, sessionId, elapsedSeconds, mistakesCount, hintsUsed, loadPuzzle, setComplete, pause, resume, resetGame } = useGameStore()
  const [loading, setLoading] = useState(false)
  const [diff, setDiff] = useState('MEDIUM')
  const [variant, setVariant] = useState('CLASSIC')
  const [isPaused, setIsPaused] = useState(false)
  const [completionData, setCompletionData] = useState(null)
  const [showConfetti, setShowConfetti] = useState(false)
  const navigate = useNavigate()

  const fetchPuzzle = async () => {
    setLoading(true)
    try {
      const { data } = await api.get(`/puzzles/generate?difficulty=${diff}&variant=${variant}`)
      loadPuzzle(data)
      setCompletionData(null)
    } catch { toast.error('Failed to load puzzle') }
    setLoading(false)
  }

  useEffect(() => {
    if (status !== 'PLAYING' || !puzzle) return
    const zeros = board.filter(v => v === 0).length
    const hasErrors = useGameStore.getState().errors.size > 0
    if (zeros === 0 && !hasErrors) checkCompletion()
  }, [board])

  const checkCompletion = async () => {
    if (!sessionId) return
    try {
      const { data } = await api.post('/game/complete', { sessionId, finalBoard: board.join(''), elapsedSeconds, mistakes: mistakesCount, hintsUsed })
      setComplete(); setCompletionData(data); setShowConfetti(true)
      setTimeout(() => setShowConfetti(false), 5000)
    } catch (e) { toast.error(e.response?.data?.message || 'Board has errors!') }
  }

  const handleHint = async () => {
    if (!sessionId) return
    try {
      const { data } = await api.get(`/game/hint/${sessionId}`)
      useGameStore.getState().applyHint(data.cellIndex, data.value)
      toast(`${data.strategy}: ${data.explanation}`, { icon: '💡', duration: 4000 })
    } catch { toast.error('No hints available') }
  }

  const handleSave = useCallback(async () => {
    if (!sessionId) return
    try {
      const notesObj = {}
      useGameStore.getState().notes.forEach((n, i) => { if (n.size > 0) notesObj[i] = [...n] })
      await api.post('/game/save', { sessionId, currentBoard: board.join(''), notesData: JSON.stringify(notesObj), elapsedSeconds, mistakesCount })
    } catch {}
  }, [sessionId, board, elapsedSeconds, mistakesCount])

  useEffect(() => {
    if (status !== 'PLAYING') return
    const id = setInterval(handleSave, 30000)
    return () => clearInterval(id)
  }, [status, handleSave])

  const handlePauseResume = () => { if (isPaused) { resume(); setIsPaused(false) } else { pause(); setIsPaused(true) } }
  const ratingColors = { S: '#ffd700', A: '#6c63ff', B: '#36d9c8', C: '#ffb347', D: '#ff6384' }

  return (
    <div className={styles.page}>
      {showConfetti && <ReactConfetti recycle={false} numberOfPieces={300} />}
      <div className={styles.header}>
        <h1 className={styles.title}>{puzzle ? `${puzzle.difficulty} · ${puzzle.variant}` : 'Choose Your Puzzle'}</h1>
        {puzzle && <button className="btn btn-ghost" onClick={handleSave} style={{fontSize:'0.7rem'}}>💾 Save</button>}
      </div>

      {!puzzle && (
        <motion.div className={styles.configPanel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className={styles.configTitle}>Configure Your Challenge</h2>
          <div className={styles.configRow}><label>Difficulty</label>
            <div className={styles.pills}>{DIFFICULTIES.map(d => <button key={d} className={`${styles.pill} ${diff===d?styles.pillActive:''}`} onClick={() => setDiff(d)}>{d}</button>)}</div>
          </div>
          <div className={styles.configRow}><label>Variant</label>
            <div className={styles.pills}>{VARIANTS.map(v => <button key={v} className={`${styles.pill} ${variant===v?styles.pillActive:''}`} onClick={() => setVariant(v)}>{v}</button>)}</div>
          </div>
          <motion.button className="btn btn-primary" onClick={fetchPuzzle} disabled={loading} style={{ marginTop:'1rem', justifyContent:'center', width:'100%' }}>
            {loading ? '⏳ Generating...' : '⚡ Start Puzzle'}
          </motion.button>
        </motion.div>
      )}

      {puzzle && (
        <div className={styles.gameLayout}>
          <div className={styles.sidebar}><PowerUps />
            <button className="btn btn-ghost" onClick={() => useGameStore.setState({ puzzle:null, status:'IDLE', board:Array(81).fill(0) })} style={{ width:'100%', justifyContent:'center', marginTop:'0.5rem', fontSize:'0.7rem' }}>🔄 New Puzzle</button>
          </div>
          <div className={styles.boardArea}>
            <GameTimer />
            {isPaused && (
              <div className={styles.pauseOverlay}><div className={styles.pauseBox}>
                <div style={{fontSize:'3rem'}}>⏸</div><h2>Paused</h2>
                <button className="btn btn-primary" onClick={handlePauseResume}>Resume</button>
              </div></div>
            )}
            <Board showErrors={true} />
            <Controls onHint={handleHint} onPause={handlePauseResume} onReset={() => { resetGame(); toast('Reset!', { icon: '🔄' }) }} isPaused={isPaused} />
          </div>
          <div className={styles.infoPanel}>
            <div className="card">
              <h3 className={styles.infoTitle}>Puzzle Info</h3>
              <div className={styles.infoList}>
                {[['Difficulty', puzzle.difficulty],['Variant', puzzle.variant],['Clues', puzzle.givenCount],['Est.', `${Math.round(puzzle.estimatedSolveTimeSeconds/60)} min`]].map(([k,v]) => (
                  <div key={k} className={styles.infoRow}><span>{k}</span><span className={styles.infoVal}>{v}</span></div>
                ))}
              </div>
            </div>
            <div className="card" style={{marginTop:'1rem'}}>
              <h3 className={styles.infoTitle}>Controls</h3>
              <ul className={styles.howTo}>
                <li>Click cell to select</li><li>1–9 to fill number</li>
                <li>Arrow keys to move</li><li>Notes for pencil marks</li>
                <li>Power-Ups for help</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {status === 'COMPLETE' && completionData && (
          <motion.div className={styles.overlay} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <motion.div className={styles.modal} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type:'spring', stiffness:200 }}>
              <div className={styles.rating} style={{ color: ratingColors[completionData.performanceRating] }}>{completionData.performanceRating}</div>
              <h2 className={styles.modalTitle}>Puzzle Complete! 🎉</h2>
              <div className={styles.modalStats}>
                {[['Score', completionData.score?.toLocaleString()],['XP', `+${completionData.xpEarned}`],['Level', completionData.newLevel]].map(([k,v]) => (
                  <div key={k} className={styles.mStat}><span>{k}</span><strong>{v}</strong></div>
                ))}
              </div>
              {completionData.newAchievements?.length > 0 && (
                <div className={styles.achs}>
                  <p>🏆 New Achievements!</p>
                  {completionData.newAchievements.map(a => (
                    <div key={a.achievementKey} className={styles.ach}><span>{a.icon}</span><div><b>{a.achievementName}</b><small>{a.achievementDesc}</small></div></div>
                  ))}
                </div>
              )}
              <div className={styles.modalBtns}>
                <button className="btn btn-primary" onClick={fetchPuzzle}>Next Puzzle</button>
                <button className="btn btn-ghost" onClick={() => navigate('/profile')}>My Stats</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
