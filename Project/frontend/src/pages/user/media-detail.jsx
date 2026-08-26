import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import Back from '../../components/common/BackButton'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { contentApi } from '../../services/contentApi'

export default function MediaDetailPage({ navigate, mediaId }) {
  const queryClient = useQueryClient()
  const [playing, setPlaying] = useState(false)
  const [transcript, setTranscript] = useState(true)
  const [userRating, setUserRating] = useState(0)

  const query = useQuery({
    queryKey: queryKeys.media.detail(mediaId),
    queryFn: ({ signal }) => (mediaId ? contentApi.getMediaById(mediaId, { signal }) : Promise.resolve(null)),
    enabled: Boolean(mediaId),
  })

  const resourcesQuery = useQuery({
    queryKey: queryKeys.resources.list(),
    queryFn: ({ signal }) => contentApi.getResources({}, { signal }),
    staleTime: 60_000,
  })

  const rateMutation = useMutation({
    mutationFn: (ratingValue) => contentApi.rateMedia(mediaId, ratingValue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media.detail(mediaId) })
    },
  })

  if (mediaId && query.isLoading) return <PageSkeleton />
  if (mediaId && query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const media = query.data?.data?.media
  const title = media?.title || 'A day in the life of a data analyst'
  const isVideo = media?.type === 'video'
  const tags = media?.tags || ['Data & Business', 'Career Day']
  const transcriptLines = (media?.transcript || '00:00 - Speaker: Welcome to this session.\n02:30 - Speaker: Here we explore how foundational skills apply in practice.')
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(' - ')
      if (parts.length >= 2) {
        return { time: parts[0], text: parts.slice(1).join(' - ') }
      }
      return { time: '00:00', text: line }
    })

  const relatedResources = resourcesQuery.data?.data?.resources || []

  const handleRate = (ratingValue) => {
    setUserRating(ratingValue)
    if (mediaId) {
      rateMutation.mutate(ratingValue)
    }
  }

  return (
    <div className="page-stack">
      <Breadcrumbs
        items={[
          { label: 'Resources', to: 'resources' },
          { label: title },
        ]}
        navigate={navigate}
      />
      <Back navigate={navigate} to="resources">
        Back to resources
      </Back>
      <div className="media-layout">
        <main>
          <section className="media-player">
            <div className="media-stage">
              <span className={`career-icon ${isVideo ? 'blue' : 'lavender'}`}>
                <Icon name={isVideo ? 'chart' : 'headphones'} size={38} />
              </span>
              <div>
                <small>Expert {media?.type || 'media'}</small>
                <strong>{title}</strong>
              </div>
              <button
                className="media-play"
                onClick={() => setPlaying(!playing)}
                aria-label={playing ? 'Pause' : 'Play'}
              >
                <Icon name={playing ? 'pause' : 'play'} size={32} />
              </button>
            </div>
            <div className="media-controls">
              <button onClick={() => setPlaying(!playing)}>
                <Icon name={playing ? 'pause' : 'play'} />
              </button>
              <span>{playing ? '03:18' : '00:00'}</span>
              <div>
                <i style={{ width: playing ? '40%' : '0%' }} />
              </div>
              <span>12:04</span>
              <button>1×</button>
            </div>
          </section>

          <section className="media-copy">
            <span className="eyebrow">{media?.type === 'video' ? 'Video' : 'Audio'} · {tags.join(' · ')}</span>
            <h1>{title}</h1>
            <p>
              Follow along with real practitioners—from breaking down complex problems to delivering tangible results.
            </p>
            <div className="teacher">
              <span>PS</span>
              <p>
                <strong>PathSeeker Faculty</strong>
                <small>Senior Practitioner · Industry Mentor</small>
              </p>
            </div>
          </section>

          <section className="panel transcript-card">
            <div>
              <div>
                <span className="eyebrow">Accessibility</span>
                <h2>Transcript</h2>
              </div>
              <button className="button soft small" onClick={() => setTranscript(!transcript)}>
                {transcript ? 'Hide' : 'Show'} transcript
              </button>
            </div>
            {transcript && (
              <div className="transcript-lines">
                {transcriptLines.map((line, idx) => (
                  <p key={idx} className={idx === 1 && playing ? 'active' : ''}>
                    <time>{line.time}</time>
                    <span>{line.text}</span>
                  </p>
                ))}
              </div>
            )}
          </section>
        </main>

        <aside>
          <section className="panel rating-card">
            <span className="eyebrow">Was this useful?</span>
            <h3>Rate this resource</h3>
            <div>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  className={star <= (userRating || Math.round(media?.ratingAvg || 4)) ? 'active' : ''}
                  key={star}
                  onClick={() => handleRate(star)}
                >
                  <Icon name="star" />
                </button>
              ))}
            </div>
            <small>
              {media?.ratingAvg ? `Average: ${media.ratingAvg.toFixed(1)} (${media.ratingCount} ratings)` : 'Your rating helps improve recommendations.'}
            </small>
          </section>

          <section className="panel related-card">
            <span className="eyebrow">Up next</span>
            <h3>Related resources</h3>
            {relatedResources.slice(0, 3).map((resource) => (
              <button key={resource._id} onClick={() => navigate('document-preview', resource._id)}>
                <span className="resource-icon amber">
                  <Icon name="file" />
                </span>
                <span>
                  <strong>{resource.title}</strong>
                  <small>{resource.type?.toUpperCase()} · {resource.downloadCount} downloads</small>
                </span>
                <Icon name="arrow" />
              </button>
            ))}
          </section>
        </aside>
      </div>
    </div>
  )
}
