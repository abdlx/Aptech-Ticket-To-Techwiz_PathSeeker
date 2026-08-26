import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { authApi } from '../../services/authApi'
import { useAuth } from '../../providers/AuthProvider'
import AuthFrame from './AuthFrame'
import Icon from '../Icon'

function MutationError({ mutation }) { return mutation.error ? <p className="form-error" role="alert">{mutation.error.message}</p> : null }

export function VerifyEmailFlow({ navigate }) {
  const [params] = useSearchParams(); const [email, setEmail] = useState(params.get('email') || ''); const [code, setCode] = useState('')
  const routerNavigate = useNavigate(); const auth = useAuth()
  const verify = useMutation({ mutationFn: authApi.verifyEmail, onSuccess: (payload) => { auth.setUser(payload.data.user); toast.success('Email verified.'); routerNavigate('/onboarding', { replace: true }) } })
  const resend = useMutation({ mutationFn: authApi.resendVerification, onSuccess: () => toast.success('A new verification code has been sent.') })
  return <AuthFrame navigate={navigate} eyebrow="Verify your email" title="Enter your six-digit code" copy="Use the code sent to your email address. It expires after ten minutes."><form onSubmit={(event) => { event.preventDefault(); verify.mutate({ email, code }) }}><label>Email address<div className="input-wrap"><Icon name="message" /><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></div></label><label>Verification code<div className="input-wrap"><Icon name="lock" /><input required inputMode="numeric" pattern="[0-9]{6}" maxLength="6" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))} /></div></label><MutationError mutation={verify} /><button className="button primary full" disabled={verify.isPending}>{verify.isPending ? 'Verifying…' : 'Verify email'} <Icon name="check" /></button><button className="text-button" type="button" disabled={!email || resend.isPending} onClick={() => resend.mutate({ email })}>Resend code</button></form></AuthFrame>
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
