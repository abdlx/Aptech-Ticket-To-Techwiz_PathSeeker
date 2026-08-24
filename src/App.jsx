import { useEffect, useState } from 'react'
import AppShell from './components/AppShell'
import NaviAssistant from './components/NaviAssistant'
import { AuthPage, OnboardingPage, WelcomePage } from './pages/PublicPages'
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
import AdminPage from './pages/AdminPages'
import './App.css'

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
  else if (screen === 'resources') page = <ResourcesPage />
  else if (screen === 'saved') page = <SavedPage navigate={navigate} />
  else if (screen === 'stories') page = <StoriesPage />
  else if (screen === 'profile') page = <ProfilePage />
  else if (screen === 'feedback') page = <FeedbackPage navigate={navigate} />
  else page = <DashboardPage navigate={navigate} onVoice={() => setVoiceOpen(true)} />

  if (screen.startsWith('admin')) return <AdminPage screen={screen} navigate={navigate} />
  if (screen === 'welcome') return <><WelcomePage navigate={navigate} onVoice={() => setVoiceOpen(true)} /><NaviAssistant open={voiceOpen} onClose={() => setVoiceOpen(false)} context="getting started" /></>
  if (screen === 'signup' || screen === 'login') return <AuthPage navigate={navigate} mode={screen} />
  if (screen === 'onboarding') return <OnboardingPage navigate={navigate} />

  return (
    <>
      <AppShell screen={screen} navigate={navigate} onVoice={() => setVoiceOpen(true)} mobileMenu={mobileMenu} setMobileMenu={setMobileMenu}>{page}</AppShell>
      <NaviAssistant open={voiceOpen} onClose={() => setVoiceOpen(false)} context={screen.replace('-', ' ')} />
    </>
  )
}

export default App
