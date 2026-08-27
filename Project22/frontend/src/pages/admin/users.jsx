import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import { useEffect, useState } from 'react'
import { apiRequest, endpoints } from '../../services/pathseekerApi'

export default function UsersAdmin({ navigate }) {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (query.trim()) params.set('q', query.trim())
      const { data } = await apiRequest(`${endpoints.admin.users}?${params}`)
      setUsers(data.users || [])
      setMeta(data.meta || null)
    } catch (err) {
      setError(err.message || 'Could not load users.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { setPage(1) }, [query])
  useEffect(() => {
    const timer = setTimeout(load, 250)
    return () => clearTimeout(timer)
    // `load` intentionally closes over the current page/query values.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, page])

  return <div className="admin-stack">
    <PageHead eyebrow="Community" title="Users" description="Live accounts and access state.">
      <button className="button soft" onClick={load}><Icon name="refresh" /> Refresh</button>
    </PageHead>
    <section className="admin-filterbar panel"><div className="admin-search"><Icon name="search" /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name or email" /></div></section>
    {error && <div className="panel form-error" role="alert">{error}</div>}
    {loading ? <div className="panel">Loading users…</div> : <section className="admin-table panel"><table><thead><tr><th>User</th><th>Stage</th><th>Email</th><th>Status</th><th /></tr></thead><tbody>{users.map(user => <tr key={user._id}><td>{user.name}</td><td>{user.stage || 'Staff'}</td><td>{user.email}</td><td>{user.status}</td><td><button className="button soft small" onClick={() => navigate('admin-user-editor', user._id)}>Edit</button></td></tr>)}</tbody></table>{!users.length && <p>No users match this search.</p>}</section>}
    {meta?.totalPages > 1 && <div className="form-actions"><button className="button ghost" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button><span>Page {page} of {meta.totalPages}</span><button className="button ghost" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</button></div>}
  </div>
}
