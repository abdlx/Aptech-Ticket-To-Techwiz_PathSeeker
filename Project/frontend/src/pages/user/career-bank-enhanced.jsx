import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Icon from '../../components/Icon'
import CareerCard from '../../components/user/CareerCard'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { careersApi } from '../../services/careersApi'
import { personalizationApi } from '../../services/personalizationApi'

function salaryLabel(salary = {}) {
  if (salary.median != null) return `${salary.currency || 'USD'} ${salary.median.toLocaleString()} median`
  if (salary.min != null || salary.max != null) {
    return `${salary.currency || 'USD'} ${salary.min?.toLocaleString() || '-'} - ${salary.max?.toLocaleString() || '-'}`
  }
  return 'Salary varies'
}

function toCard(career) {
  return {
    id: career.slug, _id: career._id, title: career.title,
    field: career.domainId?.name || 'Career', match: null,
    salary: salaryLabel(career.expectedSalary),
    demand: `${(career.demand || 'medium').replaceAll('_', ' ')} demand`,
    growth: career.growthRatePercent, icon: career.iconKey || 'briefcase',
    tone: career.colorTone || 'lavender',
    skills: career.requiredSkills?.map((item) => item.skillId?.name).filter(Boolean) || [],
    summary: career.summary || career.description,
  }
}

