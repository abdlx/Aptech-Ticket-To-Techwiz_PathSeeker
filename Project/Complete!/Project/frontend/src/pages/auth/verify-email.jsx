import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import AuthFrame from '../../components/auth/AuthFrame'
import { useAuth } from '../../context/AuthContext'

export default function VerifyEmailPage({ navigate }) {
  const { pendingVerificationEmail, verifyEmail, resendVerification } = useAuth()
  // Registration is the only way to arrive here with a pending email; if the
  // page is opened directly (refresh, bookmark) there's nothing to verify,
  // so send people back to create an account rather than guessing an email.
  const [email] = useState(pendingVerificationEmail)
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState('')
  const [resent, setResent] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [resendSeconds, setResendSeconds] = useState(0)

  useEffect(() => { if (!resendSeconds) return undefined; const timer = setInterval(() => setResendSeconds(value => Math.max(0, value - 1)), 1000); return () => clearInterval(timer) }, [resendSeconds])

  const updateDigit = (index, value) => setCode((digits) => digits.map((digit, i) => (i === index ? value.replace(/\D/g, '').slice(-1) : digit)))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await verifyEmail({ email, code: code.join('') })
      setVerified(true)
    } catch (err) {
      setError(err.message || 'That code didn’t work. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    setError('')
    try {
      await resendVerification(email)
      setResent(true)
      setResendSeconds(30)
    } catch (err) {
      setError(err.message || 'Could not resend the code. Please try again.')
    }
  }

  if (!email && !verified) {
    return (
      <AuthFrame navigate={navigate} eyebrow="Verify your email" title="Nothing to verify yet" copy="Start by creating an account, and we'll send you a verification code.">
        <button className="button primary full" onClick={() => navigate('signup')}>Create an account <Icon name="arrow" /></button>
      </AuthFrame>
    )
  }

  return (
    <AuthFrame navigate={navigate} eyebrow="Verify your email" title={verified ? 'Email verified' : 'Enter your six-digit code'} copy={verified ? 'Your account is secure and your Career Passport is ready to build.' : `We sent a code to ${email}.`}>
      {verified ? (
        <div className="flow-success"><span><Icon name="check" /></span><button className="button primary full" onClick={() => navigate('onboarding')}>Start onboarding <Icon name="arrow" /></button></div>
      ) : (
        <form onSubmit={handleSubmit}>
          {error && <p className="form-error" role="alert">{error}</p>}
          {resent && !error && <p className="form-success-note">A new code was sent to {email}.</p>}
          <div className="otp-row">{code.map((digit, index) => <input key={index} aria-label={`Digit ${index + 1}`} inputMode="numeric" maxLength="1" value={digit} onChange={(event) => updateDigit(index, event.target.value)} />)}</div>
          <button className="button primary full" type="submit" disabled={submitting || code.some((d) => !d)}>{submitting ? 'Verifying…' : 'Verify email'} <Icon name="check" /></button>
          <button className="text-button" type="button" disabled={resendSeconds > 0} onClick={handleResend}>{resendSeconds ? `Resend in ${resendSeconds}s` : 'Resend code'}</button>
        </form>
      )}
    </AuthFrame>
  )
}
