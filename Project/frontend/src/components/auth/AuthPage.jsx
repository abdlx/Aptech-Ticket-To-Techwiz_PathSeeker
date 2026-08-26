import Icon from '../Icon'
import { Brand } from '../AppShell'

export default function AuthPage({ navigate, mode = 'signup' }) {
  const isLogin = mode === 'login'
  return (
    <div className="auth-page">
      <section className="auth-visual">
        <div className="auth-visual-top">
          <Brand />
          <div className="auth-message">
            <span className="eyebrow">Your career passport</span>
            <h1>{isLogin ? 'Welcome back to your next chapter.' : <>Your future<br />starts with <em>you.</em></>}</h1>
            <p>{isLogin ? 'Pick up where you left off. Your matches, notes, and next steps are ready.' : 'Create your account and let PathSeeker guide you to the right career path.'}</p>
          </div>
        </div>
        <div className="auth-visual-bottom">
          <div className="auth-navi">
            <div className="auth-navi-glow" />
            <img src={`/assets/navi/${isLogin ? 'navi-pointing-left' : 'navi-greeting'}.png`} alt="Navi welcoming you" />
            <div className="speech-bubble">
              <strong>Hi! I’m Navi 👋</strong>
              <p>{isLogin ? 'Good to see you again. Ready to keep exploring?' : 'Let’s build your Career Passport together.'}</p>
            </div>
          </div>
          <div className="auth-trust">
            <span><Icon name="shield" /><div><b>Secure</b><small>Your data is safe</small></div></span>
            <span><Icon name="lock" /><div><b>Private</b><small>We respect privacy</small></div></span>
            <span><Icon name="users" /><div><b>Personalized</b><small>Made just for you</small></div></span>
          </div>
        </div>
      </section>
      <section className="auth-form-side">
        <button className="auth-back" onClick={() => navigate('welcome')}><Icon name="arrowLeft" /> Back</button>
        <form className="auth-card" onSubmit={(e) => { e.preventDefault(); navigate(isLogin ? 'dashboard' : 'onboarding') }}>
          <span className="mobile-brand"><Brand /></span>
          <h2>{isLogin ? 'Welcome back' : <>Welcome to <em>PathSeeker</em></>}</h2>
          <p>{isLogin ? 'Log in to continue your journey' : 'Sign up to discover what fits you best'}</p>
          {!isLogin && <label>Full name<div className="input-wrap"><Icon name="users" /><input required placeholder="e.g. Alex Morgan" defaultValue="Alex Morgan" /></div></label>}
          <label>Email address<div className="input-wrap"><Icon name="message" /><input required type="email" placeholder="name@example.com" defaultValue="alex@example.com" /></div></label>
          <label>Password<div className="input-wrap"><Icon name="lock" /><input required type="password" placeholder={isLogin ? 'Enter your password' : 'Create a strong password'} defaultValue="PathSeeker!26" /></div></label>
          {!isLogin && <div className="password-rules"><span><Icon name="check" /> At least 8 characters</span><span><Icon name="check" /> Include an uppercase letter</span><span><Icon name="check" /> Include a number</span><span><Icon name="check" /> Include a special character</span></div>}
          {isLogin && <div className="remember-row"><label><input type="checkbox" defaultChecked /> Remember me</label><button type="button" onClick={() => navigate('forgot-password')}>Forgot password?</button></div>}
          <button className="button primary full" type="submit">{isLogin ? 'Log in' : 'Create account'} <Icon name="arrow" /></button>
          <div className="divider"><span>or continue with</span></div>
          <div className="social-buttons"><button type="button">G&nbsp; Google</button><button type="button">▦&nbsp; Microsoft</button></div>
          <p className="auth-switch">{isLogin ? 'New to PathSeeker?' : 'Already have an account?'} <button type="button" onClick={() => navigate(isLogin ? 'signup' : 'login')}>{isLogin ? 'Create account' : 'Log in'}</button></p>
          {isLogin && <p className="auth-switch admin-entry">Managing PathSeeker? <button type="button" onClick={() => navigate('admin-login')}>Admin sign in</button></p>}
        </form>
        <small className="legal">By continuing, you agree to our <span>Terms of Service</span> and <span>Privacy Policy</span>.</small>
      </section>
    </div>
  )
}
