import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import Field from '../../components/admin/AdminField'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { adminApi } from '../../services/adminApi'

const emptyArticle = { title: '', slug: '', summary: '', body: '', category: 'General', sortOrder: 0, published: false }

export default function AdminHelpPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState('new')
  const [form, setForm] = useState(emptyArticle)
  const query = useQuery({ queryKey: ['admin', 'help', search], queryFn: ({ signal }) => adminApi.getHelpArticles({ ...(search ? { q: search } : {}), limit: 50 }, { signal }) })
  const articles = query.data?.data?.articles || []
  useEffect(() => {
    const selected = articles.find((article) => article._id === selectedId)
    setForm(selected ? { ...emptyArticle, ...selected } : emptyArticle)
  }, [selectedId, articles])
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['admin', 'help'] })
  const save = useMutation({
    mutationFn: (payload) => selectedId === 'new' ? adminApi.createHelpArticle(payload) : adminApi.updateHelpArticle(selectedId, payload),
    onSuccess: (result) => { setSelectedId(result.data.article._id); refresh() },
  })
  const remove = useMutation({ mutationFn: adminApi.deleteHelpArticle, onSuccess: () => { setSelectedId('new'); refresh() } })
  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const submit = (event) => { event.preventDefault(); save.mutate({ ...form, sortOrder: Number(form.sortOrder) || 0 }) }

  return <div className="admin-stack">
    <PageHead eyebrow="PathSeeker support" title="Admin help center" description="Create, publish, search, and maintain the live help knowledge base.">
      <button className="button primary" onClick={() => setSelectedId('new')}><Icon name="plus" />New article</button>
    </PageHead>
    <section className="admin-filterbar panel"><div className="admin-search"><Icon name="search" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search help articles" /></div><span className="filter-count">{query.data?.data?.meta?.total ?? articles.length} articles</span></section>
    <div className="feedback-admin-layout"><section className="panel feedback-inbox">
      {articles.length ? articles.map((article) => <button className={selectedId === article._id ? 'active' : ''} key={article._id} onClick={() => setSelectedId(article._id)}><span className="career-icon mint"><Icon name="book" /></span><p><strong>{article.title}</strong><small>{article.category}</small><em>{article.published ? 'Published' : 'Draft'}</em></p></button>) : <EmptyState title="No help articles" message="Create the first administrator guide." />}
    </section><form className="panel admin-editor-form" onSubmit={submit}>
      <span className="eyebrow">{selectedId === 'new' ? 'New article' : 'Edit article'}</span><h2>{form.title || 'Untitled help article'}</h2>
      {(save.error || remove.error) && <div className="admin-toast"><Icon name="close" />{save.error?.message || remove.error?.message}</div>}
      <div className="form-grid"><Field label="Title"><input value={form.title} onChange={set('title')} required /></Field><Field label="Slug"><input value={form.slug} onChange={set('slug')} required /></Field><Field label="Category"><input value={form.category} onChange={set('category')} /></Field><Field label="Sort order"><input type="number" min="0" value={form.sortOrder} onChange={set('sortOrder')} /></Field></div>
      <Field label="Summary"><textarea value={form.summary} onChange={set('summary')} /></Field><Field label="Article body"><textarea rows="10" value={form.body} onChange={set('body')} required /></Field>
      <label className="toggle-row"><span><strong>Published</strong><small>Make this article visible in the public help center.</small></span><input type="checkbox" checked={form.published} onChange={set('published')} /><i /></label>
      <div className="editor-actions">{selectedId !== 'new' && <button type="button" className="button ghost" disabled={remove.isPending} onClick={() => window.confirm('Delete this help article?') && remove.mutate(selectedId)}>Delete</button>}<button className="button primary" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save article'}</button></div>
    </form></div>
  </div>
}
