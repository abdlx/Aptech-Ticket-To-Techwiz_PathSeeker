import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import AdminTable from '../../components/admin/AdminTable'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { adminApi } from '../../services/adminApi'

export default function StoriesAdmin() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('')

  const query = useQuery({
    queryKey: ['admin', 'stories', statusFilter],
    queryFn: ({ signal }) =>
      adminApi.getStories(
        { ...(statusFilter ? { status: statusFilter } : {}) },
        { signal },
      ),
  })

  const approveMutation = useMutation({
    mutationFn: (id) => adminApi.approveStory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stories'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: (id) => adminApi.rejectStory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'stories'] })
    },
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const stories = query.data?.data?.stories || []
  const pendingCount = stories.filter((s) => s.status === 'pending').length
  const approvedCount = stories.filter((s) => s.status === 'approved').length
  const rejectedCount = stories.filter((s) => s.status === 'rejected').length

  const rows = stories.map((s) => {
    const initials = s.authorName ? s.authorName.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() : 'PS'
    const domain = s.domainId?.name || 'Career transition'
    const date = new Date(s.createdAt).toLocaleDateString()
    const statusLabel = s.status === 'approved' ? 'Approved' : s.status === 'rejected' ? 'Rejected' : 'Pending'
    return [
      `${initials}|${s.authorName}|${domain}`,
      domain,
      date,
      statusLabel,
      s.status === 'pending' ? (
        <span key={s._id} style={{ display: 'inline-flex', gap: '6px' }}>
          <button
            className="button primary small"
            style={{ padding: '2px 8px', fontSize: '11px' }}
            onClick={() => approveMutation.mutate(s._id)}
          >
            Approve
          </button>
          <button
            className="button ghost small"
            style={{ padding: '2px 8px', fontSize: '11px' }}
            onClick={() => rejectMutation.mutate(s._id)}
          >
            Reject
          </button>
        </span>
      ) : (
        s.status
      ),
      '⋯',
    ]
  })

  return (
    <div className="admin-stack">
      <PageHead
        eyebrow="Community inspiration"
        title="Success stories"
        description="Review, edit, approve, or reject user-submitted career transition stories."
      />

      <div className="story-admin-cards">
        <article
          className="panel"
          style={{ cursor: 'pointer' }}
          onClick={() => setStatusFilter(statusFilter === 'pending' ? '' : 'pending')}
        >
          <span className="career-icon amber">
            <Icon name="clock" />
          </span>
          <div>
            <strong>{pendingCount}</strong>
            <p>Pending review</p>
          </div>
          <Icon name="arrow" />
        </article>

        <article
          className="panel"
          style={{ cursor: 'pointer' }}
          onClick={() => setStatusFilter(statusFilter === 'approved' ? '' : 'approved')}
        >
          <span className="career-icon mint">
            <Icon name="check" />
          </span>
          <div>
            <strong>{approvedCount}</strong>
            <p>Approved & Live</p>
          </div>
          <Icon name="arrow" />
        </article>

        <article
          className="panel"
          style={{ cursor: 'pointer' }}
          onClick={() => setStatusFilter(statusFilter === 'rejected' ? '' : 'rejected')}
        >
          <span className="career-icon rose">
            <Icon name="close" />
          </span>
          <div>
            <strong>{rejectedCount}</strong>
            <p>Rejected</p>
          </div>
          <Icon name="arrow" />
        </article>
      </div>

      <AdminTable
        headings={['Author', 'Career transition', 'Submitted', 'Status', 'Actions', '']}
        rows={rows.length ? rows : [['PS|No stories found|—', '—', '—', '—', '—', '']]}
      />
    </div>
  )
}
