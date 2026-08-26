import mongoose from 'mongoose'

const { Schema } = mongoose

const auditLogSchema = new Schema(
  {
    actorId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    action: { type: String, required: true, trim: true, maxlength: 100 },
    targetType: { type: String, required: true, trim: true, maxlength: 100 },
    targetId: { type: Schema.Types.ObjectId },
    details: { type: Schema.Types.Mixed },
  },
  { timestamps: true, collection: 'auditLogs' },
)

auditLogSchema.index({ createdAt: -1 })
auditLogSchema.index({ actorId: 1, createdAt: -1 })
auditLogSchema.index({ targetType: 1, targetId: 1 })

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema)
export default AuditLog