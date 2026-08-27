import { useEffect, useState } from 'react'
import Icon from '../Icon'
import SectionHead from './SectionHead'
import { apiRequest, endpoints } from '../../services/pathseekerApi'
import { useAuth } from '../../context/AuthContext'

const NOTIFICATION_TOGGLES = [
  { key: 'emailNotifications', label: 'Email notifications', hint: 'Account and security emails, plus anything you ask us to receive' },
  { key: 'recommendationNotifications', label: 'New recommendations & matches', hint: 'When PathSeeker finds a career match worth a look' },
  { key: 'roadmapReminders', label: 'Roadmap reminders', hint: 'Nudges to keep your Career Passport moving forward' },
]

export default function SettingsForm({ section, user, profile, onSaveProfile, onDeleteAccount, saving, saveError, saveSuccess }) {
  const { logout } = useAuth()
  const [headline, setHeadline] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const [interests, setInterests] = useState('')
  const [education, setEducation] = useState({ level: '', institution: '', field: '', current: true })
  const [experience, setExperience] = useState({ title: '', organization: '', description: '', current: true })
  const [skills, setSkills] = useState([])
  const [skillOptions, setSkillOptions] = useState([])

  useEffect(() => {
    setHeadline(profile?.headline || '')
    setCity(profile?.location?.city || '')
    setCountry(profile?.location?.country || '')
    setInterests((profile?.interests || []).join(', '))
    setEducation(profile?.education?.[0] || { level: '', institution: '', field: '', current: true })
    setExperience(profile?.experience?.[0] || { title: '', organization: '', description: '', current: true })
    setSkills((profile?.skills || []).map(item => ({ skillId: item.skillId?._id || item.skillId, selfRating: item.selfRating || 5, experienceMonths: item.experienceMonths || 0, source: item.source || 'self_reported' })))
  }, [profile])

  useEffect(() => {
    if (section !== 'Personal details') return
    apiRequest(endpoints.skills).then(({ data }) => setSkillOptions(data.skills || [])).catch(() => {})
  }, [section])

  const addSkill = (skillId) => {
    if (!skillId || skills.some(item => item.skillId === skillId)) return
    setSkills(current => [...current, { skillId, selfRating: 5, experienceMonths: 0, source: 'self_reported' }])
  }

  if (section === 'Notifications') {
    const preferences = profile?.preferences || {}
    return <><SectionHead eyebrow="Stay informed" title="Notification preferences" />{saveError && <p className="form-error" role="alert">{saveError}</p>}{NOTIFICATION_TOGGLES.map(({ key, label, hint }) => <label className="toggle-row" key={key}><span><strong>{label}</strong><small>{hint}</small></span><input type="checkbox" checked={Boolean(preferences[key])} onChange={(e) => onSaveProfile({ preferences: { ...preferences, [key]: e.target.checked } })} disabled={saving} /><i /></label>)}</>
  }

  if (section === 'Privacy & data') {
    const preferences = profile?.preferences || {}
    return <><SectionHead eyebrow="Your control" title="Privacy & data" />{saveError && <p className="form-error" role="alert">{saveError}</p>}<div className="privacy-list"><label className="toggle-row"><span><Icon name="shield" /></span><p><strong>Personalized recommendations</strong><small>Use your saved interests and activity to improve matches.</small></p><input type="checkbox" checked={Boolean(preferences.aiPersonalization)} onChange={(e) => onSaveProfile({ preferences: { ...preferences, aiPersonalization: e.target.checked } })} disabled={saving} /><i /></label><label className="toggle-row"><span><Icon name="clock" /></span><p><strong>Activity history</strong><small>Allow PathSeeker to remember careers, media and resources you viewed.</small></p><input type="checkbox" checked={preferences.activityHistory !== false} onChange={(e) => onSaveProfile({ preferences: { ...preferences, activityHistory: e.target.checked } })} disabled={saving} /><i /></label><button className="danger" onClick={logout}><span><Icon name="close" /></span><p><strong>Log out</strong><small>Sign out of PathSeeker on this device.</small></p><Icon name="chevron" /></button><button className="danger" onClick={onDeleteAccount}><span><Icon name="close" /></span><p><strong>Deactivate account</strong><small>Disable this account and sign out everywhere.</small></p><Icon name="chevron" /></button></div></>
  }

  if (section === 'Preferences') {
    const preferences = profile?.preferences || {}
    return <><SectionHead eyebrow="Accessibility" title="Preferences" />{saveError && <p className="form-error" role="alert">{saveError}</p>}<div className="form-grid"><label>Theme<select value={preferences.theme || 'light'} onChange={(e) => onSaveProfile({ preferences: { ...preferences, theme: e.target.value } })}><option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option></select></label><label>Font size<select value={preferences.fontScale || 1} onChange={(e) => onSaveProfile({ preferences: { ...preferences, fontScale: Number(e.target.value) } })}><option value="0.9">Small</option><option value="1">Default</option><option value="1.15">Large</option><option value="1.3">Extra large</option></select></label></div><label className="toggle-row"><span><strong>Reduce motion</strong><small>Prefer fewer animations and transitions.</small></span><input type="checkbox" checked={Boolean(preferences.reducedMotion)} onChange={(e) => onSaveProfile({ preferences: { ...preferences, reducedMotion: e.target.checked } })} /><i /></label></>
  }

  return <><SectionHead eyebrow="Career Passport" title="Personal details" />{saveError && <p className="form-error" role="alert">{saveError}</p>}{saveSuccess && <p className="form-success-note">Saved.</p>}<div className="form-grid"><label>Full name<input value={user?.name || ''} disabled /></label><label>Email address<input value={user?.email || ''} disabled /></label><label>Current stage<input value={user?.stage ? user.stage[0].toUpperCase() + user.stage.slice(1) : ''} disabled /></label><label>City<input value={city} onChange={(e) => setCity(e.target.value)} /></label><label>Country<input value={country} onChange={(e) => setCountry(e.target.value)} /></label><label className="full">Headline<textarea value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={180} /></label><label className="full">Interests<input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Design, technology, helping people" /></label></div><h3>Skills</h3><div className="form-grid"><label className="full">Add a skill<select value="" onChange={e => addSkill(e.target.value)}><option value="">Choose a skill</option>{skillOptions.filter(skill => !skills.some(item => item.skillId === skill._id)).map(skill => <option key={skill._id} value={skill._id}>{skill.name}</option>)}</select></label></div><div className="skill-editor-list">{skills.map(skill => <div className="panel" key={skill.skillId}><div><strong>{skillOptions.find(item => item._id === skill.skillId)?.name || profile?.skills?.find(item => (item.skillId?._id || item.skillId) === skill.skillId)?.skillId?.name || 'Skill'}</strong><button type="button" onClick={() => setSkills(current => current.filter(item => item.skillId !== skill.skillId))}><Icon name="close" /></button></div><label>Self rating<input type="range" min="1" max="10" value={skill.selfRating} onChange={e => setSkills(current => current.map(item => item.skillId === skill.skillId ? { ...item, selfRating: Number(e.target.value) } : item))} /></label><small>{skill.selfRating}/10</small></div>)}</div><h3>Education</h3><div className="form-grid"><label>Level<input value={education.level || ''} onChange={(e) => setEducation({ ...education, level: e.target.value })} /></label><label>Institution<input value={education.institution || ''} onChange={(e) => setEducation({ ...education, institution: e.target.value })} /></label><label className="full">Field<input value={education.field || ''} onChange={(e) => setEducation({ ...education, field: e.target.value })} /></label></div><h3>Work experience</h3><div className="form-grid"><label>Role<input value={experience.title || ''} onChange={(e) => setExperience({ ...experience, title: e.target.value })} /></label><label>Organization<input value={experience.organization || ''} onChange={(e) => setExperience({ ...experience, organization: e.target.value })} /></label><label className="full">Description<textarea value={experience.description || ''} onChange={(e) => setExperience({ ...experience, description: e.target.value })} /></label></div><button className="button primary" disabled={saving} onClick={() => onSaveProfile({ headline, location: { city, country }, interests: interests.split(',').map((v) => v.trim()).filter(Boolean), skills, education: education.level ? [education] : [], experience: experience.title ? [experience] : [] })}>{saving ? 'Saving…' : 'Save changes'}</button></>
}
