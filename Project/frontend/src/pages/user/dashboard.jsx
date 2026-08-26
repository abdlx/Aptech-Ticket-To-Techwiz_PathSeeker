import Icon from '../../components/Icon'
import NaviPrompt from '../../components/user/NaviPrompt'
import SectionHead from '../../components/user/SectionHead'
import CareerCard from '../../components/user/CareerCard'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { careers } from '../../data'
import { queryKeys } from '../../lib/queryKeys'
import { dashboardApi } from '../../services/dashboardApi'

function ConnectedDashboardPage({ navigate, onVoice }) {
  const query = useQuery({ queryKey: queryKeys.dashboard.me(), queryFn: ({ signal }) => dashboardApi.get({ signal }), staleTime: 30_000 })
  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />
  const dashboard = query.data?.data?.dashboard
  const matches = dashboard.topMatches || []
  const firstName = dashboard.user?.name?.split(' ')[0] || 'Explorer'
  const passportStrength = Math.min(100, Math.max(0, Math.round(dashboard.profile?.completionPercent || 0)))
  return <div className="dashboard page-stack">
    <section className="dashboard-hero"><div className="hero-copy"><span className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span><h1>Welcome back, {firstName}</h1><p>{dashboard.passport ? 'Your Career Passport and latest recommendations are calculated from saved evidence.' : 'Complete the career assessment to generate your first Career Passport.'}</p><div className="hero-actions"><button className="button primary" onClick={() => navigate(dashboard.passport ? 'recommendations' : 'quiz')}>{dashboard.passport ? 'Explore my matches' : 'Start career assessment'} <Icon name="arrow" /></button>{onVoice && <button className="button soft" onClick={onVoice}><Icon name="mic" /> Talk with Navi</button>}</div></div><div className="passport-progress"><div className="progress-ring" style={{ '--progress': `${passportStrength}%`, background: `conic-gradient(#e4d7a4 0 ${passportStrength}%, rgba(255,255,255,.16) ${passportStrength}% 100%)` }}><span>{passportStrength}<small>%</small></span></div><div><span className="eyebrow">Passport evidence</span><strong>{dashboard.passport?.archetype || 'Not generated yet'}</strong><p>{dashboard.profile?.headline || 'Add profile details to strengthen your recommendations.'}</p><button onClick={() => navigate('profile')}>View passport <Icon name="arrow" size={15} /></button></div></div></section>
    {dashboard.passport && <NaviPrompt pose="explaining" title={`${matches[0]?.careerId?.title || 'A new direction'} is worth exploring`} action="See why" onAction={() => navigate('recommendations')}>Your leading match is {matches[0]?.compatibilityScore || 0}% compatible and {matches[0]?.readinessScore || 0}% ready. The difference highlights learnable skill gaps.</NaviPrompt>}
    <section><SectionHead eyebrow="Personalized for you" title="Your strongest career matches" link={matches.length ? 'See explanations' : undefined} onLink={() => navigate('recommendations')} />{matches.length ? <div className="result-list">{matches.map((match, index) => <article key={match.careerId._id} className="result-card"><span className="rank">{String(index + 1).padStart(2, '0')}</span><span className={`career-icon ${match.careerId.colorTone || 'lavender'}`}><Icon name={match.careerId.iconKey || 'briefcase'} /></span><div className="result-main"><div><span className="match-pill">{match.compatibilityScore}% match</span><h3>{match.careerId.title}</h3><p>{match.careerId.summary || match.reasons?.[0]}</p></div><div className="career-meta"><span><small>Career match</small><strong>{match.compatibilityScore}%</strong></span><span><small>Readiness</small><strong>{match.readinessScore}%</strong></span></div></div><div className="result-actions"><button className="button primary small" onClick={() => navigate('career-detail', match.careerId.slug)}>Explore <Icon name="arrow" /></button></div></article>)}</div> : <EmptyState title="No matches yet" message="Finish the assessment and PathSeeker will generate explainable recommendations." />}</section>
    <div className="quick-links-row"><button className="panel" onClick={() => navigate('quiz-history')}><Icon name="calendar" /><span><strong>Quiz history</strong><small>{dashboard.attemptCount} completed attempts</small></span><Icon name="arrow" /></button><button className="panel" onClick={() => navigate('recently-viewed')}><Icon name="clock" /><span><strong>Recently viewed</strong><small>{dashboard.recentActivity.length} recent items</small></span><Icon name="arrow" /></button><button className="panel" onClick={() => navigate('saved')}><Icon name="bookmark" /><span><strong>Saved items</strong><small>{dashboard.bookmarkCount} bookmarks</small></span><Icon name="arrow" /></button></div>
    <section><SectionHead eyebrow="Live catalog" title="Trending careers" link="Career Bank" onLink={() => navigate('careers')} /><div className="career-grid">{dashboard.trendingCareers.map((career) => <article className="career-card" key={career._id}><span className={`career-icon ${career.colorTone || 'lavender'}`}><Icon name={career.iconKey || 'briefcase'} /></span><h3>{career.title}</h3><p>{career.domainId?.name} · {career.growthRatePercent ?? 0}% projected growth</p><button className="card-link" onClick={() => navigate('career-detail', career.slug)}>View career <Icon name="arrow" /></button></article>)}</div></section>
  </div>
}

export default ConnectedDashboardPage

export function DashboardPrototype({ navigate, onVoice }) {
  const [saved, setSaved] = useState(['data-analyst'])
  const toggleSaved = (id) => setSaved((items) => items.includes(id) ? items.filter((x) => x !== id) : [...items, id])
  return (
    <div className="dashboard page-stack">
      <section className="dashboard-hero">
        <div className="hero-copy"><span className="eyebrow">Monday, August 24</span><h1>Good morning, Alex <span>👋</span></h1><p>Your career passport is taking shape. You’re one step away from unlocking your full match profile.</p><div className="hero-actions"><button className="button primary" onClick={() => navigate('quiz')}>Continue career quiz <Icon name="arrow" /></button><button className="button soft" onClick={onVoice}><Icon name="mic" /> Talk it through</button></div></div>
        <div className="passport-progress"><div className="progress-ring" style={{ '--progress': '72%', background: 'conic-gradient(#e4d7a4 0 72%, rgba(255,255,255,.16) 72% 100%)' }}><span>72<small>%</small></span></div><div><span className="eyebrow">Passport strength</span><strong>Almost explorer-ready</strong><p>Complete your interests to improve every recommendation.</p><button onClick={() => navigate('profile')}>View passport <Icon name="arrow" size={15} /></button></div></div>
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
