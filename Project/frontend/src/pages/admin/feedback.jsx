import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import Status from '../../components/admin/Status'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { exportToPdf } from '../../lib/pdfExport'
import { adminApi } from '../../services/adminApi'

export default function FeedbackAdmin({ navigate }) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('open')
  const [selectedId, setSelectedId] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [internalNotes, setInternalNotes] = useState('')

  const query = useQuery({
    queryKey: queryKeys.admin.feedback({ status: tab === 'all' ? '' : tab }),
    queryFn: ({ signal }) =>
      adminApi.getFeedback(
        { ...(tab !== 'all' ? { status: tab } : {}) },
        { signal },
      ),
  })
  const assigneesQuery = useQuery({ queryKey: ['admin', 'feedback', 'assignees'], queryFn: ({ signal }) => adminApi.getFeedbackAssignees({ signal }) })

  const respondMutation = useMutation({
    mutationFn: ({ id, response, status }) =>
      adminApi.respondToFeedback(id, { response, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] })
      setReplyText('')
    },
  })
  const triageMutation = useMutation({
    mutationFn: ({ id, payload }) => adminApi.updateFeedback(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedback'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setInternalNotes('')
    },
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const feedbackList = query.data?.data?.feedback || []
  const activeItem = feedbackList.find((f) => f._id === selectedId) || feedbackList[0]
  const assignees = assigneesQuery.data?.data?.users || []

  const handleResolve = (status = 'resolved') => {
    if (!activeItem) return
    respondMutation.mutate({
      id: activeItem._id,
      response: replyText.trim() || 'Reviewed and addressed by PathSeeker support team.',
      status,
    })
  }

  return (
    <div className="admin-stack">
      <PageHead
        eyebrow="Voice of the user"
        title="Feedback inbox"
        description="Prioritize issues, review user suggestions, and send official responses."
      >
        <button
          className="button soft"
          onClick={() => navigate('admin-feedback-analytics')}
        >
          <Icon name="chart" /> View Analytics
        </button>
        <button
          className="button soft"
          onClick={() => exportToPdf('PathSeeker Feedback Export')}
        >
          <Icon name="download" /> Export feedback
        </button>
      </PageHead>

      <div className="feedback-admin-layout">
        <section className="panel feedback-inbox">
          <div className="inbox-tabs">
            <button
              className={tab === 'open' ? 'active' : ''}
              onClick={() => setTab('open')}
            >
              Open
            </button>
            <button
              className={tab === 'resolved' ? 'active' : ''}
              onClick={() => setTab('resolved')}
            >
              Resolved
            </button>
            <button
              className={tab === 'all' ? 'active' : ''}
              onClick={() => setTab('all')}
            >
              All
            </button>
          </div>

          {feedbackList.length > 0 ? (
            feedbackList.map((item) => {
              const initials = item.userId?.name ? item.userId.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() : 'EX'
              return (
                <button
                  className={activeItem?._id === item._id ? 'active' : ''}
                  key={item._id}
                  onClick={() => setSelectedId(item._id)}
                >
                  <span className="avatar small">{initials}</span>
                  <p>
                    <strong>{item.category?.toUpperCase() || 'SUGGESTION'}</strong>
                    <small>{item.message}</small>
                    <em>{item.status}</em>
                  </p>
                  <time>{new Date(item.createdAt).toLocaleDateString()}</time>
                </button>
              )
            })
          ) : (
            <EmptyState
              title="No messages in this queue"
              message="When users submit questions or bug reports, they will appear here."
            />
          )}
        </section>

        {activeItem ? (
          <section className="panel feedback-detail">
            <div className="feedback-detail-head">
              <div>
                <span className="avatar">
                  {activeItem.userId?.name ? activeItem.userId.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() : 'EX'}
                </span>
                <p>
                  <strong>{activeItem.userId?.name || 'Explorer'}</strong>
                  <small>{activeItem.userId?.email || 'Registered user'} · {activeItem.userId?.stage || 'User'}</small>
                </p>
              </div>
              <Status tone={activeItem.status === 'resolved' ? 'success' : 'idea'}>
                {activeItem.category}
              </Status>
            </div>

            <h2>User message</h2>
            <blockquote style={{ fontStyle: 'normal', lineHeight: '1.6' }}>
              {activeItem.message}
            </blockquote>

            {activeItem.response && (
              <div style={{ background: '#f6f4ee', padding: '12px 16px', borderRadius: '10px', margin: '14px 0' }}>
                <small style={{ color: 'var(--muted, #667485)', fontWeight: 600 }}>Previous Response</small>
                <p style={{ margin: '4px 0 0', fontSize: '13px' }}>{activeItem.response}</p>
              </div>
            )}

            <div className="feedback-meta">
              <span>
                <small>Submitted</small>
                <strong>{new Date(activeItem.createdAt).toLocaleString()}</strong>
              </span>
              <span>
                <small>Status</small>
                <strong>{activeItem.status}</strong>
              </span>
            </div>

            <div className="form-grid">
              <label>Status<select value={activeItem.status} onChange={(event) => triageMutation.mutate({ id: activeItem._id, payload: { status: event.target.value } })}><option value="open">Open</option><option value="in_review">In review</option><option value="resolved">Resolved</option></select></label>
              <label>Assignee<select value={activeItem.assignee?._id || activeItem.assignee || ''} onChange={(event) => triageMutation.mutate({ id: activeItem._id, payload: { assignee: event.target.value || null } })}><option value="">Unassigned</option>{assignees.map((user) => <option key={user._id} value={user._id}>{user.name} · {user.role.replaceAll('_', ' ')}</option>)}</select></label>
            </div>
            <label>Internal notes<textarea rows={2} placeholder={activeItem.internalNotes || 'Visible only to staff'} value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} /></label>
            <div className="feedback-actions"><button className="button soft" disabled={!internalNotes.trim() || triageMutation.isPending} onClick={() => triageMutation.mutate({ id: activeItem._id, payload: { internalNotes } })}>Save internal note</button></div>

            <label>
              Staff response / Resolution note
              <textarea
                rows={3}
                placeholder="Write an official response or internal note..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </label>

            <div className="feedback-actions">
              <button
                className="button primary"
                onClick={() => handleResolve('resolved')}
                disabled={respondMutation.isPending}
              >
                <Icon name="check" /> {respondMutation.isPending ? 'Saving...' : 'Mark resolved & send response'}
              </button>
            </div>
          </section>
        ) : (
          <section className="panel feedback-detail">
            <EmptyState title="Select a message" message="Choose a message from the list to view full details and respond." />
          </section>
        )}
      </div>
    </div>
  )
}
