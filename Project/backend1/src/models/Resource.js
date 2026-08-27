import mongoose from 'mongoose'
import { RESOURCE_TYPES, USER_STAGES } from '../constants/database.js'
import { AssetSchema } from '../schemas/asset.schema.js'

const { Schema } = mongoose

const resourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 1_000 },
    type: { type: String, required: true, enum: RESOURCE_TYPES },
    file: { type: AssetSchema, required: true },
    pageCount: { type: Number, min: 0 },
    tags: { type: [{ type: String, trim: true, maxlength: 60 }], default: [] },
    relatedCareerIds: { type: [{ type: Schema.Types.ObjectId, ref: 'Career' }], default: [] },
    targetAudience: { type: [{ type: String, enum: USER_STAGES }], default: [] },
    authorName: { type: String, trim: true, maxlength: 150 },
    version: { type: String, trim: true, maxlength: 30 },
    originalContent: { type: Boolean, default: false },
    sourceReferences: {
      type: [{
        label: { type: String, trim: true, maxlength: 200 },
        url: { type: String, trim: true, maxlength: 2_000 },
      }],
      default: [],
    },
    lastReviewedAt: { type: Date },
    viewsCount: { type: Number, min: 0, default: 0 },
    downloadCount: { type: Number, min: 0, default: 0 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'published' },
    publishedAt: { type: Date },
    archivedAt: { type: Date },
    active: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'resources' },
)

resourceSchema.index({ active: 1, type: 1 })
resourceSchema.index({ status: 1, createdAt: -1 })
resourceSchema.index({ tags: 1 })
resourceSchema.index({ downloadCount: -1 })
resourceSchema.index({ title: 'text', description: 'text' })

export const Resource = mongoose.models.Resource || mongoose.model('Resource', resourceSchema)
export default Resource
