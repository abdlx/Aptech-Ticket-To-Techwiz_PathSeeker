import Icon from '../../components/Icon'
import NaviPrompt from '../../components/user/NaviPrompt'
import SectionHead from '../../components/user/SectionHead'
import CareerCard from '../../components/user/CareerCard'
import { useState } from 'react'
import { careers } from '../../data'

export default function DashboardPage({ navigate, onVoice }) {
  const [saved, setSaved] = useState(['data-analyst'])
  const toggleSaved = (id) => setSaved((items) => items.includes(id) ? items.filter((x) => x !== id) : [...items, id])
  return (
    <div className="dashboard page-stack">
      <section className="dashboard-hero">
        <div className="hero-copy"><span className="eyebrow">Monday, August 24</span><h1>Good morning, Alex <span>👋</span></h1><p>Your career passport is taking shape. You’re one step away from unlocking your full match profile.</p><div className="hero-actions"><button className="button primary" onClick={() => navigate('quiz')}>Continue career quiz <Icon name="arrow" /></button><button className="button soft" onClick={onVoice}><Icon name="mic" /> Talk it through</button></div></div>
        <div className="passport-progress"><div className="progress-ring"><span>72<small>%</small></span></div><div><span className="eyebrow">Passport strength</span><strong>Almost explorer-ready</strong><p>Complete your interests to improve every recommendation.</p><button onClick={() => navigate('profile')}>View passport <Icon name="arrow" size={15} /></button></div></div>
      </section>

      <NaviPrompt pose="explaining" title="I found a pattern worth exploring" action="See why" onAction={() => navigate('recommendations')}>You light up around creative problem-solving. Your top matches blend people insight with technology.</NaviPrompt>

      <section><SectionHead eyebrow="Personalized for you" title="Your strongest career matches" link="See all matches" onLink={() => navigate('recommendations')} /><div className="career-grid">{careers.slice(0, 3).map((career) => <CareerCard key={career.id} career={career} navigate={navigate} saved={saved.includes(career.id)} toggleSaved={toggleSaved} />)}</div></section>

      <div className="quick-links-row"><button className="panel" onClick={() => navigate('quiz-history')}><Icon name="calendar" /><span><strong>Quiz history</strong><small>Review 3 completed attempts</small></span><Icon name="arrow" /></button><button className="panel" onClick={() => navigate('recently-viewed')}><Icon name="clock" /><span><strong>Recently viewed</strong><small>Continue your latest activity</small></span><Icon name="arrow" /></button><button className="panel" onClick={() => navigate('compare')}><Icon name="chart" /><span><strong>Compare careers</strong><small>See your top paths side by side</small></span><Icon name="arrow" /></button></div>

      <div className="dashboard-columns">
        <section className="journey-card panel"><SectionHead eyebrow="Your journey" title="This week’s momentum" /><div className="momentum-score"><strong>3</strong><span>meaningful steps<br /><small>Top 18% of explorers</small></span><Icon name="trend" /></div><div className="journey-steps"><div className="complete"><span><Icon name="check" /></span><p><strong>Built your basic profile</strong><small>Completed Sunday</small></p></div><div className="current"><span>2</span><p><strong>Finish the interest quiz</strong><small>4 questions left · about 3 min</small></p><button onClick={() => navigate('quiz')}>Continue</button></div><div><span>3</span><p><strong>Review your career roadmap</strong><small>Unlocks after your quiz</small></p><Icon name="lock" size={17} /></div></div></section>
        <section className="continue-card panel"><SectionHead eyebrow="Continue learning" title="Picked for your goals" link="All resources" onLink={() => navigate('resources')} /><div className="resource-feature"><div className="resource-art"><Icon name="play" size={30} /><span>06:42</span></div><div><span className="resource-type">Mini course</span><h3>UX research: start with why</h3><p>Learn how great designers uncover the real problem.</p><div className="mini-progress"><span style={{ width: '62%' }} /></div><small>62% complete</small></div></div><div className="next-resource"><span className="resource-icon amber"><Icon name="headphones" /></span><div><small>Up next · Podcast</small><strong>Breaking into product design</strong></div><button><Icon name="play" /></button></div></section>
      </div>
    </div>
  )
}
