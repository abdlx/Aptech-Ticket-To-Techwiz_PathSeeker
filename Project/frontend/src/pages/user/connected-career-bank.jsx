import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../../components/Icon'
import CareerCard from '../../components/user/CareerCard'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { careersApi } from '../../services/careersApi'

function toCard(career) {
  const salary = career.expectedSalary || {}
  return { id: career.slug, title: career.title, field: career.domainId?.name || 'Career', match: null, salary: salary.min != null || salary.max != null ? `${salary.currency || 'USD'} ${salary.min?.toLocaleString() || '—'} – ${salary.max?.toLocaleString() || '—'}` : 'Salary varies', demand: `${(career.demand || 'medium').replace('_', ' ')} demand`, growth: career.growthRatePercent, icon: career.iconKey || 'briefcase', tone: career.colorTone || 'lavender', skills: career.requiredSkills?.map((item) => item.skillId?.name).filter(Boolean) || [], summary: career.description }
}

export default function ConnectedCareerBankPage({ navigate }) {
  const [params, setParams] = useSearchParams(); const [search, setSearch] = useState(params.get('q') || '')
  useEffect(() => { const timer = setTimeout(() => setParams((current) => { const next = new URLSearchParams(current); search ? next.set('q', search) : next.delete('q'); next.delete('page'); return next }, { replace: true }), 350); return () => clearTimeout(timer) }, [search, setParams])
  const filters = { q: params.get('q') || undefined, domain: params.get('domain') || undefined, demand: params.get('demand') || undefined, sort: params.get('sort') || 'relevance', page: params.get('page') || 1, limit: 20 }
  const careersQuery = useQuery({ queryKey: queryKeys.careers.list(filters), queryFn: ({ signal }) => careersApi.list(filters, { signal }), staleTime: 300_000 })
  const domainsQuery = useQuery({ queryKey: ['domains'], queryFn: careersApi.domains, staleTime: 300_000 })
  const update = (key, value) => setParams((current) => { const next = new URLSearchParams(current); value ? next.set(key, value) : next.delete(key); next.delete('page'); return next })
  if (careersQuery.isLoading) return <PageSkeleton />
  if (careersQuery.error) return <ErrorState message={careersQuery.error.message} onRetry={careersQuery.refetch} />
  const careers = (careersQuery.data?.data?.careers || []).map(toCard); const meta = careersQuery.data?.meta; const domains = domainsQuery.data?.data?.domains || []
  return <div className="career-bank page-stack"><section className="page-intro"><div><span className="eyebrow">Career Bank</span><h1>Explore where you could go</h1><p>Search persistent career profiles by domain, demand, salary, and growth.</p></div><div className="intro-stat"><strong>{meta?.total || 0}</strong><span>career profiles<br /><small>from PathSeeker</small></span></div></section>
    <section className="search-panel panel"><div className="career-search"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search careers, skills, or industries" /></div><div className="filter-row"><div className="filter-chips"><button className={!filters.domain ? 'active' : ''} onClick={() => update('domain', '')}>All careers</button>{domains.map((domain) => <button key={domain._id} className={filters.domain === domain.slug ? 'active' : ''} onClick={() => update('domain', domain.slug)}>{domain.name}</button>)}</div><label>Sort <select value={filters.sort} onChange={(event) => update('sort', event.target.value)}><option value="relevance">Relevance</option><option value="salary">Highest salary</option><option value="growth">Fastest growth</option></select></label></div></section>
    <section><div className="results-bar"><p><strong>{meta?.total || careers.length} careers</strong> matching your filters</p></div>{careers.length ? <div className="career-grid bank-grid">{careers.map((career) => <CareerCard key={career.id} career={career} navigate={navigate} />)}</div> : <EmptyState title="No matching careers" message="Try a broader keyword or clear the domain filter." />}</section></div>
}
