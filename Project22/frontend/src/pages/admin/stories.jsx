import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import AdminTable from '../../components/admin/AdminTable'
import { useEffect, useState } from 'react'
import { apiRequest, endpoints } from '../../services/pathseekerApi'

export default function StoriesAdmin() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    try { const { data } = await apiRequest(`${endpoints.admin.stories}?limit=100`); setStories(data.stories || []) }
    catch (err) { setError(err.message || 'Could not load stories.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const moderate = async (id, action) => {
    try { await apiRequest(`${endpoints.admin.stories}/${id}/${action}`, { method: 'PATCH' }); await load() }
    catch (err) { setError(err.message || 'Could not update the story.') }
  }

  const rows = stories.map(story => [`${story.authorName}|${story.authorName}|${story.submittedBy?.email || ''}`, story.domainId?.name || '—', story.status, new Date(story.createdAt).toLocaleDateString(), ''])

  return <div className="admin-stack"><PageHead eyebrow="Community" title="Success stories" description="Review and moderate real submissions."><button className="button soft" onClick={load}><Icon name="refresh" /> Refresh</button></PageHead>{error && <div className="panel form-error" role="alert">{error}</div>}{loading ? <div className="panel">Loading stories…</div> : <><AdminTable headings={['Author', 'Domain', 'Status', 'Submitted', '']} rows={rows} /><section className="panel">{stories.map(story => <div className="activity-row" key={story._id}><p><strong>{story.authorName}</strong><small>{story.storyText}</small></p><button className="button soft small" onClick={() => moderate(story._id, 'approve')}>Approve</button><button className="button soft small" onClick={() => moderate(story._id, 'request-changes')}>Request changes</button><button className="button ghost small" onClick={() => moderate(story._id, 'reject')}>Reject</button></div>)}</section></>}</div>
}
