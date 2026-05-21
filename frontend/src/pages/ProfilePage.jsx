import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store'
import api from '../utils/api'
import styles from './ProfilePage.module.css'

const RARITY_COLORS = { COMMON: '#9ca3af', RARE: '#6c63ff', EPIC: '#a855f7', LEGENDARY: '#ffd700' }

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [tab, setTab] = useState('stats')

  useEffect(() => {
    Promise.all([api.get('/users/me/stats'), api.get('/users/me/achievements')])
      .then(([statsRes, achRes]) => { setStats(statsRes.data); setAchievements(achRes.data) })
      .catch(() => {})
  }, [])

  const xpPercent = stats ? Math.min(100, ((user.xpPoints % stats.xpToNextLevel) / stats.xpToNextLevel) * 100) : 0

  return (
    <div className={styles.page}>
      {/* Profile header */}
      <motion.div className={styles.profileCard} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <div className={styles.avatarLarge}>{(user?.displayName || user?.username)?.[0]?.toUpperCase()}</div>
        <div className={styles.profileInfo}>
          <h1 className={styles.displayName}>{user?.displayName || user?.username}</h1>
          <p className={styles.username}>@{user?.username}</p>
          <div className={styles.levelBadge}>Level {user?.level}</div>
        </div>
        <div className={styles.xpBar}>
          <div className={styles.xpLabel}>
            <span>XP Progress</span>
            <span>{user?.xpPoints?.toLocaleString()} XP</span>
          </div>
          <div className={styles.xpTrack}>
            <motion.div className={styles.xpFill} initial={{ width: 0 }} animate={{ width: `${xpPercent}%` }} transition={{ duration: 1, delay: 0.3 }} />
          </div>
          <div className={styles.xpNext}>{stats ? `${stats.xpToNextLevel?.toLocaleString()} XP to Level ${(user?.level||0)+1}` : '…'}</div>
        </div>
      </motion.div>

      {/* Streak row */}
      <div className={styles.streakRow}>
        {[
          { label: 'Current Streak', value: `${user?.currentStreak || 0} 🔥`, color: '#ff6384' },
          { label: 'Longest Streak', value: `${user?.longestStreak || 0} ⚡`, color: '#ffd700' },
          { label: 'Total Solved',   value: stats?.totalPuzzlesSolved || 0,    color: '#34d399' },
          { label: 'Avg. Time',      value: stats?.avgSolveTimeSeconds ? `${Math.round(stats.avgSolveTimeSeconds/60)}m ${Math.round(stats.avgSolveTimeSeconds%60)}s` : '—', color: '#6c63ff' },
        ].map(s => (
          <motion.div key={s.label} className={styles.statCard} style={{ '--s-color': s.color }} initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}>
            <span className={styles.statCardVal}>{s.value}</span>
            <span className={styles.statCardLabel}>{s.label}</span>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {['stats', 'achievements'].map(t => (
          <button key={t} className={`${styles.tab} ${tab===t ? styles.tabActive : ''}`} onClick={() => setTab(t)}>
            {t === 'stats' ? '📊 Stats' : `🏆 Achievements (${achievements.length})`}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <motion.div className={styles.statsGrid} initial={{ opacity:0 }} animate={{ opacity:1 }}>
          {[
            ['Total Puzzles Solved', stats.totalPuzzlesSolved],
            ['Average Solve Time',   stats.avgSolveTimeSeconds ? `${Math.round(stats.avgSolveTimeSeconds/60)}:${String(Math.round(stats.avgSolveTimeSeconds%60)).padStart(2,'0')}` : '—'],
            ['Current Streak',       `${stats.currentStreak} days`],
            ['Longest Streak',       `${stats.longestStreak} days`],
            ['Total XP',             stats.xpPoints?.toLocaleString()],
            ['Current Level',        stats.level],
          ].map(([label, val]) => (
            <div key={label} className={styles.statItem}>
              <span className={styles.statLabel}>{label}</span>
              <span className={styles.statValue}>{val}</span>
            </div>
          ))}
        </motion.div>
      )}

      {tab === 'achievements' && (
        <motion.div className={styles.achGrid} initial={{ opacity:0 }} animate={{ opacity:1 }}>
          {achievements.length === 0 ? (
            <div className={styles.noAch}>Solve puzzles to earn achievements! 🎯</div>
          ) : achievements.map((a, i) => (
            <motion.div key={a.achievementKey} className={styles.achCard} initial={{ opacity:0, y:15 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.05 }}
              style={{ borderColor: RARITY_COLORS[a.rarity] + '55' }}>
              <div className={styles.achIcon}>{a.icon}</div>
              <div className={styles.achInfo}>
                <span className={styles.achName}>{a.achievementName}</span>
                <span className={styles.achDesc}>{a.achievementDesc}</span>
                <span className={styles.achRarity} style={{ color: RARITY_COLORS[a.rarity] }}>{a.rarity} · +{a.xpReward} XP</span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
