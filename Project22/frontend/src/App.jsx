import { lazy, Suspense, useEffect, useState, cloneElement } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import AppShell from './components/AppShell'
import NaviAssistant from './components/NaviAssistant'
import ErrorBoundary from './components/common/ErrorBoundary'
import { useAuth } from './context/AuthContext'
import { apiRequest, endpoints } from './services/pathseekerApi'
import './App.css'
import './ExtendedPages.css'

const WelcomePage = lazy(() => import('./pages/public/welcome'))
const NotFoundPage = lazy(() => import('./pages/public/not-found'))
const ForbiddenPage = lazy(() => import('./pages/public/forbidden'))
const OnboardingPage = lazy(() => import('./pages/onboarding/onboarding'))
const LoginPage = lazy(() => import('./pages/auth/login'))
const SignupPage = lazy(() => import('./pages/auth/signup'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/forgot-password'))
const ResetPasswordPage = lazy(() => import('./pages/auth/reset-password'))
const VerifyEmailPage = lazy(() => import('./pages/auth/verify-email'))
const AdminLoginPage = lazy(() => import('./pages/admin/login'))
const DashboardPage = lazy(() => import('./pages/user/dashboard'))
const QuizPage = lazy(() => import('./pages/user/quiz'))
const RecommendationsPage = lazy(() => import('./pages/user/recommendations'))
const CareerBankPage = lazy(() => import('./pages/user/career-bank'))
const CareerDetailPage = lazy(() => import('./pages/user/career-detail'))
const ResourcesPage = lazy(() => import('./pages/user/resources'))
const SavedPage = lazy(() => import('./pages/user/saved'))
const StoriesPage = lazy(() => import('./pages/user/stories'))
const ProfilePage = lazy(() => import('./pages/user/profile'))
const FeedbackPage = lazy(() => import('./pages/user/feedback'))
const NotificationsPage = lazy(() => import('./pages/user/notifications'))
const QuizHistoryPage = lazy(() => import('./pages/user/quiz-history'))
const QuizResultDetailPage = lazy(() => import('./pages/user/quiz-result-detail'))
const RecentlyViewedPage = lazy(() => import('./pages/user/recently-viewed'))
const CompareCareersPage = lazy(() => import('./pages/user/compare-careers'))
const SavedFiltersPage = lazy(() => import('./pages/user/saved-filters'))
const MediaDetailPage = lazy(() => import('./pages/user/media-detail'))
const DocumentPreviewPage = lazy(() => import('./pages/user/document-preview'))
const StoryDetailPage = lazy(() => import('./pages/user/story-detail'))
const SubmitStoryPage = lazy(() => import('./pages/user/submit-story'))
const HelpCenterPage = lazy(() => import('./pages/user/help-center'))
const AdminPage = lazy(() => import('./pages/admin/layout'))

const screenPaths = {
  welcome: '/', signup: '/signup', login: '/login', 'forgot-password': '/forgot-password', 'reset-password': '/reset-password', 'verify-email': '/verify-email', 'admin-login': '/admin/login', onboarding: '/onboarding',
  dashboard: '/dashboard', quiz: '/quiz', recommendations: '/recommendations', careers: '/careers', resources: '/resources', saved: '/saved', stories: '/stories', profile: '/profile', feedback: '/feedback', notifications: '/notifications', 'quiz-history': '/quiz/history', 'recently-viewed': '/recently-viewed', compare: '/compare', 'saved-filters': '/saved-filters', help: '/help',
  'admin': '/admin', 'admin-users': '/admin/users', 'admin-careers': '/admin/careers', 'admin-content': '/admin/content', 'admin-quiz': '/admin/quiz', 'admin-stories': '/admin/stories', 'admin-feedback': '/admin/feedback', 'admin-audit-logs': '/admin/audit-logs', 'admin-feedback-analytics': '/admin/feedback-analytics', 'admin-settings': '/admin/settings', 'admin-help': '/admin/help',
}
function pathFor(screen, entity) {
  if (screen === 'career-detail') return `/careers/${encodeURIComponent(entity || '')}`
  if (screen === 'media-detail') return `/media/${encodeURIComponent(entity || '')}`
  if (screen === 'document-preview') return `/resources/${encodeURIComponent(entity || '')}/preview`
  if (screen === 'story-detail') return `/stories/${encodeURIComponent(entity || '')}`
  if (screen === 'submit-story') return entity ? `/stories/${encodeURIComponent(entity)}/edit` : '/stories/submit'
  if (screen === 'quiz-result') return `/quiz/results/${encodeURIComponent(entity || '')}`
  if (screen === 'admin-user-editor') return `/admin/users/${encodeURIComponent(entity || 'new')}/edit`
  if (screen === 'admin-career-editor') return entity ? `/admin/careers/${encodeURIComponent(entity)}/edit` : '/admin/careers/new'
  if (screen === 'admin-content-editor') return entity ? `/admin/content/${encodeURIComponent(entity)}/edit` : '/admin/content/new'
  if (screen === 'admin-story-review') return `/admin/stories/${encodeURIComponent(entity || '')}`
  return screenPaths[screen] || '/404'
}

function useScreenNavigate() {
  const navigateRouter = useNavigate()
  return (screen, entity) => { navigateRouter(pathFor(screen, entity)); window.scrollTo({ top: 0, behavior: 'smooth' }) }
}

function Loading() { return <div className="app-loading"><span className="mini-wave"><i /><i /><i /></span><p>Loading your Career Passport…</p></div> }
function UserRoute({ children, screen }) { const { user, initializing } = useAuth(); if (initializing) return <Loading />; if (!user) return <Navigate to={screen?.startsWith('admin') ? '/admin/login' : '/login'} replace />; return children }
function StaffRoute({ children }) { const { user, initializing, isStaff } = useAuth(); if (initializing) return <Loading />; if (!user) return <Navigate to="/admin/login" replace />; if (!isStaff) return <Navigate to="/403" replace />; return children }
function UserShell({ screen, children }) { const navigate = useScreenNavigate(); const [voiceOpen, setVoiceOpen] = useState(false); const [mobileMenu, setMobileMenu] = useState(false); const child = cloneElement(children, { onVoice: () => setVoiceOpen(true) }); return <><AppShell screen={screen} navigate={navigate} onVoice={() => setVoiceOpen(true)} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu}>{child}</AppShell><NaviAssistant open={voiceOpen} onClose={() => setVoiceOpen(false)} navigate={navigate} context={screen.replace('-', ' ')} /></> }

function LegacyRedirect() { const location = useLocation(); const navigate = useNavigate(); useEffect(() => { const params = new URLSearchParams(location.search); const screen = params.get('screen'); if (!screen) return; const entity = params.get('career') || params.get('id'); navigate(pathFor(screen, entity) + (params.get('token') ? `?token=${encodeURIComponent(params.get('token'))}` : ''), { replace: true }) }, [location.search, navigate]); return <Loading /> }
function PreferenceSync() { const { user } = useAuth(); useEffect(() => { if (!user) { document.documentElement.removeAttribute('data-theme'); document.documentElement.style.removeProperty('--font-scale'); document.documentElement.classList.remove('reduced-motion'); return } apiRequest(endpoints.profile).then(({ data }) => { const preferences = data.profile?.preferences || {}; const theme = preferences.theme || 'light'; const resolved = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme; document.documentElement.setAttribute('data-theme', resolved); document.documentElement.style.setProperty('--font-scale', String(preferences.fontScale || 1)); document.documentElement.classList.toggle('reduced-motion', Boolean(preferences.reducedMotion)) }).catch(() => {}) }, [user]); return null }

function AppRoutes() {
  const navigate = useScreenNavigate()
  return <>
    <PreferenceSync />
    <Routes>
      <Route path="*" element={<LegacyOrNotFound />} />
      <Route path="/" element={<WelcomeRoute />} />
      <Route path="/signup" element={<PublicPage><SignupPage navigate={navigate} /></PublicPage>} />
      <Route path="/login" element={<PublicPage><LoginPage navigate={navigate} /></PublicPage>} />
      <Route path="/forgot-password" element={<PublicPage><ForgotPasswordPage navigate={navigate} /></PublicPage>} />
      <Route path="/reset-password" element={<PublicPage><ResetPasswordQueryRoute /></PublicPage>} />
      <Route path="/reset-password/:token" element={<PublicPage><ResetPasswordWithParam /></PublicPage>} />
      <Route path="/verify-email" element={<PublicPage><VerifyEmailPage navigate={navigate} /></PublicPage>} />
      <Route path="/admin/login" element={<PublicPage><AdminLoginPage navigate={navigate} /></PublicPage>} />
      <Route path="/403" element={<ForbiddenPage navigate={navigate} />} />
      <Route path="/onboarding" element={<UserRoute><OnboardingPage navigate={navigate} /></UserRoute>} />
      <Route path="/dashboard" element={<UserRoute><UserShell screen="dashboard"><DashboardPage navigate={navigate} /></UserShell></UserRoute>} />
      <Route path="/quiz" element={<UserRoute><UserShell screen="quiz"><QuizPage navigate={navigate} /></UserShell></UserRoute>} />
      <Route path="/recommendations" element={<UserRoute><UserShell screen="recommendations"><RecommendationsPage navigate={navigate} /></UserShell></UserRoute>} />
      <Route path="/careers" element={<PublicPage><CareerBankPage navigate={navigate} /></PublicPage>} />
      <Route path="/careers/:careerId" element={<PublicPage><CareerDetailRoute /></PublicPage>} />
      <Route path="/resources" element={<PublicPage><ResourcesPage navigate={navigate} /></PublicPage>} />
      <Route path="/resources/:resourceId/preview" element={<PublicPage><DocumentPreviewRoute /></PublicPage>} />
      <Route path="/media/:mediaId" element={<PublicPage><MediaDetailRoute /></PublicPage>} />
      <Route path="/stories" element={<PublicPage><StoriesPage navigate={navigate} /></PublicPage>} />
      <Route path="/stories/submit" element={<UserRoute><UserShell screen="submit-story"><SubmitStoryPage navigate={navigate} /></UserShell></UserRoute>} />
      <Route path="/stories/:storyId/edit" element={<UserRoute><UserShell screen="submit-story"><SubmitStoryEditRoute /></UserShell></UserRoute>} />
      <Route path="/stories/:storyId" element={<PublicPage><StoryDetailRoute /></PublicPage>} />
      <Route path="/help" element={<PublicPage><HelpCenterPage navigate={navigate} /></PublicPage>} />
      {[
        ['/saved','saved',SavedPage],['/profile','profile',ProfilePage],['/feedback','feedback',FeedbackPage],['/notifications','notifications',NotificationsPage],['/quiz/history','quiz-history',QuizHistoryPage],['/quiz/results/:attemptId','quiz-result',QuizResultRoute],['/recently-viewed','recently-viewed',RecentlyViewedPage],['/compare','compare',CompareCareersPage],['/saved-filters','saved-filters',SavedFiltersPage],
      ].map(([path, screen, Component]) => <Route key={path} path={path} element={<UserRoute><UserShell screen={screen}><Component navigate={navigate} {...(screen === 'quiz-result' ? {} : {})} /></UserShell></UserRoute>} />)}
      <Route path="/admin" element={<StaffRoute><AdminPage screen="admin" navigate={navigate} /></StaffRoute>} />
      <Route path="/admin/:section" element={<StaffRoute><AdminRoute /></StaffRoute>} />
      <Route path="/admin/users/:userId/edit" element={<StaffRoute><AdminRoute /></StaffRoute>} />
      <Route path="/admin/careers/new" element={<StaffRoute><AdminPage screen="admin-career-editor" navigate={navigate} /></StaffRoute>} />
      <Route path="/admin/careers/:careerId/edit" element={<StaffRoute><AdminRoute /></StaffRoute>} />
      <Route path="/admin/content/new" element={<StaffRoute><AdminPage screen="admin-content-editor" navigate={navigate} /></StaffRoute>} />
      <Route path="/admin/content/:contentId/edit" element={<StaffRoute><AdminRoute /></StaffRoute>} />
      <Route path="/admin/stories/:storyId" element={<StaffRoute><AdminRoute /></StaffRoute>} />
    </Routes>
  </>
}
function WelcomeRoute() { const navigate = useScreenNavigate(); const [voiceOpen, setVoiceOpen] = useState(false); return <><PublicPage><WelcomePage navigate={navigate} onVoice={() => setVoiceOpen(true)} /></PublicPage><NaviAssistant open={voiceOpen} onClose={() => setVoiceOpen(false)} navigate={navigate} context="getting started" /></> }
function PublicPage({ children }) { return <div className="public-page-shell">{children}</div> }
function CareerDetailRoute() { const { careerId } = useParams(); const navigate = useScreenNavigate(); return <CareerDetailPage navigate={navigate} careerId={careerId} /> }
function MediaDetailRoute() { const { mediaId } = useParams(); const navigate = useScreenNavigate(); return <MediaDetailPage navigate={navigate} mediaId={mediaId} /> }
function DocumentPreviewRoute() { const { resourceId } = useParams(); const navigate = useScreenNavigate(); return <DocumentPreviewPage navigate={navigate} resourceId={resourceId} /> }
function StoryDetailRoute() { const { storyId } = useParams(); const navigate = useScreenNavigate(); return <StoryDetailPage navigate={navigate} storyId={storyId} /> }
function SubmitStoryEditRoute() { const { storyId } = useParams(); const navigate = useScreenNavigate(); return <SubmitStoryPage navigate={navigate} storyId={storyId} /> }
function QuizResultRoute() { const { attemptId } = useParams(); const navigate = useScreenNavigate(); return <QuizResultDetailPage navigate={navigate} attemptId={attemptId} /> }
function ResetPasswordWithParam() { const { token } = useParams(); const navigate = useScreenNavigate(); return <ResetPasswordPage navigate={navigate} token={token} /> }
function ResetPasswordQueryRoute() { const params = new URLSearchParams(useLocation().search); const navigate = useScreenNavigate(); return <ResetPasswordPage navigate={navigate} token={params.get('token')} /> }
function AdminRoute() { const params = useParams(); const navigate = useScreenNavigate(); let screen = params.section === 'users' ? 'admin-users' : params.section === 'careers' ? 'admin-careers' : params.section === 'content' ? 'admin-content' : params.section === 'quiz' ? 'admin-quiz' : params.section === 'stories' ? 'admin-stories' : params.section === 'feedback' ? 'admin-feedback' : params.section === 'audit-logs' ? 'admin-audit-logs' : params.section === 'feedback-analytics' ? 'admin-feedback-analytics' : params.section === 'settings' ? 'admin-settings' : params.section === 'help' ? 'admin-help' : 'admin'; if (params.userId) screen = 'admin-user-editor'; if (params.careerId) screen = 'admin-career-editor'; if (params.contentId) screen = 'admin-content-editor'; if (params.storyId) screen = 'admin-story-review'; return <AdminPage screen={screen} navigate={navigate} entityId={params.storyId || params.userId || params.careerId || params.contentId} /> }
function LegacyOrNotFound() { const location = useLocation(); const hasScreen = new URLSearchParams(location.search).has('screen'); if (hasScreen) return <LegacyRedirect />; const navigate = useScreenNavigate(); return <NotFoundPage navigate={navigate} /> }

function App() { return <BrowserRouter><ErrorBoundary><Suspense fallback={<Loading />}><AppRoutes /></Suspense></ErrorBoundary></BrowserRouter> }
export default App
