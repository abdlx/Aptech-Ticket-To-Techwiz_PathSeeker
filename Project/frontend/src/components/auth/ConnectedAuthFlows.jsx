import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '../../services/authApi'
import { useAuth } from '../../providers/AuthProvider'
import AuthFrame from './AuthFrame'
import Icon from '../Icon'

function MutationError({ mutation }) { return mutation.error ? <p className="form-error" role="alert">{mutation.error.message}</p> : null }

export function VerifyEmailFlow({ navigate }) {
  const [params] = useSearchParams()
  const routerNavigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState(params.get('email') || '')
  const [digits, setDigits] = useState(Array(6).fill(''))
  const [cooldown, setCooldown] = useState(() => {
    const sentAt = location.state?.verificationSentAt
    return sentAt ? Math.max(0, 60 - Math.floor((Date.now() - sentAt) / 1000)) : 0
  })
  const inputs = useRef([])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = window.setInterval(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => {
      toast.success('Email verified. You can now log in.')
      routerNavigate('/login', { replace: true, state: { emailVerified: true } })
    },
  })
  const resendMutation = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => {
      setDigits(Array(6).fill(''))
      setCooldown(60)
      inputs.current[0]?.focus()
      toast.success('A new verification code has been sent.')
    },
  })

  const updateDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setDigits((current) => current.map((item, position) => position === index ? digit : item))
    if (digit && index < 5) inputs.current[index + 1]?.focus()
  }
  const handlePaste = (event) => {
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    event.preventDefault()
    const next = Array(6).fill('').map((_, index) => pasted[index] || '')
    setDigits(next)
    inputs.current[Math.min(pasted.length, 6) - 1]?.focus()
  }
  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !digits[index] && index > 0) inputs.current[index - 1]?.focus()
  }
  const otp = digits.join('')
  const submit = (event) => {
    event.preventDefault()
    verifyMutation.mutate({ email, otp })
  }

  return <AuthFrame navigate={navigate} eyebrow="Email verification" title="Check your inbox" copy="Enter the 6-digit code sent to your email. It expires in 10 minutes.">
    <form onSubmit={submit} noValidate>
      <label>Email address<div className="input-wrap"><Icon name="message" /><input required type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div></label>
      <label>Verification code<div className="otp-row" onPaste={handlePaste}>{digits.map((digit, index) => <input key={index} ref={(element) => { inputs.current[index] = element }} aria-label={`OTP digit ${index + 1}`} inputMode="numeric" autoComplete={index === 0 ? 'one-time-code' : 'off'} maxLength={1} value={digit} onChange={(event) => updateDigit(index, event.target.value)} onKeyDown={(event) => handleKeyDown(index, event)} />)}</div></label>
      <MutationError mutation={verifyMutation} />
      <button className="button primary full" type="submit" disabled={otp.length !== 6 || !email || verifyMutation.isPending}>{verifyMutation.isPending ? 'Verifying…' : 'Verify email'} <Icon name="check" /></button>
      <p className="auth-switch">Didn’t receive the code? <button type="button" disabled={cooldown > 0 || !email || resendMutation.isPending} onClick={() => resendMutation.mutate({ email })}>{resendMutation.isPending ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}</button></p>
      <MutationError mutation={resendMutation} />
      <p className="auth-switch">Already verified? <button type="button" onClick={() => navigate('login')}>Log in</button></p>
    </form>
  </AuthFrame>
}

export function ForgotPasswordFlow({ navigate }) {
  const [email, setEmail] = useState(''); const mutation = useMutation({ mutationFn: authApi.forgotPassword, onSuccess: () => toast.success('If the account exists, a reset link has been sent.') })
  return <AuthFrame navigate={navigate} eyebrow="Account recovery" title={mutation.isSuccess ? 'Check your inbox' : 'Reset your password'} copy="Enter the email connected to your Career Passport.">{mutation.isSuccess ? <div className="flow-success"><span><Icon name="check" /></span><button className="button primary full" onClick={() => navigate('login')}>Back to log in</button></div> : <form onSubmit={(event) => { event.preventDefault(); mutation.mutate({ email }) }}><label>Email address<div className="input-wrap"><Icon name="message" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div></label><MutationError mutation={mutation} /><button className="button primary full" disabled={mutation.isPending}>{mutation.isPending ? 'Sending…' : 'Send reset link'} <Icon name="arrow" /></button></form>}</AuthFrame>
}

export function ResetPasswordFlow({ navigate }) {
  const [params] = useSearchParams(); const [password, setPassword] = useState(''); const [confirmation, setConfirmation] = useState(''); const token = params.get('token') || ''
  const mutation = useMutation({ mutationFn: authApi.resetPassword, onSuccess: () => toast.success('Password updated. Sign in again.') })
  const submit = (event) => { event.preventDefault(); if (password !== confirmation) return toast.error('Passwords do not match.'); mutation.mutate({ token, password }) }
  return <AuthFrame navigate={navigate} eyebrow="Create a new password" title={mutation.isSuccess ? 'Password updated' : 'Choose something secure'} copy="Use at least eight characters with uppercase, number, and special characters.">{mutation.isSuccess ? <button className="button primary full" onClick={() => navigate('login')}>Continue to log in</button> : <form onSubmit={submit}><label>New password<div className="input-wrap"><Icon name="lock" /><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></div></label><label>Confirm password<div className="input-wrap"><Icon name="lock" /><input required type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} /></div></label>{!token && <p className="form-error">This reset link is missing its secure token.</p>}<MutationError mutation={mutation} /><button className="button primary full" disabled={!token || mutation.isPending}>{mutation.isPending ? 'Updating…' : 'Update password'} <Icon name="check" /></button></form>}</AuthFrame>
}

export function AdminLoginFlow({ navigate }) {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const routerNavigate = useNavigate(); const auth = useAuth()
  const mutation = useMutation({ mutationFn: authApi.adminLogin, onSuccess: (payload) => { auth.setUser(payload.data.user); toast.success('Admin session started.'); routerNavigate('/admin', { replace: true }) } })
  return <AuthFrame navigate={navigate} admin eyebrow="PathSeeker administration" title="Welcome back, admin" copy="Sign in with your authorized workspace account."><form onSubmit={(event) => { event.preventDefault(); mutation.mutate({ email, password }) }}><label>Work email<div className="input-wrap"><Icon name="message" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div></label><label>Password<div className="input-wrap"><Icon name="lock" /><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></div></label><MutationError mutation={mutation} /><button className="button primary full" disabled={mutation.isPending}>{mutation.isPending ? 'Signing in…' : 'Enter admin workspace'} <Icon name="arrow" /></button></form></AuthFrame>
}
