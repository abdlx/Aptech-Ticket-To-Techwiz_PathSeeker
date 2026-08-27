import mongoose from 'mongoose'
import { SAVABLE_ITEM_TYPES } from '../constants/database.js'
import { ITEM_TYPE_TO_MODEL } from './Bookmark.js'

const { Schema } = mongoose

// Persistent "recently viewed" history (SRS: System Intelligence). One
// document per (user, item) pair — viewedAt is bumped on repeat views
// instead of inserting duplicates, so the list stays de-duplicated.
const recentlyViewedSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    itemType: { type: String, required: true, enum: SAVABLE_ITEM_TYPES, immutable: true },
    itemModel: { type: String, required: true, enum: Object.values(ITEM_TYPE_TO_MODEL), immutable: true },
    itemId: { type: Schema.Types.ObjectId, required: true, refPath: 'itemModel', immutable: true },
    viewedAt: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: true, updatedAt: false }, collection: 'recentlyViewed' },
)

recentlyViewedSchema.pre('validate', function deriveItemModel() {
  if (this.itemType) {
    this.itemModel = ITEM_TYPE_TO_MODEL[this.itemType]
  }
})

recentlyViewedSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true })
recentlyViewedSchema.index({ userId: 1, viewedAt: -1 })
recentlyViewedSchema.index({ itemType: 1, viewedAt: -1 })
recentlyViewedSchema.index({ itemType: 1, itemId: 1 })

export const RecentlyViewed =
  mongoose.models.RecentlyViewed || mongoose.model('RecentlyViewed', recentlyViewedSchema)
export default RecentlyViewed
