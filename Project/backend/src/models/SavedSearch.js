import mongoose from 'mongoose'

const { Schema } = mongoose

const savedSearchSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    label: { type: String, required: true, trim: true, maxlength: 100 },
    filters: {
      q: { type: String, trim: true, maxlength: 200 },
      domainSlug: { type: String, trim: true, lowercase: true, maxlength: 100 },
      skillSlugs: { type: [{ type: String, trim: true, lowercase: true }], default: [] },
      salaryMin: { type: Number, min: 0 },
      salaryMax: { type: Number, min: 0 },
      demand: { type: String, trim: true, lowercase: true },
    },
  },
  { timestamps: true, collection: 'savedSearches' },
)

savedSearchSchema.index({ userId: 1, createdAt: -1 })

export const SavedSearch =
  mongoose.models.SavedSearch || mongoose.model('SavedSearch', savedSearchSchema)
export default SavedSearch