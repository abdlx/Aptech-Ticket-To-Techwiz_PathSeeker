import mongoose from 'mongoose'
const { Schema } = mongoose
const helpArticleSchema = new Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  slug: { type: String, required: true, trim: true, lowercase: true, maxlength: 220 },
  summary: { type: String, trim: true, maxlength: 500 },
  body: { type: String, required: true, trim: true, maxlength: 20_000 },
  category: { type: String, trim: true, maxlength: 80, default: 'General' },
  sortOrder: { type: Number, min: 0, default: 0 },
  published: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true, collection: 'helpArticles' })
helpArticleSchema.index({ slug: 1 }, { unique: true })
helpArticleSchema.index({ published: 1, category: 1, sortOrder: 1 })
helpArticleSchema.index({ title: 'text', summary: 'text', body: 'text' })
export const HelpArticle = mongoose.models.HelpArticle || mongoose.model('HelpArticle', helpArticleSchema)
export default HelpArticle
