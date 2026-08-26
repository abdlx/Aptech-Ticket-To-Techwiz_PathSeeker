import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import Head from '../../components/admin/AdminEditorHead'
import Field from '../../components/admin/AdminField'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { adminApi } from '../../services/adminApi'

export default function AdminSettingsPage() {
  const [section, setSection] = useState('Workspace')
  const [toast, setToast] = useState(null)

  const query = useQuery({
    queryKey: queryKeys.admin.settings(),
    queryFn: ({ signal }) => adminApi.getSettings({ signal }),
  })

  const updateMutation = useMutation({
    mutationFn: (payload) => adminApi.updateSettings(payload),
    onSuccess: () => {
      setToast('Workspace settings saved.')
      setTimeout(() => setToast(null), 3000)
    },
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const settings = query.data?.data?.settings || {}

  const handleSave = (e) => {
    e.preventDefault()
    updateMutation.mutate({
      general: {
        siteName: 'PathSeeker HQ',
        supportEmail: 'support@pathseeker.app',
      },
    })
  }

  return (
    <div className="admin-stack">
      <Head
        eyebrow="Administration"
        title="Settings"
        copy="Configure the PathSeeker workspace, team roles, and notification defaults."
      >
        <button
          className="button primary"
          onClick={handleSave}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Saving...' : 'Save settings'}
        </button>
      </Head>

      {toast && (
        <div style={{ background: '#e8f0e9', color: '#416d55', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Icon name="check" size={16} /> {toast}
        </div>
      )}

      <div className="admin-settings-layout">
        <aside className="panel settings-nav">
          {['Workspace', 'Team & roles', 'Notifications', 'Security', 'Data & privacy'].map((item) => (
            <button
              className={section === item ? 'active' : ''}
              onClick={() => setSection(item)}
              key={item}
            >
              <Icon
                name={
                  item === 'Workspace'
                    ? 'globe'
                    : item === 'Team & roles'
                    ? 'users'
                    : item === 'Notifications'
                    ? 'bell'
                    : item === 'Security'
                    ? 'shield'
                    : 'file'
                }
              />
              {item}
              <Icon name="chevron" />
            </button>
          ))}
        </aside>

        <section className="panel admin-editor-form">
          <span className="eyebrow">{section}</span>
          <h2>{section} settings</h2>

          {section === 'Workspace' && (
            <div className="form-grid">
              <Field label="Workspace name">
                <input defaultValue={settings?.general?.siteName || 'PathSeeker HQ'} />
              </Field>
              <Field label="Support email">
                <input defaultValue={settings?.general?.supportEmail || 'support@pathseeker.app'} />
              </Field>
              <Field label="Default timezone">
                <select defaultValue="Asia/Karachi">
                  <option>Asia/Karachi</option>
                  <option>UTC</option>
                </select>
              </Field>
              <Field label="Default language">
                <select defaultValue="English">
                  <option>English</option>
                  <option>Urdu</option>
                </select>
              </Field>
            </div>
          )}

          {section === 'Team & roles' && (
            <div className="settings-list">
              {[
                ['Sarah Malik', 'Super admin'],
                ['Omar Shah', 'Content editor'],
                ['Mina Raza', 'Support manager'],
              ].map(([name, role]) => (
                <div key={name}>
                  <span className="avatar small">
                    {name
                      .split(' ')
                      .map((x) => x[0])
                      .join('')}
                  </span>
                  <p>
                    <strong>{name}</strong>
                    <small>{role}</small>
                  </p>
                </div>
              ))}
            </div>
          )}

          {section === 'Notifications' &&
            ['New feedback', 'Story submissions', 'Content awaiting review', 'Weekly analytics digest'].map(
              (item, index) => (
                <label className="toggle-row" key={item}>
                  <span>
                    <strong>{item}</strong>
                    <small>Notify workspace administrators.</small>
                  </span>
                  <input type="checkbox" defaultChecked={index < 3} />
                  <i />
                </label>
              ),
            )}

          {section === 'Security' && (
            <>
              <label className="toggle-row">
                <span>
                  <strong>Require two-factor authentication</strong>
                  <small>Applies to every administrator.</small>
                </span>
                <input type="checkbox" defaultChecked />
                <i />
              </label>
              <label className="toggle-row">
                <span>
                  <strong>Session timeout</strong>
                  <small>Sign out inactive administrators after 30 minutes.</small>
                </span>
                <input type="checkbox" defaultChecked />
                <i />
              </label>
            </>
          )}

          {section === 'Data & privacy' && (
            <div className="settings-list">
              <button>
                <Icon name="download" />
                <p>
                  <strong>Export workspace data</strong>
                  <small>Create a portable archive.</small>
                </p>
                <Icon name="chevron" />
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
