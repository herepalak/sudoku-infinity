import { motion, AnimatePresence } from 'framer-motion'
import styles from './HintModal.module.css'

export default function HintModal({ hint, onApply, onClose }) {
  if (!hint) return null
  return (
    <AnimatePresence>
      <div className={styles.overlay} onClick={onClose}>
        <motion.div
          className={styles.modal}
          onClick={e => e.stopPropagation()}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 30, opacity: 0 }}
        >
          <div className={styles.header}>
            <span className={styles.icon}>💡</span>
            <div>
              <h3 className={styles.strategy}>{hint.strategy}</h3>
              <p className={styles.row}>
                Row {Math.floor(hint.cellIndex / 9) + 1}, Col {hint.cellIndex % 9 + 1}
              </p>
            </div>
          </div>
          <p className={styles.explanation}>{hint.explanation}</p>
          <div className={styles.answer}>
            The value is: <span className={styles.value}>{hint.value}</span>
          </div>
          <div className={styles.actions}>
            <button className="btn btn-primary" onClick={onApply}>Apply Hint</button>
            <button className="btn btn-ghost" onClick={onClose}>Got it</button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
