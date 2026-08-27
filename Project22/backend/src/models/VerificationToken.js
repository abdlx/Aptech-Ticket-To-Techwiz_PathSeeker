import mongoose from 'mongoose'
import { TOKEN_PURPOSES } from '../constants/database.js'

const { Schema } = mongoose

const verificationTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    purpose: { type: String, required: true, enum: TOKEN_PURPOSES, immutable: true },
    tokenHash: { type: String, required: true, select: false, minlength: 32, maxlength: 512 },
    attempts: { type: Number, min: 0, max: 10, default: 0 },
    expiresAt: { type: Date, required: true },
    usedAt: { type: Date },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'verificationTokens',
  },
)

verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })
verificationTokenSchema.index({ userId: 1, purpose: 1, createdAt: -1 })

export const VerificationToken =
  mongoose.models.VerificationToken ||
  mongoose.model('VerificationToken', verificationTokenSchema)
export default VerificationToken
