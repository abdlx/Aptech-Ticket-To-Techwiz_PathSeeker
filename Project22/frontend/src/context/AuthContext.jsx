import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { apiRequest, endpoints } from '../services/pathseekerApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  // `user` is the authenticated user from GET /api/auth/me, or null when signed out.
  // `initializing` is true only for the one-time session-restore check on load,
  // so the app can avoid flashing the login screen before that check resolves.
  const [user, setUser] = useState(null)
  const [initializing, setInitializing] = useState(true)
  const [pendingVerificationEmail, setPendingVerificationEmailState] = useState(() => {
    try {
      return sessionStorage.getItem('ps_pending_email') || localStorage.getItem('ps_pending_email') || null
    } catch {
      return null
    }
  })

  const setPendingVerificationEmail = useCallback((email) => {
    setPendingVerificationEmailState(email)
    try {
      if (email) {
        sessionStorage.setItem('ps_pending_email', email)
        localStorage.setItem('ps_pending_email', email)
      } else {
        sessionStorage.removeItem('ps_pending_email')
        localStorage.removeItem('ps_pending_email')
      }
    } catch {}
  }, [])

  const restoreSession = useCallback(async () => {
    try {
      const { data } = await apiRequest(endpoints.auth.me)
      setUser(data.user)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    restoreSession().finally(() => setInitializing(false))
  }, [restoreSession])

  useEffect(() => {
    const handleExpired = () => setUser(null)
    window.addEventListener('pathseeker:session-expired', handleExpired)
    return () => window.removeEventListener('pathseeker:session-expired', handleExpired)
  }, [])

  const register = useCallback(async ({ name, email, password, stage, termsAccepted = true }) => {
    const { data } = await apiRequest(endpoints.auth.register, {
      method: 'POST',
      body: JSON.stringify({ name, email, password, stage, termsAccepted }),
    })
    const normalizedEmail = email.trim().toLowerCase()
    setPendingVerificationEmail(normalizedEmail)
    return data.user
  }, [setPendingVerificationEmail])

  const verifyEmail = useCallback(async ({ email, code }) => {
    const targetEmail = (email || pendingVerificationEmail || sessionStorage.getItem('ps_pending_email') || '').trim().toLowerCase()
    const { data } = await apiRequest(endpoints.auth.verifyEmail, {
      method: 'POST',
      body: JSON.stringify({ email: targetEmail, code: String(code).trim() }),
    })
    setUser(data.user)
    setPendingVerificationEmail(null)
    return data.user
  }, [pendingVerificationEmail, setPendingVerificationEmail])

  const resendVerification = useCallback(async (email) => {
    await apiRequest(endpoints.auth.resendVerification, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }, [])

  const login = useCallback(async ({ email, password }) => {
    const { data } = await apiRequest(endpoints.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(data.user)
    return data.user
  }, [])

  const adminLogin = useCallback(async ({ email, password }) => {
    const { data } = await apiRequest(endpoints.auth.adminLogin, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await apiRequest(endpoints.auth.logout, { method: 'POST' })
    } finally {
      setUser(null)
    }
  }, [])

  const forgotPassword = useCallback(async (email) => {
    await apiRequest(endpoints.auth.forgotPassword, {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  }, [])

  const resetPassword = useCallback(async ({ token, password }) => {
    await apiRequest(endpoints.auth.resetPassword, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  }, [])

  const value = useMemo(
    () => ({
      user,
      initializing,
      isAuthenticated: Boolean(user),
      isStaff: Boolean(user && ['content_editor', 'support_manager', 'admin', 'super_admin'].includes(user.role)),
      pendingVerificationEmail,
      register,
      verifyEmail,
      resendVerification,
      login,
      adminLogin,
      logout,
      forgotPassword,
      resetPassword,
      refreshMe: restoreSession,
    }),
    [user, initializing, pendingVerificationEmail, register, verifyEmail, resendVerification, login, adminLogin, logout, forgotPassword, resetPassword, restoreSession],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
