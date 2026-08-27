import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Icon from '../../components/Icon'
import Back from '../../components/common/BackButton'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { contentApi } from '../../services/contentApi'
import { personalizationApi } from '../../services/personalizationApi'
import { useAuth } from '../../providers/AuthProvider'

export default function MediaDetailEnhancedPage({ navigate, mediaId }) {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const [showNotes, setShowNotes] = useState(true)
  const [userRating, setUserRating] = useState(0)
  const [notice, setNotice] = useState('')

  const allMediaQuery = useQuery({
    queryKey: queryKeys.media.list(),
    queryFn: ({ signal }) => contentApi.getMedia({}, { signal }),
    staleTime: 60_000,
  })

  const effectiveMediaId = mediaId || allMediaQuery.data?.data?.media?.[0]?._id

  const query = useQuery({
    queryKey: queryKeys.media.detail(effectiveMediaId),
    queryFn: ({ signal }) => contentApi.getMediaById(effectiveMediaId, { signal }),
    enabled: Boolean(effectiveMediaId),
  })
  const relatedQuery = useQuery({
    queryKey: ['media', 'related', effectiveMediaId],
    queryFn: ({ signal }) => contentApi.getRelatedMedia(effectiveMediaId, { signal }),
    enabled: Boolean(effectiveMediaId),
  })
  const resourcesQuery = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: ({ signal }) => contentApi.getResources({}, { signal }),
    staleTime: 60_000,
  })
  const media = query.data?.data?.media || allMediaQuery.data?.data?.media?.find((m) => m._id === effectiveMediaId)

  useEffect(() => {
    if (media?._id) personalizationApi.recordRecentlyViewed({ itemType: 'media', itemId: media._id }).catch(() => {})
  }, [media?._id])

  const rateMutation = useMutation({
    mutationFn: (value) => contentApi.rateMedia(effectiveMediaId, value),
    onSuccess: () => {
      setNotice('Thanks - your rating was saved.')
      queryClient.invalidateQueries({ queryKey: queryKeys.media.detail(effectiveMediaId) })
    },
    onError: (error) => setNotice(error.message),
  })

  const isStaff = ['content_editor', 'support_manager', 'admin', 'super_admin'].includes(auth.user?.role)

  if (query.isLoading || (!media && allMediaQuery.isLoading)) return <PageSkeleton />
  if (query.error && !media) return <ErrorState message={query.error.message} onRetry={query.refetch} />
  if (!media) return <ErrorState title="Media not found" message="Please choose a video from the library." onRetry={allMediaQuery.refetch} />

  const isVideo = media.type === 'video'
  const notes = (media.transcript || '').split('\n').filter(Boolean).map((line) => {
    const [time, ...rest] = line.split(' - ')
    return { time: rest.length ? time : '', text: rest.length ? rest.join(' - ') : line }
  })
  const relatedMedia = relatedQuery.data?.data?.media || []
  const relatedResources = resourcesQuery.data?.data?.resources || []

  return (
    <div className="page-stack">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <Breadcrumbs items={[{ label: 'Resources', to: 'resources' }, { label: media.title }]} navigate={navigate} />
        {isStaff && (
          <button
            className="button soft small"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            onClick={() => navigate('admin-content')}
          >
            <Icon name="settings" size={14} /> Back to Admin Content
          </button>
        )}
      </div>
      <Back navigate={navigate} to="resources">Back to resources</Back>
      <div className="media-layout">
        <main>
          <section className="media-player real-media-player">
            {isVideo ? (
              <iframe src={media.url} title={media.title} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen />
            ) : media.type === 'audio' ? (
              <div className="audio-player"><span className="career-icon lavender"><Icon name="headphones" size={38} /></span><audio controls preload="metadata" src={media.url}>Your browser does not support audio playback.</audio></div>
            ) : (
              <iframe src={media.url} title={media.title} loading="lazy" />
            )}
          </section>

          <section className="media-copy">
            <span className="eyebrow">Expert {media.type} - {media.durationLabel || 'Self-paced'}</span>
            <h1>{media.title}</h1>
            <p>{media.description}</p>
            <div className="teacher"><span>{media.publisherName?.slice(0, 2).toUpperCase() || 'PS'}</span><p><strong>{media.publisherName || 'PathSeeker editorial'}</strong><small>Independent publisher - reviewed by PathSeeker</small></p></div>
            <div className="media-source-actions">{media.externalUrl && <a className="button primary" href={media.externalUrl} target="_blank" rel="noreferrer">Watch on the publisher channel <Icon name="arrow" /></a>}{media.publisherUrl && <a className="button soft" href={media.publisherUrl} target="_blank" rel="noreferrer">Publisher profile</a>}</div>
          </section>

          {media.learningObjectives?.length > 0 && <section className="panel"><span className="eyebrow">Learning outcomes</span><h2>What to listen for</h2><ul className="career-fact-list">{media.learningObjectives.map((objective) => <li key={objective}>{objective}</li>)}</ul></section>}

          <section className="panel transcript-card">
            <div><div><span className="eyebrow">Accessibility and study support</span><h2>Captions and learning notes</h2></div><button className="button soft small" onClick={() => setShowNotes((value) => !value)}>{showNotes ? 'Hide' : 'Show'} notes</button></div>
            <p>Turn on captions in the embedded player for the publisher-provided transcript. The short notes below are PathSeeker study prompts, not a verbatim transcript.</p>
            {showNotes && <div className="transcript-lines">{notes.map((line, index) => <p key={`${line.time}-${index}`}><time>{line.time}</time><span>{line.text}</span></p>)}</div>}
          </section>
        </main>

        <aside>
          <section className="panel rating-card"><span className="eyebrow">Was this useful?</span><h3>Rate this resource</h3><div>{[1, 2, 3, 4, 5].map((star) => <button className={star <= (userRating || Math.round(media.ratingAvg || 4)) ? 'active' : ''} key={star} onClick={() => { setUserRating(star); rateMutation.mutate(star) }} aria-label={`Rate ${star} out of 5`}><Icon name="star" /></button>)}</div><small>{media.ratingAvg ? `Average: ${media.ratingAvg.toFixed(1)} (${media.ratingCount} ratings)` : 'Your rating helps improve recommendations.'}</small>{notice && <p className="inline-notice" role="status">{notice}</p>}</section>

          {relatedMedia.length > 0 && <section className="panel related-card"><span className="eyebrow">Continue watching</span><h3>Related expert videos</h3>{relatedMedia.slice(0, 3).map((item) => <button key={item._id} onClick={() => navigate('media-detail', item._id)}><span className="resource-icon blue"><Icon name="play" /></span><span><strong>{item.title}</strong><small>{item.publisherName || 'Expert media'}</small></span><Icon name="arrow" /></button>)}</section>}

          <section className="panel related-card"><span className="eyebrow">Put it into practice</span><h3>Downloadable materials</h3>{relatedResources.slice(0, 3).map((resource) => <button key={resource._id} onClick={() => navigate('document-preview', resource._id)}><span className="resource-icon amber"><Icon name="file" /></span><span><strong>{resource.title}</strong><small>{resource.pageCount} pages - {resource.downloadCount} downloads</small></span><Icon name="arrow" /></button>)}</section>
        </aside>
      </div>
    </div>
  )
}
