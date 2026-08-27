import { useCallback, useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import SectionHead from '../../components/user/SectionHead'
import SettingsForm from '../../components/user/SettingsForm'
import { useAuth } from '../../context/AuthContext'
import { apiRequest, endpoints } from '../../services/pathseekerApi'

function initialsFor(name) {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?'
}

export default function ProfilePage() {
  const { user } = useAuth()
  const [section, setSection] = useState('Passport')
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  const loadProfile = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const { data } = await apiRequest(endpoints.profile)
      setProfile(data.profile)
    } catch (err) {
      setLoadError(err.message || 'Could not load your profile.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProfile()
    const handleProfileUpdate = () => loadProfile()
    window.addEventListener('pathseeker:profile-updated', handleProfileUpdate)
    return () => window.removeEventListener('pathseeker:profile-updated', handleProfileUpdate)
  }, [loadProfile])

  const handleSaveProfile = async (patch) => {
    setSaving(true)
    setSaveError('')
    setSaveSuccess(false)
    try {
      const { data } = await apiRequest(endpoints.profile, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
      setProfile(data.profile)
      setSaveSuccess(true)
    } catch (err) {
      setSaveError(err.message || 'Could not save your changes.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => { if (!window.confirm('Deactivate your PathSeeker account? This will sign you out everywhere.')) return; try { await apiRequest(endpoints.account, { method: 'DELETE' }); window.location.href = '/' } catch (err) { setSaveError(err.message || 'Could not deactivate your account.') } }

  const stageLabel = user?.stage ? `${user.stage[0].toUpperCase()}${user.stage.slice(1)}` : ''
  const locationLabel = [profile?.location?.city, profile?.location?.country].filter(Boolean).join(', ')
  const interests = profile?.interests?.length ? profile.interests.join(', ') : 'Add interests to personalize your matches'

  return (
    <div className="profile-page page-stack">
      <section className="profile-hero">
        <div className="profile-avatar">{initialsFor(user?.name)}</div>
        <div>
          <span className="eyebrow">Career Passport</span>
          <h1>{user?.name || 'Your profile'}</h1>
          <p>{[stageLabel, locationLabel, profile?.headline].filter(Boolean).join(' · ') || 'Complete your profile to personalize your matches'}</p>
          <div><span><Icon name="sparkles" /> {profile?.onboarding?.status === 'completed' ? 'Onboarding complete' : 'Onboarding in progress'}</span></div>
        </div>
        
      </section>
      <div className="settings-layout">
        <aside className="settings-nav">
          {['Passport', 'Personal details', 'Preferences', 'Notifications', 'Privacy & data'].map((item) => (
            <button
              className={section === item ? 'active' : ''}
              key={item}
              onClick={() => { setSection(item); setSaveError(''); setSaveSuccess(false) }}
            >
              <Icon name={item === 'Passport' ? 'compass' : item === 'Personal details' ? 'users' : item === 'Preferences' ? 'settings' : item === 'Notifications' ? 'bell' : 'shield'} />
              {item}
              <Icon name="chevron" />
            </button>
          ))}
        </aside>
        <section className="settings-content panel">
          {loading ? (
            <p>Loading your profile…</p>
          ) : loadError ? (
            <p className="form-error" role="alert">{loadError}</p>
          ) : section === 'Passport' ? (
            <>
              <SectionHead eyebrow="Your profile" title="Career passport strength" />
              <div className="passport-score">
                <div className="progress-ring"><span>{profile?.onboarding?.status === 'completed' ? 100 : 40}<small>%</small></span></div>
                <div>
                  <strong>{profile?.onboarding?.status === 'completed' ? 'Passport complete' : 'Almost explorer-ready'}</strong>
                  <p>Add your work preferences and one experience to improve your matches.</p>
                </div>
              </div>
              <div className="passport-sections">
                <article><span><Icon name="heart" /></span><div><small>Interests</small><strong>{interests}</strong></div><button onClick={() => setSection('Personal details')}><Icon name="edit" /></button></article>
                <article><span><Icon name="target" /></span><div><small>Current goal</small><strong>{profile?.goals?.primaryGoal || 'Not set yet'}</strong></div><button onClick={() => setSection('Personal details')}><Icon name="edit" /></button></article>
                <article className={profile?.experience?.length ? '' : 'incomplete'}>
                  <span><Icon name={profile?.experience?.length ? 'briefcase' : 'plus'} /></span>
                  <div><small>Experience</small><strong>{profile?.experience?.length ? `${profile.experience.length} entr${profile.experience.length === 1 ? 'y' : 'ies'} added` : 'Add education or work experience'}</strong></div>
                  <button>{profile?.experience?.length ? 'View' : 'Add'}</button>
                </article>
              </div>
            </>
          ) : (
            <SettingsForm
              section={section}
              user={user}
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onDeleteAccount={handleDeleteAccount}
              saving={saving}
              saveError={saveError}
              saveSuccess={saveSuccess}
            />
          )}
        </section>
      </div>
    </div>
  )
}
