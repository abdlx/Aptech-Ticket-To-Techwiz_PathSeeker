import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import Head from '../../components/admin/AdminEditorHead'
import Field from '../../components/admin/AdminField'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { adminApi } from '../../services/adminApi'

export default function AdminUserEditor({ navigate, userId }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(null)
  const [notice, setNotice] = useState('')
  const query = useQuery({ queryKey: ['admin', 'users', 'detail', userId], queryFn: ({ signal }) => adminApi.getUserById(userId, { signal }), enabled: Boolean(userId && userId !== 'users') })
  const user = query.data?.data?.user
  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', stage: user.stage || '', role: user.role || 'user', status: user.status || 'active', emailVerified: Boolean(user.emailVerified) })
  }, [user])
  const mutation = useMutation({
    mutationFn: (payload) => adminApi.updateUser(userId, payload),
    onSuccess: (result) => {
      queryClient.setQueryData(['admin', 'users', 'detail', userId], result)
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] })
      setNotice('User record saved to the live database.')
    },
  })
  if (query.isLoading || !form) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))
  const save = (event) => { event.preventDefault(); mutation.mutate({ ...form, stage: form.role === 'user' ? (form.stage || 'student') : null }) }
  const initials = form.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()

  return <form className="admin-stack" onSubmit={save}>
    <Head eyebrow="Community · User record" title={form.name} copy="Review identity, role, verification, and account access using the live user record.">
      <button type="button" className="button ghost" onClick={() => navigate('admin-users')}>Cancel</button>
      <button className="button primary" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save changes'}</button>
    </Head>
    {(notice || mutation.error) && <div className="admin-toast"><Icon name={mutation.error ? 'close' : 'check'} />{mutation.error?.message || notice}</div>}
    <div className="admin-editor-layout"><section className="panel admin-editor-form">
      <div className="editor-section"><h2>Personal details</h2><div className="form-grid">
        <Field label="Full name"><input value={form.name} onChange={set('name')} required /></Field>
        <Field label="Email"><input type="email" value={form.email} onChange={set('email')} required /></Field>
        {form.role === 'user' && <Field label="Stage"><select value={form.stage || 'student'} onChange={set('stage')}><option value="student">Student</option><option value="graduate">Graduate</option><option value="professional">Professional</option></select></Field>}
      </div></div>
      <div className="editor-section"><h2>Account access</h2><div className="form-grid">
        <Field label="Status"><select value={form.status} onChange={set('status')}><option value="active">Active</option><option value="suspended">Suspended</option><option value="deleted">Deleted</option></select></Field>
        <Field label="Role"><select value={form.role} onChange={set('role')}><option value="user">User</option><option value="content_editor">Content editor</option><option value="support_manager">Support manager</option><option value="admin">Admin</option><option value="super_admin">Super admin</option></select></Field>
      </div><label className="toggle-row"><span><strong>Email verified</strong><small>Controls the persisted verification state.</small></span><input type="checkbox" checked={form.emailVerified} onChange={set('emailVerified')} /><i /></label></div>
    </section><aside className="panel admin-profile-summary"><span className="avatar">{initials}</span><h3>{form.name}</h3><p>{form.stage || form.role.replaceAll('_', ' ')}</p><dl>
      <div><dt>Last login</dt><dd>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</dd></div>
      <div><dt>Member since</dt><dd>{new Date(user.createdAt).toLocaleDateString()}</dd></div>
      <div><dt>Record ID</dt><dd>{user._id}</dd></div>
    </dl></aside></div>
  </form>
}
