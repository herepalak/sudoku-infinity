import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'
import { useGameStore } from '../store'
import Board from '../components/Board/Board'
import Controls from '../components/Board/Controls'
import GameTimer from '../components/Board/GameTimer'
import styles from './StoryPage.module.css'

export default function StoryPage() {
  const [puzzles, setPuzzles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeChapter, setActiveChapter] = useState(1)
  const [playingPuzzle, setPlayingPuzzle] = useState(null)
  const { loadPuzzle, board, status, sessionId, elapsedSeconds, mistakesCount, hintsUsed, setComplete, puzzle } = useGameStore()

  useEffect(() => {
    api.get('/puzzles/story').then(r => { setPuzzles(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  const chapters = [...new Set(puzzles.map(p => p.storyChapter))].sort()
  const chapterPuzzles = puzzles.filter(p => p.storyChapter === activeChapter)

  const startLevel = async (p) => {
    loadPuzzle(p)
    setPlayingPuzzle(p)
  }

  const handleHint = async () => {
    if (!sessionId) return
    try {
      const { data } = await api.get(`/game/hint/${sessionId}`)
      useGameStore.getState().applyHint(data.cellIndex, data.value)
      toast(`${data.strategy}: ${data.explanation}`, { icon: '💡', duration: 4000 })
    } catch { toast.error('No hints available') }
  }

  useEffect(() => {
    if (status !== 'PLAYING' || !playingPuzzle || board.filter(v=>v===0).length !== 0) return
    const check = async () => {
      if (useGameStore.getState().errors.size > 0) return
      try {
        await api.post('/game/complete', { sessionId, finalBoard: board.join(''), elapsedSeconds, mistakes: mistakesCount, hintsUsed })
        setComplete(); toast.success('Level Complete! 🎉')
      } catch(e) { toast.error(e.response?.data?.message || 'Board has errors!') }
    }
    check()
  }, [board])

  if (loading) return <div style={{display:'flex',justifyContent:'center',padding:'4rem',color:'var(--text-secondary)'}}>Loading story...</div>

  if (playingPuzzle && puzzle) return (
    <div style={{maxWidth:'900px',margin:'0 auto',padding:'1.5rem'}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1rem'}}>
        <div>
          <h2 style={{fontFamily:'var(--font-display)',color:'var(--accent)',fontSize:'1.1rem'}}>{puzzle.storyTitle}</h2>
          <p style={{color:'var(--text-secondary)',fontSize:'0.85rem',marginTop:'0.25rem'}}>Chapter {puzzle.storyChapter} · Level {puzzle.storyLevel}</p>
        </div>
        <button className="btn btn-ghost" onClick={() => setPlayingPuzzle(null)} style={{fontSize:'0.7rem'}}>← Back to Story</button>
      </div>
      {puzzle.storyLore && (
        <div style={{background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius-lg)',padding:'1rem',marginBottom:'1rem',borderLeft:'3px solid var(--accent3)',fontSize:'0.85rem',color:'var(--text-secondary)',fontStyle:'italic'}}>
          "{puzzle.storyLore}"
        </div>
      )}
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'1rem'}}>
        <GameTimer />
        <Board showErrors={true} />
        <Controls onHint={handleHint} onPause={() => {}} onReset={() => {}} isPaused={false} />
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>📖 Story Mode</h1>
        <p className={styles.sub}>Journey through 4 chapters of Sudoku lore</p>
      </div>
      <div className={styles.chapters}>
        {chapters.map(ch => (
          <button key={ch} className={`${styles.chapterBtn} ${activeChapter===ch ? styles.chapterActive : ''}`} onClick={() => setActiveChapter(ch)}>
            Chapter {ch}
          </button>
        ))}
      </div>
      <div className={styles.levels}>
        {chapterPuzzles.map((p, i) => (
          <motion.div key={p.id} className={styles.levelCard} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }} onClick={() => startLevel(p)} whileHover={{ y: -4 }}>
            <div className={styles.levelNum}>Level {p.storyLevel}</div>
            <h3 className={styles.levelTitle}>{p.storyTitle}</h3>
            <p className={styles.levelLore}>{p.storyLore?.substring(0, 90)}...</p>
            <div className={styles.levelMeta}>
              <span className={`${styles.diffBadge} ${styles[p.difficulty?.toLowerCase()]}`}>{p.difficulty}</span>
              <span className={styles.time}>{Math.round(p.estimatedSolveTimeSeconds/60)} min</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
