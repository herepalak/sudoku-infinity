import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', displayName: '' })
  const { register, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    try {
      await register(form.username, form.email, form.password, form.displayName)
      toast.success('Account created! Welcome to Sudoku Infinity!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    }
  }

  const f = (k) => ({ value: form[k], onChange: e => setForm({...form, [k]: e.target.value}) })

  return (
    <div className={styles.page}>
      <motion.div className={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className={styles.logo}>∞</div>
        <h1 className={styles.title}>Join the Infinity</h1>
        <p className={styles.sub}>Create your free account and start playing</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}><label>Username</label><input type="text" {...f('username')} placeholder="coolsolver99" required minLength={3} /></div>
            <div className={styles.field}><label>Display Name</label><input type="text" {...f('displayName')} placeholder="Your Name" /></div>
          </div>
          <div className={styles.field}><label>Email</label><input type="email" {...f('email')} placeholder="you@example.com" required /></div>
          <div className={styles.field}><label>Password</label><input type="password" {...f('password')} placeholder="Min 6 characters" required minLength={6} /></div>
          <button type="submit" className="btn btn-primary" style={{width:'100%', justifyContent:'center'}} disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className={styles.footer}>Already have an account? <Link to="/login">Sign In</Link></p>
      </motion.div>
    </div>
  )
}
