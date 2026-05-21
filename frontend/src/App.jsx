import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore, useThemeStore } from './store'

import Layout from './components/Layout/Layout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import GamePage from './pages/GamePage'
import DailyPage from './pages/DailyPage'
import StoryPage from './pages/StoryPage'
import InfinitePage from './pages/InfinitePage'
import BattlePage from './pages/BattlePage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

function PrivateRoute({ children }) {
  const { token } = useAuthStore()
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  const { token } = useAuthStore()
  const { theme, initTheme } = useThemeStore()

  useEffect(() => {
    initTheme(theme)
  }, [])

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="login"    element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />

        {/* Protected routes */}
        <Route path="play"     element={<PrivateRoute><GamePage /></PrivateRoute>} />
        <Route path="daily"    element={<PrivateRoute><DailyPage /></PrivateRoute>} />
        <Route path="story"    element={<PrivateRoute><StoryPage /></PrivateRoute>} />
        <Route path="infinite" element={<PrivateRoute><InfinitePage /></PrivateRoute>} />
        <Route path="battle"   element={<PrivateRoute><BattlePage /></PrivateRoute>} />
        <Route path="profile"  element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
