import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import { Brand } from '../../components/AppShell'
import { apiRequest, endpoints } from '../../services/pathseekerApi'
import { useAuth } from '../../context/AuthContext'

export default function OnboardingPage({ navigate }) {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState([])
  const [goal, setGoal] = useState('Discover careers that fit me')
  const [saveError, setSaveError] = useState('')
  const interests = [['Design', 'pen'], ['Technology', 'code'], ['Business', 'briefcase'], ['Data', 'chart'], ['Helping people', 'heart'], ['Media & content', 'video']]
  const toggle = (label) => setSelected((items) => (items.includes(label) ? items.filter((x) => x !== label) : [...items, label]))

  // Mark onboarding as started as soon as this screen loads, so someone who
  // leaves partway through shows up as "in progress" rather than "not started".
  useEffect(() => {
    apiRequest(endpoints.profileOnboarding, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'in_progress', currentStep: 1 }),
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const persistStep = async (nextStep) => {
    setSaveError('')
    try {
      await apiRequest(endpoints.profileOnboarding, {
        method: 'PATCH',
        body: JSON.stringify({ currentStep: nextStep }),
      })
    } catch (err) {
      // Non-fatal — the person can still move through onboarding locally even
      // if the progress save fails; they'll just need to redo it if they leave.
      setSaveError(err.message || 'Could not save your progress, but you can keep going.')
    }
  }

  const handleContinue = async () => {
    if (step === 2 && selected.length) {
      // Interests are the one onboarding answer with a real backend field
      // (UserProfile.interests) — save them as they're picked.
      try {
        await apiRequest(endpoints.profile, {
          method: 'PATCH',
          body: JSON.stringify({ interests: selected }),
        })
      } catch {
        // Interests failing to save shouldn't block onboarding progress.
      }
    }
    if (step < 3) {
      const next = step + 1
      setStep(next)
      persistStep(next)
    } else {
      try {
        await apiRequest(endpoints.profile, { method: 'PATCH', body: JSON.stringify({ goals: { primaryGoal: goal } }) })
        await apiRequest(endpoints.profileOnboarding, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' }),
        })
      } catch {
        // Still let them proceed to the quiz even if this save fails.
      }
      navigate('quiz')
    }
  }

  return (
    <div className="onboarding-page">
      <header><Brand /><button onClick={() => navigate('dashboard')}>Save & finish later</button></header>
      <div className="onboarding-progress"><span style={{ width: `${step * 33.3}%` }} /></div>
      <main>
        <section className="onboarding-card">
          <div className="step-count">Step {step} of 3</div>
          {saveError && <p className="form-error" role="alert">{saveError}</p>}
          {step === 1 && <><span className="eyebrow">A little about you</span><h1>Let’s build around where you are now.</h1><p>Your current stage was saved when you created your account. You can refine your goals and interests below.</p><div className="panel"><span className="career-icon mint"><Icon name={user?.stage === 'student' ? 'book' : user?.stage === 'graduate' ? 'compass' : 'briefcase'} /></span><h3>{user?.stage ? `${user.stage[0].toUpperCase()}${user.stage.slice(1)}` : 'Career explorer'}</h3><p>This is the account stage used by PathSeeker for personalization.</p></div></>}
          {step === 2 && <><span className="eyebrow">Your curiosity</span><h1>What are you drawn to?</h1><p>Pick as many as you like. We’ll refine these after your quiz.</p><div className="interest-grid">{interests.map(([label, icon]) => <button key={label} className={selected.includes(label) ? 'selected' : ''} onClick={() => toggle(label)}><Icon name={icon} /><strong>{label}</strong>{selected.includes(label) && <span><Icon name="check" size={14} /></span>}</button>)}</div></>}
          {step === 3 && <><span className="eyebrow">Your first goal</span><h1>What would make today feel useful?</h1><p>You can change your focus at any time.</p><div className="choice-list">{[['Discover careers that fit me','Start with a personalized interest quiz'],['Compare careers I’m considering','Salary, skills, demand, and daily work'],['Build skills for a target career','Get a practical learning roadmap']].map(([label,hint], index) => <button type="button" key={label} className={goal === label ? 'selected' : ''} onClick={() => setGoal(label)}><span className="choice-number">0{index + 1}</span><span><strong>{label}</strong><small>{hint}</small></span>{goal === label && <Icon name="check" />}</button>)}</div></>}
          <div className="onboarding-actions"><button className="button ghost" disabled={step === 1} onClick={() => setStep(step - 1)}><Icon name="arrowLeft" /> Back</button><button className="button primary" onClick={handleContinue}>{step < 3 ? 'Continue' : 'Build my passport'} <Icon name="arrow" /></button></div>
        </section>
        <aside className="onboarding-navi"><div className="navi-glow" /><img src={`/assets/navi/${step === 2 ? 'navi-thinking' : step === 3 ? 'navi-explaining' : 'navi-greeting'}.png`} alt="Navi guiding onboarding" /><div className="navi-tip"><span><Icon name="sparkles" /></span><p>{step === 1 ? 'Everyone starts somewhere. There’s no “right” stage to begin exploring.' : step === 2 ? 'Your interests can cross categories—that usually leads to the most interesting careers.' : 'Perfect. I’ll keep this goal visible while we explore together.'}</p></div></aside>
      </main>
    </div>
  )
}
