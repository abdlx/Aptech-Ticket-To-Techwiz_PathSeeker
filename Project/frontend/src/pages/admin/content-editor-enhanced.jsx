import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import Icon from '../../components/Icon'
import Head from '../../components/admin/AdminEditorHead'
import Field from '../../components/admin/AdminField'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { adminApi } from '../../services/adminApi'

const emptyForm = {
  kind: 'media', title: '', description: '', type: 'video', url: '', externalUrl: '',
  thumbnailUrl: '', publisherName: '', transcript: '', tags: '', pageCount: '',
  authorName: 'PathSeeker Editorial', version: '1.0', status: 'draft', fileAsset: null,
}
const csv = (value) => value.split(',').map((item) => item.trim()).filter(Boolean)

function fromMedia(item) {
  return { ...emptyForm, kind: 'media', title: item.title || '', description: item.description || '', type: item.type || 'video', url: item.url || '', externalUrl: item.externalUrl || '', thumbnailUrl: item.thumbnailUrl || '', publisherName: item.publisherName || '', transcript: item.transcript || '', tags: (item.tags || []).join(', '), status: item.status || (item.active ? 'published' : 'draft') }
}
function fromResource(item) {
  return { ...emptyForm, kind: 'resource', title: item.title || '', description: item.description || '', type: item.type || 'pdf', url: item.file?.url || '', fileAsset: item.file || null, tags: (item.tags || []).join(', '), pageCount: item.pageCount ?? '', authorName: item.authorName || 'PathSeeker Editorial', version: item.version || '1.0', status: item.status || (item.active ? 'published' : 'draft') }
}

