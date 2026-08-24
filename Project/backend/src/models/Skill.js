import mongoose from 'mongoose'
import { SKILL_CATEGORIES } from '../constants/database.js'

const { Schema } = mongoose

const skillSchema = new Schema(
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
    category: { type: String, required: true, enum: SKILL_CATEGORIES },
    aliases: {
      type: [{ type: String, trim: true, maxlength: 100 }],
      default: [],
      validate: {
        validator: (aliases) => new Set(aliases.map((alias) => alias.toLowerCase())).size === aliases.length,
        message: 'Skill aliases must be unique (case-insensitive).',
      },
    },
    description: { type: String, trim: true, maxlength: 1_000 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true, collection: 'skills' },
)

skillSchema.index({ slug: 1 }, { unique: true })
skillSchema.index({ name: 1 })
skillSchema.index({ aliases: 1 })
skillSchema.index({ category: 1, active: 1 })

export const Skill = mongoose.models.Skill || mongoose.model('Skill', skillSchema)
export default Skill
