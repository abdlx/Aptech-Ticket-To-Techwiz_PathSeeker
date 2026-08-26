import Icon from '../../components/Icon'
import NaviPrompt from '../../components/user/NaviPrompt'
import SectionHead from '../../components/user/SectionHead'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { careers } from '../../data'
import { queryKeys } from '../../lib/queryKeys'
import { careerIntelligenceApi } from '../../services/careerIntelligenceApi'

function ConnectedRecommendationsPage({ navigate, onVoice }) {
  const query = useQuery({ queryKey: queryKeys.recommendations.me(), queryFn: ({ signal }) => careerIntelligenceApi.recommendations({ signal }), retry: (count, error) => error?.status !== 404 && count < 2 })
  if (query.isLoading) return <PageSkeleton />
  if (query.error?.status === 404) return <div className="page-stack"><EmptyState title="Build your Career Passport" message="Complete the assessment to unlock explainable matches, readiness, and skill gaps." /><button className="button primary" onClick={() => navigate('quiz')}>Start assessment <Icon name="arrow" /></button></div>
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />
  const { passport, matches = [] } = query.data?.data || {}
  return <div className="recommendations page-stack">
    <section className="results-hero"><div><span className="eyebrow"><Icon name="sparkles" size={15} /> Career Passport generated</span><h1>You're an <em>{passport.archetype}</em></h1><p>Your matches are calculated from your assessment, stated interests, and normalized skill evidence. Compatibility and job readiness are intentionally separate.</p><div className="trait-row">{passport.traitScores?.slice(0, 4).map((trait) => <span key={trait.key}><Icon name="sparkles" /> {trait.label} {trait.score}%</span>)}</div>{onVoice && <button className="button soft" onClick={onVoice}><Icon name="mic" /> Ask Navi to explain</button>}</div><div className="results-navi"><img src="/assets/navi/navi-celebrating.png" alt="Navi celebrating your Career Passport" /><div className="results-badge"><Icon name="check" /><span><strong>{passport.completionPercent}% evidence complete</strong><small>{passport.algorithmVersion}</small></span></div></div></section>
    <section><SectionHead eyebrow="Ranked for you" title="Your explainable career matches" /><div className="result-list">{matches.map((match, index) => { const career = match.careerId; const gap = match.skillGap || []; return <article key={career._id} className="result-card"><span className="rank">{String(index + 1).padStart(2, '0')}</span><span className={`career-icon ${career.colorTone || 'lavender'}`}><Icon name={career.iconKey || 'briefcase'} /></span><div className="result-main"><div><span className="match-pill">{match.compatibilityScore}% match</span><h3>{career.title}</h3><p>{career.summary || career.description}</p></div><div className="career-meta"><span><small>Compatibility</small><strong>{match.compatibilityScore}%</strong></span><span><small>Readiness</small><strong>{match.readinessScore}%</strong></span><span><small>Confidence</small><strong>{match.confidence}%</strong></span></div><div className="skill-row">{match.reasons.map((reason) => <span key={reason}>{reason}</span>)}</div>{gap.length > 0 && <p><strong>Top gap:</strong> {gap[0].skillId?.name || 'Skill'} — level {gap[0].currentLevel} of {gap[0].requiredLevel}</p>}</div><div className="result-actions"><button className="button primary small" onClick={() => navigate('career-detail', career.slug)}>Skill gap & simulator <Icon name="arrow" size={16} /></button></div></article> })}</div></section>
    <NaviPrompt pose="pointing-left" title="These scores are evidence, not a label" action="Retake assessment" onAction={() => navigate('quiz')}>Compatibility shows how well a career fits your signals. Readiness shows how close your current skills are to that career's requirements.</NaviPrompt>
  </div>
}

export default ConnectedRecommendationsPage

export function RecommendationsPrototype({ navigate, onVoice }) {
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
