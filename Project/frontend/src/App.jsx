import { useEffect, useState } from 'react'
import AppShell from './components/AppShell'
import NaviAssistant from './components/NaviAssistant'
import {
  WelcomePage,
  OnboardingPage,
  LoginPage,
  SignupPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  AdminLoginPage,
  DashboardPage,
  QuizPage,
  RecommendationsPage,
  CareerBankPage,
  CareerDetailPage,
  ResourcesPage,
  SavedPage,
  StoriesPage,
  ProfilePage,
  FeedbackPage,
  NotificationsPage,
  QuizHistoryPage,
  QuizResultDetailPage,
  RecentlyViewedPage,
  CompareCareersPage,
  SavedFiltersPage,
  MediaDetailPage,
  DocumentPreviewPage,
  StoryDetailPage,
  SubmitStoryPage,
  HelpCenterPage,
  AdminPage,
} from './pages'
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
  else if (screen === 'media-detail') page = <MediaDetailPage navigate={navigate} mediaId={careerId} />
  else if (screen === 'document-preview') page = <DocumentPreviewPage navigate={navigate} resourceId={careerId} />
  else if (screen === 'story-detail') page = <StoryDetailPage navigate={navigate} storyId={careerId} />
  else if (screen === 'submit-story') page = <SubmitStoryPage navigate={navigate} />
  else if (screen === 'help') page = <HelpCenterPage navigate={navigate} />
  else page = <DashboardPage navigate={navigate} onVoice={() => setVoiceOpen(true)} />

  if (screen === 'admin-login') return <AdminLoginPage navigate={navigate} />
  if (screen.startsWith('admin')) return <AdminPage screen={screen} navigate={navigate} />
  if (screen === 'welcome') return <><WelcomePage navigate={navigate} onVoice={() => setVoiceOpen(true)} /><NaviAssistant open={voiceOpen} onClose={() => setVoiceOpen(false)} navigate={navigate} context="getting started" /></>
  if (screen === 'signup') return <SignupPage navigate={navigate} />
  if (screen === 'login') return <LoginPage navigate={navigate} />
  if (screen === 'forgot-password') return <ForgotPasswordPage navigate={navigate} />
  if (screen === 'reset-password') return <ResetPasswordPage navigate={navigate} />
  if (screen === 'onboarding') return <OnboardingPage navigate={navigate} />

  return (
    <>
      <AppShell screen={screen} navigate={navigate} onVoice={() => setVoiceOpen(true)} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu}>{page}</AppShell>
      <NaviAssistant open={voiceOpen} onClose={() => setVoiceOpen(false)} navigate={navigate} context={screen.replace('-', ' ')} />
    </>
  )
}

export default App
