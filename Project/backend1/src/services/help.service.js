import { HelpArticle } from '../models/index.js'
import AppError from '../utils/AppError.js'
import { stripHtml } from '../utils/sanitize.js'
import { logAction } from './auditLog.service.js'

export async function listPublishedHelp({ q, category, page = 1, limit = 20, skip = 0 }) {
  const filter = { published: true }
  if (category) filter.category = category
  if (q) filter.$text = { $search: q }
  const [articles, total] = await Promise.all([
    HelpArticle.find(filter)
      .sort(q ? { score: { $meta: 'textScore' } } : { sortOrder: 1, title: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    HelpArticle.countDocuments(filter),
  ])
  return { articles, meta: { page, limit, total, pages: Math.ceil(total / limit) } }
}

export async function getPublishedHelp(slugOrId) {
  const filter = /^[a-f0-9]{24}$/i.test(String(slugOrId))
    ? { _id: slugOrId, published: true }
    : { slug: String(slugOrId).toLowerCase(), published: true }
  const article = await HelpArticle.findOne(filter).lean()
  if (!article) throw new AppError(404, 'Help article not found.', 'NOT_FOUND')
  return article
}

export async function listAllHelp({ q, published, page = 1, limit = 20, skip = 0 }) {
  const filter = {}
  if (published !== undefined) filter.published = published
  if (q) filter.$text = { $search: q }
  const [articles, total] = await Promise.all([
    HelpArticle.find(filter)
      .sort({ sortOrder: 1, updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    HelpArticle.countDocuments(filter),
  ])
  return { articles, meta: { page, limit, total, pages: Math.ceil(total / limit) } }
}

function clean(payload) {
  return {
    title: stripHtml(payload.title || '').slice(0, 200),
    slug: String(payload.slug || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 220),
    summary: stripHtml(payload.summary || '').slice(0, 500),
    body: stripHtml(payload.body || '').slice(0, 20_000),
    category: stripHtml(payload.category || 'General').slice(0, 80),
    sortOrder: Math.max(0, Number(payload.sortOrder) || 0),
    published: Boolean(payload.published),
  }
}

export async function createHelp(adminUserId, payload) {
  const data = clean(payload)
  if (!data.title || !data.slug || !data.body) {
    throw new AppError(400, 'title, slug, and body are required.', 'VALIDATION_ERROR')
  }
  const article = await HelpArticle.create({ ...data, createdBy: adminUserId, updatedBy: adminUserId })
  await logAction(adminUserId, 'help.create', 'HelpArticle', article._id)
  return article
}

export async function updateHelp(adminUserId, id, payload) {
  const article = await HelpArticle.findById(id)
  if (!article) throw new AppError(404, 'Help article not found.', 'NOT_FOUND')
  Object.assign(article, clean({ ...article.toObject(), ...payload }), { updatedBy: adminUserId })
  await article.save()
  await logAction(adminUserId, 'help.update', 'HelpArticle', article._id)
  return article
}

export async function deleteHelp(adminUserId, id) {
  const result = await HelpArticle.deleteOne({ _id: id })
  if (!result.deletedCount) throw new AppError(404, 'Help article not found.', 'NOT_FOUND')
  await logAction(adminUserId, 'help.delete', 'HelpArticle', id)
}

export default {
  listPublishedHelp,
  getPublishedHelp,
  listAllHelp,
  createHelp,
  updateHelp,
  deleteHelp,
}
