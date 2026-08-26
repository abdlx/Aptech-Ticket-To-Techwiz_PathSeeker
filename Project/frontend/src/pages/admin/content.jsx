import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import AdminTable from '../../components/admin/AdminTable'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { adminApi } from '../../services/adminApi'

export default function ContentAdmin() {
  const queryClient = useQueryClient()
  const [formatFilter, setFormatFilter] = useState('All')
  const [search, setSearch] = useState('')

  const resourcesQuery = useQuery({
    queryKey: ['admin', 'resources'],
    queryFn: ({ signal }) => adminApi.getResources({}, { signal }),
  })

  const mediaQuery = useQuery({
    queryKey: ['admin', 'media'],
    queryFn: ({ signal }) => adminApi.getMedia({}, { signal }),
  })

  const deleteResourceMutation = useMutation({
    mutationFn: (id) => adminApi.deleteResource(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'resources'] })
    },
  })

  const deleteMediaMutation = useMutation({
    mutationFn: (id) => adminApi.deleteMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] })
    },
  })

  if (resourcesQuery.isLoading || mediaQuery.isLoading) return <PageSkeleton />
  if (resourcesQuery.error) return <ErrorState message={resourcesQuery.error.message} onRetry={resourcesQuery.refetch} />

  const resources = resourcesQuery.data?.data?.resources || []
  const media = mediaQuery.data?.data?.media || []

  const allItems = [
    ...media.map((m) => ({
      _id: m._id,
      title: m.title,
      type: m.type === 'video' ? 'Video' : 'Podcast',
      tags: m.tags?.join(', ') || 'Learning',
      author: 'PathSeeker Faculty',
      date: new Date(m.createdAt).toLocaleDateString(),
      status: m.active ? 'Published' : 'Draft',
      isMedia: true,
    })),
    ...resources.map((r) => ({
      _id: r._id,
      title: r.title,
      type: r.type?.toUpperCase() || 'DOCUMENT',
      tags: r.tags?.join(', ') || 'All careers',
      author: 'PathSeeker Editorial',
      date: new Date(r.createdAt).toLocaleDateString(),
      status: r.active ? 'Published' : 'Draft',
      isMedia: false,
    })),
  ]

  const filtered = allItems
    .filter((item) => (formatFilter === 'All' ? true : item.type.toLowerCase().includes(formatFilter.toLowerCase())))
    .filter((item) => (search.trim() ? item.title.toLowerCase().includes(search.toLowerCase()) : true))

  const rows = filtered.map((item) => [
    `▶|${item.title}|${item.tags}`,
    item.type,
    item.tags,
    item.author,
    item.date,
    item.status,
    <button
      key={item._id}
      className="button ghost small"
      style={{ padding: '2px 8px', fontSize: '11px', color: 'var(--rose, #c05c5c)' }}
      onClick={() => {
        if (window.confirm(`Delete "${item.title}"?`)) {
          if (item.isMedia) deleteMediaMutation.mutate(item._id)
          else deleteResourceMutation.mutate(item._id)
        }
      }}
    >
      Delete
    </button>,
  ])

  return (
    <div className="admin-stack">
      <PageHead
        eyebrow="Learning library"
        title="Content management"
        description="Manage expert videos, podcasts, courses, and downloadable documents."
      />

      <div className="content-summary">
        <button className={formatFilter === 'All' ? 'active' : ''} onClick={() => setFormatFilter('All')}>
          <Icon name="library" />
          <span>
            <strong>{allItems.length}</strong>
            <small>All content</small>
          </span>
        </button>
        <button className={formatFilter === 'Video' ? 'active' : ''} onClick={() => setFormatFilter('Video')}>
          <Icon name="video" />
          <span>
            <strong>{media.filter((m) => m.type === 'video').length}</strong>
            <small>Videos</small>
          </span>
        </button>
        <button className={formatFilter === 'Podcast' ? 'active' : ''} onClick={() => setFormatFilter('Podcast')}>
          <Icon name="headphones" />
          <span>
            <strong>{media.filter((m) => m.type === 'audio').length}</strong>
            <small>Podcasts</small>
          </span>
        </button>
        <button className={formatFilter === 'Document' ? 'active' : ''} onClick={() => setFormatFilter('Document')}>
          <Icon name="file" />
          <span>
            <strong>{resources.length}</strong>
            <small>Documents</small>
          </span>
        </button>
      </div>

      <section className="admin-filterbar panel">
        <div className="admin-search">
          <Icon name="search" />
          <input
            placeholder="Search content by title"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      <AdminTable
        headings={['Content', 'Format', 'Career tags', 'Author', 'Published', 'Status', 'Actions']}
        rows={rows.length ? rows : [['▶|No content items found|—', '—', '—', '—', '—', '—', '']]}
      />
    </div>
  )
}