export default function CareerBankEnhancedPage({ navigate }) {
  const queryClient = useQueryClient()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') || '')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setParams((current) => {
        const next = new URLSearchParams(current)
        search ? next.set('q', search) : next.delete('q')
        next.delete('page')
        return next
      }, { replace: true })
    }, 350)
    return () => clearTimeout(timer)
  }, [search, setParams])

  const filters = useMemo(() => ({
    q: params.get('q') || undefined,
    domain: params.get('domain') || undefined,
    skill: params.get('skill') || undefined,
    demand: params.get('demand') || undefined,
    salaryMin: params.get('salaryMin') || undefined,
    sort: params.get('sort') || 'relevance',
    page: params.get('page') || 1,
    limit: 12,
  }), [params])

  const careersQuery = useQuery({
    queryKey: queryKeys.careers.list(filters),
    queryFn: ({ signal }) => careersApi.list(filters, { signal }), staleTime: 300_000,
  })
  const domainsQuery = useQuery({ queryKey: ['domains'], queryFn: careersApi.domains, staleTime: 300_000 })
  const skillsQuery = useQuery({ queryKey: ['skills'], queryFn: ({ signal }) => careersApi.skills({}, { signal }), staleTime: 300_000 })
  const suggestionsQuery = useQuery({
    queryKey: ['career-suggestions', search],
    queryFn: ({ signal }) => careersApi.suggestions(search, { signal }),
    enabled: search.trim().length >= 2 && search !== params.get('q'), staleTime: 30_000,
  })
  const bookmarksQuery = useQuery({
    queryKey: queryKeys.bookmarks.list(),
    queryFn: ({ signal }) => personalizationApi.getBookmarks({ limit: 100 }, { signal }),
  })

  const bookmarkMutation = useMutation({
    mutationFn: async (career) => {
      const existing = (bookmarksQuery.data?.data?.bookmarks || []).find(
        (bookmark) => bookmark.itemType === 'career' && bookmark.itemId?._id === career._id,
      )
      return existing
        ? personalizationApi.removeBookmark(existing._id)
        : personalizationApi.addBookmark({ itemType: 'career', itemId: career._id })
    },
    onSuccess: () => {
      setNotice('Saved careers updated.')
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
    onError: (error) => setNotice(error.message),
  })

  const saveFilterMutation = useMutation({
    mutationFn: () => {
      const domains = domainsQuery.data?.data?.domains || []
      const skills = skillsQuery.data?.data?.skills || []
      const selectedDomain = domains.find((domain) => domain.slug === filters.domain)
      const selectedSkill = skills.find((skill) => skill.slug === filters.skill)
      const labels = [selectedDomain?.name, selectedSkill?.name, filters.demand?.replaceAll('_', ' ')].filter(Boolean)
      return personalizationApi.createSavedFilter({
        name: labels.length ? labels.join(' + ') : 'All careers',
        domainIds: selectedDomain ? [selectedDomain._id] : [],
        skillIds: selectedSkill ? [selectedSkill._id] : [],
        salaryMin: filters.salaryMin ? Number(filters.salaryMin) : undefined,
        demand: filters.demand || 'any', alerts: false,
      })
    },
    onSuccess: () => {
      setNotice('Filter saved. You can reopen it from Saved Filters.')
      queryClient.invalidateQueries({ queryKey: queryKeys.savedFilters.list() })
    },
    onError: (error) => setNotice(error.message),
  })

  const update = (key, value) => setParams((current) => {
    const next = new URLSearchParams(current)
    value ? next.set(key, value) : next.delete(key)
    next.delete('page')
    return next
  })

  if (careersQuery.isLoading) return <PageSkeleton />
  if (careersQuery.error) return <ErrorState message={careersQuery.error.message} onRetry={careersQuery.refetch} />

  const careers = (careersQuery.data?.data?.careers || []).map(toCard)
  const meta = careersQuery.data?.data?.meta
  const domains = domainsQuery.data?.data?.domains || []
  const skills = skillsQuery.data?.data?.skills || []
  const suggestions = suggestionsQuery.data?.data?.suggestions || []
  const bookmarkedIds = new Set((bookmarksQuery.data?.data?.bookmarks || [])
    .filter((bookmark) => bookmark.itemType === 'career')
    .map((bookmark) => bookmark.itemId?._id))

  return (
    <div className="career-bank page-stack">
      <section className="page-intro">
        <div><span className="eyebrow">Career Bank</span><h1>Explore where you could go</h1><p>Compare researched career profiles using skills, demand, salary, and growth evidence.</p></div>
        <div className="intro-stat"><strong>{meta?.total || 0}</strong><span>career profiles<br /><small>across 10 domains</small></span></div>
      </section>

      <section className="search-panel panel">
        <div className="career-search suggestion-anchor">
          <Icon name="search" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search careers, skills, or industries" aria-label="Search careers" />
          {suggestions.length > 0 && (
            <div className="suggestion-menu" role="listbox" aria-label="Search suggestions">
              {suggestions.map((suggestion) => (
                <button key={`${suggestion.type}-${suggestion.id}`} onClick={() => setSearch(suggestion.label)}>
                  <Icon name={suggestion.type === 'skill' ? 'sparkles' : 'briefcase'} />
                  <span>{suggestion.label}<small>{suggestion.corrected ? 'Suggested correction' : suggestion.type}</small></span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="filter-row"><div className="filter-chips"><button className={!filters.domain ? 'active' : ''} onClick={() => update('domain', '')}>All careers</button>{domains.map((domain) => <button key={domain._id} className={filters.domain === domain.slug ? 'active' : ''} onClick={() => update('domain', domain.slug)}>{domain.name}</button>)}</div></div>
        <div className="career-advanced-filters">
          <label>Skill<select value={filters.skill || ''} onChange={(event) => update('skill', event.target.value)}><option value="">Any skill</option>{skills.map((skill) => <option value={skill.slug} key={skill._id}>{skill.name}</option>)}</select></label>
          <label>Demand<select value={filters.demand || ''} onChange={(event) => update('demand', event.target.value)}><option value="">Any demand</option><option value="medium">Medium</option><option value="high">High</option><option value="very_high">Very high</option></select></label>
          <label>Minimum salary<select value={filters.salaryMin || ''} onChange={(event) => update('salaryMin', event.target.value)}><option value="">Any salary</option><option value="75000">USD 75,000+</option><option value="100000">USD 100,000+</option><option value="125000">USD 125,000+</option></select></label>
          <label>Sort<select value={filters.sort} onChange={(event) => update('sort', event.target.value)}><option value="relevance">Relevance</option><option value="salary">Highest salary</option><option value="growth">Fastest growth</option></select></label>
          <button className="button soft small" onClick={() => saveFilterMutation.mutate()} disabled={saveFilterMutation.isPending}><Icon name="bookmark" /> {saveFilterMutation.isPending ? 'Saving...' : 'Save this filter'}</button>
        </div>
        {notice && <p className="inline-notice" role="status">{notice}</p>}
      </section>

      <section>
        <div className="results-bar"><p><strong>{meta?.total || careers.length} careers</strong> matching your filters</p><button className="button ghost small" onClick={() => navigate('compare')}>Compare careers</button></div>
        {careers.length ? <div className="career-grid bank-grid">{careers.map((career) => <CareerCard key={career.id} career={career} navigate={navigate} saved={bookmarkedIds.has(career._id)} toggleSaved={() => bookmarkMutation.mutate(career)} />)}</div> : <EmptyState title="No matching careers" message="Try a broader keyword or clear one of the filters." />}
        {meta?.pages > 1 && <div className="pagination-row"><button className="button ghost small" disabled={Number(filters.page) <= 1} onClick={() => update('page', Number(filters.page) - 1)}>Previous</button><span>Page {meta.page} of {meta.pages}</span><button className="button ghost small" disabled={Number(filters.page) >= meta.pages} onClick={() => update('page', Number(filters.page) + 1)}>Next</button></div>}
      </section>
    </div>
  )
}
