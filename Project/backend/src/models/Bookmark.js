import mongoose from 'mongoose'
import { SAVABLE_ITEM_TYPES } from '../constants/database.js'

const { Schema } = mongoose

// itemType is what the UI cares about; itemModel is the actual Mongoose
// model name Mongoose needs for a polymorphic populate() via refPath.
const ITEM_TYPE_TO_MODEL = Object.freeze({
  career: 'Career',
  resource: 'Resource',
  media: 'Multimedia',
  story: 'SuccessStory',
})

const bookmarkSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    itemType: { type: String, required: true, enum: SAVABLE_ITEM_TYPES, immutable: true },
    itemModel: { type: String, required: true, enum: Object.values(ITEM_TYPE_TO_MODEL), immutable: true },
    itemId: { type: Schema.Types.ObjectId, required: true, refPath: 'itemModel', immutable: true },
    note: { type: String, trim: true, maxlength: 1_000 },
  },
  { timestamps: true, collection: 'bookmarks' },
)

bookmarkSchema.pre('validate', function deriveItemModel() {
  if (this.itemType) {
    this.itemModel = ITEM_TYPE_TO_MODEL[this.itemType]
  }
})

bookmarkSchema.index({ userId: 1, itemType: 1, itemId: 1 }, { unique: true })
bookmarkSchema.index({ userId: 1, createdAt: -1 })

export const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema)
export { ITEM_TYPE_TO_MODEL }
export default Bookmark