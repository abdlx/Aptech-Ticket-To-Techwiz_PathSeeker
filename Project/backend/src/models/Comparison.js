import mongoose from 'mongoose'

const { Schema } = mongoose

// Backs the `/users/me/comparisons` endpoint already referenced in
// frontend/src/services/pathseekerApi.js — a named set of careers a user is
// comparing side by side.
const comparisonSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    name: { type: String, trim: true, maxlength: 150 },
    careerIds: {
      type: [{ type: Schema.Types.ObjectId, ref: 'Career' }],
      validate: {
        validator: (ids) => ids.length >= 2 && ids.length <= 5,
        message: 'A comparison must contain between 2 and 5 careers.',
      },
    },
  },
  { timestamps: true, collection: 'comparisons' },
)

comparisonSchema.index({ userId: 1, createdAt: -1 })

export const Comparison = mongoose.models.Comparison || mongoose.model('Comparison', comparisonSchema)
export default Comparison