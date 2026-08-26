import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import { useEffect, useState } from 'react'
import { apiRequest, endpoints } from '../../services/pathseekerApi'

export default function FeedbackAdmin() {
  const [items, setItems] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      const [feedbackResult, usersResult] = await Promise.all([
        apiRequest(`${endpoints.admin.feedback}?limit=100`),
        apiRequest(endpoints.admin.feedbackAssignees),
      ])
      setItems(feedbackResult.data.feedback || [])
      setUsers(usersResult.data.users || [])
    } catch (err) { setError(err.message || 'Could not load feedback.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const triage = async (id, patch) => {
    try {
      await apiRequest(`${endpoints.admin.feedback}/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
      await load()
    } catch (err) { setError(err.message || 'Could not update feedback.') }
  }

  const respond = async (id) => {
    const response = window.prompt('Response to the user')
    if (!response) return
    try {
      await apiRequest(`${endpoints.admin.feedback}/${id}/respond`, { method: 'PATCH', body: JSON.stringify({ response, status: 'resolved' }) })
      await load()
    } catch (err) { setError(err.message || 'Could not respond to feedback.') }
  }

  return <div className="admin-stack"><PageHead eyebrow="Community" title="Feedback inbox" description="Triage, assign, respond to, and resolve real user feedback."><button className="button soft" onClick={load}><Icon name="refresh" /> Refresh</button></PageHead>{error && <div className="panel form-error" role="alert">{error}</div>}{loading ? <div className="panel">Loading feedback…</div> : <section className="panel">{items.map(item => <article className="activity-row" key={item._id}><p><strong>{item.category} · {item.userId?.name || 'User'}</strong><small>{item.message}</small><small>Status: {item.status}{item.assignee?.name ? ` · Assigned to ${item.assignee.name}` : ''}{item.response ? ` · Response: ${item.response}` : ''}</small></p><div className="form-actions"><select value={item.status} onChange={e => triage(item._id, { status: e.target.value })}><option value="open">Open</option><option value="in_review">In review</option><option value="resolved">Resolved</option></select><select value={item.assignee?._id || ''} onChange={e => triage(item._id, { assignee: e.target.value || null })}><option value="">Unassigned</option>{users.map(user => <option key={user._id} value={user._id}>{user.name} · {user.role}</option>)}</select><button className="button soft small" onClick={() => respond(item._id)}>Respond</button><button className="button ghost small" onClick={() => { const note = window.prompt('Internal note', item.internalNotes || ''); if (note !== null) triage(item._id, { internalNotes: note }) }}>Internal note</button></div></article>)}{!items.length && <p>No feedback yet.</p>}</section>}</div>
}
