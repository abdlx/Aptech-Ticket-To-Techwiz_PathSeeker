import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import Status from '../../components/admin/Status'
import { useEffect, useState } from 'react'
import { apiRequest, endpoints, mapCareer } from '../../services/pathseekerApi'

export default function CareersAdmin({ navigate }) {
  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await apiRequest(`${endpoints.admin.careers}?page=${page}&limit=20`)
      setCareers((data.careers || []).map(mapCareer))
      setMeta(data.meta || null)
    } catch (err) {
      setError(err.message || 'Could not load careers.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const setStatus = async (id, status) => { try { await apiRequest(endpoints.admin.careerStatus(id, status), { method: 'PATCH' }); await load() } catch (err) { setError(err.message || 'Could not change publication status.') } }

  const remove = async (id) => {
    if (!window.confirm('Delete this career profile?')) return
    try {
      await apiRequest(`${endpoints.admin.careers}/${id}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setError(err.message || 'Could not delete the career.')
    }
  }

  return <div className="admin-stack">
    <PageHead eyebrow="Career Bank" title="Career profiles" description="Manage live career records."><button className="button primary" onClick={() => navigate('admin-career-editor')}><Icon name="plus" /> New career profile</button></PageHead>
    {error && <div className="panel form-error" role="alert">{error}</div>}
    {loading ? <div className="panel">Loading careers…</div> : <div className="career-admin-grid">{careers.map(career => <article key={career._id} className="panel"><div><span className={`career-icon ${career.tone}`}><Icon name={career.icon} /></span><Status tone={career.raw?.status === 'published' ? 'success' : career.raw?.status === 'archived' ? 'draft' : 'draft'}>{career.raw?.status || (career.raw?.active === false ? 'draft' : 'published')}</Status></div><h3>{career.title}</h3><p>{career.field}</p><div><span><small>Salary</small><strong>{career.salary}</strong></span><span><small>Growth</small><strong>{career.growth}</strong></span></div><div><button onClick={() => navigate('admin-career-editor', career._id)}><Icon name="edit" /> Edit</button>{career.raw?.status !== 'published' && <button onClick={() => setStatus(career._id, 'published')}>Publish</button>}{career.raw?.status === 'published' && <button onClick={() => setStatus(career._id, 'archived')}>Archive</button>}{career.raw?.status !== 'draft' && career.raw?.status !== 'published' && <button onClick={() => setStatus(career._id, 'draft')}>Draft</button>}<button onClick={() => remove(career._id)}><Icon name="close" /> Delete</button></div></article>)}</div>}
    {meta?.totalPages > 1 && <div className="form-actions"><button className="button ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page} of {meta.totalPages}</span><button className="button ghost" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</button></div>}
  </div>
}
