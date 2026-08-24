import mongoose from 'mongoose'

const { Schema } = mongoose

export const AssetSchema = new Schema(
  {
    assetKey: { type: String, trim: true, maxlength: 500 },
    url: { type: String, trim: true, maxlength: 2_000 },
    mimeType: { type: String, trim: true, maxlength: 100 },
    sizeBytes: { type: Number, min: 0 },
    originalName: { type: String, trim: true, maxlength: 255 },
  },
  { _id: false },
)
