import mongoose from 'mongoose'

const { Schema } = mongoose

// One rating per (user, media) pair. Multimedia.ratingAvg/ratingCount are
// recomputed from these documents whenever a rating is created or changed.
const mediaRatingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    mediaId: { type: Schema.Types.ObjectId, ref: 'Multimedia', required: true, immutable: true },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true, collection: 'mediaRatings' },
)

mediaRatingSchema.index({ userId: 1, mediaId: 1 }, { unique: true })
mediaRatingSchema.index({ mediaId: 1 })

export const MediaRating =
  mongoose.models.MediaRating || mongoose.model('MediaRating', mediaRatingSchema)
export default MediaRating