import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import ReactConfetti from 'react-confetti'
import styles from './VictoryModal.module.css'

export default function VictoryModal({ result, onPlayAgain, onClose }) {
  const navigate = useNavigate()
  if (!result) return null

  const ratingColors = { S: '#ffd700', A: '#6c63ff', B: '#36d9c8', C: '#ffb347', D: '#888' }
  const ratingColor = ratingColors[result.performanceRating] || '#888'

  return (
    <AnimatePresence>
      <div className={styles.overlay}>
        <ReactConfetti
          recycle={false}
          numberOfPieces={400}
          colors={['#6c63ff', '#36d9c8', '#ffd700', '#ff6384', '#ff9f40']}
        />
        <motion.div
          className={styles.modal}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className={styles.header}>
            <div className={styles.trophy}>🏆</div>
            <h2 className={styles.title}>PUZZLE SOLVED!</h2>
          </div>

          {/* Performance rating */}
          <motion.div
            className={styles.rating}
            style={{ color: ratingColor, borderColor: ratingColor }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
          >
            {result.performanceRating}
          </motion.div>

          {/* Stats */}
          <div className={styles.stats}>
            <StatItem label="Score" value={result.score?.toLocaleString()} icon="🎯" />
            <StatItem label="XP Earned" value={`+${result.xpEarned}`} icon="⭐" gold />
            <StatItem label="Level" value={`Lv. ${result.newLevel}`} icon="📈" />
          </div>

          {/* New achievements */}
          {result.newAchievements?.length > 0 && (
            <div className={styles.achievements}>
              <h3 className={styles.achTitle}>🏅 New Achievements!</h3>
              <div className={styles.achList}>
                {result.newAchievements.map((a, i) => (
                  <motion.div
                    key={a.achievementKey}
                    className={styles.achItem}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <span className={styles.achIcon}>{a.icon}</span>
                    <div>
                      <div className={styles.achName}>{a.achievementName}</div>
                      <div className={styles.achDesc}>{a.achievementDesc}</div>
                    </div>
                    <span className={styles.achXP}>+{a.xpReward} XP</span>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={onPlayAgain}>
              ▶ Play Again
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/leaderboard')}>
              🏆 Leaderboard
            </button>
            <button className="btn btn-ghost" onClick={() => navigate('/profile')}>
              👤 Profile
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

function StatItem({ label, value, icon, gold }) {
  return (
    <div className={styles.statItem}>
      <span className={styles.statIcon}>{icon}</span>
      <span className={`${styles.statValue} ${gold ? styles.gold : ''}`}>{value}</span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  )
}
