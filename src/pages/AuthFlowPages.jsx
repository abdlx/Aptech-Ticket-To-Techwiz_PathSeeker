import { useState } from 'react'
import Icon from '../components/Icon'
import { Brand } from '../components/AppShell'

function AuthFrame({ eyebrow, title, copy, children, navigate, admin = false }) {
  return (
    <div className={`flow-auth ${admin ? 'admin-auth' : ''}`}>
      <header><button onClick={() => navigate(admin ? 'login' : 'welcome')} aria-label="Back"><Icon name="arrowLeft" /></button><Brand /></header>
      <main>
        <section className="flow-auth-card panel">
          <div className="flow-auth-icon"><Icon name={admin ? 'shield' : 'lock'} size={27} /></div>
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{copy}</p>
          {children}
        </section>
        <aside className="flow-auth-aside">
          <div className="auth-orbit" />
          <img src={`/assets/navi/${admin ? 'navi-pointing-left' : 'navi-explaining'}.png`} alt="Navi guiding you" />
          <div className="panel"><Icon name="shield" /><p><strong>{admin ? 'Protected workspace' : 'You’re in control'}</strong><small>{admin ? 'Administrator access is monitored and role-based.' : 'We only use this step to keep your Career Passport secure.'}</small></p></div>
        </aside>
      </main>
    </div>
  )
}

export function ForgotPasswordPage({ navigate }) {
  const [sent, setSent] = useState(false)
  return <AuthFrame navigate={navigate} eyebrow="Account recovery" title={sent ? 'Check your inbox' : 'Reset your password'} copy={sent ? 'We sent a secure reset link to alex@example.com. It expires in 20 minutes.' : 'Enter the email connected to your Career Passport and we’ll send a secure reset link.'}>
    {sent ? <div className="flow-success"><span><Icon name="check" /></span><button className="button primary full" onClick={() => navigate('reset-password')}>Open reset preview <Icon name="arrow" /></button><button className="text-button" onClick={() => setSent(false)}>Use another email</button></div> : <form onSubmit={(event) => { event.preventDefault(); setSent(true) }}><label>Email address<div className="input-wrap"><Icon name="message" /><input required type="email" defaultValue="alex@example.com" /></div></label><button className="button primary full" type="submit">Send reset link <Icon name="arrow" /></button><button className="text-button" type="button" onClick={() => navigate('login')}>Back to log in</button></form>}
  </AuthFrame>
}

export function ResetPasswordPage({ navigate }) {
  const [done, setDone] = useState(false)
  return <AuthFrame navigate={navigate} eyebrow="Create a new password" title={done ? 'Password updated' : 'Choose something secure'} copy={done ? 'Your password has been changed. You can now continue your journey.' : 'Use at least eight characters with a number and a special character.'}>
    {done ? <div className="flow-success"><span><Icon name="check" /></span><button className="button primary full" onClick={() => navigate('login')}>Continue to log in <Icon name="arrow" /></button></div> : <form onSubmit={(event) => { event.preventDefault(); setDone(true) }}><label>New password<div className="input-wrap"><Icon name="lock" /><input required type="password" defaultValue="PathSeeker!27" /></div></label><label>Confirm password<div className="input-wrap"><Icon name="lock" /><input required type="password" defaultValue="PathSeeker!27" /></div></label><div className="password-meter"><span /><small>Strong password</small></div><button className="button primary full" type="submit">Update password <Icon name="check" /></button></form>}
  </AuthFrame>
}

export function VerifyEmailPage({ navigate }) {
  const [code, setCode] = useState(['2', '8', '4', '6', '1', '9'])
  const [verified, setVerified] = useState(false)
  const updateDigit = (index, value) => setCode((digits) => digits.map((digit, i) => i === index ? value.slice(-1) : digit))
  return <AuthFrame navigate={navigate} eyebrow="Verify your email" title={verified ? 'Email verified' : 'Enter your six-digit code'} copy={verified ? 'Your account is secure and your Career Passport is ready to build.' : 'We sent a code to alex@example.com. The code expires in 09:42.'}>
    {verified ? <div className="flow-success"><span><Icon name="check" /></span><button className="button primary full" onClick={() => navigate('onboarding')}>Start onboarding <Icon name="arrow" /></button></div> : <form onSubmit={(event) => { event.preventDefault(); setVerified(true) }}><div className="otp-row">{code.map((digit, index) => <input key={index} aria-label={`Digit ${index + 1}`} inputMode="numeric" maxLength="1" value={digit} onChange={(event) => updateDigit(index, event.target.value)} />)}</div><button className="button primary full" type="submit">Verify email <Icon name="check" /></button><button className="text-button" type="button">Resend code</button></form>}
  </AuthFrame>
}

export function AdminLoginPage({ navigate }) {
  return <AuthFrame navigate={navigate} admin eyebrow="PathSeeker administration" title="Welcome back, admin" copy="Sign in with your authorized workspace account.">
    <form onSubmit={(event) => { event.preventDefault(); navigate('admin') }}><label>Work email<div className="input-wrap"><Icon name="message" /><input required type="email" defaultValue="sarah@pathseeker.app" /></div></label><label>Password<div className="input-wrap"><Icon name="lock" /><input required type="password" defaultValue="PathSeeker!26" /></div></label><label className="check-row"><input type="checkbox" defaultChecked /> Keep me signed in on this device</label><button className="button primary full" type="submit">Enter admin workspace <Icon name="arrow" /></button><button className="text-button" type="button" onClick={() => navigate('forgot-password')}>Forgot admin password?</button></form>
  </AuthFrame>
}
