import Icon from './Icon'
const navItems = [
  { id: 'dashboard', label: 'Overview', icon: 'home' },
  { id: 'quiz', label: 'Career quiz', icon: 'sparkles' },
  { id: 'recommendations', label: 'My matches', icon: 'target' },
  { id: 'careers', label: 'Career Bank', icon: 'compass' },
  { id: 'resources', label: 'Resources', icon: 'library' },
  { id: 'saved', label: 'Saved & notes', icon: 'bookmark' },
  { id: 'stories', label: 'Success stories', icon: 'users' },
]
import { useAuth } from '../context/AuthContext'

function initialsFor(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?'
}

export function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <span className="brand-mark"><img src="/PathSeeker-Icon.svg" alt="" aria-hidden="true" /></span>
      {!compact && <span>Path<span>Seeker</span></span>}
    </div>
  )
}


function Breadcrumbs({ screen, navigate }) {
  const labels = { dashboard: 'Overview', quiz: 'Career quiz', recommendations: 'My matches', careers: 'Career Bank', 'career-detail': 'Career detail', resources: 'Resources', saved: 'Saved & notes', stories: 'Success stories', profile: 'Profile & settings', notifications: 'Notifications', 'quiz-history': 'Quiz history', 'quiz-result': 'Quiz result', 'recently-viewed': 'Recently viewed', compare: 'Compare careers', 'saved-filters': 'Saved filters', 'media-detail': 'Media player', 'document-preview': 'Document preview', 'story-detail': 'Success story', 'submit-story': 'Share your story', help: 'Help center' }
  const label = labels[screen]
  if (!label || screen === 'dashboard') return null
  return <nav className="breadcrumbs" aria-label="Breadcrumb"><button onClick={() => navigate('dashboard')}>Overview</button><span aria-hidden="true">/</span><strong>{label}</strong></nav>
}

export default function AppShell({ screen, navigate, children, onVoice, mobileMenu, setMobileMenu }) {
  const { user, logout } = useAuth()
  const displayName = user?.name || 'Your account'
  const initials = initialsFor(user?.name)
  const activeItem = navItems.find((item) => item.id === screen)
  const handleLogout = async () => {
    await logout()
    navigate('welcome')
  }
  const extraScreenLabels = {
    notifications: 'Notifications', 'quiz-history': 'Quiz history', 'quiz-result': 'Quiz results',
    'recently-viewed': 'Recently viewed', compare: 'Compare careers', 'saved-filters': 'Saved filters',
    'media-detail': 'Media player', 'document-preview': 'Document preview', 'story-detail': 'Success story',
    'submit-story': 'Share your story', help: 'Help center',
  }
  return (
    <div className="app-layout">
      <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
        <div className="sidebar-head">
          <Brand />
          <button className="icon-button sidebar-close" onClick={() => setMobileMenu(false)} aria-label="Close menu"><Icon name="close" /></button>
        </div>
        <nav aria-label="Primary navigation">
          <p className="nav-label">Your journey</p>
          {navItems.map((item) => (
            <button key={item.id} className={`nav-item ${screen === item.id || (screen === 'career-detail' && item.id === 'careers') ? 'active' : ''}`} onClick={() => { navigate(item.id); setMobileMenu(false) }}>
              <Icon name={item.icon} /><span>{item.label}</span>
              {item.id === 'quiz' && <span className="nav-badge">New</span>}
            </button>
          ))}
          <p className="nav-label nav-label-space">Account</p>
          <button className={`nav-item ${screen === 'profile' ? 'active' : ''}`} onClick={() => navigate('profile')}><Icon name="settings" /><span>Profile & settings</span></button>
          <button className={`nav-item ${screen === 'quiz-history' || screen === 'quiz-result' ? 'active' : ''}`} onClick={() => navigate('quiz-history')}><Icon name="calendar" /><span>Quiz history</span></button>
          <button className={`nav-item ${screen === 'recently-viewed' ? 'active' : ''}`} onClick={() => navigate('recently-viewed')}><Icon name="clock" /><span>Recently viewed</span></button>
          <button className={`nav-item ${screen === 'saved-filters' ? 'active' : ''}`} onClick={() => navigate('saved-filters')}><Icon name="filter" /><span>Saved filters</span></button>
          <button className="nav-item" onClick={() => navigate('feedback')}><Icon name="message" /><span>Send feedback</span></button>
          <button className={`nav-item ${screen === 'help' ? 'active' : ''}`} onClick={() => navigate('help')}><Icon name="help" /><span>Help center</span></button>
        </nav>
        <div className="sidebar-card">
          <div className="sidebar-navi"><img src="/assets/navi/navi-pointing-left.png" alt="Navi pointing" /></div>
          <strong>Need a hand?</strong>
          <p>Talk it through with Navi, your career guide.</p>
          <button onClick={onVoice}><Icon name="mic" size={17} /> Talk to Navi</button>
        </div>
        <button className="user-chip" onClick={() => navigate('profile')}>
          <span className="avatar">{initials}</span>
          <span><strong>{displayName}</strong><small>Explorer plan</small></span>
          <Icon name="more" />
        </button>
        <button className="nav-item logout-item" onClick={handleLogout}><Icon name="close" /><span>Log out</span></button>
      </aside>

      {mobileMenu && <button className="sidebar-scrim" aria-label="Close menu" onClick={() => setMobileMenu(false)} />}

      <section className="app-main">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileMenu(true)} aria-label="Open menu"><Icon name="menu" /></button>
          <div className="topbar-title">
            <span className="topbar-overline">PathSeeker</span>
            <strong>{activeItem?.label || extraScreenLabels[screen] || (screen === 'career-detail' ? 'Career profile' : screen === 'profile' ? 'Profile & settings' : 'Career passport')}</strong>
          </div>
          <button className="global-search" onClick={() => navigate('careers')}><Icon name="search" size={18} /><span>Search careers or resources</span><kbd>⌘ K</kbd></button>
          <div className="topbar-actions">
            <button className="voice-pill" onClick={onVoice}><span className="mini-wave"><i /><i /><i /></span><span>Talk to Navi</span></button>
            <button className="icon-button notification" aria-label="Notifications" onClick={() => navigate('notifications')}><Icon name="bell" /><span /></button>
            <button className="avatar small" onClick={() => navigate('profile')}>{initials}</button>
          </div>
        </header>
        <main className="page-content"><Breadcrumbs screen={screen} navigate={navigate} />{children}</main>
      </section>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 4).map((item) => (
          <button key={item.id} className={screen === item.id ? 'active' : ''} onClick={() => navigate(item.id)}><Icon name={item.icon} /><span>{item.label.replace('Career ', '')}</span></button>
        ))}
        <button onClick={onVoice} className="mobile-voice"><Icon name="mic" /></button>
      </nav>
    </div>
  )
}
