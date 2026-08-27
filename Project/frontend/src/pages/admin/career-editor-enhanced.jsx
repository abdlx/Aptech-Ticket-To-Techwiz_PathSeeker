import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'
import Icon from '../../components/Icon'
import Head from '../../components/admin/AdminEditorHead'
import Field from '../../components/admin/AdminField'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { adminApi } from '../../services/adminApi'
import { careersApi } from '../../services/careersApi'

const emptyForm = {
  title: '', slug: '', domainId: '', summary: '', description: '', educationPath: '',
  salaryMin: '', salaryMax: '', salaryMedian: '', demand: 'medium', growthRatePercent: '',
  responsibilities: '', toolsToLearn: '', tags: '', sourceLabel: '', sourceUrl: '', status: 'draft',
}

function toForm(career) {
  return {
    title: career.title || '', slug: career.slug || '', domainId: career.domainId?._id || career.domainId || '',
    summary: career.summary || '', description: career.description || '', educationPath: career.educationPath || '',
    salaryMin: career.expectedSalary?.min ?? '', salaryMax: career.expectedSalary?.max ?? '', salaryMedian: career.expectedSalary?.median ?? '',
    demand: career.demand || 'medium', growthRatePercent: career.growthRatePercent ?? '',
    responsibilities: (career.responsibilities || []).join('\n'), toolsToLearn: (career.toolsToLearn || []).join('\n'), tags: (career.tags || []).join(', '),
    sourceLabel: career.dataSource?.occupationLabel || '', sourceUrl: career.dataSource?.url || '', status: career.status || (career.active ? 'published' : 'draft'),
  }
}

const lines = (value) => value.split('\n').map((item) => item.trim()).filter(Boolean)
const csv = (value) => value.split(',').map((item) => item.trim()).filter(Boolean)
const optionalNumber = (value) => value === '' ? undefined : Number(value)