export default function AdminContentEditorEnhanced({ navigate, contentId }) {
  const queryClient = useQueryClient()
  const location = useLocation()
  const searchParams = new URLSearchParams(window.location.search)
  const identifier = contentId || searchParams.get('career') || searchParams.get('id') || decodeURIComponent(location.pathname.split('/').filter(Boolean).at(-1) || 'new')
  const isNew = !identifier || identifier === 'new'
  const [draft, setDraft] = useState(null)
  const [notice, setNotice] = useState('')
  const uploadMutation = useMutation({
    mutationFn: (file) => adminApi.uploadFile(file),
    onSuccess: (result) => {
      const asset = result.data.asset
      setDraft({ ...form, url: asset.url, fileAsset: asset })
      setNotice('File uploaded. Save the content record to persist this asset.')
    },
    onError: (error) => setNotice(error.message),
  })

  const resourcesQuery = useQuery({ queryKey: ['admin', 'resources', 'editor'], queryFn: ({ signal }) => adminApi.getResources({ limit: 100 }, { signal }), enabled: !isNew })
  const mediaQuery = useQuery({ queryKey: ['admin', 'media', 'editor'], queryFn: ({ signal }) => adminApi.getMedia({ limit: 100 }, { signal }), enabled: !isNew })
  const resource = useMemo(() => (resourcesQuery.data?.data?.resources || []).find((item) => item._id === identifier), [resourcesQuery.data, identifier])
  const media = useMemo(() => (mediaQuery.data?.data?.media || []).find((item) => item._id === identifier), [mediaQuery.data, identifier])
  const existing = resource || media
  const form = draft || (resource ? fromResource(resource) : media ? fromMedia(media) : emptyForm)

  const mutation = useMutation({
    mutationFn: ({ status }) => {
      if (form.kind === 'media') {
        const payload = { title: form.title.trim(), description: form.description.trim(), type: form.type, url: form.url.trim(), externalUrl: form.externalUrl.trim(), thumbnailUrl: form.thumbnailUrl.trim(), publisherName: form.publisherName.trim(), transcript: form.transcript.trim(), tags: csv(form.tags), status }
        return isNew ? adminApi.createMedia(payload) : adminApi.updateMedia(existing._id, payload)
      }
      const payload = { title: form.title.trim(), description: form.description.trim(), type: form.type, tags: csv(form.tags), pageCount: form.pageCount === '' ? undefined : Number(form.pageCount), authorName: form.authorName.trim(), version: form.version.trim(), originalContent: true, status }
      if (form.fileAsset) payload.file = form.fileAsset
      else if (isNew) payload.file = { url: form.url.trim(), mimeType: 'application/pdf', originalName: form.url.split('/').at(-1) || 'resource.pdf' }
      return isNew ? adminApi.createResource(payload) : adminApi.updateResource(existing._id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'resources'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] })
      navigate('admin-content')
    },
    onError: (error) => setNotice(error.message),
  })

  const loading = !isNew && (resourcesQuery.isLoading || mediaQuery.isLoading)
  const error = resourcesQuery.error || mediaQuery.error
  if (loading) return <PageSkeleton />
  if (error) return <ErrorState message={error.message} onRetry={() => { resourcesQuery.refetch(); mediaQuery.refetch() }} />
  if (!isNew && resourcesQuery.isSuccess && mediaQuery.isSuccess && !existing) return <ErrorState title="Content not found" message="Return to content management and choose an existing item." />

  const set = (key) => (event) => setDraft({ ...form, [key]: event.target.value })
  const submit = (status) => {
    setNotice('')
    if (!form.title.trim() || !form.url.trim()) { setNotice('Title and source URL are required.'); return }
    mutation.mutate({ status })
  }
  const isMedia = form.kind === 'media'

  return (
    <div className="admin-stack">
      <Head eyebrow="Learning library - Connected editor" title={isNew ? 'Add content' : `Edit ${existing?.title || 'content'}`} copy="Publish attributed expert media or maintain downloadable career resources through the live content API.">
        <button className="button ghost" onClick={() => navigate('admin-content')}>Cancel</button>
        {existing && (
          <button
            className="button soft"
            style={{ color: 'var(--blue, #3b82f6)' }}
            onClick={() => navigate(isMedia ? 'media-detail' : 'document-preview', existing._id)}
          >
            ▶ Student View
          </button>
        )}
        <button className="button soft" onClick={() => submit(isNew ? 'draft' : form.status)} disabled={mutation.isPending}>{isNew ? 'Save draft' : 'Save changes'}</button>
        <button className="button primary" onClick={() => submit('published')} disabled={mutation.isPending}><Icon name="check" /> {mutation.isPending ? 'Saving...' : 'Publish content'}</button>
      </Head>
      {notice && <p className="form-error" role="alert">{notice}</p>}
      
      {/* Live Stream Preview for Admin */}
      {isMedia && form.url && (
        <section className="panel" style={{ padding: '16px', background: 'var(--surface-sunken, #0f172a)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="eyebrow" style={{ color: 'var(--blue, #38bdf8)' }}>Live Stream Preview</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)' }}>Streams exactly as a student sees it</span>
          </div>
          <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe
              src={form.url}
              title={form.title || 'Video preview'}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <section className="panel admin-editor-form connected-admin-form">
        <div className="editor-section"><h2>Content details</h2><div className="form-grid"><Field label="Content family"><select value={form.kind} onChange={(event) => setDraft({ ...emptyForm, kind: event.target.value, type: event.target.value === 'media' ? 'video' : 'pdf' })} disabled={!isNew}><option value="media">Expert media</option><option value="resource">Downloadable document</option></select></Field><Field label="Format"><select value={form.type} onChange={set('type')}>{isMedia ? <><option value="video">Video</option><option value="audio">Audio</option><option value="animation">Animation</option></> : <><option value="pdf">PDF guide</option><option value="checklist">Checklist</option><option value="infographic">Infographic</option><option value="template">Template</option></>}</select></Field><Field label="Title"><input value={form.title} onChange={set('title')} required /></Field><Field label="Tags (comma separated)"><input value={form.tags} onChange={set('tags')} /></Field><Field label="Description"><textarea value={form.description} onChange={set('description')} /></Field><Field label={isMedia ? 'Embed or media URL' : isNew ? 'Public HTTPS file URL' : 'Current file (read only)'}><input type={isMedia || isNew ? 'url' : 'text'} value={form.url} onChange={set('url')} readOnly={!isMedia && !isNew} required /></Field></div></div>
        <div className="editor-section"><h2>Managed upload</h2><Field label="Upload a file to the backend"><input type="file" onChange={(event) => event.target.files?.[0] && uploadMutation.mutate(event.target.files[0])} disabled={uploadMutation.isPending} /></Field><small>{uploadMutation.isPending ? 'Uploading…' : 'The returned asset URL is inserted into the source field above.'}</small></div>
        {isMedia ? <div className="editor-section"><h2>Publisher and accessibility</h2><div className="form-grid"><Field label="Original watch URL"><input type="url" value={form.externalUrl} onChange={set('externalUrl')} /></Field><Field label="Thumbnail URL"><input type="url" value={form.thumbnailUrl} onChange={set('thumbnailUrl')} /></Field><Field label="Publisher"><input value={form.publisherName} onChange={set('publisherName')} /></Field><Field label="Transcript or learning notes"><textarea rows="8" value={form.transcript} onChange={set('transcript')} /></Field></div></div> : <div className="editor-section"><h2>Document metadata</h2><div className="form-grid"><Field label="Page count"><input type="number" min="0" value={form.pageCount} onChange={set('pageCount')} /></Field><Field label="Author"><input value={form.authorName} onChange={set('authorName')} /></Field><Field label="Version"><input value={form.version} onChange={set('version')} /></Field></div></div>}
      </section>
    </div>
  )
}
