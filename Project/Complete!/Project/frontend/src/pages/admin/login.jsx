import { useState } from 'react'
import Icon from '../../components/Icon'
import AuthFrame from '../../components/auth/AuthFrame'
import { useAuth } from '../../context/AuthContext'

export default function AdminLoginPage({ navigate }) {
  const { adminLogin } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await adminLogin({ email, password })
      navigate('admin')
    } catch (err) {
      setError(err.message || 'Could not sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame navigate={navigate} admin eyebrow="PathSeeker administration" title="Welcome back, admin" copy="Sign in with your authorized workspace account.">
      <form onSubmit={handleSubmit}>
        {error && <p className="form-error" role="alert">{error}</p>}
        <label>Work email<div className="input-wrap"><Icon name="message" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div></label>
        <label>Password<div className="input-wrap"><Icon name="lock" /><input required type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></div></label>
        <label className="check-row"><input type="checkbox" defaultChecked /> Keep me signed in on this device</label>
        <button className="button primary full" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Enter admin workspace'} <Icon name="arrow" /></button>
        <button className="text-button" type="button" onClick={() => navigate('forgot-password')}>Forgot admin password?</button>
      </form>
    </AuthFrame>
  )
}
