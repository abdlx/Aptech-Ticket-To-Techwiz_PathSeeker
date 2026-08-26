import mongoose from 'mongoose'
import { NOTIFICATION_TYPES } from '../constants/database.js'

const { Schema } = mongoose

const notificationSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    type: { type: String, required: true, enum: NOTIFICATION_TYPES },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, trim: true, maxlength: 1_000 },
    icon: { type: String, trim: true, maxlength: 50 },
    read: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true, collection: 'notifications' },
)

notificationSchema.pre('validate', function requireReadAt() {
  if (this.read && !this.readAt) {
    this.readAt = new Date()
  }
})

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 })

export const Notification =
  mongoose.models.Notification || mongoose.model('Notification', notificationSchema)
export default Notification