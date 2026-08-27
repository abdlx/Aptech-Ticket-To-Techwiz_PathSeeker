import { useEffect, useState } from 'react'
import PageHead from '../../components/admin/PageHead'
import { apiRequest, endpoints } from '../../services/pathseekerApi'

const blankCareer = {
  slug: '', title: '', domainId: '', summary: '', description: '', educationPath: '',
  expectedSalary: { min: '', max: '', currency: 'USD' }, demand: 'medium', growthRatePercent: 0,
  responsibilities: [], toolsToLearn: [], traits: [], tags: [], timeToJobReadyMinMonths: '', timeToJobReadyMaxMonths: '',
  iconKey: 'compass', colorTone: 'mint', requiredSkills: [], active: false, status: 'draft',
}

const csv = (value) => Array.isArray(value) ? value.join(', ') : ''
const list = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean)

export default function AdminCareerEditor({ navigate, careerId }) {
  const [career, setCareer] = useState(blankCareer)
  const [domains, setDomains] = useState([])
  const [skills, setSkills] = useState([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(Boolean(careerId))
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      apiRequest(endpoints.domains),
      apiRequest(endpoints.skills),
      careerId ? apiRequest(`${endpoints.careers}/${careerId}`) : Promise.resolve({ data: { career: blankCareer } }),
    ]).then(([d, s, c]) => {
      const raw = c.data.career || blankCareer
      setDomains(d.data.domains || [])
      setSkills(s.data.skills || [])
      setCareer({
        ...blankCareer,
        ...raw,
        domainId: raw.domainId?._id || raw.domainId || '',
        requiredSkills: (raw.requiredSkills || []).map((item) => ({ skillId: item.skillId?._id || item.skillId, importance: item.importance || 'important' })),
      })
    }).catch((err) => setError(err.message || 'Could not load the career.')).finally(() => setLoading(false))
  }, [careerId])

  const update = (patch) => setCareer((current) => ({ ...current, ...patch }))
  const updateSalary = (patch) => setCareer((current) => ({ ...current, expectedSalary: { ...current.expectedSalary, ...patch } }))

  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...career,
        status: career.status || 'draft',
        domainId: career.domainId,
        expectedSalary: {
          ...career.expectedSalary,
          min: Number(career.expectedSalary?.min) || 0,
          max: Number(career.expectedSalary?.max) || 0,
        },
        growthRatePercent: Number(career.growthRatePercent) || 0,
        timeToJobReadyMinMonths: Number(career.timeToJobReadyMinMonths) || 0,
        timeToJobReadyMaxMonths: Number(career.timeToJobReadyMaxMonths) || 0,
        responsibilities: list(career.responsibilities),
        toolsToLearn: list(career.toolsToLearn),
        traits: list(career.traits),
        tags: list(career.tags),
      }
      const endpoint = careerId ? `${endpoints.admin.careers}/${careerId}` : endpoints.admin.careers
      await apiRequest(endpoint, { method: careerId ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      navigate('admin-careers')
    } catch (err) {
      setError(err.message || 'Could not save the career.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="admin-stack"><div className="panel">Loading career…</div></div>

  return <div className="admin-stack">
    <PageHead eyebrow="Career Bank · Editor" title={career.title || 'New career'} copy="Edit the complete live career record.">
      <button className="button ghost" onClick={() => navigate('admin-careers')}>Cancel</button>
      <button className="button primary" disabled={!career.title || !career.slug || !career.domainId || saving} onClick={save}>{saving ? 'Saving…' : 'Save career'}</button>
    </PageHead>
    {error && <div className="panel form-error" role="alert">{error}</div>}
    <section className="panel form-grid">
      <label>Slug<input required value={career.slug || ''} onChange={e => update({ slug: e.target.value })} /></label>
      <label>Title<input required value={career.title || ''} onChange={e => update({ title: e.target.value })} /></label>
      <label>Domain<select required value={career.domainId || ''} onChange={e => update({ domainId: e.target.value })}><option value="">Choose</option>{domains.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}</select></label>
      <label>Demand<select value={career.demand || 'medium'} onChange={e => update({ demand: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="very_high">Very high</option></select></label>
      <label>Growth %<input type="number" value={career.growthRatePercent ?? 0} onChange={e => update({ growthRatePercent: e.target.value })} /></label>
      <label>Currency<input maxLength={3} value={career.expectedSalary?.currency || 'USD'} onChange={e => updateSalary({ currency: e.target.value.toUpperCase() })} /></label>
      <label>Salary min<input type="number" value={career.expectedSalary?.min ?? ''} onChange={e => updateSalary({ min: e.target.value })} /></label>
      <label>Salary max<input type="number" value={career.expectedSalary?.max ?? ''} onChange={e => updateSalary({ max: e.target.value })} /></label>
      <label>Ready min (months)<input type="number" min="0" value={career.timeToJobReadyMinMonths ?? ''} onChange={e => update({ timeToJobReadyMinMonths: e.target.value })} /></label>
      <label>Ready max (months)<input type="number" min="0" value={career.timeToJobReadyMaxMonths ?? ''} onChange={e => update({ timeToJobReadyMaxMonths: e.target.value })} /></label>
      <label>Icon key<input value={career.iconKey || ''} onChange={e => update({ iconKey: e.target.value })} /></label>
      <label>Color tone<input value={career.colorTone || ''} onChange={e => update({ colorTone: e.target.value })} /></label>
      <label className="full">Summary<textarea maxLength={500} value={career.summary || ''} onChange={e => update({ summary: e.target.value })} /></label>
      <label className="full">Description<textarea maxLength={3000} value={career.description || ''} onChange={e => update({ description: e.target.value })} /></label>
      <label className="full">Education path<textarea maxLength={500} value={career.educationPath || ''} onChange={e => update({ educationPath: e.target.value })} /></label>
      <label className="full">Responsibilities (comma separated)<textarea value={csv(career.responsibilities)} onChange={e => update({ responsibilities: e.target.value })} /></label>
      <label className="full">Tools to learn (comma separated)<textarea value={csv(career.toolsToLearn)} onChange={e => update({ toolsToLearn: e.target.value })} /></label>
      <label className="full">Traits (comma separated)<input value={csv(career.traits)} onChange={e => update({ traits: e.target.value })} /></label>
      <label className="full">Tags (comma separated)<input value={csv(career.tags)} onChange={e => update({ tags: e.target.value })} /></label>
      <label className="full">Required skills<select multiple value={career.requiredSkills.map((item) => item.skillId || '')} onChange={e => update({ requiredSkills: Array.from(e.target.selectedOptions).map((option) => ({ skillId: option.value, importance: 'important' })) })}>{skills.map(skill => <option key={skill._id} value={skill._id}>{skill.name}</option>)}</select></label>
      <label>Status<select value={career.status || 'draft'} onChange={e=>update({status:e.target.value,active:e.target.value==='published'})}><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
    </section>
  </div>
}
