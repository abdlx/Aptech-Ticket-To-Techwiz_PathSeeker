import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import PageTitle from '../../components/common/PageTitle'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { careersApi } from '../../services/careersApi'
import { personalizationApi } from '../../services/personalizationApi'

export default function CompareCareersPage({ navigate }) {
  const [overrideSlugs, setOverrideSlugs] = useState(null)

  const careersQuery = useQuery({
    queryKey: ['careers', 'list', 'all'],
    queryFn: ({ signal }) => careersApi.getCareers({}, { signal }),
    staleTime: 60_000,
  })

  const saveComparisonMutation = useMutation({
    mutationFn: (careerIds) => personalizationApi.saveComparison({ careerIds }),
  })

  if (careersQuery.isLoading) return <PageSkeleton />
  if (careersQuery.error) return <ErrorState message={careersQuery.error.message} onRetry={careersQuery.refetch} />

  const allCareers = careersQuery.data?.data?.careers || []
  const selectedSlugs = overrideSlugs || allCareers.slice(0, 3).map((c) => c.slug)

  const selected = selectedSlugs
    .map((slug) => allCareers.find((c) => c.slug === slug || c._id === slug))
    .filter(Boolean)

  const update = (index, newSlug) => {
    const next = selectedSlugs.map((s, i) => (i === index ? newSlug : s))
    setOverrideSlugs(next)
    const selectedIds = next
      .map((slug) => allCareers.find((c) => c.slug === slug)?._id)
      .filter(Boolean)
    if (selectedIds.length >= 2) {
      saveComparisonMutation.mutate(selectedIds)
    }
  }

  const rows = [
    [
      'Typical salary',
      (career) =>
        career.expectedSalary
          ? `$${(career.expectedSalary.min / 1000).toFixed(0)}k – $${(career.expectedSalary.max / 1000).toFixed(0)}k`
          : '$70k – $110k',
    ],
    ['Projected growth', (career) => `+${career.growthRatePercent ?? 12}%`],
    [
      'Market demand',
      (career) =>
        career.marketDemand === 'very_high'
          ? 'Very high'
          : career.marketDemand === 'high'
          ? 'High demand'
          : career.marketDemand === 'medium'
          ? 'Medium'
          : 'Growing',
    ],
    [
      'Domain stream',
      (career) => career.domainId?.name || 'Technology',
    ],
  ]

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="page-stack">
      <Breadcrumbs
        items={[
          { label: 'Career Bank', to: 'careers' },
          { label: 'Compare Careers' },
        ]}
        navigate={navigate}
      />
      <PageTitle
        eyebrow="Career comparison"
        title="See the tradeoffs clearly"
        copy="Compare fit, salary expectations, growth outlook, and core skills side by side."
        actions={
          <button className="button soft" onClick={handlePrint}>
            <Icon name="download" /> Export comparison
          </button>
        }
      />

      <section className="compare-table panel">
        <div className="compare-head">
          <span>Compare</span>
          {selected.map((career, index) => (
            <div key={`${career._id}-${index}`}>
              <span className={`career-icon ${career.colorTone || 'lavender'}`}>
                <Icon name={career.iconKey || 'briefcase'} />
              </span>
              <select
                value={career.slug}
                onChange={(event) => update(index, event.target.value)}
              >
                {allCareers.map((item) => (
                  <option value={item.slug} key={item._id}>
                    {item.title}
                  </option>
                ))}
              </select>
              <button onClick={() => navigate('career-detail', career.slug)}>
                View profile
              </button>
            </div>
          ))}
        </div>

        {rows.map(([label, value]) => (
          <div className="compare-row" key={label}>
            <strong>{label}</strong>
            {selected.map((career, index) => (
              <span key={`${career._id}-${label}`}>{value(career, index)}</span>
            ))}
          </div>
        ))}

        <div className="compare-row skills">
          <strong>Core skills</strong>
          {selected.map((career) => {
            const skills = (career.requiredSkills || []).map((s) => s.skillId?.name || s.name || 'Skill')
            return (
              <span key={`${career._id}-skills`}>
                {skills.slice(0, 3).map((skill) => (
                  <em key={skill}>{skill}</em>
                ))}
              </span>
            )
          })}
        </div>
      </section>

      <section className="comparison-note">
        <img src="/assets/navi/navi-explaining.png" alt="Navi explaining" />
        <div>
          <span className="eyebrow">Navi’s take</span>
          <h2>{selected[0]?.title || 'UX Designer'} leads your comparison</h2>
          <p>
            {selected[0]?.title} pairs strong user empathy with creative problem-solving. Review the skill roadmap on each career profile to plan your next high-leverage project.
          </p>
        </div>
      </section>
    </div>
  )
}
