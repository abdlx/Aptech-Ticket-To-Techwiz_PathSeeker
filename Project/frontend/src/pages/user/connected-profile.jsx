import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import SectionHead from '../../components/user/SectionHead'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { exportToPdf } from '../../lib/pdfExport'
import { useAuth } from '../../providers/AuthProvider'
import { careersApi } from '../../services/careersApi'
import { profileApi } from '../../services/profileApi'
import { useAccessibilityStore } from '../../stores/appStores'

export default function ConnectedProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const { theme, setTheme, fontScale, setFontScale } = useAccessibilityStore()

  const [activeTab, setActiveTab] = useState('Passport')
  const [toast, setToast] = useState(null)

  // Modals
  const [showEduModal, setShowEduModal] = useState(false)
  const [showExpModal, setShowExpModal] = useState(false)
  const [showDeactivateModal, setShowDeactivateModal] = useState(false)

  // Add Item Drafts
  const [eduDraft, setEduDraft] = useState({ level: 'Bachelor', institution: '', field: '', startYear: new Date().getFullYear() - 2, endYear: new Date().getFullYear(), current: false })
  const [expDraft, setExpDraft] = useState({ title: '', organization: '', description: '', current: false })
  const [newSkillText, setNewSkillText] = useState('')
  const [newSkillRating, setNewSkillRating] = useState(7)
  const [newInterestText, setNewInterestText] = useState('')

  const query = useQuery({
    queryKey: queryKeys.profile.me(),
    queryFn: ({ signal }) => profileApi.get({ signal }),
    staleTime: 60_000,
  })

  const catalogSkillsQuery = useQuery({
    queryKey: ['skills', 'catalog'],
    queryFn: ({ signal }) => careersApi.skills({}, { signal }),
    staleTime: 300_000,
  })

  const catalogSkills = catalogSkillsQuery.data?.data?.skills || []

  const updateMutation = useMutation({
    mutationFn: (payload) => profileApi.update(payload),
    onSuccess: (response) => {
      queryClient.setQueryData(queryKeys.profile.me(), response)
      setToast({ type: 'success', message: 'Profile updated successfully!' })
      setTimeout(() => setToast(null), 4000)
    },
    onError: (err) => {
      setToast({ type: 'error', message: err?.message || 'Failed to update profile.' })
    },
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const profile = query.data?.data?.profile || {}
  const initials = user?.name
    ? user.name.split(/\s+/).map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'PS'
  const locationStr = [profile.location?.city, profile.location?.country].filter(Boolean).join(', ') || 'Location not specified'
  const stageDisplay = user?.stage ? user.stage.charAt(0).toUpperCase() + user.stage.slice(1) : 'Explorer'

  // Calculate passport strength %
  let strengthScore = 20
  if (profile.headline) strengthScore += 10
  if (profile.location?.city || profile.location?.country) strengthScore += 10
  if (profile.interests?.length > 0) strengthScore += 15
  if (profile.skills?.length > 0) strengthScore += 15
  if (profile.goals?.primaryGoal) strengthScore += 15
  if (profile.education?.length > 0) strengthScore += 15
  if (profile.experience?.length > 0) strengthScore += 10
  strengthScore = Math.min(100, strengthScore)

  // Handlers for Personal Details
  const handleSavePersonal = (e) => {
    e.preventDefault()
    const form = e.target
    const headline = form.headline.value.trim()
    const city = form.city.value.trim()
    const country = form.country.value.trim()

    updateMutation.mutate({
      headline,
      location: { city, country },
    })
  }

  // Handlers for Education
  const handleAddEducation = (e) => {
    e.preventDefault()
    if (!eduDraft.level || !eduDraft.institution) return
    const updatedEdu = [...(profile.education || []), { ...eduDraft, startYear: Number(eduDraft.startYear), endYear: Number(eduDraft.endYear) }]
    updateMutation.mutate({ education: updatedEdu })
    setShowEduModal(false)
    setEduDraft({ level: 'Bachelor', institution: '', field: '', startYear: new Date().getFullYear() - 2, endYear: new Date().getFullYear(), current: false })
  }

  const handleRemoveEducation = (index) => {
    const updatedEdu = profile.education.filter((_, i) => i !== index)
    updateMutation.mutate({ education: updatedEdu })
  }

  // Handlers for Experience
  const handleAddExperience = (e) => {
    e.preventDefault()
    if (!expDraft.title || !expDraft.organization) return
    const updatedExp = [...(profile.experience || []), { ...expDraft }]
    updateMutation.mutate({ experience: updatedExp })
    setShowExpModal(false)
    setExpDraft({ title: '', organization: '', description: '', current: false })
  }

  const handleRemoveExperience = (index) => {
    const updatedExp = profile.experience.filter((_, i) => i !== index)
    updateMutation.mutate({ experience: updatedExp })
  }

  // Handlers for Skills & Interests
  const handleAddSkill = (e) => {
    e.preventDefault()
    const input = newSkillText.trim()
    if (!input) return
    const inputLower = input.toLowerCase()

    // Match with catalog skills by exact ID, name, slug, or alias
    const matchedSkill = catalogSkills.find(
      (s) =>
        s._id === input ||
        s.name.toLowerCase() === inputLower ||
        s.slug.toLowerCase() === inputLower ||
        s.aliases?.some((a) => a.toLowerCase() === inputLower)
    )

    if (!matchedSkill) {
      setToast({
        type: 'error',
        message: `"${input}" was not found in the skills catalog. Please select an available skill from the suggestion list.`,
      })
      return
    }

    const existingIndex = (profile.skills || []).findIndex((s) => {
      const id = typeof s.skillId === 'object' && s.skillId?._id ? s.skillId._id : s.skillId
      return String(id) === String(matchedSkill._id)
    })

    if (existingIndex >= 0) {
      setToast({
        type: 'info',
        message: `"${matchedSkill.name}" is already in your skills list.`,
      })
      return
    }

    const updatedSkills = [
      ...(profile.skills || []).map((s) => ({
        skillId: typeof s.skillId === 'object' && s.skillId?._id ? s.skillId._id : s.skillId,
        selfRating: Number(s.selfRating) || 5,
        experienceMonths: Number(s.experienceMonths) || 0,
        source: s.source || 'self_reported',
      })),
      {
        skillId: matchedSkill._id,
        selfRating: Number(newSkillRating) || 7,
        experienceMonths: 12,
        source: 'self_reported',
      },
    ]

    updateMutation.mutate({ skills: updatedSkills })
    setNewSkillText('')
    setNewSkillRating(7)
  }

  const handleUpdateSkillRating = (index, rating) => {
    const updatedSkills = (profile.skills || []).map((s, i) => ({
      skillId: typeof s.skillId === 'object' && s.skillId?._id ? s.skillId._id : s.skillId,
      selfRating: i === index ? Number(rating) : Number(s.selfRating) || 5,
      experienceMonths: Number(s.experienceMonths) || 0,
      source: s.source || 'self_reported',
    }))
    updateMutation.mutate({ skills: updatedSkills })
  }

  const handleRemoveSkill = (index) => {
    const updatedSkills = (profile.skills || [])
      .filter((_, i) => i !== index)
      .map((s) => ({
        skillId: typeof s.skillId === 'object' && s.skillId?._id ? s.skillId._id : s.skillId,
        selfRating: Number(s.selfRating) || 5,
        experienceMonths: Number(s.experienceMonths) || 0,
        source: s.source || 'self_reported',
      }))
    updateMutation.mutate({ skills: updatedSkills })
  }

  const handleAddInterest = (e) => {
    e.preventDefault()
    const tag = newInterestText.trim()
    if (!tag || profile.interests?.some((item) => item.toLowerCase() === tag.toLowerCase())) return
    const updatedInterests = [...(profile.interests || []), tag]
    updateMutation.mutate({ interests: updatedInterests })
    setNewInterestText('')
  }

  const handleRemoveInterest = (tag) => {
    const updatedInterests = (profile.interests || []).filter((item) => item !== tag)
    updateMutation.mutate({ interests: updatedInterests })
  }

  const handleSaveGoals = (e) => {
    e.preventDefault()
    const form = e.target
    const goals = {
      primaryGoal: form.primaryGoal.value.trim(),
      timeframeMonths: Number(form.timeframeMonths.value) || 12,
      remotePreference: form.remotePreference.value,
      desiredIncome: Number(form.desiredIncome.value) || undefined,
      desiredIncomeCurrency: form.desiredIncomeCurrency.value.trim() || 'USD',
    }
    updateMutation.mutate({ goals })
  }

  // Handlers for Preferences
  const handleSavePreferences = (e) => {
    e.preventDefault()
    const form = e.target
    const selectedTheme = form.themeSelect.value
    const selectedScale = parseFloat(form.fontScaleSelect.value)
    const reducedMotion = form.reducedMotion.checked
    const aiPersonalization = form.aiPersonalization.checked

    setTheme(selectedTheme)
    setFontScale(selectedScale)

    updateMutation.mutate({
      preferences: {
        ...(profile.preferences || {}),
        theme: selectedTheme,
        fontScale: selectedScale,
        reducedMotion,
        aiPersonalization,
      },
    })
  }

  // Handlers for Notifications
  const handleSaveNotifications = (e) => {
    e.preventDefault()
    const form = e.target
    updateMutation.mutate({
      preferences: {
        ...(profile.preferences || {}),
        emailNotifications: form.emailNotifications.checked,
        recommendationNotifications: form.recommendationNotifications.checked,
        roadmapReminders: form.roadmapReminders.checked,
      },
    })
  }

  // JSON Data Download
  const handleDownloadJsonData = () => {
    const exportData = {
      user: {
        name: user?.name,
        email: user?.email,
        stage: user?.stage,
        role: user?.role,
      },
      profile,
      exportedAt: new Date().toISOString(),
    }
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2))
    const dlAnchor = document.createElement('a')
    dlAnchor.setAttribute('href', dataStr)
    dlAnchor.setAttribute('download', `${user?.name || 'PathSeeker'}_Profile_Data.json`)
    dlAnchor.click()
  }

  const navItemsList = [
    { id: 'Passport', label: 'Career Passport', icon: 'compass' },
    { id: 'Personal details', label: 'Personal & Education', icon: 'users' },
    { id: 'Skills', label: 'Skills & Goals', icon: 'target' },
    { id: 'Preferences', label: 'Preferences & UI', icon: 'settings' },
    { id: 'Notifications', label: 'Notifications', icon: 'bell' },
    { id: 'Privacy & data', label: 'Privacy & Security', icon: 'shield' },
  ]

  return (
    <div className="profile-page page-stack">
      {toast && (
        <div className={`profile-toast ${toast.type}`}>
          <Icon name={toast.type === 'success' ? 'sparkles' : 'help'} />
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)}>×</button>
        </div>
      )}

      {/* Hero Section */}
      <section className="profile-hero">
        <div className="profile-avatar">
          {initials}
          <button aria-label="Edit avatar" title="Update avatar image">
            <Icon name="edit" size={14} />
          </button>
        </div>
        <div>
          <span className="eyebrow">Career Passport</span>
          <h1>{user?.name || 'PathSeeker Explorer'}</h1>
          <p>{stageDisplay} · {locationStr} · {profile.headline || 'Exploring tailored career pathways'}</p>
          <div className="passport-badge-row">
            <span className="passport-badge"><Icon name="sparkles" /> Thoughtful Builder</span>
            <span className="passport-badge"><Icon name="target" /> {profile.interests?.length || 0} Interests</span>
            <span className="passport-badge"><Icon name="compass" /> {strengthScore}% Passport Strength</span>
          </div>
        </div>
        <button
          className="button soft"
          onClick={() => exportToPdf(`${user?.name || 'PathSeeker'} Career Passport`)}
          title="Download passport as PDF"
        >
          <Icon name="download" /> Download passport
        </button>
      </section>

      {/* Main Settings & Profile Layout */}
      <div className="settings-layout">
        <aside className="settings-nav">
          {navItemsList.map((item) => (
            <button
              key={item.id}
              className={activeTab === item.id ? 'active' : ''}
              onClick={() => setActiveTab(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              <Icon name="chevron" />
            </button>
          ))}
        </aside>

        <section className="settings-content panel">
          {/* 1. CAREER PASSPORT OVERVIEW */}
          {activeTab === 'Passport' && (
            <>
              <SectionHead eyebrow="Your Overview" title="Career Passport Strength" />
              <div className="passport-score">
                <div className="progress-ring">
                  <span>{strengthScore}<small>%</small></span>
                </div>
                <div>
                  <strong>{strengthScore >= 80 ? 'Passport is Explorer-Ready!' : 'Almost Explorer-Ready'}</strong>
                  <p>{strengthScore >= 80 ? 'Your profile has comprehensive background details for maximum match accuracy.' : 'Add your education, work experience, and career goals to boost your recommendation strength.'}</p>
                  {strengthScore < 100 && (
                    <button className="button primary small" onClick={() => setActiveTab('Personal details')}>
                      Complete passport <Icon name="arrow" />
                    </button>
                  )}
                </div>
              </div>

              <div className="passport-sections">
                <article>
                  <span><Icon name="heart" /></span>
                  <div>
                    <small>Interests ({profile.interests?.length || 0})</small>
                    <strong>{profile.interests?.length ? profile.interests.join(', ') : 'Add your interests'}</strong>
                  </div>
                  <button onClick={() => setActiveTab('Skills')} title="Edit interests"><Icon name="edit" /></button>
                </article>

                <article>
                  <span><Icon name="sparkles" /></span>
                  <div>
                    <small>Top Strengths & Skills</small>
                    <strong>{profile.skills?.length ? `${profile.skills.length} skills reported` : 'Self-rate your skills'}</strong>
                  </div>
                  <button onClick={() => setActiveTab('Skills')} title="Edit skills"><Icon name="edit" /></button>
                </article>

                <article>
                  <span><Icon name="target" /></span>
                  <div>
                    <small>Primary Goal</small>
                    <strong>{profile.goals?.primaryGoal || 'Define your next career milestone'}</strong>
                  </div>
                  <button onClick={() => setActiveTab('Skills')} title="Edit goals"><Icon name="edit" /></button>
                </article>

                <article className={!profile.education?.length && !profile.experience?.length ? 'incomplete' : ''}>
                  <span><Icon name="users" /></span>
                  <div>
                    <small>Experience & Academics</small>
                    <strong>{(profile.education?.length || 0) + (profile.experience?.length || 0)} entries recorded</strong>
                  </div>
                  <button onClick={() => setActiveTab('Personal details')} title="Manage details">
                    {!profile.education?.length && !profile.experience?.length ? 'Add' : <Icon name="edit" />}
                  </button>
                </article>
              </div>
            </>
          )}

          {/* 2. PERSONAL & ACADEMIC DETAILS */}
          {activeTab === 'Personal details' && (
            <>
              <SectionHead eyebrow="Account Information" title="Personal & Academic Details" />
              <form onSubmit={handleSavePersonal}>
                <div className="form-grid">
                  <label>
                    Full name
                    <input type="text" defaultValue={user?.name || ''} readOnly style={{ background: '#f0f3ef', cursor: 'not-allowed' }} title="Full name from registered account" />
                  </label>
                  <label>
                    Email address
                    <input type="email" defaultValue={user?.email || ''} readOnly style={{ background: '#f0f3ef', cursor: 'not-allowed' }} />
                  </label>
                  <label>
                    City
                    <input name="city" type="text" defaultValue={profile.location?.city || ''} placeholder="e.g. Karachi" />
                  </label>
                  <label>
                    Country
                    <input name="country" type="text" defaultValue={profile.location?.country || ''} placeholder="e.g. Pakistan" />
                  </label>
                  <label className="full">
                    Professional Headline / Short Bio
                    <textarea name="headline" defaultValue={profile.headline || ''} placeholder="Tell us about yourself and what drives your career exploration..." />
                  </label>
                </div>
                <button type="submit" className="button primary" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving...' : 'Save Personal Details'}
                </button>
              </form>

              {/* Education Section */}
              <div className="section-block">
                <div className="section-block-head">
                  <h3>Education & Academics</h3>
                  <button type="button" className="button soft small" onClick={() => setShowEduModal(true)}>
                    <Icon name="plus" /> Add Education
                  </button>
                </div>

                {!profile.education?.length ? (
                  <p style={{ color: 'var(--muted)', fontSize: '12px' }}>No education history added yet. Click &ldquo;Add Education&rdquo; to add your degrees or courses.</p>
                ) : (
                  <div className="item-card-list">
                    {profile.education.map((edu, idx) => (
                      <div key={idx} className="item-card">
                        <div className="item-card-main">
                          <h4>{edu.level} in {edu.field || 'General Studies'}</h4>
                          <p>{edu.institution}</p>
                          <small>{edu.startYear} – {edu.current ? 'Present' : edu.endYear}</small>
                        </div>
                        <div className="item-card-actions">
                          <button type="button" onClick={() => handleRemoveEducation(idx)} title="Remove education">
                            <Icon name="close" size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience Section */}
              <div className="section-block">
                <div className="section-block-head">
                  <h3>Work & Project Experience</h3>
                  <button type="button" className="button soft small" onClick={() => setShowExpModal(true)}>
                    <Icon name="plus" /> Add Experience
                  </button>
                </div>

                {!profile.experience?.length ? (
                  <p style={{ color: 'var(--muted)', fontSize: '12px' }}>No work or project experience listed yet. Click &ldquo;Add Experience&rdquo; to showcase your journey.</p>
                ) : (
                  <div className="item-card-list">
                    {profile.experience.map((exp, idx) => (
                      <div key={idx} className="item-card">
                        <div className="item-card-main">
                          <h4>{exp.title}</h4>
                          <p>{exp.organization}</p>
                          <small>{exp.description || 'No description provided.'}</small>
                        </div>
                        <div className="item-card-actions">
                          <button type="button" onClick={() => handleRemoveExperience(idx)} title="Remove experience">
                            <Icon name="close" size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* 3. SKILLS & GOALS */}
          {activeTab === 'Skills' && (
            <>
              <SectionHead eyebrow="Competencies & Aspirations" title="Skills & Career Goals" />

              {/* Skills */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ fontSize: '14px', margin: '0 0 12px' }}>Self-Rated Skills</h3>
                {!profile.skills?.length ? (
                  <p style={{ color: 'var(--muted)', fontSize: '12px' }}>No skills added. Add your key skills below to receive personalized career matches.</p>
                ) : (
                  <div className="skill-rating-list">
                    {profile.skills.map((skill, idx) => {
                      const skillLabel = typeof skill.skillId === 'object' && skill.skillId?.name
                        ? skill.skillId.name
                        : skill.customName || String(skill.skillId)
                      const category = typeof skill.skillId === 'object' ? skill.skillId?.category : 'Skill'
                      return (
                        <div key={idx} className="skill-rating-item">
                          <div className="skill-info">
                            <strong>{skillLabel}</strong>
                            <small>{category || 'Skill'}</small>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="10"
                            value={skill.selfRating || 5}
                            onChange={(e) => handleUpdateSkillRating(idx, e.target.value)}
                            title={`Self rating: ${skill.selfRating}/10`}
                          />
                          <span className="rating-val">{skill.selfRating}/10</span>
                          <button type="button" className="remove-btn" onClick={() => handleRemoveSkill(idx)} title="Remove skill">
                            <Icon name="close" size={14} />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="add-inline-row">
                  <input
                    type="text"
                    list="catalog-skills-list"
                    placeholder="Search or select a skill (e.g. Python, UI Design, React, Communication)..."
                    value={newSkillText}
                    onChange={(e) => setNewSkillText(e.target.value)}
                  />
                  <datalist id="catalog-skills-list">
                    {catalogSkills.map((s) => (
                      <option key={s._id} value={s.name}>
                        {s.category ? `Category: ${s.category}` : ''}
                      </option>
                    ))}
                  </datalist>
                  <button type="button" className="button soft" onClick={handleAddSkill}>
                    <Icon name="plus" /> Add Skill
                  </button>
                </div>
              </div>

              {/* Interests */}
              <div className="section-block">
                <h3 style={{ fontSize: '14px', margin: '0 0 12px' }}>Interests & Passion Areas</h3>
                <div className="chip-group">
                  {(profile.interests || []).map((tag) => (
                    <span key={tag} className="interest-chip">
                      {tag}
                      <button type="button" onClick={() => handleRemoveInterest(tag)} title={`Remove ${tag}`}>×</button>
                    </span>
                  ))}
                </div>
                <div className="add-inline-row">
                  <input
                    type="text"
                    placeholder="Add an interest (e.g. Artificial Intelligence, Healthcare, UX Research)..."
                    value={newInterestText}
                    onChange={(e) => setNewInterestText(e.target.value)}
                  />
                  <button type="button" className="button soft" onClick={handleAddInterest}>
                    <Icon name="plus" /> Add Interest
                  </button>
                </div>
              </div>

              {/* Career Goals */}
              <div className="section-block">
                <h3 style={{ fontSize: '14px', margin: '0 0 12px' }}>Career Target & Goals</h3>
                <form onSubmit={handleSaveGoals}>
                  <div className="form-grid">
                    <label className="full">
                      Primary Career Goal
                      <textarea
                        name="primaryGoal"
                        defaultValue={profile.goals?.primaryGoal || ''}
                        placeholder="What role, domain, or achievement are you working towards next?"
                      />
                    </label>
                    <label>
                      Remote Work Preference
                      <select name="remotePreference" defaultValue={profile.goals?.remotePreference || 'unspecified'}>
                        <option value="unspecified">Unspecified / Flexible</option>
                        <option value="remote">Remote only</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="onsite">Onsite</option>
                      </select>
                    </label>
                    <label>
                      Target Timeframe (Months)
                      <input
                        name="timeframeMonths"
                        type="number"
                        min="1"
                        max="240"
                        defaultValue={profile.goals?.timeframeMonths || 12}
                      />
                    </label>
                    <label>
                      Desired Annual Income
                      <input
                        name="desiredIncome"
                        type="number"
                        min="0"
                        defaultValue={profile.goals?.desiredIncome || ''}
                        placeholder="e.g. 75000"
                      />
                    </label>
                    <label>
                      Currency
                      <input
                        name="desiredIncomeCurrency"
                        type="text"
                        maxLength="3"
                        defaultValue={profile.goals?.desiredIncomeCurrency || 'USD'}
                      />
                    </label>
                  </div>
                  <button type="submit" className="button primary" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Goals'}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* 4. PREFERENCES & ACCESSIBILITY */}
          {activeTab === 'Preferences' && (
            <>
              <SectionHead eyebrow="Experience Customization" title="Preferences & Accessibility" />
              <form onSubmit={handleSavePreferences}>
                <div className="form-grid">
                  <label>
                    Theme Mode
                    <select name="themeSelect" defaultValue={theme}>
                      <option value="light">Light Mode</option>
                      <option value="dark">Dark Mode</option>
                    </select>
                  </label>
                  <label>
                    Text Scale
                    <select name="fontScaleSelect" defaultValue={String(fontScale)}>
                      <option value="0.9">Compact (90%)</option>
                      <option value="1">Standard (100%)</option>
                      <option value="1.1">Large (110%)</option>
                      <option value="1.2">Extra Large (120%)</option>
                    </select>
                  </label>
                </div>

                <div style={{ marginTop: '16px' }}>
                  <label className="toggle-row">
                    <span>
                      <strong>Reduced Motion</strong>
                      <small>Minimize animations and transitions across all screens</small>
                    </span>
                    <input name="reducedMotion" type="checkbox" defaultChecked={profile.preferences?.reducedMotion || false} />
                    <i />
                  </label>

                  <label className="toggle-row">
                    <span>
                      <strong>AI Personalization Engine</strong>
                      <small>Use quiz results and interaction history to suggest optimal career paths</small>
                    </span>
                    <input name="aiPersonalization" type="checkbox" defaultChecked={profile.preferences?.aiPersonalization !== false} />
                    <i />
                  </label>
                </div>

                <div style={{ marginTop: '24px' }}>
                  <button type="submit" className="button primary" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* 5. NOTIFICATIONS */}
          {activeTab === 'Notifications' && (
            <>
              <SectionHead eyebrow="Stay Informed" title="Notification Preferences" />
              <form onSubmit={handleSaveNotifications}>
                <label className="toggle-row">
                  <span>
                    <strong>Weekly Career Insights Digest</strong>
                    <small>A short personalized digest summarizing new career paths in your areas of interest</small>
                  </span>
                  <input name="emailNotifications" type="checkbox" defaultChecked={profile.preferences?.emailNotifications !== false} />
                  <i />
                </label>

                <label className="toggle-row">
                  <span>
                    <strong>New Resources for Bookmarked Careers</strong>
                    <small>Get notified when expert guides, checklists, or videos are added for your saved careers</small>
                  </span>
                  <input name="recommendationNotifications" type="checkbox" defaultChecked={profile.preferences?.recommendationNotifications !== false} />
                  <i />
                </label>

                <label className="toggle-row">
                  <span>
                    <strong>Learning & Roadmap Reminders</strong>
                    <small>Friendly reminders to complete your next skill milestone or explore quiz results</small>
                  </span>
                  <input name="roadmapReminders" type="checkbox" defaultChecked={profile.preferences?.roadmapReminders !== false} />
                  <i />
                </label>

                <div style={{ marginTop: '24px' }}>
                  <button type="submit" className="button primary" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Save Notification Settings'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* 6. PRIVACY & SECURITY */}
          {activeTab === 'Privacy & data' && (
            <>
              <SectionHead eyebrow="Your Data & Control" title="Privacy & Security" />
              <div className="privacy-list">
                <button type="button" onClick={handleDownloadJsonData}>
                  <span><Icon name="download" /></span>
                  <p>
                    <strong>Download My Data (JSON)</strong>
                    <small>Export a full JSON copy of your profile, skills, education, and preferences.</small>
                  </p>
                  <Icon name="chevron" />
                </button>

                <button type="button" onClick={() => exportToPdf(`${user?.name || 'PathSeeker'} Career Passport`)}>
                  <span><Icon name="shield" /></span>
                  <p>
                    <strong>Download Career Passport (PDF)</strong>
                    <small>Generate an official Career Passport document with all your verified competencies.</small>
                  </p>
                  <Icon name="chevron" />
                </button>

                <button type="button" className="danger" onClick={() => setShowDeactivateModal(true)}>
                  <span><Icon name="close" /></span>
                  <p>
                    <strong>Deactivate Account</strong>
                    <small>Permanently deactivate your PathSeeker explorer account and remove personal data.</small>
                  </p>
                  <Icon name="chevron" />
                </button>
              </div>

              <div className="account-info-grid">
                <div className="account-info-card">
                  <small>Email Status</small>
                  <strong>{user?.emailVerified ? 'Verified ✓' : 'Pending Verification'}</strong>
                </div>
                <div className="account-info-card">
                  <small>User Role</small>
                  <strong style={{ textTransform: 'capitalize' }}>{user?.role || 'User'} ({stageDisplay})</strong>
                </div>
                <div className="account-info-card">
                  <small>Account ID</small>
                  <strong style={{ fontSize: '11px', fontFamily: 'monospace' }}>{user?._id || user?.id || 'Active'}</strong>
                </div>
              </div>
            </>
          )}
        </section>
      </div>

      {/* ADD EDUCATION DIALOG */}
      {showEduModal && (
        <div className="dialog-backdrop" onClick={() => setShowEduModal(false)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h3>Add Education Record</h3>
            <form onSubmit={handleAddEducation}>
              <div className="form-grid">
                <label>
                  Degree / Level
                  <select
                    value={eduDraft.level}
                    onChange={(e) => setEduDraft({ ...eduDraft, level: e.target.value })}
                  >
                    <option value="High School">High School</option>
                    <option value="Intermediate / A-Levels">Intermediate / A-Levels</option>
                    <option value="Bachelor">Bachelor&apos;s Degree</option>
                    <option value="Master">Master&apos;s Degree</option>
                    <option value="Doctorate">Doctorate (PhD)</option>
                    <option value="Certification / Diploma">Certification / Diploma</option>
                  </select>
                </label>
                <label>
                  Field of Study
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science"
                    value={eduDraft.field}
                    onChange={(e) => setEduDraft({ ...eduDraft, field: e.target.value })}
                  />
                </label>
                <label className="full">
                  Institution Name
                  <input
                    type="text"
                    required
                    placeholder="e.g. University of Engineering and Technology"
                    value={eduDraft.institution}
                    onChange={(e) => setEduDraft({ ...eduDraft, institution: e.target.value })}
                  />
                </label>
                <label>
                  Start Year
                  <input
                    type="number"
                    min="1960"
                    max="2035"
                    value={eduDraft.startYear}
                    onChange={(e) => setEduDraft({ ...eduDraft, startYear: Number(e.target.value) })}
                  />
                </label>
                <label>
                  End Year
                  <input
                    type="number"
                    min="1960"
                    max="2035"
                    disabled={eduDraft.current}
                    value={eduDraft.endYear}
                    onChange={(e) => setEduDraft({ ...eduDraft, endYear: Number(e.target.value) })}
                  />
                </label>
              </div>
              <div className="dialog-actions">
                <button type="button" className="button soft" onClick={() => setShowEduModal(false)}>Cancel</button>
                <button type="submit" className="button primary">Save Education</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD EXPERIENCE DIALOG */}
      {showExpModal && (
        <div className="dialog-backdrop" onClick={() => setShowExpModal(false)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h3>Add Work / Project Experience</h3>
            <form onSubmit={handleAddExperience}>
              <div className="form-grid">
                <label className="full">
                  Role / Title
                  <input
                    type="text"
                    required
                    placeholder="e.g. Junior UI/UX Designer or Student Lead"
                    value={expDraft.title}
                    onChange={(e) => setExpDraft({ ...expDraft, title: e.target.value })}
                  />
                </label>
                <label className="full">
                  Company / Organization
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tech Studio Ltd. or Open Source Project"
                    value={expDraft.organization}
                    onChange={(e) => setExpDraft({ ...expDraft, organization: e.target.value })}
                  />
                </label>
                <label className="full">
                  Summary & Key Responsibilities
                  <textarea
                    placeholder="Describe your responsibilities, technologies used, and key outcomes..."
                    value={expDraft.description}
                    onChange={(e) => setExpDraft({ ...expDraft, description: e.target.value })}
                  />
                </label>
              </div>
              <div className="dialog-actions">
                <button type="button" className="button soft" onClick={() => setShowExpModal(false)}>Cancel</button>
                <button type="submit" className="button primary">Save Experience</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DEACTIVATE CONFIRMATION DIALOG */}
      {showDeactivateModal && (
        <div className="dialog-backdrop" onClick={() => setShowDeactivateModal(false)}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#c0392b' }}>Deactivate Account</h3>
            <p style={{ color: 'var(--muted)', fontSize: '13px', lineHeight: '1.6' }}>
              Are you sure you want to deactivate your PathSeeker account? Your saved careers, quiz attempts, and personalized recommendations will be disabled.
            </p>
            <div className="dialog-actions">
              <button type="button" className="button soft" onClick={() => setShowDeactivateModal(false)}>Cancel</button>
              <button
                type="button"
                className="button primary"
                style={{ background: '#c0392b', borderColor: '#c0392b' }}
                onClick={() => {
                  setShowDeactivateModal(false)
                  setToast({ type: 'success', message: 'Account deactivation requested. Our support team will process your request.' })
                }}
              >
                Confirm Deactivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
