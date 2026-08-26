import { useQuery } from '@tanstack/react-query'
import Icon from '../../components/Icon'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { careersApi } from '../../services/careersApi'
import CareerIntelligencePanel from '../../components/user/CareerIntelligencePanel'

function ConnectedCareerDetailPage({ navigate, careerId }) {
  const query = useQuery({ queryKey: queryKeys.careers.detail(careerId), queryFn: ({ signal }) => careersApi.detail(careerId, { signal }), enabled: Boolean(careerId), staleTime: 300_000 })
  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState title={query.error.status === 404 ? 'Career not found' : undefined} message={query.error.message} onRetry={query.error.status === 404 ? undefined : query.refetch} />
  const career = query.data?.data?.career; const skills = career.requiredSkills || []; const salary = career.expectedSalary || {}
  return <div className="career-detail page-stack"><button className="back-link" onClick={() => navigate('careers')}><Icon name="arrowLeft" /> Back to Career Bank</button><section className="career-detail-hero"><div className="career-title-block"><span className={`career-icon xl ${career.colorTone || 'lavender'}`}><Icon name={career.iconKey || 'briefcase'} size={30} /></span><div><span className="match-pill"><Icon name="sparkles" size={13} /> Career profile</span><h1>{career.title}</h1><p>{career.domainId?.name || 'Career'} · Updated {new Date(career.updatedAt).toLocaleDateString()}</p></div></div><button className="button primary" onClick={() => navigate('quiz')}>Check my fit <Icon name="arrow" /></button></section>
    <div className="detail-layout"><div className="detail-main"><section className="panel prose-card"><span className="eyebrow">Career snapshot</span><h2>{career.title}</h2><p>{career.description || 'More details are being prepared for this career.'}</p><div className="snapshot-grid"><div><span className="snapshot-icon"><Icon name="briefcase" /></span><small>Typical salary</small><strong>{salary.currency || 'USD'} {salary.min?.toLocaleString() || '—'} – {salary.max?.toLocaleString() || '—'}</strong></div><div><span className="snapshot-icon"><Icon name="trend" /></span><small>Projected growth</small><strong>{career.growthRatePercent == null ? 'Not published' : `${career.growthRatePercent}%`}</strong></div><div><span className="snapshot-icon"><Icon name="target" /></span><small>Demand</small><strong>{(career.demand || 'medium').replace('_', ' ')}</strong></div></div></section><section className="panel"><span className="eyebrow">Skills map</span><h2>What you’ll need to thrive</h2><div className="skill-row">{skills.map((item) => <span key={item.skillId?._id || item.skillId}>{item.skillId?.name || 'Skill'} · {item.importance.replaceAll('_', ' ')}</span>)}</div></section>{career.educationPath && <section className="panel prose-card"><span className="eyebrow">Education path</span><h2>Ways into this career</h2><p>{career.educationPath}</p></section>}</div></div></div>
}

export default function CareerDetailWithIntelligence(props) {
  return <><ConnectedCareerDetailPage {...props} /><CareerIntelligencePanel careerSlug={props.careerId} navigate={props.navigate} /></>
}
