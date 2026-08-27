import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/Icon'
import Breadcrumbs from '../../components/common/Breadcrumbs'
import PageTitle from '../../components/common/PageTitle'
import { EmptyState, ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { careersApi } from '../../services/careersApi'
import { personalizationApi } from '../../services/personalizationApi'

export default function SavedFiltersPage({ navigate }) {
  const queryClient = useQueryClient()
  const routeNavigate = useNavigate()
  const [editing, setEditing] = useState(null)

  const savedFiltersQuery = useQuery({
    queryKey: queryKeys.savedFilters.list(),
    queryFn: ({ signal }) => personalizationApi.getSavedFilters({ signal }),
  })

  const domainsQuery = useQuery({
    queryKey: ['domains', 'list'],
    queryFn: ({ signal }) => careersApi.getDomains({ signal }),
    staleTime: 60_000,
  })

  const createFilterMutation = useMutation({
    mutationFn: (payload) => personalizationApi.createSavedFilter(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedFilters.list() })
      setEditing(null)
    },
  })

  const deleteFilterMutation = useMutation({
    mutationFn: (id) => personalizationApi.deleteSavedFilter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.savedFilters.list() })
    },
  })

  if (savedFiltersQuery.isLoading) return <PageSkeleton />
  if (savedFiltersQuery.error) return <ErrorState message={savedFiltersQuery.error.message} onRetry={savedFiltersQuery.refetch} />

  const filters = savedFiltersQuery.data?.data?.savedFilters || []
  const availableDomains = domainsQuery.data?.data?.domains || []

  const handleSave = (e) => {
    e.preventDefault()
    if (!editing) return
    createFilterMutation.mutate({
      name: editing.name || 'My saved search',
      domainIds: editing.domainIds || [],
      salaryMin: editing.salaryMin ? Number(editing.salaryMin) : undefined,
      demand: editing.demand || 'any',
      alerts: Boolean(editing.alerts),
    })
  }

  return (
    <div className="page-stack">
      <Breadcrumbs
        items={[
          { label: 'Career Bank', to: 'careers' },
          { label: 'Saved Filters' },
        ]}
        navigate={navigate}
      />
      <PageTitle
        eyebrow="Career Bank"
        title="Saved searches and filters"
        copy="Return to useful searches quickly and optionally receive alerts when new careers match."
        actions={
          <button
            className="button primary"
            onClick={() =>
              setEditing({
                name: '',
                domainIds: availableDomains.slice(0, 1).map((d) => d._id),
                salaryMin: 50000,
                demand: 'any',
                alerts: false,
              })
            }
          >
            <Icon name="plus" /> New saved filter
          </button>
        }
      />

      <section className="saved-filter-grid">
        {filters.length > 0 ? (
          filters.map((filter) => {
            const domainNames = (filter.domainIds || []).map((d) => (typeof d === 'object' ? d.name : d)).filter(Boolean)
            const skillNames = (filter.skillIds || []).map((s) => (typeof s === 'object' ? s.name : s)).filter(Boolean)
            const applyFilter = () => {
              const query = new URLSearchParams()
              const domain = filter.domainIds?.[0]
              const skill = filter.skillIds?.[0]
              if (domain) query.set('domain', typeof domain === 'object' ? domain.slug : domain)
              if (skill) query.set('skill', typeof skill === 'object' ? skill.slug : skill)
              if (filter.salaryMin) query.set('salaryMin', filter.salaryMin)
              if (filter.demand && filter.demand !== 'any') query.set('demand', filter.demand)
              routeNavigate(`/app/careers?${query.toString()}`)
            }
            return (
              <article className="panel" key={filter._id}>
                <div>
                  <span className="filter-icon">
                    <Icon name="filter" />
                  </span>
                  <button
                    onClick={() => deleteFilterMutation.mutate(filter._id)}
                    title="Delete saved filter"
                    aria-label="Delete saved filter"
                  >
                    <Icon name="close" />
                  </button>
                </div>
                <h3>{filter.name}{skillNames.length ? ` - ${skillNames.join(' + ')}` : ''}</h3>
                <p>
                  {domainNames.length ? domainNames.join(' + ') : 'All domains'} ·{' '}
                  {filter.salaryMin ? `$${filter.salaryMin.toLocaleString()}+` : 'Any salary'} ·{' '}
                  {filter.demand === 'very_high' ? 'Very high' : filter.demand === 'high' ? 'High' : filter.demand === 'medium' ? 'Medium' : 'Any'} demand
                </p>
                <span className={`alert-pill ${filter.alerts ? 'on' : ''}`}>
                  <Icon name="bell" /> Alerts {filter.alerts ? 'on' : 'off'}
                </span>
                <div>
                  <button className="button soft small" onClick={applyFilter}>
                    Apply in Career Bank
                  </button>
                </div>
              </article>
            )
          })
        ) : (
          <EmptyState
            title="No saved filters yet"
            message="Save your favorite search combinations from the Career Bank for quick one-click filtering."
          />
        )}
      </section>

      {editing && (
        <div className="inline-editor panel">
          <div>
            <span className="eyebrow">New filter</span>
            <h2>Filter preferences</h2>
          </div>
          <form onSubmit={handleSave}>
            <label>
              Filter name
              <input
                required
                placeholder="e.g. High-growth design & tech"
                value={editing.name}
                onChange={(event) => setEditing({ ...editing, name: event.target.value })}
              />
            </label>
            <label>
              Domain
              <select
                value={editing.domainIds?.[0] || ''}
                onChange={(event) => setEditing({ ...editing, domainIds: event.target.value ? [event.target.value] : [] })}
              >
                <option value="">All domains</option>
                {availableDomains.map((domain) => (
                  <option key={domain._id} value={domain._id}>
                    {domain.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Minimum salary ($ USD)
              <input
                type="number"
                min="0"
                step="5000"
                value={editing.salaryMin || ''}
                onChange={(event) => setEditing({ ...editing, salaryMin: event.target.value })}
              />
            </label>
            <label>
              Market demand
              <select
                value={editing.demand || 'any'}
                onChange={(event) => setEditing({ ...editing, demand: event.target.value })}
              >
                <option value="any">Any demand</option>
                <option value="medium">Medium</option>
                <option value="high">High demand</option>
                <option value="very_high">Very high demand</option>
              </select>
            </label>
            <label className="check-row">
              <input
                type="checkbox"
                checked={Boolean(editing.alerts)}
                onChange={(event) => setEditing({ ...editing, alerts: event.target.checked })}
              />{' '}
              Notify me when new matching careers are added
            </label>
            <div>
              <button className="button ghost" type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="button primary" type="submit" disabled={createFilterMutation.isPending}>
                {createFilterMutation.isPending ? 'Saving...' : 'Save filter'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
