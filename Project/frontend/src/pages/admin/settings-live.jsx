import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import Head from '../../components/admin/AdminEditorHead'
import Field from '../../components/admin/AdminField'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { adminApi } from '../../services/adminApi'
import { queryKeys } from '../../lib/queryKeys'

export default function AdminSettingsPage() {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(null)
  const [notice, setNotice] = useState('')
  const settingsQuery = useQuery({ queryKey: queryKeys.admin.settings(), queryFn: ({ signal }) => adminApi.getSettings({ signal }) })
  const staffQuery = useQuery({ queryKey: ['admin', 'staff'], queryFn: ({ signal }) => adminApi.getUsers({ limit: 50 }, { signal }) })
  const settings = settingsQuery.data?.data?.settings
  useEffect(() => {
    if (settings) setForm({ maintenanceMode: Boolean(settings.maintenanceMode), allowNewRegistrations: Boolean(settings.allowNewRegistrations), siteAnnouncement: settings.siteAnnouncement || '' })
  }, [settings])
  const mutation = useMutation({ mutationFn: (payload) => adminApi.updateSettings(payload), onSuccess: (result) => { queryClient.setQueryData(queryKeys.admin.settings(), result); setNotice('Workspace settings saved to the live database.') } })
  if (settingsQuery.isLoading || !form) return <PageSkeleton />
  if (settingsQuery.error) return <ErrorState message={settingsQuery.error.message} onRetry={settingsQuery.refetch} />
  const staff = (staffQuery.data?.data?.users || []).filter((user) => user.role !== 'user')
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }))

  return <div className="admin-stack">
    <Head eyebrow="Administration" title="Settings" copy="Configure the persisted workspace controls and review active staff accounts."><button className="button primary" disabled={mutation.isPending} onClick={() => mutation.mutate(form)}>{mutation.isPending ? 'Saving…' : 'Save settings'}</button></Head>
    {(notice || mutation.error) && <div className="admin-toast"><Icon name={mutation.error ? 'close' : 'check'} />{mutation.error?.message || notice}</div>}
    <div className="admin-settings-layout"><aside className="panel settings-nav"><button className="active"><Icon name="settings" />Workspace controls<Icon name="chevron" /></button><button><Icon name="users" />{staff.length} staff accounts<Icon name="chevron" /></button></aside>
      <section className="panel admin-editor-form"><span className="eyebrow">Live configuration</span><h2>Workspace controls</h2>
        <Field label="Site announcement"><textarea rows="4" value={form.siteAnnouncement} onChange={set('siteAnnouncement')} placeholder="Optional message shown to users" /></Field>
        <label className="toggle-row"><span><strong>Allow new registrations</strong><small>When disabled, new account creation is paused.</small></span><input type="checkbox" checked={form.allowNewRegistrations} onChange={set('allowNewRegistrations')} /><i /></label>
        <label className="toggle-row"><span><strong>Maintenance mode</strong><small>Persist the platform maintenance flag.</small></span><input type="checkbox" checked={form.maintenanceMode} onChange={set('maintenanceMode')} /><i /></label>
        <div className="editor-section"><h2>Team & roles</h2><div className="settings-list">{staffQuery.isLoading ? <p>Loading staff…</p> : staff.map((user) => <div key={user._id}><span className="avatar small">{user.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2)}</span><p><strong>{user.name}</strong><small>{user.email} · {user.role.replaceAll('_', ' ')}</small></p></div>)}</div></div>
      </section>
    </div>
  </div>
}
