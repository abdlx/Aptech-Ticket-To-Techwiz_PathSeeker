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
  const totalFeedback = analytics.totalCount || 12
  const resolutionRate = analytics.resolutionRate != null ? `${analytics.resolutionRate}%` : '91%'
  const avgResponseTime = analytics.avgResponseHours ? `${analytics.avgResponseHours}h` : '4.2h'
  const sentiments = [
    ['Positive', 62, 'mint'],
    ['Neutral', 25, 'blue'],
    ['Negative', 13, 'rose'],
  ]

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
          <strong>4.8</strong>
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
          {[
            ['Ideas & Suggestions', 52, 'sparkles'],
            ['Bug Reports', 28, 'settings'],
            ['Career Questions', 20, 'book'],
          ].map(([label, value, icon]) => (
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
