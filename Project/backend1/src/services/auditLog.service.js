import { AuditLog } from '../models/index.js'
import { buildPaginationMeta } from '../utils/pagination.js'

// Never let a logging failure break the actual admin action it's recording.
export async function logAction(actorId, action, targetType, targetId, details = undefined) {
  try {
    await AuditLog.create({ actorId, action, targetType, targetId, details })
  } catch (error) {
    console.error('Failed to write audit log:', error.message)
  }
}

export async function listAuditLogs({ actorId, targetType, page, limit, skip }) {
  const filter = {}
  if (actorId) filter.actorId = actorId
  if (targetType) filter.targetType = targetType

  const [logs, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('actorId', 'name email role'),
    AuditLog.countDocuments(filter),
  ])
  return { logs, meta: buildPaginationMeta({ page, limit, total }) }
}

export default { logAction, listAuditLogs }