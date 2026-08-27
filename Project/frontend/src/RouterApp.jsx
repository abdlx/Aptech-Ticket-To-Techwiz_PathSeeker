import { lazy, Suspense, useState } from 'react'
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import AppShell from './components/AppShell'
import NaviAssistant from './components/NaviAssistant'
import { ErrorState, Forbidden, NotFound, PageSkeleton } from './components/common/RouteStates'
import { useAuth } from './providers/AuthProvider'
import './App.css'
import './ExtendedPages.css'

const WelcomePage = lazy(() => import('./pages/public/welcome')); const OnboardingPage = lazy(() => import('./pages/onboarding/onboarding'))
const LoginPage = lazy(() => import('./pages/auth/login')); const SignupPage = lazy(() => import('./pages/auth/signup'))
const authFlows = () => import('./components/auth/ConnectedAuthFlows')
const ForgotPasswordPage = lazy(() => authFlows().then((module) => ({ default: module.ForgotPasswordFlow })))
const VerifyEmailPage = lazy(() => authFlows().then((module) => ({ default: module.VerifyEmailFlow })))
const ResetPasswordPage = lazy(() => authFlows().then((module) => ({ default: module.ResetPasswordFlow }))); const AdminLoginPage = lazy(() => authFlows().then((module) => ({ default: module.AdminLoginFlow })))
const DashboardPage = lazy(() => import('./pages/user/dashboard')); const QuizPage = lazy(() => import('./pages/user/quiz')); const RecommendationsPage = lazy(() => import('./pages/user/recommendations'))
const CareerBankPage = lazy(() => import('./pages/user/career-bank-enhanced')); const CareerDetailPage = lazy(() => import('./pages/user/career-detail-enhanced')); const ResourcesPage = lazy(() => import('./pages/user/resources'))
const SavedPage = lazy(() => import('./pages/user/saved')); const StoriesPage = lazy(() => import('./pages/user/stories')); const ProfilePage = lazy(() => import('./pages/user/connected-profile')); const FeedbackPage = lazy(() => import('./pages/user/feedback'))
const NotificationsPage = lazy(() => import('./pages/user/notifications')); const QuizHistoryPage = lazy(() => import('./pages/user/quiz-history')); const QuizResultDetailPage = lazy(() => import('./pages/user/quiz-result-detail'))
const RecentlyViewedPage = lazy(() => import('./pages/user/recently-viewed')); const CompareCareersPage = lazy(() => import('./pages/user/compare-careers-enhanced')); const SavedFiltersPage = lazy(() => import('./pages/user/saved-filters'))
const MediaDetailPage = lazy(() => import('./pages/user/media-detail-enhanced')); const DocumentPreviewPage = lazy(() => import('./pages/user/document-preview-enhanced')); const StoryDetailPage = lazy(() => import('./pages/user/story-detail'))
const SubmitStoryPage = lazy(() => import('./pages/user/submit-story')); const HelpCenterPage = lazy(() => import('./pages/user/help-center')); const AdminPage = lazy(() => import('./pages/admin/layout'))

const screenPaths = {
  welcome: '/', signup: '/signup', login: '/login', 'verify-email': '/verify-email', 'forgot-password': '/forgot-password', 'reset-password': '/reset-password', onboarding: '/onboarding',
  dashboard: '/app/dashboard', quiz: '/app/quiz', 'quiz-history': '/app/quiz/history', 'quiz-result': '/app/quiz/results', recommendations: '/app/recommendations', careers: '/app/careers',
  'career-detail': '/app/careers', compare: '/app/careers/compare', resources: '/app/resources', 'document-preview': '/app/resources', 'media-detail': '/app/media', saved: '/app/saved',
  'saved-filters': '/app/saved-filters', 'recently-viewed': '/app/recently-viewed', stories: '/app/stories', 'submit-story': '/app/stories/submit', 'story-detail': '/app/stories',
  profile: '/app/profile', feedback: '/app/feedback', notifications: '/app/notifications', help: '/app/help',
  'admin-login': '/admin/login', admin: '/admin', 'admin-users': '/admin/users', 'admin-user-editor': '/admin/users', 'admin-careers': '/admin/careers',
  'admin-career-editor': '/admin/careers', 'admin-content': '/admin/content', 'admin-content-editor': '/admin/content', 'admin-quiz': '/admin/quiz',
  'admin-stories': '/admin/stories', 'admin-story-review': '/admin/stories', 'admin-feedback': '/admin/feedback', 'admin-feedback-analytics': '/admin/feedback/analytics',
  'admin-settings': '/admin/settings', 'admin-help': '/admin/help',
}

