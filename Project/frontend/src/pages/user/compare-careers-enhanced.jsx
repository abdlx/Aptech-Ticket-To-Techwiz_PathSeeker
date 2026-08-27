import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import PageTitle from '../../components/common/PageTitle'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { exportToPdf } from '../../lib/pdfExport'
import { careersApi } from '../../services/careersApi'
import { personalizationApi } from '../../services/personalizationApi'

function salary(career) {
  const value = career.expectedSalary || {}
  if (value.median != null) return `${value.currency || 'USD'} ${value.median.toLocaleString()} median`
  if (value.min != null || value.max != null) return `${value.currency || 'USD'} ${value.min?.toLocaleString() || '-'} - ${value.max?.toLocaleString() || '-'}`
  return 'Not published'
}

export default function CompareCareersEnhancedPage({ navigate }) {
  const [overrideSlugs, setOverrideSlugs] = useState(null)
  const [notice, setNotice] = useState('')
  const careersQuery = useQuery({
    queryKey: ['careers', 'list', 'compare'],
    queryFn: ({ signal }) => careersApi.getCareers({ limit: 50 }, { signal }), staleTime: 60_000,
  })
  const allCareers = careersQuery.data?.data?.careers || []
  const selectedSlugs = overrideSlugs || allCareers.slice(0, 3).map((career) => career.slug)
  const selected = selectedSlugs.map((slug) => allCareers.find((career) => career.slug === slug)).filter(Boolean)

  const saveMutation = useMutation({
    mutationFn: () => personalizationApi.saveComparison({
      name: selected.map((career) => career.title).join(' vs '),
      careerIds: selected.map((career) => career._id),
    }),
    onSuccess: () => setNotice('Comparison saved to your account.'),
    onError: (error) => setNotice(error.message),
  })

  if (careersQuery.isLoading) return <PageSkeleton />
  if (careersQuery.error) return <ErrorState message={careersQuery.error.message} onRetry={careersQuery.refetch} />

  const update = (index, slug) => setOverrideSlugs(selectedSlugs.map((value, itemIndex) => itemIndex === index ? slug : value))
  const rows = [
    ['Median salary', salary],
    ['Projected growth', (career) => career.growthRatePercent == null ? 'Not published' : `${career.growthRatePercent}%`],
    ['Market demand', (career) => (career.demand || 'medium').replaceAll('_', ' ')],
    ['Domain', (career) => career.domainId?.name || 'Career'],
    ['Preparation estimate', (career) => career.timeToJobReady ? `${career.timeToJobReady.minMonths ?? 0}-${career.timeToJobReady.maxMonths ?? 0} months` : 'Varies'],
    ['Evidence year', (career) => career.dataSource?.salaryYear || 'Not specified'],
  ]

  return (
    <div className="page-stack compare-export-area">
      <Breadcrumbs items={[{ label: 'Career Bank', to: 'careers' }, { label: 'Compare Careers' }]} navigate={navigate} />
      <PageTitle eyebrow="Career comparison" title="See the tradeoffs clearly" copy="Compare salary evidence, growth, preparation, and core skills side by side." actions={<div className="page-action-row"><button className="button soft" onClick={() => exportToPdf('PathSeeker Career Comparison')}><Icon name="download" /> Export comparison</button><button className="button primary" onClick={() => saveMutation.mutate()} disabled={selected.length < 2 || saveMutation.isPending}><Icon name="bookmark" /> {saveMutation.isPending ? 'Saving...' : 'Save comparison'}</button></div>} />
      {notice && <p className="inline-notice" role="status">{notice}</p>}

      <section className="compare-table panel">
        <div className="compare-head"><span>Compare</span>{selected.map((career, index) => <div key={`${career._id}-${index}`}><span className={`career-icon ${career.colorTone || 'lavender'}`}><Icon name={career.iconKey || 'briefcase'} /></span><select value={career.slug} onChange={(event) => update(index, event.target.value)} aria-label={`Career ${index + 1}`}>{allCareers.map((item) => <option value={item.slug} key={item._id}>{item.title}</option>)}</select><button onClick={() => navigate('career-detail', career.slug)}>View profile</button></div>)}</div>
        {rows.map(([label, value]) => <div className="compare-row" key={label}><strong>{label}</strong>{selected.map((career) => <span key={`${career._id}-${label}`}>{value(career)}</span>)}</div>)}
        <div className="compare-row skills"><strong>Core skills</strong>{selected.map((career) => <span key={`${career._id}-skills`}>{(career.requiredSkills || []).slice(0, 4).map((skill) => <em key={skill.skillId?._id || skill.skillId}>{skill.skillId?.name || 'Skill'}</em>)}</span>)}</div>
        <div className="compare-row"><strong>Primary source</strong>{selected.map((career) => <span key={`${career._id}-source`}>{career.dataSource?.url ? <a href={career.dataSource.url} target="_blank" rel="noreferrer">{career.dataSource.occupationLabel || career.dataSource.name}</a> : 'Not linked'}</span>)}</div>
      </section>
      <p className="resource-disclaimer">Salary figures are occupational medians for the stated source geography and year, not personal salary predictions. Compare local job postings, licensing requirements, and living costs before deciding.</p>
    </div>
  )
}
