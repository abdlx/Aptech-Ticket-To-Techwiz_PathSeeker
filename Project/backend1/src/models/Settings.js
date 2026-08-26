import mongoose from 'mongoose'

const { Schema } = mongoose

// Singleton document: only one Settings row is ever expected to exist.
// settings.service.js enforces this by always upserting the same document
// instead of creating new ones.
const settingsSchema = new Schema(
  {
    maintenanceMode: { type: Boolean, default: false },
    allowNewRegistrations: { type: Boolean, default: true },
    siteAnnouncement: { type: String, trim: true, maxlength: 500, default: '' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'settings' },
)

export const Settings = mongoose.models.Settings || mongoose.model('Settings', settingsSchema)
export default Settings