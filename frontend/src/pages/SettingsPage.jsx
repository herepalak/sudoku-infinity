import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore, useThemeStore } from '../store'
import toast from 'react-hot-toast'
import styles from './SettingsPage.module.css'

const THEMES = [
  { id:'NEON',    name:'Neon',    desc:'Electric purple — the default experience', color:'#6c63ff' },
  { id:'CLASSIC', name:'Classic', desc:'Warm parchment, timeless and calm',         color:'#8b4513' },
  { id:'MATRIX',  name:'Matrix',  desc:'Green rain on black — full hacker mode',   color:'#00ff41' },
  { id:'ZEN',     name:'Zen',     desc:'Amber tones, meditative and focused',       color:'#e8a838' },
]

export default function SettingsPage() {
  const { user, updatePreferences } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const [saving, setSaving] = useState(false)
  const [diff, setDiff] = useState(user?.preferredDifficulty || 'MEDIUM')

  const handleTheme = async (t) => {
    setTheme(t)
    try {
      await updatePreferences({ theme: t })
      toast.success(`Theme changed to ${t}`)
    } catch { toast.error('Failed to save theme') }
  }

  const handleDiff = async (d) => {
    setDiff(d)
    setSaving(true)
    try {
      await updatePreferences({ difficulty: d })
      toast.success('Preferences saved')
    } catch { toast.error('Failed to save') }
    setSaving(false)
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>⚙️ Settings</h1>

      <motion.section className={styles.section} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <h2 className={styles.sectionTitle}>Theme</h2>
        <p className={styles.sectionSub}>Choose how Sudoku Infinity looks and feels</p>
        <div className={styles.themeGrid}>
          {THEMES.map(t => (
            <motion.button key={t.id} className={`${styles.themeCard} ${theme===t.id ? styles.themeCardActive : ''}`}
              style={{ '--tc': t.color }} onClick={() => handleTheme(t.id)} whileHover={{ y:-3 }} whileTap={{ scale:0.97 }}>
              <div className={styles.themePreview} style={{ background: t.color }} />
              <div className={styles.themeInfo}>
                <span className={styles.themeName}>{t.name}</span>
                <span className={styles.themeDesc}>{t.desc}</span>
              </div>
              {theme === t.id && <div className={styles.themeCheck}>✓</div>}
            </motion.button>
          ))}
        </div>
      </motion.section>

      <motion.section className={styles.section} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>
        <h2 className={styles.sectionTitle}>Default Difficulty</h2>
        <p className={styles.sectionSub}>Puzzles will default to this difficulty when you click Play</p>
        <div className={styles.diffGrid}>
          {['EASY','MEDIUM','HARD','EXPERT','MASTER','LEGEND'].map(d => (
            <button key={d} className={`${styles.diffBtn} ${diff===d ? styles.diffActive : ''}`} onClick={() => handleDiff(d)}>
              {d}
            </button>
          ))}
        </div>
      </motion.section>

      <motion.section className={styles.section} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}>
        <h2 className={styles.sectionTitle}>Account</h2>
        <div className={styles.accountInfo}>
          {[['Username', user?.username], ['Email', user?.email], ['Level', user?.level], ['Member Since', new Date(user?.createdAt).toLocaleDateString()]].map(([k,v]) => (
            <div key={k} className={styles.infoRow}>
              <span className={styles.infoKey}>{k}</span>
              <span className={styles.infoVal}>{v}</span>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
