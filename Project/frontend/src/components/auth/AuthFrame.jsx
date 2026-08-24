import Icon from '../Icon'
import { Brand } from '../AppShell'

export default function AuthFrame({ eyebrow, title, copy, children, navigate, admin = false }) {
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
