import { useQuery } from '@tanstack/react-query'
import Icon from '../../components/Icon'
import Head from '../../components/admin/AdminEditorHead'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { exportToPdf } from '../../lib/pdfExport'
import { adminApi } from '../../services/adminApi'

export default function AdminFeedbackAnalytics({ navigate }) {
  const query = useQuery({
    queryKey: ['admin', 'feedback', 'analytics'],
    queryFn: ({ signal }) => adminApi.getFeedbackAnalytics({ signal }),
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const analytics = query.data?.data?.analytics || {}
  const totalFeedback = analytics.totalCount || 0
  const resolutionRate = `${analytics.resolutionRate || 0}%`
  const avgResponseTime = `${analytics.avgResponseHours || 0}h`
  const sentimentTotal = Object.values(analytics.sentiment || {}).reduce((sum, value) => sum + value, 0)
  const sentimentPercent = (tone) => sentimentTotal ? Math.round(((analytics.sentiment?.[tone] || 0) / sentimentTotal) * 100) : 0
  const sentiments = [
    ['Positive', sentimentPercent('positive'), 'mint'],
    ['Neutral', sentimentPercent('neutral'), 'blue'],
    ['Negative', sentimentPercent('negative'), 'rose'],
  ]
  const categoryTotal = (analytics.byCategory || []).reduce((sum, item) => sum + item.count, 0)
  const categories = (analytics.byCategory || []).map((item) => [
    item._id?.replaceAll('_', ' ') || 'Other',
    categoryTotal ? Math.round((item.count / categoryTotal) * 100) : 0,
    item._id === 'bug' ? 'settings' : item._id === 'career_question' ? 'book' : 'sparkles',
  ])

  return (
    <div className="admin-stack">
      <Head
        eyebrow="Voice of the user"
        title="Feedback analytics"
        copy="Understand sentiment, topics, and response trends across submitted feedback."
      >
        <button className="button ghost" onClick={() => navigate('admin-feedback')}>
          Back to inbox
        </button>
        <button className="button soft" onClick={() => exportToPdf('PathSeeker Feedback Analytics')}>
          <Icon name="download" /> Export analytics
        </button>
      </Head>

      <section className="admin-kpis">
        <article>
          <div>
            <span className="career-icon mint">
              <Icon name="message" />
            </span>
          </div>
          <strong>{totalFeedback}</strong>
          <p>Total feedback received</p>
          <small>Live explorer submissions</small>
        </article>

        <article>
          <div>
            <span className="career-icon amber">
              <Icon name="clock" />
            </span>
          </div>
          <strong>{avgResponseTime}</strong>
          <p>Average response time</p>
          <small>Triage velocity</small>
        </article>

        <article>
          <div>
            <span className="career-icon blue">
              <Icon name="check" />
            </span>
          </div>
          <strong>{resolutionRate}</strong>
          <p>Resolution rate</p>
          <small>Triage completion</small>
        </article>

        <article>
          <div>
            <span className="career-icon lavender">
              <Icon name="star" />
            </span>
          </div>
          <strong>{analytics.averageRating || 0}</strong>
          <p>Experience rating</p>
          <small>Average satisfaction</small>
        </article>
      </section>

      <div className="analytics-detail-grid">
        <section className="panel sentiment-panel">
          <span className="eyebrow">Sentiment summary</span>
          <h2>Most feedback is positive</h2>
          <div className="sentiment-bar">
            {sentiments.map(([label, value, tone]) => (
              <i className={tone} style={{ width: `${value}%` }} key={label} />
            ))}
          </div>
          {sentiments.map(([label, value, tone]) => (
            <p key={label}>
              <i className={tone} />
              <span>{label}</span>
              <strong>{value}%</strong>
            </p>
          ))}
        </section>

        <section className="panel response-panel">
          <span className="eyebrow">Categories</span>
          <h2>What people are sending</h2>
          {categories.map(([label, value, icon]) => (
            <div key={label}>
              <span>
                <Icon name={icon} />
                {label}
              </span>
              <div>
                <i style={{ width: `${value}%` }} />
              </div>
              <strong>{value}%</strong>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
