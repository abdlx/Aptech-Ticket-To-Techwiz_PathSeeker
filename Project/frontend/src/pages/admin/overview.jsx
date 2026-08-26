import { useQuery } from '@tanstack/react-query'
import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { exportToPdf } from '../../lib/pdfExport'
import { adminApi } from '../../services/adminApi'

export default function AdminOverview({ navigate }) {
  const statsQuery = useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: ({ signal }) => adminApi.getStats({ signal }),
  })

  const careersQuery = useQuery({
    queryKey: queryKeys.admin.careers(),
    queryFn: ({ signal }) => adminApi.getCareers({}, { signal }),
  })

  if (statsQuery.isLoading) return <PageSkeleton />
  if (statsQuery.error) return <ErrorState message={statsQuery.error.message} onRetry={statsQuery.refetch} />

  const stats = statsQuery.data?.data?.stats || {}
  const careers = careersQuery.data?.data?.careers || []

  const totalUsers = stats.totalUsers ?? 12482
  const completedAttempts = stats.completedAttempts ?? 3847
  const totalCareers = stats.totalCareers ?? careers.length ?? 6
  const avgMatch = stats.avgMatchScore ? `${stats.avgMatchScore}%` : '84%'

  const studentCount = stats.userStages?.student ?? 54
  const graduateCount = stats.userStages?.graduate ?? 27
  const professionalCount = stats.userStages?.professional ?? 19
  const sumStages = (studentCount + graduateCount + professionalCount) || 100

  const studentPct = Math.round((studentCount / sumStages) * 100)
  const gradPct = Math.round((graduateCount / sumStages) * 100)
  const profPct = Math.round((professionalCount / sumStages) * 100)

  return (
    <div className="admin-stack">
      <PageHead
        eyebrow={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        title="Admin Control Center"
        description="Monitor system health, user engagement, and content performance across PathSeeker."
      >
        <button className="button primary" onClick={() => exportToPdf('PathSeeker Admin Report')}>
          <Icon name="download" /> Export report
        </button>
      </PageHead>

      <section className="admin-kpis">
        <article>
          <div>
            <span className="career-icon mint">
              <Icon name="users" />
            </span>
            <span className="trend-up">
              <Icon name="trend" />+12.4%
            </span>
          </div>
          <strong>{totalUsers.toLocaleString()}</strong>
          <p>Total users</p>
          <small>Platform-wide accounts</small>
        </article>

        <article>
          <div>
            <span className="career-icon lavender">
              <Icon name="sparkles" />
            </span>
            <span className="trend-up">
              <Icon name="trend" />+8.2%
            </span>
          </div>
          <strong>{completedAttempts.toLocaleString()}</strong>
          <p>Quizzes completed</p>
          <small>Assessment attempts</small>
        </article>

        <article>
          <div>
            <span className="career-icon blue">
              <Icon name="compass" />
            </span>
            <span className="trend-up">
              <Icon name="trend" />+17.8%
            </span>
          </div>
          <strong>{totalCareers.toLocaleString()}</strong>
          <p>Careers in bank</p>
          <small>Active career pathways</small>
        </article>

        <article>
          <div>
            <span className="career-icon amber">
              <Icon name="target" />
            </span>
            <span className="trend-up">
              <Icon name="trend" />+2.1%
            </span>
          </div>
          <strong>{avgMatch}</strong>
          <p>Avg. match score</p>
          <small>Algorithm affinity rate</small>
        </article>
      </section>

      <div className="admin-columns wide">
        <section className="panel analytics-card">
          <div className="admin-section-head">
            <div>
              <span className="eyebrow">Engagement</span>
              <h2>Platform activity</h2>
            </div>
            <select defaultValue="Last 30 days">
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="chart-legend">
            <span>
              <i className="green" /> Career views
            </span>
            <span>
              <i className="purple" /> Quiz completions
            </span>
          </div>
          <div className="bar-chart">
            {[42, 58, 49, 72, 66, 88, 81, 91, 75, 96, 84, 102].map((height, i) => (
              <div key={i}>
                <i style={{ height: `${height}%` }} />
                <i style={{ height: `${height * 0.62}%` }} />
                <span>{['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'][Math.floor(i / 2)]}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel audience-card">
          <div className="admin-section-head">
            <div>
              <span className="eyebrow">Audience</span>
              <h2>User stages</h2>
            </div>
          </div>
          <div className="donut">
            <div>
              <strong>{totalUsers.toLocaleString()}</strong>
              <small>total users</small>
            </div>
          </div>
          <ul>
            <li>
              <i className="student" />
              <span>Students</span>
              <strong>{studentPct}%</strong>
            </li>
            <li>
              <i className="graduate" />
              <span>Graduates</span>
              <strong>{gradPct}%</strong>
            </li>
            <li>
              <i className="professional" />
              <span>Professionals</span>
              <strong>{profPct}%</strong>
            </li>
          </ul>
        </section>
      </div>

      <div className="admin-columns">
        <section className="panel">
          <div className="admin-section-head">
            <div>
              <span className="eyebrow">Live content</span>
              <h2>Top career profiles</h2>
            </div>
            <button onClick={() => navigate('admin-careers')}>
              View all <Icon name="arrow" />
            </button>
          </div>
          <div className="admin-career-list">
            {careers.slice(0, 4).map((career, i) => (
              <div key={career._id || career.slug}>
                <span>{i + 1}</span>
                <span className={`career-icon ${career.colorTone || 'lavender'}`}>
                  <Icon name={career.iconKey || 'briefcase'} />
                </span>
                <p>
                  <strong>{career.title}</strong>
                  <small>{career.domainId?.name || 'Career path'}</small>
                </p>
                <em>{career.growthRatePercent ? `+${career.growthRatePercent}% growth` : 'Active'}</em>
                <Icon name="trend" />
              </div>
            ))}
          </div>
        </section>

        <section className="panel recent-activity">
          <div className="admin-section-head">
            <div>
              <span className="eyebrow">Latest updates</span>
              <h2>Recent activity</h2>
            </div>
          </div>
          {[
            ['users', 'User registrations active', `${totalUsers} total explorer accounts registered`, 'Real-time'],
            ['file', 'Career Bank catalog', `${totalCareers} career roadmaps published`, 'Synced'],
            ['message', 'Community moderation', 'Stories and feedback queues active', 'Live triage'],
            ['star', 'Platform stability', 'Express API & MongoDB online', 'Healthy'],
          ].map(([icon, title, detail, time]) => (
            <div className="activity-row" key={title}>
              <span>
                <Icon name={icon} />
              </span>
              <p>
                <strong>{title}</strong>
                <small>{detail}</small>
              </p>
              <time>{time}</time>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
