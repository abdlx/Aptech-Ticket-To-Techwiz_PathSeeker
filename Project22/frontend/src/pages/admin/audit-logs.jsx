import PageHead from '../../components/admin/PageHead'
import { useEffect, useState } from 'react'
import { apiRequest, endpoints } from '../../services/pathseekerApi'

export default function AuditLogsAdmin() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    apiRequest(`${endpoints.admin.auditLogs}?limit=100`).then(({ data }) => setLogs(data.logs || [])).finally(() => setLoading(false))
  }, [])
  return <div className="admin-stack"><PageHead eyebrow="Security oversight" title="Audit logs" description="Server-recorded administrative and security events." /><section className="panel admin-table">{loading ? <p>Loading audit logs…</p> : <table><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Target</th></tr></thead><tbody>{logs.map(log => <tr key={log._id}><td>{new Date(log.createdAt).toLocaleString()}</td><td>{log.actorId?.email || log.actorId?.name || 'System'}</td><td>{log.action}</td><td>{log.targetType}</td></tr>)}</tbody></table>}{!loading && !logs.length && <p>No audit events recorded yet.</p>}</section></div>
}
