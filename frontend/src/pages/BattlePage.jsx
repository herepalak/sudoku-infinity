import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import styles from './BattlePage.module.css'

export default function BattlePage() {
  return (
    <div className={styles.page}>
      <motion.div className={styles.hero} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}>
        <div className={styles.icon}>⚔️</div>
        <h1 className={styles.title}>Battle Mode</h1>
        <p className={styles.sub}>Race against the AI or challenge a friend. First to solve wins power-up bonuses!</p>
        <div className={styles.modes}>
          <motion.div className={styles.modeCard} whileHover={{ scale:1.03, y:-4 }}>
            <span className={styles.modeIcon}>🤖</span>
            <h2>vs AI</h2>
            <p>Race against an adaptive AI that adjusts to your skill level. Multiple difficulty tiers.</p>
            <Link to="/play?mode=battle&opponent=ai" className="btn btn-primary">Fight AI</Link>
          </motion.div>
          <motion.div className={styles.modeCard} whileHover={{ scale:1.03, y:-4 }}>
            <span className={styles.modeIcon}>👥</span>
            <h2>vs Friend</h2>
            <p>Share a room code with a friend. Same puzzle, same start time — may the best solver win.</p>
            <button className="btn btn-ghost" onClick={() => alert('Coming soon! Share a room link to play with friends.')}>Create Room</button>
          </motion.div>
          <motion.div className={styles.modeCard} whileHover={{ scale:1.03, y:-4 }}>
            <span className={styles.modeIcon}>🌐</span>
            <h2>Ranked</h2>
            <p>Global matchmaking. Climb the ranked ladder, earn exclusive skins and badges.</p>
            <button className="btn btn-ghost" onClick={() => alert('Ranked mode coming in v2.0!')}>Coming Soon</button>
          </motion.div>
        </div>
        <div className={styles.rules}>
          <h3>Battle Rules</h3>
          <ul>
            <li>⚡ Both players get the same puzzle simultaneously</li>
            <li>🎯 First to complete correctly wins</li>
            <li>💥 Mistakes cost 15 seconds each</li>
            <li>🏆 Winner earns 1.5x score multiplier</li>
            <li>🔮 Power-up charges transfer to next puzzle on win</li>
          </ul>
        </div>
      </motion.div>
    </div>
  )
}
