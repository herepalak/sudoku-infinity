import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, useThemeStore } from '../../store'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import {
  Grid3X3, Zap, BookOpen, Infinity, Swords, Trophy,
  User, Settings, LogOut, Menu, X, Sun
} from 'lucide-react'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, logout } = useAuthStore()
  const { theme, setTheme } = useThemeStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const THEMES = ['NEON', 'CLASSIC', 'MATRIX', 'ZEN']

  const navLinks = [
    { to: '/play',      icon: <Grid3X3 size={16}/>, label: 'Play' },
    { to: '/daily',     icon: <Zap size={16}/>,      label: 'Daily' },
    { to: '/story',     icon: <BookOpen size={16}/>, label: 'Story' },
    { to: '/infinite',  icon: <Infinity size={16}/>, label: 'Infinite' },
    { to: '/battle',    icon: <Swords size={16}/>,   label: 'Battle' },
    { to: '/leaderboard', icon: <Trophy size={16}/>, label: 'Ranks' },
  ]

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <div className={styles.root}>
      {/* Background particles */}
      <div className={styles.bgParticles}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={styles.particle} style={{
            left: `${(i * 17 + 5) % 100}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${8 + (i % 5) * 2}s`
          }} />
        ))}
      </div>

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className={styles.nav}>
        <div className={styles.navInner}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>∞</span>
            <span className={styles.logoText}>SUDOKU<span>INFINITY</span></span>
          </Link>

          {/* Desktop Links */}
          <div className={styles.navLinks}>
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`${styles.navLink} ${location.pathname === link.to ? styles.active : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className={styles.navRight}>
            {/* Theme switcher */}
            <div className={styles.themePicker}>
              {THEMES.map(t => (
                <button
                  key={t}
                  className={`${styles.themeBtn} ${theme === t ? styles.themeBtnActive : ''}`}
                  onClick={() => setTheme(t)}
                  title={t}
                  style={{ '--t-color': t === 'NEON' ? '#6c63ff' : t === 'CLASSIC' ? '#8b4513' : t === 'MATRIX' ? '#00ff41' : '#e8a838' }}
                />
              ))}
            </div>

            {user ? (
              <div className={styles.userMenu}>
                <Link to="/profile" className={styles.userBadge}>
                  <div className={styles.avatar}>
                    {user.displayName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase()}
                  </div>
                  <div className={styles.userInfo}>
                    <span className={styles.userName}>{user.displayName || user.username}</span>
                    <span className={styles.userLevel}>Lv.{user.level}</span>
                  </div>
                </Link>
                <Link to="/settings" className={styles.iconBtn}><Settings size={16}/></Link>
                <button onClick={handleLogout} className={`${styles.iconBtn} ${styles.logoutBtn}`}>
                  <LogOut size={16}/>
                </button>
              </div>
            ) : (
              <div className={styles.authLinks}>
                <Link to="/login" className="btn btn-ghost">Login</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </div>
            )}

            {/* Mobile burger */}
            <button className={styles.burger} onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={20}/> : <Menu size={20}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={styles.mobileLink}
                onClick={() => setMenuOpen(false)}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PAGE CONTENT ────────────────────────────────────── */}
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>© 2024 Sudoku Infinity — Built with ❤️ & Java</span>
      </footer>
    </div>
  )
}
