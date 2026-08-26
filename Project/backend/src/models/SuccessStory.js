import mongoose from 'mongoose'
import { STORY_STATUSES } from '../constants/database.js'
import { AssetSchema } from '../schemas/asset.schema.js'

const { Schema } = mongoose

const successStorySchema = new Schema(
  {
    submittedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    authorName: { type: String, required: true, trim: true, maxlength: 150 },
    domainId: { type: Schema.Types.ObjectId, ref: 'Domain', required: true },
    storyText: { type: String, required: true, trim: true, maxlength: 5_000 },
    image: { type: AssetSchema },
    status: { type: String, required: true, enum: STORY_STATUSES, default: 'pending' },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
  },
  { timestamps: true, collection: 'successStories' },
)

successStorySchema.pre('validate', function requireApprovalFields() {
  if (this.status === 'approved' && !this.approvedAt) {
    this.approvedAt = new Date()
  }
})

successStorySchema.index({ status: 1, domainId: 1, createdAt: -1 })
successStorySchema.index({ submittedBy: 1 })

export const SuccessStory =
  mongoose.models.SuccessStory || mongoose.model('SuccessStory', successStorySchema)
export default SuccessStory