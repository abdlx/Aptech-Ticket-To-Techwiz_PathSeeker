import Icon from '../../components/Icon'
import CareerCard from '../../components/user/CareerCard'
import { useMemo, useState } from 'react'
import { careers } from '../../data'

export default function CareerBankPage({ navigate }) {
  const [query, setQuery] = useState('')
  const [field, setField] = useState('All careers')
  const [saved, setSaved] = useState([])
  const filtered = useMemo(() => careers.filter((career) => (field === 'All careers' || career.field.includes(field)) && `${career.title} ${career.skills.join(' ')}`.toLowerCase().includes(query.toLowerCase())), [query, field])
  const toggleSaved = (id) => setSaved((items) => items.includes(id) ? items.filter((x) => x !== id) : [...items, id])
  return (
    <div className="career-bank page-stack">
      <section className="page-intro"><div><span className="eyebrow">Career Bank</span><h1>Explore where you could go</h1><p>Compare salary, skills, demand, and the work itself across hundreds of career paths.</p></div><div className="intro-stat"><strong>240+</strong><span>career profiles<br /><small>curated by experts</small></span></div></section>
      <section className="search-panel panel"><div className="career-search"><Icon name="search" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search careers, skills, or industries" /><button>Search</button></div><div className="filter-row"><div className="filter-chips">{['All careers', 'Design', 'Technology', 'Business', 'Data'].map((item) => <button key={item} className={field === item ? 'active' : ''} onClick={() => setField(item)}>{item}</button>)}</div><button className="advanced-filter"><Icon name="filter" /> More filters <span>2</span></button></div><div className="active-filters"><span>High demand <button>×</button></span><span>$60k+ salary <button>×</button></span><button>Clear all</button></div></section>
      <section><div className="results-bar"><p><strong>{filtered.length || 0} careers</strong> matching your filters</p><label>Sort by <select defaultValue="Best match"><option>Best match</option><option>Highest salary</option><option>Fastest growth</option></select></label></div>{filtered.length > 0 ? <div className="career-grid bank-grid">{filtered.map((career) => <CareerCard key={career.id} career={career} navigate={navigate} saved={saved.includes(career.id)} toggleSaved={toggleSaved} />)}</div> : <div className="empty-state"><img src="/assets/navi/navi-thinking.png" alt="Navi thinking" /><h2>No exact matches yet</h2><p>Try a broader keyword or remove one of your filters.</p><button className="button soft" onClick={() => { setQuery(''); setField('All careers') }}>Clear search</button></div>}</section>
    </div>
  )
}
