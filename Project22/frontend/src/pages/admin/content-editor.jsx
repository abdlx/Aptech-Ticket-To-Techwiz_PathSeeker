import Icon from '../../components/Icon'
import PageHead from '../../components/admin/AdminEditorHead'
import { useEffect, useState } from 'react'
import { apiRequest, endpoints } from '../../services/pathseekerApi'

export default function AdminContentEditor({ navigate, contentId }) {
  const editing = Boolean(contentId)
  const [kind, setKind] = useState('resource')
  const [resourceType, setResourceType] = useState('pdf')
  const [mediaType, setMediaType] = useState('video')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')
  const [transcript, setTranscript] = useState('')
  const [tags, setTags] = useState('')
  const [targetAudience, setTargetAudience] = useState([])
  const [relatedCareerIds, setRelatedCareerIds] = useState([])
  const [careers, setCareers] = useState([])
  const [status, setStatus] = useState('draft')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(editing)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!editing) return
    Promise.all([apiRequest(`${endpoints.admin.resources}?limit=100`), apiRequest(`${endpoints.admin.media}?limit=100`), apiRequest(`${endpoints.admin.careers}?limit=100`)]).then(([r, m, c]) => {
      const resource = (r.data.resources || []).find(item => item._id === contentId)
      const media = (m.data.media || []).find(item => item._id === contentId)
      const item = resource || media
      if (!item) throw new Error('Content record not found.')
      setKind(resource ? 'resource' : 'media')
      setResourceType(resource?.type || 'pdf')
      setMediaType(media?.type || 'video')
      setTitle(item.title || '')
      setUrl(resource ? item.file?.url || '' : item.url || '')
      setDescription(item.description || '')
      setTranscript(item.transcript || '')
      setTags((item.tags || []).join(', '))
      setStatus(item.status || (item.active !== false ? 'published' : 'draft'))
      setTargetAudience(item.targetAudience || [])
      setRelatedCareerIds(item.relatedCareerIds || [])
      setCareers(c.data.careers || [])
    }).catch(err => setError(err.message || 'Could not load content.')).finally(() => setLoading(false))
  }, [contentId, editing])

  useEffect(() => { if (!editing) apiRequest(`${endpoints.admin.careers}?limit=100`).then(({ data }) => setCareers(data.careers || [])).catch(() => {}) }, [editing])

  const upload = async () => {
    if (!file) return null
    const form = new FormData()
    form.append('file', file)
    const { data } = await apiRequest(endpoints.admin.uploads, { method: 'POST', body: form, timeoutMs: 60000 })
    return data.asset
  }

  const save = async () => {
    setSaving(true); setError('')
    try {
      let uploaded = null
      if (file) uploaded = await upload()
      const finalUrl = uploaded?.url || url
      if (!finalUrl) throw new Error('Provide a URL or upload a file.')
      const tagsList = tags.split(',').map(v => v.trim()).filter(Boolean)
      const payload = kind === 'resource'
        ? { title, description, type: resourceType, file: uploaded || { url: finalUrl }, tags: tagsList, targetAudience, status, active: status === 'published' }
        : { title, type: mediaType, url: finalUrl, transcript, tags: tagsList, relatedCareerIds, status, active: status === 'published' }
      const endpoint = kind === 'resource' ? endpoints.admin.resources : endpoints.admin.media
      if (editing) await apiRequest(`${endpoint}/${contentId}`, { method: 'PATCH', body: JSON.stringify(payload) })
      else await apiRequest(endpoint, { method: 'POST', body: JSON.stringify(payload) })
      navigate('admin-content')
    } catch (err) { setError(err.message || 'Could not save content.') } finally { setSaving(false) }
  }

  if (loading) return <div className="admin-stack"><div className="panel">Loading content…</div></div>
  return <div className="admin-stack">
    <PageHead eyebrow="Learning library · Editor" title={editing ? 'Edit content' : 'Add content'} copy="Manage real content records with validated local file storage or controlled HTTP(S) URLs."><button className="button ghost" onClick={() => navigate('admin-content')}>Cancel</button><button className="button primary" disabled={!title || saving} onClick={save}>{saving ? 'Saving…' : 'Save'}</button></PageHead>
    {error && <div className="panel form-error" role="alert">{error}</div>}
    <section className="panel form-grid">
      <label>Content type<select disabled={editing} value={kind} onChange={e => setKind(e.target.value)}><option value="resource">Document resource</option><option value="media">Multimedia</option></select></label>
      <label>Title<input value={title} onChange={e => setTitle(e.target.value)} /></label>
      {kind === 'resource' ? <label>Resource type<select value={resourceType} onChange={e => setResourceType(e.target.value)}><option value="pdf">PDF</option><option value="checklist">Checklist</option><option value="infographic">Infographic</option><option value="template">Template</option></select></label> : <label>Media type<select value={mediaType} onChange={e => setMediaType(e.target.value)}><option value="video">Video</option><option value="audio">Audio</option><option value="animation">Animation</option></select></label>}
      <label className="full">Description<textarea value={description} onChange={e => setDescription(e.target.value)} /></label>
      {kind === 'media' && <label className="full">Transcript<textarea value={transcript} onChange={e => setTranscript(e.target.value)} /></label>}
      <label className="full">Upload file<input type="file" accept={kind === 'resource' ? 'application/pdf,image/png,image/jpeg,image/webp' : 'video/mp4,video/webm,audio/mpeg,audio/wav'} onChange={e => setFile(e.target.files?.[0] || null)} /></label>
      <label className="full">Or controlled URL<input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" /></label>
      <label className="full">Tags<input value={tags} onChange={e => setTags(e.target.value)} placeholder="beginner, scholarship, skill-building" /></label>
      {kind === 'resource' ? <label className="full">Target audience<select multiple value={targetAudience} onChange={e => setTargetAudience(Array.from(e.target.selectedOptions).map(o => o.value))}><option value="student">Student</option><option value="graduate">Graduate</option><option value="professional">Professional</option></select></label> : <label className="full">Related careers<select multiple value={relatedCareerIds.map(id => id?._id || id)} onChange={e => setRelatedCareerIds(Array.from(e.target.selectedOptions).map(o => o.value))}>{careers.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}</select></label>}
      <label>Status<select value={status} onChange={e=>setStatus(e.target.value)}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
      <p className="form-help"><Icon name="shield"/> Uploaded files are signature-checked, size-limited, renamed to collision-safe IDs, and stored outside the frontend source tree.</p>
    </section>
  </div>
}
