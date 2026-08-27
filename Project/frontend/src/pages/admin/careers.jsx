import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import Status from '../../components/admin/Status'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { exportToPdf } from '../../lib/pdfExport'
import { adminApi } from '../../services/adminApi'

export default function CareersAdmin({ navigate }) {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')

  const query = useQuery({
    queryKey: queryKeys.admin.careers({ search }),
    queryFn: ({ signal }) => adminApi.getCareers({ q: search }, { signal }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteCareer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.careers() })
    },
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const careers = query.data?.data?.careers || []
  const filtered = search.trim()
    ? careers.filter((c) => c.title?.toLowerCase().includes(search.toLowerCase()) || c.domainId?.name?.toLowerCase().includes(search.toLowerCase()))
    : careers

  return (
    <div className="admin-stack">
      <PageHead
        eyebrow="Career Bank"
        title="Career profiles"
        description="Create and maintain salary, skill, demand, and roadmap information."
      >
        <button className="button soft" onClick={() => exportToPdf('PathSeeker Career Bank')}>
          <Icon name="download" /> Export catalog
        </button>
        <button className="button primary" onClick={() => navigate('admin-career-editor', 'new')}>
          <Icon name="plus" /> New career profile
        </button>
      </PageHead>

      <section className="admin-filterbar panel">
        <div className="admin-search">
          <Icon name="search" />
          <input
            placeholder="Search career profiles"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="filter-count">{filtered.length} profiles</span>
      </section>

      <div className="career-admin-grid">
        {filtered.map((career) => (
          <article key={career._id} className="panel">
            <div>
              <span className={`career-icon ${career.colorTone || 'lavender'}`}>
                <Icon name={career.iconKey || 'briefcase'} />
              </span>
              <Status tone={career.active ? 'success' : 'draft'}>
                {career.active ? 'Published' : 'Draft'}
              </Status>
              <button
                onClick={() => {
                  if (window.confirm(`Delete career "${career.title}"?`)) {
                    deleteMutation.mutate(career._id)
                  }
                }}
                title="Delete career"
                aria-label="Delete career"
              >
                <Icon name="close" />
              </button>
            </div>
            <h3>{career.title}</h3>
            <p>{career.domainId?.name || 'Career stream'}</p>
            <div>
              <span>
                <small>Salary</small>
                <strong>
                  {career.expectedSalary ? `$${(career.expectedSalary.min / 1000).toFixed(0)}k+` : '—'}
                </strong>
              </span>
              <span>
                <small>Growth</small>
                <strong>+{career.growthRatePercent || 12}%</strong>
              </span>
              <span>
                <small>Skills</small>
                <strong>{career.requiredSkills?.length || 0}</strong>
              </span>
            </div>
            <button onClick={() => navigate('admin-career-editor', career.slug || career._id)}>
              <Icon name="edit" /> Edit profile
            </button>
          </article>
        ))}
      </div>
    </div>
  )
}
