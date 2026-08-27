import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import Status from '../../components/admin/Status'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { adminApi } from '../../services/adminApi'

export default function QuizAdmin() {
  const queryClient = useQueryClient()
  const [selectedId, setSelectedId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const questionsQuery = useQuery({ queryKey: ['admin', 'quiz-questions'], queryFn: ({ signal }) => adminApi.getQuizQuestions({ signal }) })
  const versionsQuery = useQuery({ queryKey: ['admin', 'quiz-versions'], queryFn: ({ signal }) => adminApi.getQuizVersions({ signal }) })
  const previewQuery = useQuery({ queryKey: ['admin', 'quiz-preview'], queryFn: ({ signal }) => adminApi.previewQuiz({ signal }), enabled: previewOpen })
  const questions = questionsQuery.data?.data?.questions || []
  const current = questions.find((question) => question._id === selectedId) || questions[0]
  useEffect(() => { if (current) { setSelectedId(current._id); setEditing(structuredClone(current)) } }, [current?._id])
  const refresh = () => { queryClient.invalidateQueries({ queryKey: ['admin', 'quiz-questions'] }); queryClient.invalidateQueries({ queryKey: ['admin', 'quiz-preview'] }); queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }) }
  const update = useMutation({ mutationFn: ({ id, payload }) => adminApi.updateQuizQuestion(id, payload), onSuccess: refresh })
  const create = useMutation({ mutationFn: () => adminApi.createQuizQuestion({ questionText: 'New assessment question', type: 'multiple_choice', order: questions.length, active: true, options: [{ key: 'a', label: 'First option' }, { key: 'b', label: 'Second option' }] }), onSuccess: (result) => { refresh(); setSelectedId(result.data.question._id) } })
  const remove = useMutation({ mutationFn: (id) => adminApi.deleteQuizQuestion(id), onSuccess: () => { setSelectedId(null); refresh() } })
  const reorder = useMutation({ mutationFn: (ids) => adminApi.reorderQuizQuestions(ids), onSuccess: refresh })
  const publish = useMutation({ mutationFn: () => adminApi.publishQuiz('Career Passport Assessment'), onSuccess: () => { versionsQuery.refetch(); refresh() } })
  const archive = useMutation({ mutationFn: (version) => adminApi.archiveQuizVersion(version), onSuccess: () => versionsQuery.refetch() })
  if (questionsQuery.isLoading) return <PageSkeleton />
  if (questionsQuery.error) return <ErrorState message={questionsQuery.error.message} onRetry={questionsQuery.refetch} />
  const busy = update.isPending || create.isPending || remove.isPending || reorder.isPending || publish.isPending
  const move = (index, delta) => { const next = [...questions]; const target = index + delta; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; reorder.mutate(next.map((item) => item._id)) }
  const save = (event) => { event.preventDefault(); update.mutate({ id: editing._id, payload: { questionText: editing.questionText, eyebrow: editing.eyebrow, hint: editing.hint, type: editing.type, active: editing.active, timeLimitSeconds: Number(editing.timeLimitSeconds) || 0, options: editing.options } }) }
  const error = update.error || create.error || remove.error || reorder.error || publish.error || archive.error

  return <div className="admin-stack">
    <PageHead eyebrow="Assessment engine" title="Quiz builder" description="Edit questions, reorder the live assessment, preview drafts, and publish immutable versions.">
      <button className="button soft" onClick={() => setPreviewOpen((open) => !open)}><Icon name="play" />{previewOpen ? 'Hide preview' : 'Preview draft'}</button>
      <button className="button primary" disabled={busy || !questions.length} onClick={() => publish.mutate()}><Icon name="sparkles" />{publish.isPending ? 'Publishing…' : 'Publish new version'}</button>
    </PageHead>
    {error && <div className="admin-toast"><Icon name="close" />{error.message}</div>}
    {previewOpen && <section className="panel" style={{ padding: 20 }}><span className="eyebrow">Draft preview</span><h2>{previewQuery.data?.data?.questions?.length || 0} questions</h2>{(previewQuery.data?.data?.questions || []).map((question, index) => <p key={question._id}><strong>{index + 1}. {question.questionText}</strong> · {question.options?.length || 0} options</p>)}</section>}
    <div className="quiz-admin-layout"><section className="panel question-list"><div><h3>Career Passport Assessment</h3><Status tone="success">{versionsQuery.data?.data?.versions?.find((version) => version.status === 'published') ? `Published v${versionsQuery.data.data.versions.find((version) => version.status === 'published').version}` : 'Unpublished'}</Status><p>{questions.length} live draft questions</p><button className="button soft small" onClick={() => create.mutate()} disabled={busy}><Icon name="plus" />Add question</button></div>
      {questions.map((question, index) => <button className={selectedId === question._id ? 'active' : ''} key={question._id} onClick={() => { setSelectedId(question._id); setEditing(structuredClone(question)) }}><span>{index + 1}</span><p><strong>{question.questionText}</strong><small>{question.active ? 'Active' : 'Disabled'} · {question.type?.replaceAll('_', ' ')}</small></p><span><button type="button" disabled={index === 0 || reorder.isPending} onClick={(event) => { event.stopPropagation(); move(index, -1) }}>↑</button><button type="button" disabled={index === questions.length - 1 || reorder.isPending} onClick={(event) => { event.stopPropagation(); move(index, 1) }}>↓</button></span></button>)}
    </section><section className="panel question-editor">{editing ? <form onSubmit={save}><div className="editor-head"><div><span className="eyebrow">Question editor</span><h2>Edit question</h2></div><button type="button" className="button ghost small" onClick={() => window.confirm('Delete this question?') && remove.mutate(editing._id)}>Delete</button></div>
      <label>Question prompt<input required value={editing.questionText || ''} onChange={(event) => setEditing({ ...editing, questionText: event.target.value })} /></label><label>Hint<input value={editing.hint || ''} onChange={(event) => setEditing({ ...editing, hint: event.target.value })} /></label><label className="toggle-row"><span><strong>Active</strong><small>Include in the next published version.</small></span><input type="checkbox" checked={editing.active !== false} onChange={(event) => setEditing({ ...editing, active: event.target.checked })} /><i /></label>
      <div className="answer-editor"><span>Answer options ({editing.options?.length || 0})</span>{(editing.options || []).map((option, index) => <div key={option.key || index}><span>{option.key}</span><input value={option.label || ''} onChange={(event) => { const options = [...editing.options]; options[index] = { ...option, label: event.target.value }; setEditing({ ...editing, options }) }} /></div>)}</div><div className="editor-actions"><button className="button primary" disabled={busy}>{update.isPending ? 'Saving…' : 'Save draft'}</button></div></form> : <p>Add a question to begin.</p>}</section></div>
    <section className="panel" style={{ padding: 20 }}><span className="eyebrow">Published history</span><h2>Quiz versions</h2>{(versionsQuery.data?.data?.versions || []).map((version) => <div className="activity-row" key={version._id}><span><Icon name="sparkles" /></span><p><strong>Version {version.version} · {version.title}</strong><small>{version.questions?.length || 0} questions · {version.createdBy?.name || 'Staff'}</small></p><Status tone={version.status === 'published' ? 'success' : 'muted'}>{version.status}</Status>{version.status !== 'published' && <button className="button ghost small" onClick={() => archive.mutate(version.version)} disabled={archive.isPending}>Archive</button>}</div>)}</section>
  </div>
}