function useLegacyNavigate() {
  const navigate = useNavigate()
  return (screen, id) => {
    let path = screenPaths[screen] || '/app/dashboard'
    if (id && ['career-detail', 'quiz-result', 'media-detail', 'document-preview', 'story-detail', 'admin-user-editor', 'admin-career-editor', 'admin-content-editor', 'admin-story-review'].includes(screen)) path += `/${id}`
    navigate(path)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function RequireUser({ staff = false }) {
  const auth = useAuth()
  const location = useLocation()
  if (auth.isLoading) return <main className="page-content"><PageSkeleton /></main>
  if (auth.error) return <main className="page-content"><ErrorState message={auth.error.message} onRetry={auth.refresh} /></main>
  if (!auth.user) return <Navigate to={staff ? '/admin/login' : '/login'} replace state={{ from: location }} />
  if (staff && !['content_editor', 'support_manager', 'admin', 'super_admin'].includes(auth.user.role)) return <Navigate to="/forbidden" replace />
  return <Outlet />
}

function PublicPage({ Component }) {
  const navigate = useLegacyNavigate()
  const [voiceOpen, setVoiceOpen] = useState(false)
  return <><Component navigate={navigate} onVoice={() => setVoiceOpen(true)} /><NaviAssistant open={voiceOpen} onClose={() => setVoiceOpen(false)} context="getting started" /></>
}

function AuthPageRoute({ Component }) {
  const navigate = useLegacyNavigate()
  return <Component navigate={navigate} />
}

function screenFromPath(pathname) {
  if (pathname.includes('/quiz/results/')) return 'quiz-result'
  if (pathname.includes('/careers/compare')) return 'compare'
  if (/\/app\/careers\/[^/]+/.test(pathname)) return 'career-detail'
  if (/\/app\/media\//.test(pathname)) return 'media-detail'
  if (/\/app\/resources\/[^/]+/.test(pathname)) return 'document-preview'
  if (pathname.endsWith('/stories/submit')) return 'submit-story'
  if (/\/app\/stories\/[^/]+/.test(pathname)) return 'story-detail'
  const entry = Object.entries(screenPaths).find(([, path]) => path === pathname)
  return entry?.[0] || 'dashboard'
}

function UserLayout() {
  const location = useLocation()
  const navigate = useLegacyNavigate()
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const screen = screenFromPath(location.pathname)
  return <><AppShell screen={screen} navigate={navigate} onVoice={() => setVoiceOpen(true)} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu}><Outlet /></AppShell><NaviAssistant open={voiceOpen} onClose={() => setVoiceOpen(false)} context={screen.replaceAll('-', ' ')} /></>
}

function LegacyRoute({ Component }) {
  const navigate = useLegacyNavigate()
  const params = useParams()
  return <Component navigate={navigate} careerId={params.slug} attemptId={params.attemptId} resourceId={params.resourceId} mediaId={params.mediaId} storyId={params.storyId} />
}

function AdminRoute() {
  const navigate = useLegacyNavigate()
  const pathname = useLocation().pathname
  let screen = screenFromPath(pathname)
  if (/\/admin\/users\/[^/]+/.test(pathname)) screen = 'admin-user-editor'
  else if (pathname === '/admin/careers/new' || /\/admin\/careers\/[^/]+/.test(pathname)) screen = 'admin-career-editor'
  else if (pathname === '/admin/content/new' || /\/admin\/content\/[^/]+/.test(pathname)) screen = 'admin-content-editor'
  else if (/\/admin\/stories\/[^/]+/.test(pathname)) screen = 'admin-story-review'
  return <AdminPage screen={screen} navigate={navigate} />
}

export default function RouterApp() {
  return <Suspense fallback={<main className="page-content"><PageSkeleton /></main>}><Routes>
    <Route path="/" element={<PublicPage Component={WelcomePage} />} />
    <Route path="/signup" element={<AuthPageRoute Component={SignupPage} />} /><Route path="/login" element={<AuthPageRoute Component={LoginPage} />} />
    <Route path="/verify-email" element={<AuthPageRoute Component={VerifyEmailPage} />} />
    <Route path="/forgot-password" element={<AuthPageRoute Component={ForgotPasswordPage} />} />
    <Route path="/reset-password" element={<AuthPageRoute Component={ResetPasswordPage} />} /><Route path="/admin/login" element={<AuthPageRoute Component={AdminLoginPage} />} />
    <Route path="/forbidden" element={<main className="page-content"><Forbidden /></main>} />

    <Route element={<RequireUser />}>
      <Route path="/onboarding" element={<AuthPageRoute Component={OnboardingPage} />} />
      <Route path="/app" element={<UserLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<LegacyRoute Component={DashboardPage} />} />
        <Route path="quiz" element={<LegacyRoute Component={QuizPage} />} /><Route path="quiz/history" element={<LegacyRoute Component={QuizHistoryPage} />} /><Route path="quiz/results/:attemptId" element={<LegacyRoute Component={QuizResultDetailPage} />} />
        <Route path="recommendations" element={<LegacyRoute Component={RecommendationsPage} />} /><Route path="careers" element={<LegacyRoute Component={CareerBankPage} />} />
        <Route path="careers/compare" element={<LegacyRoute Component={CompareCareersPage} />} /><Route path="careers/:slug" element={<LegacyRoute Component={CareerDetailPage} />} />
        <Route path="resources" element={<LegacyRoute Component={ResourcesPage} />} /><Route path="resources/:resourceId" element={<LegacyRoute Component={DocumentPreviewPage} />} />
        <Route path="media/:mediaId" element={<LegacyRoute Component={MediaDetailPage} />} /><Route path="saved" element={<LegacyRoute Component={SavedPage} />} /><Route path="saved-filters" element={<LegacyRoute Component={SavedFiltersPage} />} />
        <Route path="recently-viewed" element={<LegacyRoute Component={RecentlyViewedPage} />} /><Route path="stories" element={<LegacyRoute Component={StoriesPage} />} /><Route path="stories/submit" element={<LegacyRoute Component={SubmitStoryPage} />} />
        <Route path="stories/:storyId" element={<LegacyRoute Component={StoryDetailPage} />} /><Route path="profile" element={<LegacyRoute Component={ProfilePage} />} /><Route path="feedback" element={<LegacyRoute Component={FeedbackPage} />} />
        <Route path="notifications" element={<LegacyRoute Component={NotificationsPage} />} /><Route path="help" element={<LegacyRoute Component={HelpCenterPage} />} />
      </Route>
    </Route>

    <Route element={<RequireUser staff />}><Route path="/admin/*" element={<AdminRoute />} /></Route>
    <Route path="*" element={<NotFound />} />
  </Routes></Suspense>
}
