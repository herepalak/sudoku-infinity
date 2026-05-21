import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store'
import { Zap, BookOpen, Infinity, Swords, Trophy, Brain, Star, Grid3X3 } from 'lucide-react'
import styles from './HomePage.module.css'

const FEATURES = [
  { icon: '∞', title: 'Infinite Levels',   desc: 'Algorithmically generated puzzles, never repeating, endless challenge.', color: '#6c63ff' },
  { icon: '📖', title: 'Story Mode',        desc: '20 hand-crafted narrative levels across 4 chapters with rich lore.',     color: '#36d9c8' },
  { icon: '⚔️', title: 'Battle Mode',       desc: 'Race against AI or friends. Solve faster to earn bonus power-ups.',     color: '#ff6384' },
  { icon: '⚡', title: 'Power-Ups',         desc: 'Reveal cells, X-Ray rows, eliminate mistakes. Strategy meets logic.',    color: '#ffb347' },
  { icon: '🧠', title: 'AI Hint Engine',    desc: 'Not just answers — learn WHY with human-readable strategy explanations.', color: '#a78bfa' },
  { icon: '🏆', title: 'Daily Challenge',   desc: 'One global puzzle per day. Compete on the worldwide leaderboard.',       color: '#ffd700' },
  { icon: '⭐', title: 'XP & Achievements', desc: 'Level up, earn rare badges, maintain streaks. Track your growth.',       color: '#34d399' },
  { icon: '🎨', title: 'Four Themes',       desc: 'Neon, Classic, Matrix, and Zen skins. Play your way.',                  color: '#f472b6' },
]

const DIFFICULTIES = [
  { name: 'Easy',   color: '#34d399', desc: '36 clues · ~5 min'  },
  { name: 'Medium', color: '#6c63ff', desc: '29 clues · ~10 min' },
  { name: 'Hard',   color: '#f59e0b', desc: '25 clues · ~15 min' },
  { name: 'Expert', color: '#ef4444', desc: '22 clues · ~20 min' },
  { name: 'Master', color: '#ec4899', desc: '19 clues · ~30 min' },
  { name: 'Legend', color: '#8b5cf6', desc: '17 clues · ??? min' },
]

export default function HomePage() {
  const { user } = useAuthStore()
  const sample = '530070000600195000098000060800060003400803001700020006060000280000419005000080079'

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <motion.div className={styles.heroContent} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className={styles.heroBadge}><span>⚡</span> The Ultimate Sudoku Experience</div>
          <h1 className={styles.heroTitle}>SUDOKU<br /><span className={styles.heroAccent}>INFINITY</span></h1>
          <p className={styles.heroSubtitle}>Infinite puzzles. Six difficulties. Four variants. Story mode. Battle mode. Power-ups. AI hints. Daily leaderboards.</p>
          <div className={styles.heroCTA}>
            {user
              ? <><Link to="/play" className="btn btn-primary">Continue Playing</Link><Link to="/daily" className="btn btn-ghost">Today's Challenge</Link></>
              : <><Link to="/register" className="btn btn-primary">Start Playing Free</Link><Link to="/login" className="btn btn-ghost">Sign In</Link></>}
          </div>
        </motion.div>
        <motion.div className={styles.heroGrid} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <div className={styles.miniBoard}>
            {sample.split('').map((v, i) => (
              <motion.div key={i} className={`${styles.miniCell} ${v !== '0' ? styles.miniCellGiven : ''}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.007 }}
                style={{ borderRight: [2,5].includes(i%9) ? '2px solid var(--accent)' : '', borderBottom: [2,5].includes(Math.floor(i/9)) ? '2px solid var(--accent)' : '' }}>
                {v !== '0' ? v : ''}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Six Difficulties</h2>
        <p className={styles.sectionSub}>From your first puzzle to your greatest challenge</p>
        <div className={styles.diffGrid}>
          {DIFFICULTIES.map((d, i) => (
            <motion.div key={d.name} className={styles.diffCard} style={{ '--d-color': d.color }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -4 }}>
              <div className={styles.diffDot} />
              <span className={styles.diffName}>{d.name}</span>
              <span className={styles.diffDesc}>{d.desc}</span>
            </motion.div>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Everything You Need</h2>
        <p className={styles.sectionSub}>Built for casual players and Sudoku masters alike</p>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} className={styles.featureCard} style={{ '--f-color': f.color }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} whileHover={{ y: -6, borderColor: f.color }}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3 className={styles.featureTitle}>{f.title}</h3>
              <p className={styles.featureDesc}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className={styles.statsBanner}>
        {[['∞','Unique Puzzles'],['6','Difficulties'],['4','Game Variants'],['20','Story Levels']].map(([v,l], i) => (
          <motion.div key={l} className={styles.statItem} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <span className={styles.statValue}>{v}</span>
            <span className={styles.statLabel}>{l}</span>
          </motion.div>
        ))}
      </section>

      {!user && (
        <section className={styles.ctaSection}>
          <motion.div className={styles.ctaBox} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2>Ready to Begin?</h2>
            <p>Join thousands of Sudoku players. Free forever.</p>
            <Link to="/register" className="btn btn-primary">Create Free Account</Link>
          </motion.div>
        </section>
      )}
    </div>
  )
}
