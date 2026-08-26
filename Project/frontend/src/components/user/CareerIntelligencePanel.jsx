import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../Icon'
import { queryKeys } from '../../lib/queryKeys'
import { careerIntelligenceApi } from '../../services/careerIntelligenceApi'

export default function CareerIntelligencePanel({ careerSlug, navigate }) {
  const query = useQuery({
    queryKey: queryKeys.recommendations.career(careerSlug),
    queryFn: ({ signal }) => careerIntelligenceApi.career(careerSlug, { signal }),
    enabled: Boolean(careerSlug),
    retry: (count, error) => error?.status !== 404 && count < 2,
  })
  const [adjustments, setAdjustments] = useState({})
  const simulation = useMutation({ mutationFn: (changes) => careerIntelligenceApi.simulate(careerSlug, changes) })
  if (query.isLoading) return <section className="panel prose-card" aria-busy="true"><span className="eyebrow">Career intelligence</span><h2>Calculating your fitâ€¦</h2></section>
  if (query.error?.status === 404) return <section className="panel prose-card"><span className="eyebrow">Personal insight</span><h2>Unlock your skill gap</h2><p>Complete the Career Passport assessment to calculate compatibility, readiness, and a stateless improvement simulation.</p><button className="button primary" onClick={() => navigate('quiz')}>Start assessment <Icon name="arrow" /></button></section>
  if (query.error) return <section className="panel prose-card" role="alert"><h2>Career intelligence unavailable</h2><p>{query.error.message}</p><button className="button soft" onClick={() => query.refetch()}>Try again</button></section>
  const match = query.data?.data?.match
  const gaps = match?.skillGap || []
  const simulated = simulation.data?.data?.simulation
  const simulate = () => simulation.mutate(gaps.map((gap) => ({ skillId: gap.skillId._id, level: adjustments[gap.skillId._id] ?? Math.min(10, gap.currentLevel + 1) })))
  return <section className="panel prose-card"><span className="eyebrow">Your live Career Passport</span><h2>{match.compatibilityScore}% compatible Â· {match.readinessScore}% ready</h2><p>{match.reasons?.join(' ')}</p><div className="history-summary"><article className="panel"><Icon name="sparkles" /><span><small>Career Match</small><strong>{simulated?.after.compatibilityScore ?? match.compatibilityScore}%</strong></span></article><article className="panel"><Icon name="target" /><span><small>Career Readiness</small><strong>{simulated?.after.readinessScore ?? match.readinessScore}%</strong></span></article><article className="panel"><Icon name="chart" /><span><small>Confidence</small><strong>{match.confidence}%</strong></span></article></div><h3>Skill-gap simulator</h3>{gaps.length ? gaps.map((gap) => <label key={gap.skillId._id} className="admin-field"><span>{gap.skillId.name} Â· {gap.importance.replaceAll('_', ' ')}<small>Current {gap.currentLevel}, required {gap.requiredLevel}</small></span><input type="range" min={gap.currentLevel} max="10" value={adjustments[gap.skillId._id] ?? Math.min(10, gap.currentLevel + 1)} onChange={(event) => setAdjustments((current) => ({ ...current, [gap.skillId._id]: Number(event.target.value) }))} /></label>) : <p>You currently meet every modeled skill requirement.</p>}{gaps.length > 0 && <button className="button primary" disabled={simulation.isPending} onClick={simulate}>{simulation.isPending ? 'Simulatingâ€¦' : 'Preview skill improvements'} <Icon name="arrow" /></button>}{simulated && <p role="status"><strong>Preview only:</strong> readiness changes from {simulated.before.readinessScore}% to {simulated.after.readinessScore}%. Your saved Career Passport was not changed.</p>}{simulation.error && <p className="form-error" role="alert">{simulation.error.message}</p>}</section>
}
