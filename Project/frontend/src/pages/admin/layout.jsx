import Icon from '../../components/Icon'
import { Brand } from '../../components/AppShell'
import AdminOverview from './overview'
import UsersAdmin from './users'
import CareersAdmin from './careers'
import ContentAdmin from './content'
import QuizAdmin from './quiz'
import StoriesAdmin from './stories'
import FeedbackAdmin from './feedback'
import AdminFeedbackAnalytics from './feedback-analytics'
import AdminSettingsPage from './settings'
import AdminHelpPage from './help'
import AdminUserEditor from './user-editor'
import AdminCareerEditor from './career-editor'
import AdminContentEditor from './content-editor'
import AdminStoryReview from './story-review'
import adminNav from './navigation'
import { authApi } from '../../services/authApi'
import { useAuth } from '../../providers/AuthProvider'

export default function AdminPage({ screen, navigate }) {
  const auth = useAuth()
  const logout = async () => {
    try { await authApi.logout() } finally { auth.clearUser(); navigate('admin-login') }
  }
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Brand />
        <div className="admin-workspace"><span className="avatar">PS</span><p><strong>PathSeeker HQ</strong><small>Administrator</small></p><Icon name="chevron" /></div>
        <nav><p className="nav-label">Workspace</p>{adminNav.map(([id, label, icon]) => <button key={id} className={screen === id ? 'active' : ''} onClick={() => navigate(id)}><Icon name={icon} /><span>{label}</span>{id === 'admin-feedback' && <em>12</em>}</button>)}</nav>
        <div className="admin-sidebar-bottom"><button className={screen === 'admin-help' ? 'active' : ''} onClick={() => navigate('admin-help')}><Icon name="help" /> Help center</button><button className={screen === 'admin-settings' ? 'active' : ''} onClick={() => navigate('admin-settings')}><Icon name="settings" /> Settings</button><button onClick={logout}><Icon name="logout" /> Log out</button><div><span className="avatar small">SM</span><p><strong>Sarah Malik</strong><small>Super admin</small></p><Icon name="more" /></div></div>
      </aside>
      <nav className="admin-mobile-nav" aria-label="Admin navigation">{adminNav.slice(0, 7).map(([id, label, icon]) => <button key={id} className={screen === id ? 'active' : ''} onClick={() => navigate(id)}><Icon name={icon} /><span>{label}</span></button>)}<button className={screen === 'admin-settings' ? 'active' : ''} onClick={() => navigate('admin-settings')}><Icon name="settings" /><span>Settings</span></button></nav>
      <main className="admin-main">
        <header className="admin-topbar"><button className="admin-mobile-menu" onClick={() => navigate('admin')} aria-label="Admin overview"><Icon name="menu" /></button><div className="admin-search"><Icon name="search" /><input placeholder="Search PathSeeker admin" /><kbd>⌘ K</kbd></div><button className="icon-button"><Icon name="bell" /><span className="notification-dot" /></button><button className="button soft small" onClick={() => navigate('dashboard')}><Icon name="globe" /> View website</button></header>
        <div className="admin-content">
          {screen === 'admin' && <AdminOverview navigate={navigate} />}
          {screen === 'admin-users' && <UsersAdmin />}
          {screen === 'admin-careers' && <CareersAdmin />}
          {screen === 'admin-content' && <ContentAdmin />}
          {screen === 'admin-quiz' && <QuizAdmin />}
          {screen === 'admin-stories' && <StoriesAdmin />}
          {screen === 'admin-feedback' && <FeedbackAdmin />}
          {screen === 'admin-feedback-analytics' && <AdminFeedbackAnalytics navigate={navigate} />}
          {screen === 'admin-settings' && <AdminSettingsPage navigate={navigate} />}
          {screen === 'admin-help' && <AdminHelpPage navigate={navigate} />}
          {screen === 'admin-user-editor' && <AdminUserEditor navigate={navigate} />}
          {screen === 'admin-career-editor' && <AdminCareerEditor navigate={navigate} />}
          {screen === 'admin-content-editor' && <AdminContentEditor navigate={navigate} />}
          {screen === 'admin-story-review' && <AdminStoryReview navigate={navigate} />}
        </div>
      </main>
    </div>
  )
}
