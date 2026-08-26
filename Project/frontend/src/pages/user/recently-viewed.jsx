import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import PageTitle from '../../components/common/PageTitle'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { personalizationApi } from '../../services/personalizationApi'

function formatRelative(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const diffMins = Math.floor((Date.now() - date) / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} min ago`
  if (diffHours < 24) return `${diffHours} hr ago`
  if (diffDays === 1) return 'Yesterday'
  return `${diffDays} days ago`
}

export default function RecentlyViewedPage({ navigate }) {
  const [filter, setFilter] = useState('All')

  const query = useQuery({
    queryKey: queryKeys.recentlyViewed.list(),
    queryFn: ({ signal }) => personalizationApi.getRecentlyViewed({}, { signal }),
    staleTime: 30_000,
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const rawItems = query.data?.data?.items || []
  const mappedItems = rawItems.map((entry) => {
    const item = entry.itemId || {}
    let typeLabel = 'Career'
    let icon = 'compass'
    let tone = 'lavender'
    let target = ['careers']
    let title = item.title || item.authorName || 'Career detail'
    let meta = formatRelative(entry.viewedAt)

    if (entry.itemType === 'career') {
      typeLabel = 'Career'
      icon = item.iconKey || 'briefcase'
      tone = item.colorTone || 'lavender'
      target = ['career-detail', item.slug || item._id]
      title = item.title || 'Career profile'
      meta = `Viewed ${formatRelative(entry.viewedAt)}`
    } else if (entry.itemType === 'media') {
      typeLabel = item.type === 'video' ? 'Video' : 'Audio'
      icon = item.type === 'video' ? 'video' : 'headphones'
      tone = 'blue'
      target = ['media-detail', item._id]
      meta = `Viewed ${formatRelative(entry.viewedAt)}`
    } else if (entry.itemType === 'story') {
      typeLabel = 'Story'
      icon = 'users'
      tone = 'mint'
      target = ['story-detail', item._id]
      title = `${item.authorName}’s transition story`
      meta = `Viewed ${formatRelative(entry.viewedAt)}`
    } else if (entry.itemType === 'resource') {
      typeLabel = 'Document'
      icon = 'file'
      tone = 'amber'
      target = ['document-preview', item._id]
      meta = `${item.pageCount ? `${item.pageCount} pages · ` : ''}Viewed ${formatRelative(entry.viewedAt)}`
    }

    return {
      _id: entry._id,
      type: typeLabel,
      icon,
      tone,
      title,
      meta,
      target,
    }
  })

  const items = filter === 'All' ? mappedItems : mappedItems.filter((item) => item.type === filter)

  return (
    <div className="page-stack">
      <PageTitle
        eyebrow="Pick up where you left off"
        title="Recently viewed"
        copy="Your recent careers, learning resources, documents, and stories in one place."
      />
      <div className="filter-chips recent-filters">
        {['All', 'Career', 'Video', 'Story', 'Document'].map((item) => (
          <button
            className={filter === item ? 'active' : ''}
            key={item}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <section className="recent-grid">
        {items.length > 0 ? (
          items.map((item) => (
            <button className="panel" key={item._id} onClick={() => navigate(...item.target)}>
              <span className={`career-icon ${item.tone}`}>
                <Icon name={item.icon} />
              </span>
              <span>
                <small>{item.type}</small>
                <strong>{item.title}</strong>
                <p>{item.meta}</p>
              </span>
              <Icon name="arrow" />
            </button>
          ))
        ) : (
          <EmptyState
            title="No recent items"
            message="As you browse careers, videos, and guides, your recently viewed activity will appear here."
          />
        )}
      </section>

      <div className="privacy-note panel">
        <Icon name="clock" />
        <p>
          <strong>History stays private</strong>
          <small>Your recent activity helps personalize recommendations and can be viewed only by you.</small>
        </p>
      </div>
    </div>
  )
}
