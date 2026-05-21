import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || '') + '/api',
  timeout: 15000,
})

// Attach token from storage on every request
api.interceptors.request.use(config => {
  try {
    const stored = JSON.parse(localStorage.getItem('sudoku-auth') || '{}')
    const token  = stored?.state?.token
    if (token) config.headers['Authorization'] = `Bearer ${token}`
  } catch {}
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('sudoku-auth')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
