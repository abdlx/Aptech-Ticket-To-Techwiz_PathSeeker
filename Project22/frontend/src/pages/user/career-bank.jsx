import Icon from '../../components/Icon'
import CareerCard from '../../components/user/CareerCard'
import { useEffect, useState } from 'react'
import { apiRequest, endpoints, mapCareer } from '../../services/pathseekerApi'

export default function CareerBankPage({ navigate }) {
  const initialParams = new URLSearchParams(window.location.search)
  const [query, setQuery] = useState('')
  const [domain, setDomain] = useState(initialParams.get('domain') || '')
  const [demand, setDemand] = useState(initialParams.get('demand') || '')
  const [salaryMin, setSalaryMin] = useState(initialParams.get('salaryMin') || '')
  const [sort, setSort] = useState('relevance')
  const [careers, setCareers] = useState([])
  const [domains, setDomains] = useState([])
  const [skills, setSkills] = useState([])
  const [skill, setSkill] = useState(initialParams.get('skill') || '')
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [suggestions, setSuggestions] = useState([])

  useEffect(() => {
    Promise.all([apiRequest(endpoints.domains), apiRequest(endpoints.skills)]).then(([domainResult, skillResult]) => {
      setDomains(domainResult.data.domains || [])
      setSkills(skillResult.data.skills || [])
    }).catch(() => {})
  }, [])
  useEffect(() => { apiRequest(endpoints.bookmarks).then(({ data }) => setBookmarks(data.bookmarks || [])).catch(() => {}) }, [])
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true); setError('')
      try {
        const params = new URLSearchParams({ page: String(page), limit: '12', sort })
        if (query.trim()) params.set('q', query.trim())
        if (domain) params.set('domain', domain)
        if (demand) params.set('demand', demand)
        if (skill) params.set('skill', skill)
        if (salaryMin) params.set('salaryMin', salaryMin)
        const { data } = await apiRequest(`${endpoints.careers}?${params}`)
        setCareers((data.careers || []).map((career) => mapCareer(career)))
        setMeta(data.meta)
      } catch (err) { setError(err.message || 'Could not load careers.') }
      finally { setLoading(false) }
    }, 250)
    return () => clearTimeout(timer)
  }, [query, domain, skill, demand, salaryMin, sort, page])
  useEffect(() => {
    if (query.trim().length < 2) { setSuggestions([]); return undefined }
    const timer = setTimeout(() => { apiRequest(`${endpoints.searchSuggestions}?q=${encodeURIComponent(query.trim())}`).then(({ data }) => setSuggestions(data.suggestions || [])).catch(() => {}) }, 200)
    return () => clearTimeout(timer)
  }, [query])

  const toggleSaved = async (careerId) => {
    const existing = bookmarks.find((item) => item.itemType === 'career' && item.itemId === careerId)
    try {
      if (existing) {
        await apiRequest(`${endpoints.bookmarks}/${existing._id}`, { method: 'DELETE' })
        setBookmarks((items) => items.filter((item) => item._id !== existing._id))
      } else {
        const career = careers.find((item) => item.id === careerId)
        if (!career?._id) return
        const { data } = await apiRequest(endpoints.bookmarks, { method: 'POST', body: JSON.stringify({ itemType: 'career', itemId: career._id }) })
        setBookmarks((items) => [data.bookmark, ...items])
      }
    } catch (err) { setError(err.message || 'Could not update bookmark.') }
  }

  return <div className="career-bank page-stack">
    <section className="page-intro"><div><span className="eyebrow">Career Bank</span><h1>Explore where you could go</h1><p>Search the live career catalog and compare salary, skills, demand, and growth.</p></div><div className="intro-stat"><strong>{meta?.total ?? '—'}</strong><span>career profiles<br /><small>from MongoDB</small></span></div></section>
    <section className="search-panel panel">
      <div className="career-search"><Icon name="search" /><input value={query} onChange={(e) => { setPage(1); setQuery(e.target.value) }} placeholder="Search careers, skills, or industries" list="career-suggestions" /><datalist id="career-suggestions">{suggestions.map((item) => <option key={`${item.type}-${item.id}`} value={item.label} />)}</datalist><button onClick={() => setPage(1)}>Search</button></div>
      <div className="filter-row"><div className="filter-chips"><button className={!domain ? 'active' : ''} onClick={() => { setDomain(''); setPage(1) }}>All</button>{domains.map((item) => <button key={item.slug} className={domain === item.slug ? 'active' : ''} onClick={() => { setDomain(item.slug); setPage(1) }}>{item.name}</button>)}</div></div>
      <div className="filter-row"><label>Skill <select value={skill} onChange={(e) => { setSkill(e.target.value); setPage(1) }}><option value="">Any</option>{skills.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label><label>Demand <select value={demand} onChange={(e) => { setDemand(e.target.value); setPage(1) }}><option value="">Any</option><option value="very_high">Very high</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label>Salary <select value={salaryMin} onChange={(e) => { setSalaryMin(e.target.value); setPage(1) }}><option value="">Any</option><option value="50000">$50k+</option><option value="70000">$70k+</option><option value="90000">$90k+</option></select></label><label>Sort <select value={sort} onChange={(e) => setSort(e.target.value)}><option value="relevance">Best match</option><option value="salary">Highest salary</option><option value="growth">Fastest growth</option></select></label></div>
    </section>
    {error && <div className="panel form-error" role="alert">{error}</div>}{!loading && !careers.length && suggestions.some(item=>item.corrected) && <div className="panel"><strong>Did you mean?</strong> {suggestions.filter(item=>item.corrected).map(item=><button key={item.id} className="button soft small" onClick={()=>{setQuery(item.label);setPage(1)}}>{item.label}</button>)}</div>}
    <section><div className="results-bar"><p><strong>{meta?.total ?? careers.length} careers</strong> matching your filters</p></div>{loading ? <div className="panel">Loading careers…</div> : careers.length ? <div className="career-grid bank-grid">{careers.map((career) => <CareerCard key={career._id} career={career} navigate={navigate} saved={bookmarks.some((b) => b.itemType === 'career' && b.itemId === career._id)} toggleSaved={toggleSaved} />)}</div> : <div className="empty-state"><img src="/assets/navi/navi-thinking.png" alt="Navi thinking" /><h2>No matches</h2><p>Try a broader search or remove a filter.</p></div>}</section>
    {meta?.totalPages > 1 && <div className="form-actions"><button className="button ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button><span>Page {page} of {meta.totalPages}</span><button className="button ghost" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>Next</button></div>}
  </div>
}
