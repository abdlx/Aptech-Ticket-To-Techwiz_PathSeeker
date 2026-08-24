import { useEffect, useState } from 'react'
import AppShell from './components/AppShell'
import NaviAssistant from './components/NaviAssistant'
import { AuthPage, OnboardingPage, WelcomePage } from './pages/PublicPages'
import { AdminLoginPage, ForgotPasswordPage, ResetPasswordPage, VerifyEmailPage } from './pages/AuthFlowPages'
import {
  CareerBankPage,
  CareerDetailPage,
  DashboardPage,
  FeedbackPage,
  ProfilePage,
  QuizPage,
  RecommendationsPage,
  ResourcesPage,
  SavedPage,
  StoriesPage,
} from './pages/UserPages'
import {
  CompareCareersPage,
  DocumentPreviewPage,
  HelpCenterPage,
  MediaDetailPage,
  NotificationsPage,
  QuizHistoryPage,
  QuizResultDetailPage,
  RecentlyViewedPage,
  SavedFiltersPage,
  StoryDetailPage,
  SubmitStoryPage,
} from './pages/ExtendedUserPages'
import AdminPage from './pages/AdminPages'
import './App.css'
import './ExtendedPages.css'

function readLocation() {
  const params = new URLSearchParams(window.location.search)
  return { screen: params.get('screen') || 'welcome', careerId: params.get('career') || 'ux-designer' }
}

function App() {
  const initial = readLocation()
  const [screen, setScreen] = useState(initial.screen)
  const [careerId, setCareerId] = useState(initial.careerId)
  const [voiceOpen, setVoiceOpen] = useState(() => new URLSearchParams(window.location.search).get('voice') === '1')
  const [mobileMenu, setMobileMenu] = useState(false)

  useEffect(() => {
    const onPopState = () => {
      const next = readLocation()
      setScreen(next.screen)
      setCareerId(next.careerId)
    }
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const navigate = (nextScreen, nextCareer) => {
    const params = new URLSearchParams()
    params.set('screen', nextScreen)
    if (nextCareer) params.set('career', nextCareer)
    window.history.pushState({}, '', `?${params.toString()}`)
    setScreen(nextScreen)
    if (nextCareer) setCareerId(nextCareer)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  let page
  if (screen === 'dashboard') page = <DashboardPage navigate={navigate} onVoice={() => setVoiceOpen(true)} />
  else if (screen === 'quiz') page = <QuizPage navigate={navigate} onVoice={() => setVoiceOpen(true)} />
  else if (screen === 'recommendations') page = <RecommendationsPage navigate={navigate} onVoice={() => setVoiceOpen(true)} />
  else if (screen === 'careers') page = <CareerBankPage navigate={navigate} />
  else if (screen === 'career-detail') page = <CareerDetailPage navigate={navigate} careerId={careerId} />
  else if (screen === 'resources') page = <ResourcesPage navigate={navigate} />
  else if (screen === 'saved') page = <SavedPage navigate={navigate} />
  else if (screen === 'stories') page = <StoriesPage navigate={navigate} />
  else if (screen === 'profile') page = <ProfilePage />
  else if (screen === 'feedback') page = <FeedbackPage navigate={navigate} />
  else if (screen === 'notifications') page = <NotificationsPage navigate={navigate} />
  else if (screen === 'quiz-history') page = <QuizHistoryPage navigate={navigate} />
  else if (screen === 'quiz-result') page = <QuizResultDetailPage navigate={navigate} />
  else if (screen === 'recently-viewed') page = <RecentlyViewedPage navigate={navigate} />
  else if (screen === 'compare') page = <CompareCareersPage navigate={navigate} />
  else if (screen === 'saved-filters') page = <SavedFiltersPage navigate={navigate} />
  else if (screen === 'media-detail') page = <MediaDetailPage navigate={navigate} />
  else if (screen === 'document-preview') page = <DocumentPreviewPage navigate={navigate} />
  else if (screen === 'story-detail') page = <StoryDetailPage navigate={navigate} />
  else if (screen === 'submit-story') page = <SubmitStoryPage navigate={navigate} />
  else if (screen === 'help') page = <HelpCenterPage navigate={navigate} />
  else page = <DashboardPage navigate={navigate} onVoice={() => setVoiceOpen(true)} />

  if (screen === 'admin-login') return <AdminLoginPage navigate={navigate} />
  if (screen.startsWith('admin')) return <AdminPage screen={screen} navigate={navigate} />
  if (screen === 'welcome') return <><WelcomePage navigate={navigate} onVoice={() => setVoiceOpen(true)} /><NaviAssistant open={voiceOpen} onClose={() => setVoiceOpen(false)} context="getting started" /></>
  if (screen === 'signup' || screen === 'login') return <AuthPage navigate={navigate} mode={screen} />
  if (screen === 'forgot-password') return <ForgotPasswordPage navigate={navigate} />
  if (screen === 'reset-password') return <ResetPasswordPage navigate={navigate} />
  if (screen === 'verify-email') return <VerifyEmailPage navigate={navigate} />
  if (screen === 'onboarding') return <OnboardingPage navigate={navigate} />

  return (
    <>
      <AppShell screen={screen} navigate={navigate} onVoice={() => setVoiceOpen(true)} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu}>{page}</AppShell>
      <NaviAssistant open={voiceOpen} onClose={() => setVoiceOpen(false)} context={screen.replace('-', ' ')} />
    </>
  )
}

export default App
