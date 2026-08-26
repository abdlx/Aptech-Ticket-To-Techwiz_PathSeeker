import mongoose from 'mongoose'

const { Schema } = mongoose

const domainSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 100,
      match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 1_000 },
    icon: { type: String, trim: true, maxlength: 100 },
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, min: 0, default: 0 },
  },
  { timestamps: true, collection: 'domains' },
)

domainSchema.index({ slug: 1 }, { unique: true })
domainSchema.index({ active: 1, sortOrder: 1, name: 1 })

export const Domain = mongoose.models.Domain || mongoose.model('Domain', domainSchema)
export default Domain
