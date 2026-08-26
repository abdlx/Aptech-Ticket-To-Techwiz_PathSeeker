import Icon from '../../components/Icon'
import PageTitle from '../../components/common/PageTitle'
import { useEffect, useState } from 'react'
import { apiRequest, endpoints } from '../../services/pathseekerApi'

export default function SavedFiltersPage() {
  const [filters, setFilters] = useState([])
  const [skills, setSkills] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await apiRequest(endpoints.savedFilters)
      setFilters(data.savedFilters || [])
    } catch (err) { setError(err.message || 'Could not load saved filters.') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    load()
    apiRequest(endpoints.skills).then(({ data }) => setSkills(data.skills || [])).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async (event) => {
    event.preventDefault()
    setError('')
    try {
      const payload = { name: editing.name, salaryMin: Number(editing.salaryMin) || undefined, demand: editing.demand, alerts: editing.alerts, domainIds: editing.domainIds || [], skillIds: editing.skillIds || [] }
      const endpoint = editing._id ? `${endpoints.savedFilters}/${editing._id}` : endpoints.savedFilters
      await apiRequest(endpoint, { method: editing._id ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      setEditing(null)
      await load()
    } catch (err) { setError(err.message || 'Could not save the filter.') }
  }

  const remove = async (id) => {
    try { await apiRequest(`${endpoints.savedFilters}/${id}`, { method: 'DELETE' }); setFilters(current => current.filter(filter => filter._id !== id)) }
    catch (err) { setError(err.message || 'Could not delete the filter.') }
  }

  const apply = (filter) => {
    const params = new URLSearchParams()
    if (filter.domainIds?.length) params.set('domain', filter.domainIds.join(','))
    if (filter.skillIds?.length) params.set('skill', filter.skillIds.join(','))
    if (filter.salaryMin) params.set('salaryMin', filter.salaryMin)
    if (filter.demand && filter.demand !== 'any') params.set('demand', filter.demand)
    window.location.assign(`/careers?${params.toString()}`)
  }

  return <div className="page-stack"><PageTitle eyebrow="Career Bank" title="Saved searches and filters" copy="Your saved Career Bank preferences are persisted to your account." actions={<button className="button primary" onClick={() => setEditing({ name: '', salaryMin: '', demand: 'any', alerts: false, skillIds: [] })}><Icon name="plus" /> New saved filter</button>} />{error && <div className="panel form-error" role="alert">{error}</div>}{loading ? <div className="panel">Loading saved filters…</div> : <section className="saved-filter-grid">{filters.map(filter => <article className="panel" key={filter._id}><div><span className="filter-icon"><Icon name="filter" /></span></div><h3>{filter.name}</h3><p>{filter.salaryMin ? `$${Number(filter.salaryMin).toLocaleString()}+` : 'Any salary'} · {filter.demand}</p><span className={`alert-pill ${filter.alerts ? 'on' : ''}`}><Icon name="bell" /> Alerts {filter.alerts ? 'on' : 'off'}</span><div><button className="button soft small" onClick={() => apply(filter)}>Apply filter</button><button className="button ghost small" onClick={() => setEditing({ ...filter })}>Edit</button><button className="button ghost small" onClick={() => remove(filter._id)}>Delete</button></div></article>)}{!filters.length && <div className="panel">No saved filters yet.</div>}</section>}{editing && <div className="inline-editor panel"><h2>{editing._id ? 'Edit filter' : 'New filter'}</h2><form onSubmit={save}><label>Filter name<input required value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} /></label><label>Minimum salary<input type="number" value={editing.salaryMin || ''} onChange={e => setEditing({ ...editing, salaryMin: e.target.value })} /></label><label>Skills<select multiple value={editing.skillIds || []} onChange={e => setEditing({ ...editing, skillIds: Array.from(e.target.selectedOptions).map(o => o.value) })}>{skills.map(skill => <option key={skill._id} value={skill._id}>{skill.name}</option>)}</select></label><label>Demand<select value={editing.demand || 'any'} onChange={e => setEditing({ ...editing, demand: e.target.value })}><option value="any">Any</option><option value="very_high">Very high</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label><label className="check-row"><input type="checkbox" checked={Boolean(editing.alerts)} onChange={e => setEditing({ ...editing, alerts: e.target.checked })} /> Enable alerts</label><div><button className="button ghost" type="button" onClick={() => setEditing(null)}>Cancel</button><button className="button primary" type="submit">Save filter</button></div></form></div>}</div>
}
