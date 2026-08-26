import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import Icon from '../../components/Icon'
import PageHead from '../../components/admin/PageHead'
import AdminTable from '../../components/admin/AdminTable'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { queryKeys } from '../../lib/queryKeys'
import { exportToPdf } from '../../lib/pdfExport'
import { adminApi } from '../../services/adminApi'

export default function UsersAdmin() {
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const query = useQuery({
    queryKey: queryKeys.admin.users({ search, stage: stageFilter, status: statusFilter }),
    queryFn: ({ signal }) =>
      adminApi.getUsers(
        {
          ...(search ? { q: search } : {}),
          ...(stageFilter ? { stage: stageFilter } : {}),
          ...(statusFilter ? { status: statusFilter } : {}),
        },
        { signal },
      ),
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const users = query.data?.data?.users || []
  const rows = users.map((u) => {
    const initials = u.name ? u.name.split(/\s+/).map((p) => p[0]).join('').slice(0, 2).toUpperCase() : 'PS'
    const lastActive = u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Recent'
    return [
      `${initials}|${u.name}|${u.email}`,
      u.stage ? u.stage.charAt(0).toUpperCase() + u.stage.slice(1) : 'Explorer',
      u.role || 'user',
      u.status === 'active' ? 'Active' : u.status || 'Active',
      lastActive,
      u.status === 'active' ? 'Active' : 'Suspended',
      '⋯',
    ]
  })

  return (
    <div className="admin-stack">
      <PageHead
        eyebrow="Community"
        title="Users"
        description="View accounts, understand engagement, and manage access."
      >
        <button className="button soft" onClick={() => exportToPdf('PathSeeker User Directory')}>
          <Icon name="download" /> Export users
        </button>
      </PageHead>

      <section className="admin-filterbar panel">
        <div className="admin-search">
          <Icon name="search" />
          <input
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
          <option value="">All user stages</option>
          <option value="student">Students</option>
          <option value="graduate">Graduates</option>
          <option value="professional">Professionals</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">Any status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
        </select>
      </section>

      <AdminTable
        headings={['User', 'Stage', 'Role', 'Account state', 'Last active', 'Status', '']}
        rows={rows.length ? rows : [['PS|No users found|—', '—', '—', '—', '—', '—', '']]}
      />
    </div>
  )
}
