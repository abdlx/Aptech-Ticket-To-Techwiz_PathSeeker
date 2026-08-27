import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Icon from '../../components/Icon'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { careersApi } from '../../services/careersApi'
import { personalizationApi } from '../../services/personalizationApi'
import CareerIntelligencePanel from '../../components/user/CareerIntelligencePanel'

function salaryLabel(salary = {}) {
  if (salary.median != null) return `${salary.currency || 'USD'} ${salary.median.toLocaleString()} median`
  if (salary.min != null || salary.max != null) return `${salary.currency || 'USD'} ${salary.min?.toLocaleString() || '-'} - ${salary.max?.toLocaleString() || '-'}`
  return 'Not published'
}

function CareerDetail({ navigate, careerId }) {
  const queryClient = useQueryClient()
  const [notice, setNotice] = useState('')
  const query = useQuery({
    queryKey: queryKeys.careers.detail(careerId),
    queryFn: ({ signal }) => careersApi.detail(careerId, { signal }),
    enabled: Boolean(careerId), staleTime: 300_000,
  })
  const relatedQuery = useQuery({
    queryKey: ['careers', 'related', careerId],
    queryFn: ({ signal }) => careersApi.related(careerId, { signal }), enabled: Boolean(careerId),
  })
  const contentQuery = useQuery({
    queryKey: ['careers', 'related-content', careerId],
    queryFn: ({ signal }) => careersApi.relatedContent(careerId, { signal }), enabled: Boolean(careerId),
  })
  const bookmarksQuery = useQuery({
    queryKey: queryKeys.bookmarks.list(),
    queryFn: ({ signal }) => personalizationApi.getBookmarks({ limit: 100 }, { signal }),
  })

  const career = query.data?.data?.career
  const bookmark = useMemo(() => (bookmarksQuery.data?.data?.bookmarks || []).find(
    (item) => item.itemType === 'career' && item.itemId?._id === career?._id,
  ), [bookmarksQuery.data, career?._id])

  useEffect(() => {
    if (career?._id) personalizationApi.recordRecentlyViewed({ itemType: 'career', itemId: career._id }).catch(() => {})
  }, [career?._id])

  const bookmarkMutation = useMutation({
    mutationFn: () => bookmark
      ? personalizationApi.removeBookmark(bookmark._id)
      : personalizationApi.addBookmark({ itemType: 'career', itemId: career._id }),
    onSuccess: () => {
      setNotice(bookmark ? 'Removed from saved careers.' : 'Saved to your career collection.')
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
    onError: (error) => setNotice(error.message),
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState title={query.error.status === 404 ? 'Career not found' : undefined} message={query.error.message} onRetry={query.error.status === 404 ? undefined : query.refetch} />

  const skills = career.requiredSkills || []
  const salary = career.expectedSalary || {}
  const source = career.dataSource || {}
  const preparation = career.timeToJobReady
    ? `${career.timeToJobReady.minMonths ?? 0}-${career.timeToJobReady.maxMonths ?? career.timeToJobReady.minMonths ?? 0} months`
    : null
  const related = relatedQuery.data?.data?.careers || []
  const relatedMedia = contentQuery.data?.data?.media || []
  const relatedResources = contentQuery.data?.data?.resources || []

  return (
    <div className="career-detail page-stack">
      <Breadcrumbs items={[{ label: 'Career Bank', to: 'careers' }, { label: career.title }]} navigate={navigate} />
      <button className="back-link" onClick={() => navigate('careers')}><Icon name="arrowLeft" /> Back to Career Bank</button>
      <section className="career-detail-hero">
        <div className="career-title-block"><span className={`career-icon xl ${career.colorTone || 'lavender'}`}><Icon name={career.iconKey || 'briefcase'} size={30} /></span><div><span className="match-pill"><Icon name="sparkles" size={13} /> Evidence-backed profile</span><h1>{career.title}</h1><p>{career.domainId?.name || 'Career'} - {source.geography || 'United States'} outlook</p></div></div>
        <div className="career-hero-actions"><button className={`button ${bookmark ? 'soft' : 'primary'}`} onClick={() => bookmarkMutation.mutate()} disabled={bookmarkMutation.isPending}><Icon name="bookmark" /> {bookmark ? 'Saved' : 'Save career'}</button><button className="button primary" onClick={() => navigate('quiz')}>Check my fit <Icon name="arrow" /></button></div>
      </section>
      {notice && <p className="inline-notice" role="status">{notice}</p>}

      <div className="detail-layout">
        <div className="detail-main">
          <section className="panel prose-card"><span className="eyebrow">Career snapshot</span><h2>What the work involves</h2><p>{career.description}</p><div className="snapshot-grid"><div><span className="snapshot-icon"><Icon name="briefcase" /></span><small>Pay evidence</small><strong>{salaryLabel(salary)}</strong></div><div><span className="snapshot-icon"><Icon name="trend" /></span><small>{source.outlookPeriod || 'Projected growth'}</small><strong>{career.growthRatePercent == null ? 'Not published' : `${career.growthRatePercent}%`}</strong></div><div><span className="snapshot-icon"><Icon name="target" /></span><small>Market demand</small><strong>{(career.demand || 'medium').replaceAll('_', ' ')}</strong></div></div></section>

          <section className="panel"><span className="eyebrow">Day-to-day work</span><h2>Core responsibilities</h2>{career.responsibilities?.length ? <ul className="career-fact-list">{career.responsibilities.map((item) => <li key={item}>{item}</li>)}</ul> : <EmptyState title="Responsibilities coming soon" message="This profile is awaiting a responsibilities review." />}</section>

          <section className="panel"><span className="eyebrow">Skills map</span><h2>What you will need to thrive</h2><div className="skill-row">{skills.map((item) => <span key={item.skillId?._id || item.skillId}>{item.skillId?.name || 'Skill'} - {item.importance.replaceAll('_', ' ')}</span>)}</div>{career.toolsToLearn?.length > 0 && <><h3>Common tools and methods</h3><div className="skill-row">{career.toolsToLearn.map((tool) => <span key={tool}>{tool}</span>)}</div></>}</section>

          <section className="panel prose-card"><span className="eyebrow">Path into the field</span><h2>Education and preparation</h2><p>{career.educationPath}</p>{preparation && <p><strong>Illustrative preparation time:</strong> {preparation}</p>}{career.traits?.length > 0 && <p><strong>Helpful traits:</strong> {career.traits.join(', ')}</p>}</section>

          <section className="panel career-source-card"><span className="eyebrow">Source and limitations</span><h2>{source.name || 'Career information source'}</h2><p>Salary is a reference figure for {source.geography || 'the listed geography'} and is not a promise of individual earnings. Education, experience, industry, and location can materially change pay and hiring demand.</p>{source.url && <a className="button soft small" href={source.url} target="_blank" rel="noreferrer">Open {source.occupationLabel || 'official occupation source'} <Icon name="arrow" /></a>}<small>Salary year: {source.salaryYear || 'not specified'} - Outlook: {source.outlookPeriod || 'not specified'}</small></section>
        </div>

        <aside className="career-detail-aside">
          <section className="panel related-card"><span className="eyebrow">Keep exploring</span><h3>Related careers</h3>{related.map((item) => <button key={item._id} onClick={() => navigate('career-detail', item.slug)}><span className={`career-icon ${item.colorTone || 'lavender'}`}><Icon name={item.iconKey || 'briefcase'} /></span><span><strong>{item.title}</strong><small>{item.domainId?.name || 'Career'} - {item.growthRatePercent ?? 0}% growth</small></span><Icon name="arrow" /></button>)}</section>
          <section className="panel related-card"><span className="eyebrow">Learn from experts</span><h3>Related media</h3>{relatedMedia.slice(0, 3).map((item) => <button key={item._id} onClick={() => navigate('media-detail', item._id)}><span className="resource-icon blue"><Icon name="play" /></span><span><strong>{item.title}</strong><small>{item.publisherName || 'Expert video'}</small></span><Icon name="arrow" /></button>)}</section>
          <section className="panel related-card"><span className="eyebrow">Take action</span><h3>Career materials</h3>{relatedResources.slice(0, 3).map((item) => <button key={item._id} onClick={() => navigate('document-preview', item._id)}><span className="resource-icon amber"><Icon name="file" /></span><span><strong>{item.title}</strong><small>{item.pageCount} pages - Original PathSeeker resource</small></span><Icon name="arrow" /></button>)}</section>
        </aside>
      </div>
    </div>
  )
}

export default function CareerDetailEnhancedPage(props) {
  return <><CareerDetail {...props} /><CareerIntelligencePanel careerSlug={props.careerId} navigate={props.navigate} /></>
}
