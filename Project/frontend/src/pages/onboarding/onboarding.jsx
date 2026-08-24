import Icon from '../../components/Icon'
import { Brand } from '../../components/AppShell'
import { useState } from 'react'

export default function OnboardingPage({ navigate }) {
  const [step, setStep] = useState(1)
  const [selected, setSelected] = useState(['Design', 'Technology'])
  const interests = [['Design', 'pen'], ['Technology', 'code'], ['Business', 'briefcase'], ['Data', 'chart'], ['Helping people', 'heart'], ['Media & content', 'video']]
  const toggle = (label) => setSelected((items) => items.includes(label) ? items.filter((x) => x !== label) : [...items, label])
  return (
    <div className="onboarding-page">
      <header><Brand /><button onClick={() => navigate('dashboard')}>Save & finish later</button></header>
      <div className="onboarding-progress"><span style={{ width: `${step * 33.3}%` }} /></div>
      <main>
        <section className="onboarding-card">
          <div className="step-count">Step {step} of 3</div>
          {step === 1 && <><span className="eyebrow">A little about you</span><h1>What brings you to PathSeeker?</h1><p>This helps Navi shape guidance around where you are today.</p><div className="choice-grid large"><button className="selected"><Icon name="book" /><span><strong>I’m a student</strong><small>Exploring what could come next</small></span><Icon name="check" /></button><button><Icon name="compass" /><span><strong>I’m a graduate</strong><small>Finding my first career direction</small></span></button><button><Icon name="briefcase" /><span><strong>I’m working</strong><small>Growing or changing my career</small></span></button><button><Icon name="sparkles" /><span><strong>I’m returning</strong><small>Re-entering after time away</small></span></button></div></>}
          {step === 2 && <><span className="eyebrow">Your curiosity</span><h1>What are you drawn to?</h1><p>Pick as many as you like. We’ll refine these after your quiz.</p><div className="interest-grid">{interests.map(([label, icon]) => <button key={label} className={selected.includes(label) ? 'selected' : ''} onClick={() => toggle(label)}><Icon name={icon} /><strong>{label}</strong>{selected.includes(label) && <span><Icon name="check" size={14} /></span>}</button>)}</div></>}
          {step === 3 && <><span className="eyebrow">Your first goal</span><h1>What would make today feel useful?</h1><p>You can change your focus at any time.</p><div className="choice-list"><button className="selected"><span className="choice-number">01</span><span><strong>Discover careers that fit me</strong><small>Start with a personalized interest quiz</small></span><Icon name="check" /></button><button><span className="choice-number">02</span><span><strong>Compare careers I’m considering</strong><small>Salary, skills, demand, and daily work</small></span></button><button><span className="choice-number">03</span><span><strong>Build skills for a target career</strong><small>Get a practical learning roadmap</small></span></button></div></>}
          <div className="onboarding-actions"><button className="button ghost" disabled={step === 1} onClick={() => setStep(step - 1)}><Icon name="arrowLeft" /> Back</button><button className="button primary" onClick={() => step < 3 ? setStep(step + 1) : navigate('quiz')}>{step < 3 ? 'Continue' : 'Build my passport'} <Icon name="arrow" /></button></div>
        </section>
        <aside className="onboarding-navi"><div className="navi-glow" /><img src={`/assets/navi/${step === 2 ? 'navi-thinking' : step === 3 ? 'navi-explaining' : 'navi-greeting'}.png`} alt="Navi guiding onboarding" /><div className="navi-tip"><span><Icon name="sparkles" /></span><p>{step === 1 ? 'Everyone starts somewhere. There’s no “right” stage to begin exploring.' : step === 2 ? 'Your interests can cross categories—that usually leads to the most interesting careers.' : 'Perfect. I’ll keep this goal visible while we explore together.'}</p></div></aside>
      </main>
    </div>
  )
}
