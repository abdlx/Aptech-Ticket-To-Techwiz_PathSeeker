import { useQuery } from '@tanstack/react-query'
import Back from '../../components/common/BackButton'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { contentApi } from '../../services/contentApi'

export default function StoryDetailPage({ navigate, storyId }) {
  const query = useQuery({
    queryKey: queryKeys.stories.detail(storyId),
    queryFn: ({ signal }) => (storyId ? contentApi.getStoryById(storyId, { signal }) : Promise.resolve(null)),
    enabled: Boolean(storyId),
  })

  if (storyId && query.isLoading) return <PageSkeleton />
  if (storyId && query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const story = query.data?.data?.story
  const author = story?.authorName || 'Aisha Rahman'
  const domain = story?.domainId?.name || 'Design & Technology'
  const initials = author.split(' ').map((p) => p[0]).join('') || 'PS'
  const storyText = story?.storyText || 'After graduation, exploring different career paths led to practical, fulfilling work.'

  return (
    <div className="page-stack">
      <Breadcrumbs
        items={[
          { label: 'Stories', to: 'stories' },
          { label: `${author}’s Story` },
        ]}
        navigate={navigate}
      />
      <Back navigate={navigate} to="stories">
        Back to success stories
      </Back>
      <section className="story-detail-hero">
        <div>
          <span className="eyebrow">Career journey · {domain}</span>
          <h1>{author}’s Career Transition</h1>
          <p>{author} · {domain}</p>
          <div className="story-tags">
            <span>{story?.isDemo ? 'Illustrative demo journey' : 'Community story'}</span>
            <span>{domain}</span>
          </div>
        </div>
        <div className="story-portrait">{initials}</div>
      </section>
      <div className="story-detail-layout">
        <main className="panel story-article">
          <blockquote>“Finding work that feels like you is built one step at a time.”</blockquote>
          <p style={{ whiteSpace: 'pre-line', lineHeight: '1.7' }}>{storyText}</p>
        </main>
        <aside className="story-timeline panel">
          <span className="eyebrow">Journey milestones</span>
          {[
            ['01', 'Explored', 'Completed the Career Assessment & explored fits'],
            ['02', 'Tested', 'Built foundational skills with curated learning'],
            ['03', 'Built', 'Created real project evidence and portfolio work'],
            ['04', 'Landed', 'Transitioned into target career role'],
          ].map(([number, title, copy]) => (
            <div key={number}>
              <span>{number}</span>
              <p>
                <strong>{title}</strong>
                <small>{copy}</small>
              </p>
            </div>
          ))}
          <button className="button primary" onClick={() => navigate('submit-story')}>
            Share your story
          </button>
        </aside>
      </div>
    </div>
  )
}
