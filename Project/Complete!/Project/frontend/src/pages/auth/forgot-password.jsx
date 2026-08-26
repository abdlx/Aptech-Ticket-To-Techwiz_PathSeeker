import { useState } from 'react'
import Icon from '../../components/Icon'
import AuthFrame from '../../components/auth/AuthFrame'
import { useAuth } from '../../context/AuthContext'

export default function ForgotPasswordPage({ navigate }) {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await forgotPassword(email)
      // The API deliberately doesn't reveal whether the email is registered,
      // so this success state shows regardless — that's expected, not a bug.
      setSent(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthFrame navigate={navigate} eyebrow="Account recovery" title={sent ? 'Check your inbox' : 'Reset your password'} copy={sent ? `If ${email} is registered, we've sent a secure reset link. It expires in 20 minutes.` : 'Enter the email connected to your Career Passport and we’ll send a secure reset link.'}>
      {sent ? (
        <div className="flow-success"><span><Icon name="check" /></span><button className="text-button" onClick={() => setSent(false)}>Use another email</button></div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p className="form-error" role="alert">{error}</p>}
          <label>Email address<div className="input-wrap"><Icon name="message" /><input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div></label>
          <button className="button primary full" type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send reset link'} <Icon name="arrow" /></button>
          <button className="text-button" type="button" onClick={() => navigate('login')}>Back to log in</button>
        </form>
      )}
    </AuthFrame>
  )
}
