import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import AdminTable from '../../components/admin/AdminTable'
import PageHead from '../../components/admin/PageHead'
import { ErrorState, PageSkeleton } from '../../components/common/RouteStates'
import { adminApi } from '../../services/adminApi'

export default function AdminAuditLogs() {
  const [targetType, setTargetType] = useState('')
  const query = useQuery({
    queryKey: ['admin', 'audit-logs', targetType],
    queryFn: ({ signal }) => adminApi.getAuditLogs({ ...(targetType ? { targetType } : {}), limit: 50 }, { signal }),
    refetchInterval: 30_000,
  })

  if (query.isLoading) return <PageSkeleton />
  if (query.error) return <ErrorState message={query.error.message} onRetry={query.refetch} />

  const logs = query.data?.data?.logs || []
  const types = [...new Set(logs.map((log) => log.targetType).filter(Boolean))].sort()
  const rows = logs.map((log) => [
    log.actorId?.name || 'System',
    log.action?.replaceAll('.', ' ') || 'activity',
    log.targetType || 'System',
    log.targetId || '—',
    new Date(log.createdAt).toLocaleString(),
  ])

  return <div className="admin-stack">
    <PageHead eyebrow="Security & oversight" title="Audit logs" description="A live, immutable record of administrative changes across the workspace." />
    <section className="admin-filterbar panel">
      <select value={targetType} onChange={(event) => setTargetType(event.target.value)}>
        <option value="">All record types</option>
        {types.map((type) => <option value={type} key={type}>{type}</option>)}
      </select>
      <span className="filter-count">{query.data?.data?.meta?.total ?? logs.length} events</span>
    </section>
    <AdminTable
      headings={['Actor', 'Action', 'Record type', 'Record ID', 'Time']}
      rows={rows.length ? rows : [['System', 'No administrative activity', '—', '—', '—']]}
    />
  </div>
}
