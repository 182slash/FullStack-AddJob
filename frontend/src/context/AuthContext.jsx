import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '@/services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const stored = localStorage.getItem('user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('user')
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (email, password) => {
    setError(null)
    try {
      const { data } = await api.post('/auth/login', { email, password })
      const { user, accessToken, refreshToken } = data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      return { success: true, role: user.role }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login gagal. Periksa kembali email & password Anda.'
      setError(msg)
      return { success: false, error: msg }
    }
  }, [])

  const register = useCallback(async (payload) => {
    setError(null)
    try {
      const { data } = await api.post('/auth/register', payload)
      const { user, accessToken, refreshToken } = data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      return { success: true, role: user.role }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.'
      setError(msg)
      return { success: false, error: msg }
    }
  }, [])

  // ADD THIS — follows identical pattern as login/register
  const googleAuth = useCallback(async (credential, role = 'seeker') => {
    setError(null)
    try {
      const { data } = await api.post('/auth/google', { credential, role })
      const { user, accessToken, refreshToken } = data
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      return { success: true, role: user.role }
    } catch (err) {
      const msg = err.response?.data?.message || 'Google login gagal. Silakan coba lagi.'
      setError(msg)
      return { success: false, error: msg }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setUser(null)
    setError(null)
    api.post('/auth/logout').catch(() => {})
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const updated = { ...prev, ...updates }
      localStorage.setItem('user', JSON.stringify(updated))
      return updated
    })
  }, [])

  const isSeeker   = user?.role === 'seeker'
  const isEmployer = user?.role === 'employer'
  const isAdmin    = user?.role === 'admin'
  const isSales    = user?.role === 'sales'

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isSeeker,
        isEmployer,
        isAdmin,
        isAuthenticated: !!user,
        login,
        register,
        googleAuth,   // ADD THIS
        logout,
        updateUser,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export default AuthContext