export default function AdminCareerEditorEnhanced({ navigate }) {
  const queryClient = useQueryClient()
  const location = useLocation()
  const identifier = decodeURIComponent(location.pathname.split('/').filter(Boolean).at(-1) || 'new')
  const isNew = identifier === 'new'
  const [draft, setDraft] = useState(null)
  const [notice, setNotice] = useState('')

  const careersQuery = useQuery({
    queryKey: ['admin', 'careers', 'editor'],
    queryFn: ({ signal }) => adminApi.getCareers({ limit: 100 }, { signal }), enabled: !isNew,
  })
  const domainsQuery = useQuery({ queryKey: ['domains', 'admin-editor'], queryFn: careersApi.getDomains, staleTime: 300_000 })
  const career = useMemo(
    () => (careersQuery.data?.data?.careers || []).find((item) => item._id === identifier || item.slug === identifier),
    [careersQuery.data, identifier],
  )
  const domains = domainsQuery.data?.data?.domains || []
  const form = draft || (career ? toForm(career) : { ...emptyForm, domainId: domains[0]?._id || '' })

  const mutation = useMutation({
    mutationFn: ({ status }) => {
      const payload = {
        title: form.title.trim(), slug: form.slug.trim().toLowerCase(), domainId: form.domainId,
        summary: form.summary.trim(), description: form.description.trim(), educationPath: form.educationPath.trim(),
        expectedSalary: { min: optionalNumber(form.salaryMin), max: optionalNumber(form.salaryMax), median: optionalNumber(form.salaryMedian), currency: 'USD' },
        demand: form.demand, growthRatePercent: optionalNumber(form.growthRatePercent),
        responsibilities: lines(form.responsibilities), toolsToLearn: lines(form.toolsToLearn), tags: csv(form.tags),
        dataSource: { name: 'U.S. Bureau of Labor Statistics, Occupational Outlook Handbook', occupationLabel: form.sourceLabel.trim(), url: form.sourceUrl.trim(), geography: 'United States', salaryYear: 2024, outlookPeriod: '2024-2034' },
        status,
      }
      return isNew ? adminApi.createCareer(payload) : adminApi.updateCareer(career._id, payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'careers'] })
      navigate('admin-careers')
    },
    onError: (error) => setNotice(error.message),
  })

  if (!isNew && careersQuery.isLoading) return <PageSkeleton />
  if (!isNew && careersQuery.error) return <ErrorState message={careersQuery.error.message} onRetry={careersQuery.refetch} />
  if (!isNew && careersQuery.isSuccess && !career) return <ErrorState title="Career not found" message="Return to the Career Bank and choose an existing profile." />
  const set = (key) => (event) => setDraft({ ...form, [key]: event.target.value })
  const submit = (status) => {
    setNotice('')
    if (!form.title.trim() || !form.slug.trim() || !form.domainId) { setNotice('Title, slug, and domain are required.'); return }
    mutation.mutate({ status })
  }

  return (
    <div className="admin-stack">
      <Head eyebrow="Career Bank - Connected editor" title={isNew ? 'Add a career profile' : `Edit ${career.title}`} copy="Maintain public career evidence, market context, responsibilities, tools, and publication state."><button className="button ghost" onClick={() => navigate('admin-careers')}>Cancel</button><button className="button soft" onClick={() => submit(isNew ? 'draft' : form.status)} disabled={mutation.isPending}>{isNew ? 'Save draft' : 'Save changes'}</button><button className="button primary" onClick={() => submit('published')} disabled={mutation.isPending}><Icon name="check" /> {mutation.isPending ? 'Saving...' : 'Publish changes'}</button></Head>
      {notice && <p className="form-error" role="alert">{notice}</p>}
      <section className="panel admin-editor-form connected-admin-form">
        <div className="editor-section"><h2>Overview</h2><div className="form-grid"><Field label="Career title"><input value={form.title} onChange={set('title')} required /></Field><Field label="URL slug"><input value={form.slug} onChange={set('slug')} placeholder="data-analyst" required /></Field><Field label="Domain"><select value={form.domainId} onChange={set('domainId')} required><option value="">Select a domain</option>{domains.map((domain) => <option key={domain._id} value={domain._id}>{domain.name}</option>)}</select></Field><Field label="Demand"><select value={form.demand} onChange={set('demand')}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="very_high">Very high</option></select></Field><Field label="Short summary"><textarea value={form.summary} onChange={set('summary')} /></Field><Field label="Full description"><textarea value={form.description} onChange={set('description')} /></Field></div></div>
        <div className="editor-section"><h2>Salary and outlook</h2><div className="form-grid"><Field label="Minimum salary (USD)"><input type="number" min="0" value={form.salaryMin} onChange={set('salaryMin')} /></Field><Field label="Median salary (USD)"><input type="number" min="0" value={form.salaryMedian} onChange={set('salaryMedian')} /></Field><Field label="Maximum salary (USD)"><input type="number" min="0" value={form.salaryMax} onChange={set('salaryMax')} /></Field><Field label="Projected growth (%)"><input type="number" min="-100" value={form.growthRatePercent} onChange={set('growthRatePercent')} /></Field><Field label="BLS occupation label"><input value={form.sourceLabel} onChange={set('sourceLabel')} /></Field><Field label="BLS source URL"><input type="url" value={form.sourceUrl} onChange={set('sourceUrl')} placeholder="https://www.bls.gov/ooh/..." /></Field></div></div>
        <div className="editor-section"><h2>Pathway and evidence</h2><div className="form-grid"><Field label="Education path"><textarea value={form.educationPath} onChange={set('educationPath')} /></Field><Field label="Tags (comma separated)"><textarea value={form.tags} onChange={set('tags')} /></Field><Field label="Responsibilities (one per line)"><textarea rows="6" value={form.responsibilities} onChange={set('responsibilities')} /></Field><Field label="Tools to learn (one per line)"><textarea rows="6" value={form.toolsToLearn} onChange={set('toolsToLearn')} /></Field></div></div>
      </section>
    </div>
  )
}
