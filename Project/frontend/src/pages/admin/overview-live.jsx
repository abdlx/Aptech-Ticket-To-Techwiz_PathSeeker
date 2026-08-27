import { useQuery } from '@tanstack/react-query'
import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { exportToPdf } from '../../lib/pdfExport'
import { adminApi } from '../../services/adminApi'

const trend = (value) => `${value > 0 ? '+' : ''}${value || 0}%`

export default function AdminOverview({ navigate }) {
  const statsQuery = useQuery({ queryKey: queryKeys.admin.stats(), queryFn: ({ signal }) => adminApi.getStats({ signal }), refetchInterval: 30_000 })
  const healthQuery = useQuery({ queryKey: ['health', 'database'], queryFn: ({ signal }) => adminApi.getDatabaseHealth({ signal }), refetchInterval: 30_000 })
  if (statsQuery.isLoading) return <PageSkeleton />
  if (statsQuery.error) return <ErrorState message={statsQuery.error.message} onRetry={statsQuery.refetch} />
  const stats = statsQuery.data?.data?.stats || {}
  const stages = stats.userStages || {}
  const stageTotal = Object.values(stages).reduce((sum, value) => sum + value, 0)
  const pct = (value) => stageTotal ? Math.round(((value || 0) / stageTotal) * 100) : 0
  const studentPct = pct(stages.student); const graduatePct = pct(stages.graduate); const professionalPct = pct(stages.professional)
  const activity = stats.monthlyActivity || []
  const activityMax = Math.max(1, ...activity.flatMap((month) => [month.careerViews, month.quizCompletions]))
  const careers = stats.popularCareers || []
  const audits = stats.recentActivity || []
  const databaseReady = healthQuery.data?.data?.database === 'connected'

  return <div className="admin-stack">
    <PageHead eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} title="Admin Control Center" description={`Live data refreshed ${stats.generatedAt ? new Date(stats.generatedAt).toLocaleTimeString() : 'now'}.`}>
      <button className="button primary" onClick={() => exportToPdf('PathSeeker Admin Report')}><Icon name="download" />Export report</button>
    </PageHead>
    <section className="admin-kpis">
      <article><div><span className="career-icon mint"><Icon name="users" /></span><span className="trend-up"><Icon name="trend" />{trend(stats.trends?.registrations)}</span></div><strong>{(stats.totalUsers || 0).toLocaleString()}</strong><p>Total users</p><small>{stats.activeUsersLast30Days || 0} active in 30 days</small></article>
      <article><div><span className="career-icon lavender"><Icon name="sparkles" /></span><span className="trend-up"><Icon name="trend" />{trend(stats.trends?.quizCompletions)}</span></div><strong>{(stats.completedQuizAttempts || 0).toLocaleString()}</strong><p>Quizzes completed</p><small>{stats.totalQuizAttempts || 0} total attempts</small></article>
      <article><div><span className="career-icon blue"><Icon name="compass" /></span></div><strong>{(stats.totalActiveCareers || 0).toLocaleString()}</strong><p>Careers in bank</p><small>Published pathways</small></article>
      <article><div><span className="career-icon amber"><Icon name="target" /></span></div><strong>{stats.avgMatchScore || 0}%</strong><p>Avg. match score</p><small>{stats.matchSamples || 0} recommendation matches</small></article>
    </section>
    <div className="admin-columns wide"><section className="panel analytics-card"><div className="admin-section-head"><div><span className="eyebrow">Engagement</span><h2>Platform activity</h2></div><small>Last 6 months</small></div><div className="chart-legend"><span><i className="green" />Career views</span><span><i className="purple" />Quiz completions</span></div><div className="bar-chart">{activity.map((month) => <div key={month.key}><i title={`${month.careerViews} career views`} style={{ height: `${Math.max(2, month.careerViews / activityMax * 100)}%` }} /><i title={`${month.quizCompletions} quiz completions`} style={{ height: `${Math.max(2, month.quizCompletions / activityMax * 100)}%` }} /><span>{month.label}</span></div>)}</div></section>
      <section className="panel audience-card"><div className="admin-section-head"><div><span className="eyebrow">Audience</span><h2>User stages</h2></div></div><div className="donut" style={{ background: `conic-gradient(#6f9879 0 ${studentPct}%,#8875c7 ${studentPct}% ${studentPct + graduatePct}%,#d0a15e ${studentPct + graduatePct}% 100%)` }}><div><strong>{stageTotal}</strong><small>total users</small></div></div><ul><li><i className="student" /><span>Students</span><strong>{studentPct}%</strong></li><li><i className="graduate" /><span>Graduates</span><strong>{graduatePct}%</strong></li><li><i className="professional" /><span>Professionals</span><strong>{professionalPct}%</strong></li></ul></section></div>
    <div className="admin-columns"><section className="panel"><div className="admin-section-head"><div><span className="eyebrow">Live engagement</span><h2>Most viewed careers</h2></div><button onClick={() => navigate('admin-careers')}>View all <Icon name="arrow" /></button></div><div className="admin-career-list">{careers.length ? careers.map((career, index) => <div key={career.careerId}><span>{index + 1}</span><span className={`career-icon ${career.colorTone || 'lavender'}`}><Icon name={career.iconKey || 'briefcase'} /></span><p><strong>{career.title}</strong><small>{career.domain || 'Career path'}</small></p><em>{career.views} views</em><Icon name="trend" /></div>) : <p>No career views recorded yet.</p>}</div></section>
      <section className="panel recent-activity"><div className="admin-section-head"><div><span className="eyebrow">Latest updates</span><h2>Recent admin activity</h2></div></div>{audits.length ? audits.slice(0, 5).map((item) => <div className="activity-row" key={item._id}><span><Icon name="file" /></span><p><strong>{item.action?.replaceAll('.', ' ')}</strong><small>{item.actorId?.name || 'System'} · {item.targetType}</small></p><time>{new Date(item.createdAt).toLocaleString()}</time></div>) : <div className="activity-row"><span><Icon name="clock" /></span><p><strong>No admin changes yet</strong><small>Activity will appear here.</small></p></div>}
        <div className="activity-row"><span><Icon name={databaseReady ? 'check' : 'close'} /></span><p><strong>Database</strong><small>{healthQuery.isError ? 'Health check unavailable' : databaseReady ? 'MongoDB connected' : 'MongoDB disconnected'}</small></p><time>{databaseReady ? 'Healthy' : 'Check'}</time></div></section></div>
    <section className="content-summary"><button onClick={() => navigate('admin-stories')}><Icon name="message" /><span><strong>{stats.queues?.pendingStories || 0}</strong><small>Stories awaiting review</small></span></button><button onClick={() => navigate('admin-feedback')}><Icon name="heart" /><span><strong>{stats.queues?.openFeedback || 0}</strong><small>Open feedback</small></span></button><button onClick={() => navigate('admin-content')}><Icon name="file" /><span><strong>{stats.queues?.draftResources || 0}</strong><small>Draft resources</small></span></button><button onClick={() => navigate('admin-content')}><Icon name="video" /><span><strong>{stats.queues?.draftMedia || 0}</strong><small>Draft media</small></span></button></section>
  </div>
}
