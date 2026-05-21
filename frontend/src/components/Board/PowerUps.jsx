import { motion } from 'framer-motion'
import { Crosshair, Trash2, ScanLine, Columns, FileSearch } from 'lucide-react'
import { useGameStore } from '../../store'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import styles from './PowerUps.module.css'

const POWERUPS = [
  { type: 'REVEAL_CELL',     label: 'Reveal Cell',  desc: 'Reveals selected cell', color: '#6c63ff', needsTarget: true  },
  { type: 'ELIMINATE_WRONG', label: 'Clear Errors', desc: 'Removes all mistakes',  color: '#ff6384', needsTarget: false },
  { type: 'XRAY_ROW',        label: 'X-Ray Row',    desc: 'Shows row answers',     color: '#36d9c8', needsTarget: true  },
  { type: 'XRAY_COL',        label: 'X-Ray Col',    desc: 'Shows col answers',     color: '#ffb347', needsTarget: true  },
  { type: 'AUTO_NOTES',      label: 'Auto Notes',   desc: 'Fills all candidates',  color: '#a78bfa', needsTarget: false },
]

export default function PowerUps() {
  const { sessionId, selected, powerUpsAvailable, decrementPowerUp, applyPowerUpResult } = useGameStore()

  const usePowerUp = async (type, needsTarget) => {
    if (!sessionId) { toast.error('Start a game first'); return }
    if ((powerUpsAvailable[type] || 0) <= 0) { toast.error('No charges left!'); return }
    if (needsTarget && selected === null) { toast.error('Select a cell first'); return }
    try {
      const { data } = await api.post('/game/powerup', {
        sessionId, powerUpType: type, targetCell: needsTarget ? selected : undefined
      })
      decrementPowerUp(type)
      applyPowerUpResult(type, data.affectedCells, data.revealedValues)
      toast.success(data.message, { icon: '⚡' })
    } catch { toast.error('Power-up failed') }
  }

  return (
    <div className={styles.panel}>
      <h3 className={styles.title}>⚡ Power-Ups</h3>
      <div className={styles.grid}>
        {POWERUPS.map(({ type, label, desc, color, needsTarget }) => {
          const count = powerUpsAvailable[type] || 0
          const disabled = count <= 0
          return (
            <motion.button
              key={type}
              className={`${styles.powerBtn} ${disabled ? styles.powerBtnDisabled : ''}`}
              style={{ '--pu-color': color }}
              onClick={() => usePowerUp(type, needsTarget)}
              whileHover={!disabled ? { scale: 1.04, y: -2 } : {}}
              whileTap={!disabled ? { scale: 0.96 } : {}}
              disabled={disabled}
            >
              <div className={styles.powerInfo}>
                <span className={styles.powerLabel}>{label}</span>
                <span className={styles.powerDesc}>{desc}</span>
              </div>
              <div className={`${styles.powerCount} ${count === 0 ? styles.powerCountEmpty : ''}`}>{count}</div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
