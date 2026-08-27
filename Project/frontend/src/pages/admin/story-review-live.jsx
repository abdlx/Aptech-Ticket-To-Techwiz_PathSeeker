import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import Head from '../../components/admin/AdminEditorHead'
import Field from '../../components/admin/AdminField'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { adminApi } from '../../services/adminApi'

export default function AdminStoryReview({ navigate, storyId }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(null)
  const query = useQuery({ queryKey: ['admin', 'stories', 'detail', storyId], queryFn: ({ signal }) => adminApi.getStoryById(storyId, { signal }), enabled: Boolean(storyId && storyId !== 'stories') })
  const story = query.data?.data?.story
  useEffect(() => {
    if (story) setForm({ authorName: story.authorName || '', storyText: story.storyText || '', educationPath: story.educationPath || '', challenges: story.challenges || '', outcome: story.outcome || '', moderationNote: story.moderationNote || '', featured: Boolean(story.featured) })
  }, [story])
  const finish = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'stories'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
    query.refetch()
  }
  const update = useMutation({ mutationFn: (payload) => adminApi.updateStory(storyId, payload), onSuccess: finish })
  const moderate = useMutation({
    mutationFn: ({ action, moderationNote }) => adminApi[action](storyId, { moderationNote }),
    onSuccess: finish,
  })
  const feature = useMutation({ mutationFn: (featured) => adminApi.featureStory(storyId, featured), onSuccess: finish })
  if (query.isLoading || !form) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))
  const busy = update.isPending || moderate.isPending || feature.isPending

  return <div className="admin-stack">
    <Head eyebrow="Moderation · Story review" title={story.authorName} copy={`${story.domainId?.name || 'Career story'} · ${story.status}`}>
      <button className="button ghost" onClick={() => navigate('admin-stories')}>Back</button>
      <button className="button soft" disabled={busy} onClick={() => update.mutate(form)}>Save edits</button>
      {story.status === 'pending' && <button className="button primary" disabled={busy} onClick={() => moderate.mutate({ action: 'approveStory', moderationNote: form.moderationNote })}>Approve</button>}
    </Head>
    {(update.error || moderate.error || feature.error) && <div className="admin-toast"><Icon name="close" />{update.error?.message || moderate.error?.message || feature.error?.message}</div>}
    <div className="admin-editor-layout"><section className="panel admin-editor-form">
      <div className="editor-section"><h2>Published identity</h2><div className="form-grid"><Field label="Author name"><input value={form.authorName} onChange={set('authorName')} /></Field><Field label="Submitter"><input value={story.submittedBy?.email || ''} disabled /></Field></div></div>
      <div className="editor-section"><h2>Story</h2><Field label="Story text"><textarea rows={7} value={form.storyText} onChange={set('storyText')} /></Field><div className="form-grid"><Field label="Education path"><textarea value={form.educationPath} onChange={set('educationPath')} /></Field><Field label="Challenges"><textarea value={form.challenges} onChange={set('challenges')} /></Field><Field label="Outcome"><textarea value={form.outcome} onChange={set('outcome')} /></Field></div></div>
      <div className="editor-section"><h2>Moderation</h2><Field label="Moderator note"><textarea rows={4} value={form.moderationNote} onChange={set('moderationNote')} /></Field><div className="editor-actions">
        {story.status === 'pending' && <><button className="button soft" disabled={busy} onClick={() => moderate.mutate({ action: 'requestStoryChanges', moderationNote: form.moderationNote })}>Request changes</button><button className="button ghost" disabled={busy} onClick={() => moderate.mutate({ action: 'rejectStory', moderationNote: form.moderationNote })}>Reject</button></>}
        {story.status === 'approved' && <button className="button soft" disabled={busy} onClick={() => feature.mutate(!story.featured)}>{story.featured ? 'Remove feature' : 'Feature story'}</button>}
      </div></div>
    </section><aside className="panel admin-profile-summary"><span className="career-icon mint"><Icon name="message" /></span><h3>{story.status}</h3><dl><div><dt>Submitted</dt><dd>{new Date(story.createdAt).toLocaleString()}</dd></div><div><dt>Reviewed</dt><dd>{story.reviewedAt ? new Date(story.reviewedAt).toLocaleString() : 'Not yet'}</dd></div><div><dt>Featured</dt><dd>{story.featured ? 'Yes' : 'No'}</dd></div><div><dt>Record ID</dt><dd>{story._id}</dd></div></dl></aside></div>
  </div>
}
