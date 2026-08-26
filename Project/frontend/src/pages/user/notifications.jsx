import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import PageTitle from '../../components/common/PageTitle'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { notificationApi } from '../../services/notificationApi'

function formatRelativeTime(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hr ago`
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [filter, setFilter] = useState('All')

  const query = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: ({ signal }) => notificationApi.getNotifications({}, { signal }),
    staleTime: 15_000,
  })

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() })
    },
  })

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() })
    },
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const items = query.data?.data?.notifications || []
  const unreadCount = query.data?.data?.unreadCount ?? items.filter((item) => !item.read).length
  const shown = filter === 'Unread' ? items.filter((item) => !item.read) : items

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="Inbox"
        title="Notifications"
        copy="Updates about your matches, learning, saved paths, and account."
        actions={
          unreadCount > 0 && (
            <button
              className="button soft"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              <Icon name="check" /> Mark all read
            </button>
          )
        }
      />
      <div className="tab-row">
        <button
          className={filter === 'All' ? 'active' : ''}
          onClick={() => setFilter('All')}
        >
          All <span>{items.length}</span>
        </button>
        <button
          className={filter === 'Unread' ? 'active' : ''}
          onClick={() => setFilter('Unread')}
        >
          Unread <span>{unreadCount}</span>
        </button>
      </div>
      <section className="notification-list panel">
        {shown.length > 0 ? (
          shown.map((item) => (
            <button
              key={item._id}
              className={!item.read ? 'unread' : ''}
              onClick={() => {
                if (!item.read) markReadMutation.mutate(item._id)
              }}
            >
              <span className="notification-kind">
                <Icon name={item.icon || (item.type === 'match' ? 'sparkles' : item.type === 'resource' ? 'book' : item.type === 'feedback' ? 'message' : 'bell')} />
              </span>
              <span>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
                <small>{formatRelativeTime(item.createdAt)}</small>
              </span>
              {!item.read && <i />}
            </button>
          ))
        ) : (
          <EmptyState
            title={filter === 'Unread' ? 'No unread notifications' : 'Your inbox is clear'}
            message="We'll let you know when new matches, resources, or updates arrive."
          />
        )}
      </section>
    </div>
  )
}
