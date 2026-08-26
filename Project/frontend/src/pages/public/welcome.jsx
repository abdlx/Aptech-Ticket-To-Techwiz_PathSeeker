import Icon from '../../components/Icon'
import { Brand } from '../../components/AppShell'

export default function WelcomePage({ navigate, onVoice }) {
  return (
    <div className="welcome-page">
      <header className="public-header">
        <Brand />
        <nav>
          <button onClick={() => navigate('careers')}>Explore careers</button>
          <button onClick={() => navigate('stories')}>Success stories</button>
          <button onClick={() => navigate('resources')}>Resources</button>
        </nav>
        <div>
          <button className="button ghost" onClick={() => navigate('login')}>
            Log in
          </button>
          <button className="button primary small" onClick={() => navigate('signup')}>
            Create passport
          </button>
        </div>
      </header>

      <main className="welcome-main">
        <section className="welcome-copy">
          <span className="eyebrow">
            <Icon name="sparkles" size={15} /> Your future, made clearer
          </span>
          <h1>
            <span>Find the work that</span>
            <em>feels like you.</em>
          </h1>
          <p>
            Discover careers that match your interests, strengths, and goals—then get a practical plan to move forward.
          </p>
          <div className="welcome-actions">
            <button className="button primary" onClick={() => navigate('signup')}>
              Start my career quiz <Icon name="arrow" />
            </button>
            <button className="button soft" onClick={onVoice}>
              <Icon name="mic" /> Ask Navi
            </button>
          </div>
          <div className="social-proof">
            <div className="avatar-stack">
              <span>AR</span>
              <span>DK</span>
              <span>FN</span>
              <span>+2k</span>
            </div>
            <p>
              <strong>4.9 out of 5</strong>
              <br />
              from career explorers
            </p>
          </div>
        </section>

        <section className="welcome-visual">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-navi">
            <img src="/assets/navi/navi-greeting.png" alt="Navi, your PathSeeker career guide" />
          </div>
          <div className="floating-card hero-chat">
            <span className="navi-dot">
              <img src="/assets/navi/navi-idle.png" alt="" />
            </span>
            <div>
              <strong>Hey, I’m Navi 👋</strong>
              <p>Let’s find what kind of work brings out your best.</p>
            </div>
          </div>
          <div className="floating-card match-card">
            <span className="match-score">94%</span>
            <div>
              <small>Top match</small>
              <strong>UX Designer</strong>
            </div>
            <Icon name="trend" />
          </div>
        </section>
      </main>

      <section className="trust-strip">
        <div>
          <Icon name="target" />
          <strong>Personal matches</strong>
          <span>Built around your interests</span>
        </div>
        <div>
          <Icon name="compass" />
          <strong>Clear roadmaps</strong>
          <span>Know exactly what to learn</span>
        </div>
        <div>
          <Icon name="mic" />
          <strong>Guidance that listens</strong>
          <span>Chat or talk with Navi</span>
        </div>
        <div>
          <Icon name="shield" />
          <strong>Private by design</strong>
          <span>Your journey stays yours</span>
        </div>
      </section>

      {/* SRS 1.9 Homepage Sitemap */}
      <section className="welcome-sitemap panel" style={{ maxWidth: '1120px', margin: '40px auto 60px', padding: '32px 28px' }}>
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <span className="eyebrow">Application Structure & Flow</span>
          <h2 style={{ fontSize: '24px', margin: '4px 0 8px' }}>PathSeeker Interactive Sitemap</h2>
          <p style={{ color: 'var(--muted, #667485)', maxWidth: '640px', margin: '0 auto', fontSize: '13px' }}>
            A complete architectural overview of user journeys across Public Onboarding, Career Passport, Intelligence, and Community modules.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div style={{ background: 'var(--cream, #f6f4ee)', padding: '20px', borderRadius: '14px', border: '1px solid var(--line, #e4e8e2)' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '12px' }}>
              <Icon name="compass" size={16} /> 1. Public & Onboarding
            </strong>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px', fontSize: '12px' }}>
              <li><button onClick={() => navigate('welcome')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--green-dark, #416d55)', cursor: 'pointer', fontWeight: 600 }}>• Homepage & Vision</button></li>
              <li><button onClick={() => navigate('signup')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Explorer Registration</button></li>
              <li><button onClick={() => navigate('login')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Account Authentication</button></li>
              <li><button onClick={() => navigate('forgot-password')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Password Recovery</button></li>
            </ul>
          </div>

          <div style={{ background: 'var(--cream, #f6f4ee)', padding: '20px', borderRadius: '14px', border: '1px solid var(--line, #e4e8e2)' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '12px' }}>
              <Icon name="sparkles" size={16} /> 2. Assessment & Passport
            </strong>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px', fontSize: '12px' }}>
              <li><button onClick={() => navigate('quiz')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--green-dark, #416d55)', cursor: 'pointer', fontWeight: 600 }}>• Career Personality Assessment</button></li>
              <li><button onClick={() => navigate('quiz-history')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Assessment History</button></li>
              <li><button onClick={() => navigate('profile')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Career Passport & Evidence</button></li>
              <li><button onClick={() => navigate('notifications')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Match & Activity Inbox</button></li>
            </ul>
          </div>

          <div style={{ background: 'var(--cream, #f6f4ee)', padding: '20px', borderRadius: '14px', border: '1px solid var(--line, #e4e8e2)' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '12px' }}>
              <Icon name="target" size={16} /> 3. Career Bank & Tools
            </strong>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px', fontSize: '12px' }}>
              <li><button onClick={() => navigate('careers')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--green-dark, #416d55)', cursor: 'pointer', fontWeight: 600 }}>• Career Bank Directory</button></li>
              <li><button onClick={() => navigate('compare')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Side-by-Side Comparison</button></li>
              <li><button onClick={() => navigate('saved-filters')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Saved Filter Alerts</button></li>
              <li><button onClick={() => navigate('saved')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Bookmarks & Sticky Notes</button></li>
              <li><button onClick={() => navigate('recently-viewed')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Recently Viewed History</button></li>
            </ul>
          </div>

          <div style={{ background: 'var(--cream, #f6f4ee)', padding: '20px', borderRadius: '14px', border: '1px solid var(--line, #e4e8e2)' }}>
            <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', marginBottom: '12px' }}>
              <Icon name="library" size={16} /> 4. Resources & Community
            </strong>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '8px', fontSize: '12px' }}>
              <li><button onClick={() => navigate('resources')} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--green-dark, #416d55)', cursor: 'pointer', fontWeight: 600 }}>• Resource Library & Videos</button></li>
              <li><button onClick={() => navigate('stories')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Success Stories & Journeys</button></li>
              <li><button onClick={() => navigate('submit-story')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Submit Transition Story</button></li>
              <li><button onClick={() => navigate('feedback')} style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}>• Feedback & Help Desk</button></li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
