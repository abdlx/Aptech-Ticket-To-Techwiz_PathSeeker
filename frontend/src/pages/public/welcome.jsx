import Icon from '../../components/Icon'
import { Brand } from '../../components/AppShell'

export default function WelcomePage({ navigate, onVoice }) {
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
