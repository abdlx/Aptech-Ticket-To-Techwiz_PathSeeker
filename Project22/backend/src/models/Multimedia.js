import mongoose from 'mongoose'
import { MULTIMEDIA_TYPES } from '../constants/database.js'

const { Schema } = mongoose

const multimediaSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    type: { type: String, required: true, enum: MULTIMEDIA_TYPES },
    url: { type: String, required: true, trim: true, maxlength: 2_000 },
    transcript: { type: String, trim: true, maxlength: 20_000 },
    tags: { type: [{ type: String, trim: true, maxlength: 60 }], default: [] },
    relatedCareerIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Career' }], default: [] },
    ratingAvg: { type: Number, min: 0, max: 5, default: 0 },
    ratingCount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    publishedAt: { type: Date },
    archivedAt: { type: Date },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'multimedia' },
)

multimediaSchema.index({ active: 1, type: 1 })
multimediaSchema.index({ status: 1, createdAt: -1 })
multimediaSchema.index({ tags: 1 })
multimediaSchema.index({ ratingAvg: -1 })

export const Multimedia = mongoose.models.Multimedia || mongoose.model('Multimedia', multimediaSchema)
export default Multimedia