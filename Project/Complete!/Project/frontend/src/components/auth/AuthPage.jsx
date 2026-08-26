import { useState } from 'react'
import Icon from '../Icon'
import { Brand } from '../AppShell'
import { useAuth } from '../../context/AuthContext'

export default function AuthPage({ navigate, mode = 'signup' }) {
  const isLogin = mode === 'login'
  const { login, register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [stage, setStage] = useState('student')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) { setError('Enter a valid email address.'); return }
    if (!password) { setError('Enter your password.'); return }
    if (!isLogin && (password.length < 8 || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password))) { setError('Password must be at least 8 characters and include an uppercase letter, a number, and a special character.'); return }
    if (!isLogin && name.trim().length < 2) { setError('Enter your full name.'); return }
    if (!isLogin && !termsAccepted) { setError('Accept the Terms of Service and Privacy Policy to create your account.'); return }
    setSubmitting(true)
    try {
      if (isLogin) {
        await login({ email, password })
        navigate('dashboard')
      } else {
        await register({ name, email, password, stage, termsAccepted })
        navigate('verify-email')
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <Brand />
        <div className="auth-message">
          <span className="eyebrow">Your career passport</span>
          <h1>{isLogin ? 'Welcome back to your next chapter.' : <>Your future<br />starts with <em>you.</em></>}</h1>
          <p>{isLogin ? 'Pick up where you left off. Your matches, notes, and next steps are ready.' : 'Create your account and let PathSeeker guide you to the right career path.'}</p>
        </div>
        <div className="auth-navi"><img src={`/assets/navi/${isLogin ? 'navi-pointing-left' : 'navi-greeting'}.png`} alt="Navi welcoming you" /><div className="speech-bubble"><strong>Hi! I’m Navi 👋</strong><p>{isLogin ? 'Good to see you again. Ready to keep exploring?' : 'Let’s build your Career Passport together.'}</p></div></div>
        <div className="auth-trust"><span><Icon name="shield" /><b>Secure</b><small>Your data is safe</small></span><span><Icon name="lock" /><b>Private</b><small>We respect privacy</small></span><span><Icon name="users" /><b>Personalized</b><small>Made just for you</small></span></div>
      </section>
      <section className="auth-form-side">
        <button className="auth-back" onClick={() => navigate('welcome')}><Icon name="arrowLeft" /> Back</button>
        <form className="auth-card" onSubmit={handleSubmit}>
          <span className="mobile-brand"><Brand /></span>
          <h2>{isLogin ? 'Welcome back' : <>Welcome to <em>PathSeeker</em></>}</h2>
          <p>{isLogin ? 'Log in to continue your journey' : 'Sign up to discover what fits you best'}</p>
          {error && <p className="form-error" role="alert">{error}</p>}
          {!isLogin && <label>Full name<div className="input-wrap"><Icon name="users" /><input required placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} /></div></label>}
          <label>Email address<div className="input-wrap"><Icon name="message" /><input required type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} /></div></label>
          <label>Password<div className="input-wrap"><Icon name="lock" /><input required type="password" placeholder={isLogin ? 'Enter your password' : 'Create a password'} value={password} onChange={(e) => setPassword(e.target.value)} /></div></label>
          {!isLogin && (
            <>
              <label>Current stage<div className="input-wrap"><Icon name="compass" /><select required value={stage} onChange={(e) => setStage(e.target.value)}><option value="student">Student</option><option value="graduate">Graduate</option><option value="professional">Working professional</option></select></div></label>
              <label className="check-row"><input type="checkbox" required checked={termsAccepted} onChange={e=>setTermsAccepted(e.target.checked)} /> I agree to the Terms of Service and Privacy Policy.</label><div className="password-rules"><span><Icon name="check" /> At least 8 characters</span><span><Icon name="check" /> Include an uppercase letter</span><span><Icon name="check" /> Include a number</span><span><Icon name="check" /> Include a special character</span></div>
            </>
          )}
          {isLogin && <div className="remember-row"><label><input type="checkbox" defaultChecked /> Remember me</label><button type="button" onClick={() => navigate('forgot-password')}>Forgot password?</button></div>}
          <button className="button primary full" type="submit" disabled={submitting}>{submitting ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'} <Icon name="arrow" /></button>
          <p className="auth-switch">{isLogin ? 'New to PathSeeker?' : 'Already have an account?'} <button type="button" onClick={() => navigate(isLogin ? 'signup' : 'login')}>{isLogin ? 'Create account' : 'Log in'}</button></p>
          {isLogin && <p className="auth-switch admin-entry">Managing PathSeeker? <button type="button" onClick={() => navigate('admin-login')}>Admin sign in</button></p>}
        </form>
        <small className="legal">By continuing, you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>.</small>
      </section>
    </div>
  )
}
