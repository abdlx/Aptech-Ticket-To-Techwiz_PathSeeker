import { useQuery } from '@tanstack/react-query'
import Icon from '../../components/Icon'
import NaviPrompt from '../../components/user/NaviPrompt'
import SectionHead from '../../components/user/SectionHead'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { contentApi } from '../../services/contentApi'

export default function StoriesPage({ navigate }) {
  const query = useQuery({
    queryKey: queryKeys.stories.list(),
    queryFn: ({ signal }) => contentApi.getStories({}, { signal }),
    staleTime: 60_000,
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const stories = query.data?.data?.stories || []
  const featured = stories[0]
  const restStories = stories.slice(1)

  return (
    <div className="stories-page page-stack">
      <section className="stories-hero">
        <div>
          <span className="eyebrow">Real people · Real pivots</span>
          <h1>There’s more than one way forward.</h1>
          <p>Meet people who followed their curiosity, built new skills, and found work that fits.</p>
          <button className="button primary" onClick={() => navigate('submit-story')}>
            Share your story <Icon name="arrow" />
          </button>
        </div>
        <div className="story-collage">
          <span className="portrait p1">AR</span>
          <span className="portrait p2">DK</span>
          <span className="portrait p3">FN</span>
          <div>
            <strong>{stories.length}+</strong>
            <small>career journeys shared</small>
          </div>
        </div>
      </section>

      {featured && (
        <button
          className="featured-story panel"
          onClick={() => navigate('story-detail', featured._id)}
          style={{ width: '100%', textAlign: 'left' }}
        >
          <div className="story-video">
            <span>
              <Icon name="play" size={28} />
            </span>
            <small>Featured</small>
          </div>
          <div>
            <span className="eyebrow">Featured journey</span>
            <h2>“{featured.storyText.slice(0, 70)}...”</h2>
            <blockquote>“{featured.storyText.slice(0, 160)}...”</blockquote>
            <div className="story-person">
              <span>{featured.authorName?.split(' ').map((p) => p[0]).join('') || 'AR'}</span>
              <p>
                <strong>{featured.authorName}</strong>
                <small>{featured.domainId?.name || 'Career transition'}</small>
              </p>
            </div>
            <div className="story-tags">
              <span>{featured.domainId?.name || 'Transition'}</span>
              <span>{featured.isDemo ? 'Illustrative demo journey' : 'Community story'}</span>
            </div>
          </div>
        </button>
      )}

      <section>
        <SectionHead eyebrow="Community voices" title="More paths worth knowing" />
        {restStories.length > 0 ? (
          <div className="story-grid">
            {restStories.map((story) => {
              const initials = story.authorName?.split(' ').map((p) => p[0]).join('') || 'PS'
              return (
                <article key={story._id}>
                  <Icon name="message" />
                  <p>“{story.storyText.slice(0, 140)}...”</p>
                  <div>
                    <span className="portrait mint">{initials}</span>
                    <span>
                      <strong>{story.authorName}</strong>
                      <small>{story.domainId?.name || 'Career Explorer'}{story.isDemo ? ' · Demo journey' : ''}</small>
                    </span>
                  </div>
                  <button className="card-link" onClick={() => navigate('story-detail', story._id)}>
                    Read journey <Icon name="arrow" />
                  </button>
                </article>
              )
            })}
          </div>
        ) : (
          !featured && (
            <EmptyState
              title="No stories published yet"
              message="Be the first to share your career transition and inspire others."
            />
          )
        )}
      </section>

      <NaviPrompt pose="walking-profile" title="Your path can move, too">
        Careers are built one experiment at a time. Save the stories that make your next step feel possible.
      </NaviPrompt>
    </div>
  )
}
