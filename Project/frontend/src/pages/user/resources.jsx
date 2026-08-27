import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import SectionHead from '../../components/user/SectionHead'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { contentApi } from '../../services/contentApi'
import { personalizationApi } from '../../services/personalizationApi'

export default function ResourcesPage({ navigate }) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')

  const resourcesQuery = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: ({ signal }) => contentApi.getResources({}, { signal }),
    staleTime: 60_000,
  })

  const mediaQuery = useQuery({
    queryKey: queryKeys.media.list(),
    queryFn: ({ signal }) => contentApi.getMedia({}, { signal }),
    staleTime: 60_000,
  })

  const bookmarkMutation = useMutation({
    mutationFn: ({ itemType, itemId }) => personalizationApi.addBookmark({ itemType, itemId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.list() })
      setNotice('Saved to your resource collection.')
    },
    onError: (error) => setNotice(error.status === 409 ? 'This resource is already saved.' : error.message),
  })

  if (resourcesQuery.isLoading || mediaQuery.isLoading) return <PageSkeleton />
  if (resourcesQuery.error || mediaQuery.error) {
    const failedQuery = resourcesQuery.error ? resourcesQuery : mediaQuery
    return <ErrorState message={failedQuery.error.message} onRetry={failedQuery.refetch} />
  }

  const rawResources = resourcesQuery.data?.data?.resources || []
  const rawMedia = mediaQuery.data?.data?.media || []

  // Unify resources and media into cards
  const allItems = [
    ...rawMedia.map((m) => ({
      _id: m._id,
      title: m.title,
      type: m.type === 'video' ? 'Video' : 'Podcast',
      meta: `${m.ratingAvg ? `★ ${m.ratingAvg.toFixed(1)} · ` : ''}${m.tags?.slice(0, 2).join(', ') || 'Learning'}`,
      icon: m.type === 'video' ? 'play' : 'headphones',
      tone: m.type === 'video' ? 'blue' : 'lavender',
      isMedia: true,
      thumbnailUrl: m.thumbnailUrl,
      publisherName: m.publisherName,
      description: m.description || m.tags?.join(' · '),
    })),
    ...rawResources.map((r) => ({
      _id: r._id,
      title: r.title,
      type: r.type === 'pdf' ? 'PDF Guide' : r.type === 'checklist' ? 'Checklist' : r.type === 'template' ? 'Toolkit' : 'Document',
      meta: `${r.pageCount ? `${r.pageCount} pages · ` : ''}${r.downloadCount} downloads`,
      icon: 'file',
      tone: r.type === 'checklist' ? 'mint' : r.type === 'template' ? 'amber' : 'rose',
      isMedia: false,
      description: r.description,
    })),
  ]

  const filteredBySearch = search.trim()
    ? allItems.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()) || item.description?.toLowerCase().includes(search.toLowerCase()))
    : allItems

  const filtered = tab === 'All'
    ? filteredBySearch
    : tab === 'Videos'
    ? filteredBySearch.filter((item) => item.type === 'Video')
    : tab === 'Podcasts'
    ? filteredBySearch.filter((item) => item.type === 'Podcast')
    : filteredBySearch.filter((item) => !item.isMedia)

  const featuredMedia = rawMedia[0]

  return (
    <div className="resources-page page-stack">
      <section className="page-intro resources-intro">
        <div>
          <span className="eyebrow">Resource library</span>
          <h1>Learn what moves you forward</h1>
          <p>Practical, expert-led resources matched to your goals and saved careers.</p>
        </div>
        <div className="resource-search">
          <Icon name="search" />
          <input
            placeholder="Search the library"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <div className="tab-row">
        {['All', 'Videos', 'Documents'].map((item) => (
          <button
            className={tab === item ? 'active' : ''}
            key={item}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {notice && <p className="inline-notice" role="status">{notice}</p>}

      {featuredMedia && (
        <section className="featured-resource">
          <div className="feature-art" style={featuredMedia.thumbnailUrl ? { backgroundImage: `linear-gradient(135deg, rgba(18, 31, 51, .28), rgba(18, 31, 51, .72)), url(${featuredMedia.thumbnailUrl})` } : undefined}>
            <span className="resource-type">Featured {featuredMedia.type}</span>
            <div className="feature-play" onClick={() => navigate('media-detail', featuredMedia._id)}>
              <Icon name="play" />
            </div>
            <small>{featuredMedia.ratingCount} explorers rated · ★ {featuredMedia.ratingAvg?.toFixed(1) || '4.9'}</small>
          </div>
          <div>
            <span className="eyebrow">Recommended expert content</span>
            <h2>{featuredMedia.title}</h2>
            <p>{featuredMedia.description || featuredMedia.tags?.join(' · ') || 'Practical exploration into core career disciplines and real day-to-day work.'}</p>
            <small>Published by {featuredMedia.publisherName || 'an independent expert publisher'}</small>
            <button className="button primary" onClick={() => navigate('media-detail', featuredMedia._id)}>
              Watch & read transcript <Icon name="arrow" />
            </button>
          </div>
        </section>
      )}

      <section>
        <SectionHead eyebrow="Curated for your path" title={tab === 'All' ? 'Explore all resources' : tab} />
        {filtered.length > 0 ? (
          <div className="resource-grid">
            {filtered.map((resource) => (
              <article key={resource._id} className="resource-card">
                <div className={`resource-cover ${resource.tone}`} style={resource.thumbnailUrl ? { backgroundImage: `linear-gradient(rgba(16, 32, 50, .24), rgba(16, 32, 50, .64)), url(${resource.thumbnailUrl})` } : undefined}>
                  {!resource.thumbnailUrl && <Icon name={resource.icon} size={32} />}
                  <span>{resource.type}</span>
                  <button
                    onClick={() => bookmarkMutation.mutate({ itemType: resource.isMedia ? 'media' : 'resource', itemId: resource._id })}
                    title="Bookmark this item"
                    aria-label="Bookmark this item"
                  >
                    <Icon name="bookmark" />
                  </button>
                </div>
                <div>
                  <span className="resource-type">{resource.type}</span>
                  <h3>{resource.title}</h3>
                  <p>{resource.meta}</p>
                  <button
                    className="card-link"
                    onClick={() => navigate(resource.isMedia ? 'media-detail' : 'document-preview', resource._id)}
                  >
                    Open resource <Icon name="arrow" />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No matching resources found"
            message="Try searching for another topic or switch categories above."
          />
        )}
      </section>
    </div>
  )
}
