import mongoose from 'mongoose'

const { Schema } = mongoose

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    tokenHash: { type: String, required: true, select: false, minlength: 32, maxlength: 512 },
    ipAddress: { type: String, trim: true, maxlength: 64 },
    userAgent: { type: String, trim: true, maxlength: 1_000 },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    lastUsedAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'sessions',
  },
)

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
sessionSchema.index({ userId: 1, createdAt: -1 })
sessionSchema.index({ userId: 1, revokedAt: 1 })

export const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema)
export default Session
