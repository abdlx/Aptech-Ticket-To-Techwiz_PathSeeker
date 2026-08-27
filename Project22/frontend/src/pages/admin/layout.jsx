import { lazy, Suspense } from 'react'
import Icon from '../../components/Icon'
import { Brand } from '../../components/AppShell'
const AdminOverview = lazy(() => import('./overview'))
const UsersAdmin = lazy(() => import('./users'))
const CareersAdmin = lazy(() => import('./careers'))
const ContentAdmin = lazy(() => import('./content'))
const QuizAdmin = lazy(() => import('./quiz'))
const StoriesAdmin = lazy(() => import('./stories'))
const FeedbackAdmin = lazy(() => import('./feedback'))
const AdminFeedbackAnalytics = lazy(() => import('./feedback-analytics'))
const AdminSettingsPage = lazy(() => import('./settings'))
const AdminHelpPage = lazy(() => import('./help'))
const AdminUserEditor = lazy(() => import('./user-editor'))
const AdminCareerEditor = lazy(() => import('./career-editor'))
const AdminContentEditor = lazy(() => import('./content-editor'))
const AdminStoryReview = lazy(() => import('./story-review'))
const AuditLogsAdmin = lazy(() => import('./audit-logs'))
import adminNav from './navigation'
import { useAuth } from '../../context/AuthContext'

export default function AdminPage({ screen, navigate, entityId }) {
  const { user } = useAuth()
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Brand />
        <div className="admin-workspace"><span className="avatar">PS</span><p><strong>PathSeeker HQ</strong><small>{user?.role || 'Administrator'}</small></p><Icon name="chevron" /></div>
        <nav><p className="nav-label">Workspace</p>{adminNav.map(([id, label, icon]) => <button key={id} className={screen === id ? 'active' : ''} onClick={() => navigate(id)}><Icon name={icon} /><span>{label}</span>{id === 'admin-feedback' && <em>12</em>}</button>)}</nav>
        <div className="admin-sidebar-bottom"><button className={screen === 'admin-help' ? 'active' : ''} onClick={() => navigate('admin-help')}><Icon name="help" /> Help center</button><button className={screen === 'admin-settings' ? 'active' : ''} onClick={() => navigate('admin-settings')}><Icon name="settings" /> Settings</button><button onClick={() => navigate('dashboard')}><Icon name="logout" /> Exit admin</button><div><span className="avatar small">{(user?.name || 'PS').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span><p><strong>{user?.name || 'Administrator'}</strong><small>{user?.role || 'staff'}</small></p><Icon name="more" /></div></div>
      </aside>
      <nav className="admin-mobile-nav" aria-label="Admin navigation">{adminNav.slice(0, 7).map(([id, label, icon]) => <button key={id} className={screen === id ? 'active' : ''} onClick={() => navigate(id)}><Icon name={icon} /><span>{label}</span></button>)}<button className={screen === 'admin-settings' ? 'active' : ''} onClick={() => navigate('admin-settings')}><Icon name="settings" /><span>Settings</span></button></nav>
      <main className="admin-main">
        <header className="admin-topbar"><button className="admin-mobile-menu" onClick={() => navigate('admin')} aria-label="Admin overview"><Icon name="menu" /></button><div className="admin-search"><Icon name="search" /><input placeholder="Search PathSeeker admin" /><kbd>⌘ K</kbd></div><button className="icon-button"><Icon name="bell" /><span className="notification-dot" /></button><button className="button soft small" onClick={() => navigate('dashboard')}><Icon name="globe" /> View website</button></header>
        <div className="admin-content"><Suspense fallback={<div className="panel">Loading admin module…</div>}>
          {screen === 'admin' && <AdminOverview navigate={navigate} />}
          {screen === 'admin-users' && <UsersAdmin navigate={navigate} />}
          {screen === 'admin-careers' && <CareersAdmin navigate={navigate} />}
          {screen === 'admin-content' && <ContentAdmin navigate={navigate} />}
          {screen === 'admin-quiz' && <QuizAdmin />}
          {screen === 'admin-stories' && <StoriesAdmin navigate={navigate} />}
          {screen === 'admin-feedback' && <FeedbackAdmin />}
          {screen === 'admin-audit-logs' && <AuditLogsAdmin />}
          {screen === 'admin-feedback-analytics' && <AdminFeedbackAnalytics navigate={navigate} />}
          {screen === 'admin-settings' && <AdminSettingsPage navigate={navigate} />}
          {screen === 'admin-help' && <AdminHelpPage navigate={navigate} />}
          {screen === 'admin-user-editor' && <AdminUserEditor navigate={navigate} userId={entityId} />}
          {screen === 'admin-career-editor' && <AdminCareerEditor navigate={navigate} careerId={entityId} />}
          {screen === 'admin-content-editor' && <AdminContentEditor navigate={navigate} contentId={entityId} />}
          {screen === 'admin-story-review' && <AdminStoryReview navigate={navigate} storyId={entityId} />}
        </Suspense></div>
      </main>
    </div>
  )
}
