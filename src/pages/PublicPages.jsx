import { useState } from 'react'
import Icon from '../components/Icon'
import { Brand } from '../components/AppShell'

export function WelcomePage({ navigate, onVoice }) {
  return (
    <div className="welcome-page">
      <header className="public-header">
        <Brand />
        <nav><button onClick={() => navigate('careers')}>Explore careers</button><button onClick={() => navigate('stories')}>Success stories</button><button onClick={() => navigate('resources')}>Resources</button></nav>
        <div><button className="button ghost" onClick={() => navigate('login')}>Log in</button><button className="button primary small" onClick={() => navigate('signup')}>Create passport</button></div>
      </header>
      <main className="welcome-main">
        <section className="welcome-copy">
          <span className="eyebrow"><Icon name="sparkles" size={15} /> Your future, made clearer</span>
          <h1>Find the work that<br /><em>feels like you.</em></h1>
          <p>Discover careers that match your interests, strengths, and goals—then get a practical plan to move forward.</p>
          <div className="welcome-actions"><button className="button primary" onClick={() => navigate('signup')}>Start my career quiz <Icon name="arrow" /></button><button className="button soft" onClick={onVoice}><Icon name="mic" /> Ask Navi</button></div>
          <div className="social-proof"><div className="avatar-stack"><span>AR</span><span>DK</span><span>FN</span><span>+2k</span></div><p><strong>4.9 out of 5</strong><br />from career explorers</p></div>
        </section>
        <section className="welcome-visual">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" />
          <div className="hero-navi"><img src="/assets/navi/navi-greeting.png" alt="Navi, your PathSeeker career guide" /></div>
          <div className="floating-card hero-chat"><span className="navi-dot"><img src="/assets/navi/navi-idle.png" alt="" /></span><div><strong>Hey, I’m Navi 👋</strong><p>Let’s find what kind of work brings out your best.</p></div></div>
          <div className="floating-card match-card"><span className="match-score">94%</span><div><small>Top match</small><strong>UX Designer</strong></div><Icon name="trend" /></div>
          <div className="floating-card voice-card"><span className="voice-pulse"><Icon name="mic" /></span><div><strong>Voice guidance</strong><small>Talk, don’t type</small></div><span className="wave-bars"><i /><i /><i /><i /></span></div>
        </section>
      </main>
      <section className="trust-strip"><div><Icon name="target" /><strong>Personal matches</strong><span>Built around your interests</span></div><div><Icon name="compass" /><strong>Clear roadmaps</strong><span>Know exactly what to learn</span></div><div><Icon name="mic" /><strong>Guidance that listens</strong><span>Chat or talk with Navi</span></div><div><Icon name="shield" /><strong>Private by design</strong><span>Your journey stays yours</span></div></section>
    </div>
  )
}

export function AuthPage({ navigate, mode = 'signup' }) {
  const isLogin = mode === 'login'
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
        <form className="auth-card" onSubmit={(e) => { e.preventDefault(); navigate(isLogin ? 'dashboard' : 'verify-email') }}>
          <span className="mobile-brand"><Brand /></span>
          <h2>{isLogin ? 'Welcome back' : <>Welcome to <em>PathSeeker</em></>}</h2>
          <p>{isLogin ? 'Log in to continue your journey' : 'Sign up to discover what fits you best'}</p>
          {!isLogin && <label>Full name<div className="input-wrap"><Icon name="users" /><input required placeholder="Enter your full name" defaultValue="Alex Morgan" /></div></label>}
          <label>Email address<div className="input-wrap"><Icon name="message" /><input required type="email" placeholder="Enter your email address" defaultValue="alex@example.com" /></div></label>
          <label>Password<div className="input-wrap"><Icon name="lock" /><input required type="password" placeholder={isLogin ? 'Enter your password' : 'Create a password'} defaultValue="PathSeeker!26" /></div></label>
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

export function OnboardingPage({ navigate }) {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState(['Design', 'Technology'])
  const interests = [['Design', 'pen'], ['Technology', 'code'], ['Business', 'briefcase'], ['Data', 'chart'], ['Helping people', 'heart'], ['Media & content', 'video']]
  const toggle = (label) => setSelected((items) => items.includes(label) ? items.filter((x) => x !== label) : [...items, label])
  return (
    <div className="onboarding-page">
      <header><Brand /><button onClick={() => navigate('dashboard')}>Save & finish later</button></header>
      <div className="onboarding-progress"><span style={{ width: `${step * 33.3}%` }} /></div>
      <main>
        <section className="onboarding-card">
          <div className="step-count">Step {step} of 3</div>
          {step === 1 && <><span className="eyebrow">A little about you</span><h1>What brings you to PathSeeker?</h1><p>This helps Navi shape guidance around where you are today.</p><div className="choice-grid large"><button className="selected"><Icon name="book" /><span><strong>I’m a student</strong><small>Exploring what could come next</small></span><Icon name="check" /></button><button><Icon name="compass" /><span><strong>I’m a graduate</strong><small>Finding my first career direction</small></span></button><button><Icon name="briefcase" /><span><strong>I’m working</strong><small>Growing or changing my career</small></span></button><button><Icon name="sparkles" /><span><strong>I’m returning</strong><small>Re-entering after time away</small></span></button></div></>}
          {step === 2 && <><span className="eyebrow">Your curiosity</span><h1>What are you drawn to?</h1><p>Pick as many as you like. We’ll refine these after your quiz.</p><div className="interest-grid">{interests.map(([label, icon]) => <button key={label} className={selected.includes(label) ? 'selected' : ''} onClick={() => toggle(label)}><Icon name={icon} /><strong>{label}</strong>{selected.includes(label) && <span><Icon name="check" size={14} /></span>}</button>)}</div></>}
          {step === 3 && <><span className="eyebrow">Your first goal</span><h1>What would make today feel useful?</h1><p>You can change your focus at any time.</p><div className="choice-list"><button className="selected"><span className="choice-number">01</span><span><strong>Discover careers that fit me</strong><small>Start with a personalized interest quiz</small></span><Icon name="check" /></button><button><span className="choice-number">02</span><span><strong>Compare careers I’m considering</strong><small>Salary, skills, demand, and daily work</small></span></button><button><span className="choice-number">03</span><span><strong>Build skills for a target career</strong><small>Get a practical learning roadmap</small></span></button></div></>}
          <div className="onboarding-actions"><button className="button ghost" disabled={step === 1} onClick={() => setStep(step - 1)}><Icon name="arrowLeft" /> Back</button><button className="button primary" onClick={() => step < 3 ? setStep(step + 1) : navigate('quiz')}>{step < 3 ? 'Continue' : 'Build my passport'} <Icon name="arrow" /></button></div>
        </section>
        <aside className="onboarding-navi"><div className="navi-glow" /><img src={`/assets/navi/${step === 2 ? 'navi-thinking' : step === 3 ? 'navi-explaining' : 'navi-greeting'}.png`} alt="Navi guiding onboarding" /><div className="navi-tip"><span><Icon name="sparkles" /></span><p>{step === 1 ? 'Everyone starts somewhere. There’s no “right” stage to begin exploring.' : step === 2 ? 'Your interests can cross categories—that usually leads to the most interesting careers.' : 'Perfect. I’ll keep this goal visible while we explore together.'}</p></div></aside>
      </main>
    </div>
  )
}
