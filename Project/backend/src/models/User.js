import mongoose from 'mongoose'
import {
  EMAIL_PATTERN,
  USER_ROLES,
  USER_STAGES,
  USER_STATUSES,
} from '../constants/database.js'

const { Schema } = mongoose

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
      match: EMAIL_PATTERN,
    },
    normalizedEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 320,
      match: EMAIL_PATTERN,
    },
    passwordHash: { type: String, required: true, select: false, minlength: 20 },
    role: { type: String, required: true, enum: USER_ROLES, default: 'user' },
    stage: {
      type: String,
      enum: USER_STAGES,
      required() {
        return this.role === 'user'
      },
    },
    status: { type: String, required: true, enum: USER_STATUSES, default: 'active' },
    emailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date },
    lastLoginAt: { type: Date },
    deletedAt: { type: Date, select: false },
  },
  {
    timestamps: true,
    collection: 'users',
    toJSON: {
      transform(_document, value) {
        delete value.passwordHash
        delete value.normalizedEmail
        delete value.deletedAt
        return value
      },
    },
  },
)

userSchema.pre('validate', function normalizeIdentity() {
  if (this.email) {
    this.email = this.email.trim().toLowerCase()
    this.normalizedEmail = this.email
  }

  if (this.emailVerifiedAt && !this.emailVerified) {
    this.emailVerified = true
  }

  if (this.status === 'deleted' && !this.deletedAt) {
    this.deletedAt = new Date()
  }
})

userSchema.index({ normalizedEmail: 1 }, { unique: true })
userSchema.index({ role: 1, status: 1 })
userSchema.index({ createdAt: -1 })

export const User = mongoose.models.User || mongoose.model('User', userSchema)
export default User
