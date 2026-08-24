import Icon from '../../components/Icon'
import NaviPrompt from '../../components/user/NaviPrompt'
import SectionHead from '../../components/user/SectionHead'
import { useState } from 'react'
import { careers } from '../../data'

export default function RecommendationsPage({ navigate, onVoice }) {
  const [saved, setSaved] = useState(['ux-designer'])
  const toggleSaved = (id) => setSaved((items) => items.includes(id) ? items.filter((x) => x !== id) : [...items, id])
  return (
    <div className="recommendations page-stack">
      <section className="results-hero"><div><span className="eyebrow"><Icon name="sparkles" size={15} /> Your quiz results are ready</span><h1>You’re a <em>Thoughtful Builder</em></h1><p>You combine empathy, curiosity, and structured thinking. You do your best work when you can understand a real problem, make sense of it, and shape something useful.</p><div className="trait-row"><span><Icon name="heart" /> Empathetic</span><span><Icon name="sparkles" /> Curious</span><span><Icon name="chart" /> Analytical</span><span><Icon name="pen" /> Creative</span></div><button className="button soft" onClick={onVoice}><Icon name="mic" /> Hear Navi explain my results</button></div><div className="results-navi"><img src="/assets/navi/navi-celebrating.png" alt="Navi celebrating your results" /><div className="results-badge"><Icon name="check" /><span><strong>Profile unlocked</strong><small>Based on 7 answers</small></span></div></div></section>
      <section><SectionHead eyebrow="Ranked for you" title="Your top career matches" /><div className="result-list">{careers.slice(0, 4).map((career, index) => <article key={career.id} className="result-card"><span className="rank">0{index + 1}</span><span className={`career-icon ${career.tone}`}><Icon name={career.icon} /></span><div className="result-main"><div><span className="match-pill">{career.match}% match</span><h3>{career.title}</h3><p>{career.summary}</p></div><div className="career-meta"><span><small>Typical salary</small><strong>{career.salary}</strong></span><span><small>Job outlook</small><strong>{career.growth} growth</strong></span><span><small>Best-fit strength</small><strong>{career.skills[0]}</strong></span></div><div className="skill-row">{career.skills.map((skill) => <span key={skill}>{skill}</span>)}</div></div><div className="result-actions"><button className={`save-button ${saved.includes(career.id) ? 'saved' : ''}`} onClick={() => toggleSaved(career.id)}><Icon name="bookmark" /></button><button className="button primary small" onClick={() => navigate('career-detail', career.id)}>View career <Icon name="arrow" size={16} /></button></div></article>)}</div></section>
      <NaviPrompt pose="pointing-left" title="Not seeing what you expected?" action="Refine my matches" onAction={() => navigate('quiz')}>Your results are a starting point, not a label. We can adjust your priorities or explore a different side of your strengths.</NaviPrompt>
    </div>
  )
}
