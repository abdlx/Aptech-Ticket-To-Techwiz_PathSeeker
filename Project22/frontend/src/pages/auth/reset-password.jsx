import { useState } from 'react'
import Icon from '../../components/Icon'
import AuthFrame from '../../components/auth/AuthFrame'
import { useAuth } from '../../context/AuthContext'

export default function ResetPasswordPage({ navigate, token }) {
  const { resetPassword } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!token) {
    return (
      <AuthFrame navigate={navigate} eyebrow="Create a new password" title="Open this from your email" copy="This page needs the reset link we emailed you — it carries a one-time token in the URL.">
        <button className="button primary full" onClick={() => navigate('forgot-password')}>Request a reset link <Icon name="arrow" /></button>
      </AuthFrame>
    )
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setSubmitting(true)
    try {
      await resetPassword({ token, password })
      setDone(true)
    } catch (err) {
      setError(err.message || 'That reset link is invalid or has expired.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame navigate={navigate} eyebrow="Create a new password" title={done ? 'Password updated' : 'Choose something secure'} copy={done ? 'Your password has been changed. You can now continue your journey.' : 'Use at least eight characters with an uppercase letter, a number, and a special character.'}>
      {done ? (
        <div className="flow-success"><span><Icon name="check" /></span><button className="button primary full" onClick={() => navigate('login')}>Continue to log in <Icon name="arrow" /></button></div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p className="form-error" role="alert">{error}</p>}
          <label>New password<div className="input-wrap"><Icon name="lock" /><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div></label>
          <label>Confirm password<div className="input-wrap"><Icon name="lock" /><input required type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div></label>
          <button className="button primary full" type="submit" disabled={submitting}>{submitting ? 'Updating…' : 'Update password'} <Icon name="check" /></button>
        </form>
      )}
    </AuthFrame>
  )
}
