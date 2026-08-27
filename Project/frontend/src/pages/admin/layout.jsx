import Icon from '../../components/Icon'
import { useQuery } from '@tanstack/react-query'
import { Brand } from '../../components/AppShell'
import AdminOverview from './overview-live'
import UsersAdmin from './users'
import CareersAdmin from './careers'
import ContentAdmin from './content'
import QuizAdmin from './quiz-live'
import StoriesAdmin from './stories'
import FeedbackAdmin from './feedback'
import AdminFeedbackAnalytics from './feedback-analytics'
import AdminSettingsPage from './settings-live'
import AdminHelpPage from './help-live'
import AdminUserEditor from './user-editor-live'
import AdminCareerEditor from './career-editor-enhanced'
import AdminContentEditor from './content-editor-enhanced'
import AdminStoryReview from './story-review-live'
import AdminAuditLogs from './audit-logs'
import adminNav from './navigation'
import { authApi } from '../../services/authApi'
import { useAuth } from '../../providers/AuthProvider'
import { adminApi } from '../../services/adminApi'
import { queryKeys } from '../../lib/queryKeys'

export default function AdminPage({ screen, navigate, entityId }) {
  const auth = useAuth()
  const statsQuery = useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: ({ signal }) => adminApi.getStats({ signal }),
    refetchInterval: 30_000,
  })
  const openFeedback = statsQuery.data?.data?.stats?.queues?.openFeedback || 0
  const displayName = auth.user?.name || 'Administrator'
  const initials = displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()
  const canManageUsers = ['admin', 'super_admin'].includes(auth.user?.role)
  const visibleNav = canManageUsers ? adminNav : adminNav.filter(([id]) => !['admin-users', 'admin-audit'].includes(id))
  const logout = async () => {
    try { await authApi.logout() } finally { auth.clearUser(); navigate('admin-login') }
  }
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Brand />
        <div className="admin-workspace"><span className="avatar">PS</span><p><strong>PathSeeker HQ</strong><small>Administrator</small></p><Icon name="chevron" /></div>
        <nav><p className="nav-label">Workspace</p>{visibleNav.map(([id, label, icon]) => <button key={id} className={screen === id ? 'active' : ''} onClick={() => navigate(id)}><Icon name={icon} /><span>{label}</span>{id === 'admin-feedback' && openFeedback > 0 && <em>{openFeedback}</em>}</button>)}</nav>
        <div className="admin-sidebar-bottom"><button className={screen === 'admin-help' ? 'active' : ''} onClick={() => navigate('admin-help')}><Icon name="help" /> Help center</button>{canManageUsers && <button className={screen === 'admin-settings' ? 'active' : ''} onClick={() => navigate('admin-settings')}><Icon name="settings" /> Settings</button>}<button onClick={logout}><Icon name="logout" /> Log out</button><div><span className="avatar small">{initials}</span><p><strong>{displayName}</strong><small>{auth.user?.role?.replaceAll('_', ' ') || 'staff'}</small></p><Icon name="more" /></div></div>
      </aside>
      <nav className="admin-mobile-nav" aria-label="Admin navigation">{visibleNav.slice(0, 7).map(([id, label, icon]) => <button key={id} className={screen === id ? 'active' : ''} onClick={() => navigate(id)}><Icon name={icon} /><span>{label}</span></button>)}{canManageUsers && <button className={screen === 'admin-settings' ? 'active' : ''} onClick={() => navigate('admin-settings')}><Icon name="settings" /><span>Settings</span></button>}</nav>
      <main className="admin-main">
        <header className="admin-topbar"><button className="admin-mobile-menu" onClick={() => navigate('admin')} aria-label="Admin overview"><Icon name="menu" /></button><div className="admin-search"><Icon name="search" /><input placeholder="Search PathSeeker admin" /><kbd>⌘ K</kbd></div><button className="icon-button"><Icon name="bell" /><span className="notification-dot" /></button><button className="button soft small" onClick={() => navigate('dashboard')}><Icon name="globe" /> View website</button></header>
        <div className="admin-content">
          {screen === 'admin' && <AdminOverview navigate={navigate} />}
          {screen === 'admin-users' && <UsersAdmin navigate={navigate} />}
          {screen === 'admin-careers' && <CareersAdmin navigate={navigate} />}
          {screen === 'admin-content' && <ContentAdmin navigate={navigate} />}
          {screen === 'admin-quiz' && <QuizAdmin navigate={navigate} />}
          {screen === 'admin-stories' && <StoriesAdmin navigate={navigate} />}
          {screen === 'admin-feedback' && <FeedbackAdmin navigate={navigate} />}
          {screen === 'admin-feedback-analytics' && <AdminFeedbackAnalytics navigate={navigate} />}
          {screen === 'admin-audit' && <AdminAuditLogs />}
          {screen === 'admin-settings' && <AdminSettingsPage navigate={navigate} />}
          {screen === 'admin-help' && <AdminHelpPage navigate={navigate} />}
          {screen === 'admin-user-editor' && <AdminUserEditor navigate={navigate} userId={entityId} />}
          {screen === 'admin-career-editor' && <AdminCareerEditor navigate={navigate} careerId={entityId} />}
          {screen === 'admin-content-editor' && <AdminContentEditor navigate={navigate} contentId={entityId} />}
          {screen === 'admin-story-review' && <AdminStoryReview navigate={navigate} storyId={entityId} />}
        </div>
      </main>
    </div>
  )
}
