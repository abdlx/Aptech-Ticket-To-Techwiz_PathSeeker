import {
  Bookmark,
  Career,
  Comparison,
  RecentlyViewed,
  SavedFilter,
  UserProfile,
  Multimedia,
  Resource,
} from '../models/index.js'
import { ITEM_TYPE_TO_MODEL } from '../models/Bookmark.js'
import AppError from '../utils/AppError.js'
import { buildPaginationMeta } from '../utils/pagination.js'
import { sanitizeOptional } from '../utils/sanitize.js'

// ---------------------------------------------------------------------------
// Bookmarks
// ---------------------------------------------------------------------------

export async function listBookmarks(userId, { page, limit, skip }) {
  const filter = { userId }
  const [bookmarks, total] = await Promise.all([
    Bookmark.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('itemId'),
    Bookmark.countDocuments(filter),
  ])
  return { bookmarks, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function addBookmark(userId, { itemType, itemId, note }) {
  if (!Object.keys(ITEM_TYPE_TO_MODEL).includes(itemType)) {
    throw new AppError(400, `itemType must be one of: ${Object.keys(ITEM_TYPE_TO_MODEL).join(', ')}`, 'VALIDATION_ERROR')
  }
  const Model = (await import('../models/index.js'))[ITEM_TYPE_TO_MODEL[itemType]]
  const exists = await Model.exists({ _id: itemId })
  if (!exists) throw new AppError(404, 'The item you are trying to save does not exist.', 'NOT_FOUND')

  try {
    return await Bookmark.create({ userId, itemType, itemId, note: sanitizeOptional(note, 1000) })
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(409, 'This item is already bookmarked.', 'ALREADY_BOOKMARKED')
    }
    throw error
  }
}

export async function updateBookmarkNote(userId, bookmarkId, note) {
  const bookmark = await Bookmark.findOne({ _id: bookmarkId, userId })
  if (!bookmark) {
    throw new AppError(404, 'Bookmark not found.', 'NOT_FOUND')
  }
  bookmark.note = sanitizeOptional(note, 1000)
  await bookmark.save()
  return bookmark
}

export async function removeBookmark(userId, bookmarkId) {
  const result = await Bookmark.deleteOne({ _id: bookmarkId, userId })
  if (result.deletedCount === 0) {
    throw new AppError(404, 'Bookmark not found.', 'NOT_FOUND')
  }
}

// ---------------------------------------------------------------------------
// Recently viewed
// ---------------------------------------------------------------------------

export async function listRecentlyViewed(userId, { page, limit, skip }) {
  const filter = { userId }
  const [items, total] = await Promise.all([
    RecentlyViewed.find(filter).sort({ viewedAt: -1 }).skip(skip).limit(limit).populate('itemId'),
    RecentlyViewed.countDocuments(filter),
  ])
  return { items, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function recordView(userId, { itemType, itemId }) {
  if (!Object.keys(ITEM_TYPE_TO_MODEL).includes(itemType)) {
    throw new AppError(400, `itemType must be one of: ${Object.keys(ITEM_TYPE_TO_MODEL).join(', ')}`, 'VALIDATION_ERROR')
  }

  return RecentlyViewed.findOneAndUpdate(
    { userId, itemType, itemId },
    { $set: { viewedAt: new Date() } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  )
}

export async function removeRecentlyViewed(userId, activityId) {
  const result = await RecentlyViewed.deleteOne({ _id: activityId, userId })
  if (result.deletedCount === 0) throw new AppError(404, 'Recently viewed item not found.', 'NOT_FOUND')
}

export async function clearRecentlyViewed(userId) {
  await RecentlyViewed.deleteMany({ userId })
}

// ---------------------------------------------------------------------------
// Saved filters
// ---------------------------------------------------------------------------

export async function listSavedFilters(userId) {
  return SavedFilter.find({ userId }).sort({ createdAt: -1 })
}

export async function createSavedFilter(userId, { name, domainIds, skillIds, salaryMin, demand, alerts }) {
  return SavedFilter.create({ userId, name, domainIds, skillIds, salaryMin, demand, alerts })
}

export async function updateSavedFilter(userId, filterId, payload) {
  const filter = await SavedFilter.findOne({ _id: filterId, userId })
  if (!filter) throw new AppError(404, 'Saved filter not found.', 'NOT_FOUND')
  for (const key of ['name', 'domainIds', 'skillIds', 'salaryMin', 'demand', 'alerts']) {
    if (payload[key] !== undefined) filter[key] = payload[key]
  }
  await filter.save()
  return filter
}

export async function deleteSavedFilter(userId, filterId) {
  const result = await SavedFilter.deleteOne({ _id: filterId, userId })
  if (result.deletedCount === 0) {
    throw new AppError(404, 'Saved filter not found.', 'NOT_FOUND')
  }
}

// ---------------------------------------------------------------------------
// Comparisons
// ---------------------------------------------------------------------------

export async function listComparisons(userId) {
  return Comparison.find({ userId }).sort({ createdAt: -1 }).populate('careerIds', 'title slug demand expectedSalary')
}

export async function createComparison(userId, { name, careerIds }) {
  const count = await Career.countDocuments({ _id: { $in: careerIds }, active: true })
  if (count !== careerIds.length) {
    throw new AppError(400, 'One or more selected careers do not exist or are inactive.', 'VALIDATION_ERROR')
  }
  return Comparison.create({ userId, name, careerIds })
}

export async function deleteComparison(userId, comparisonId) {
  const result = await Comparison.deleteOne({ _id: comparisonId, userId })
  if (result.deletedCount === 0) {
    throw new AppError(404, 'Comparison not found.', 'NOT_FOUND')
  }
}

// ---------------------------------------------------------------------------
// Bookmarks export
// ---------------------------------------------------------------------------

export async function exportBookmarks(userId) {
  const bookmarks = await Bookmark.find({ userId }).sort({ createdAt: -1 }).populate('itemId')
  const lines = [
    'PathSeeker — Saved items',
    '',
    ...bookmarks.map((bookmark, index) => {
      const item = bookmark.itemId || {}
      const title = item.title || item.name || item.slug || 'Saved item'
      return `${index + 1}. ${title} [${bookmark.itemType}]${bookmark.note ? ` — Note: ${bookmark.note}` : ''}`
    }),
  ]
  return lines
    .join('\n')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x20-\x7E\n]/g, '')
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export async function getRecommendations(userId, limit = 6) {
  const [profile, latestAttempt, interactions] = await Promise.all([
    UserProfile.findOne({ userId }).lean(),
    (await import('../models/index.js')).QuizAttempt.findOne({ userId, status: 'completed' })
      .sort({ completedAt: -1 })
      .select('topCareerId')
      .lean(),
    Promise.all([
      Bookmark.find({ userId, itemType: 'career' }).select('itemId').lean(),
      RecentlyViewed.find({ userId, itemType: 'career' }).sort({ viewedAt: -1 }).limit(20).select('itemId').lean(),
    ]),
  ])
  if (profile?.preferences?.aiPersonalization === false) return []

  const bookmarkedCareerIds = new Set(interactions[0].map((item) => item.itemId.toString()))
  const viewedCareerIds = new Set(interactions[1].map((item) => item.itemId.toString()))
  const careers = await Career.find({ active: true })
    .populate('domainId', 'name slug')
    .populate('requiredSkills.skillId', 'name slug')
    .limit(100)
    .lean()

  const profileSkillIds = new Set((profile?.skills || []).map((skill) => skill.skillId?.toString()))
  const interests = (profile?.interests || []).map((value) => value.toLowerCase())
  const scored = careers
    .filter((career) => !bookmarkedCareerIds.has(career._id.toString()))
    .map((career) => {
      const required = career.requiredSkills || []
      const matchedSkills = required.filter((skill) => profileSkillIds.has(skill.skillId?._id?.toString()))
      const skillScore = required.length ? matchedSkills.length / required.length : 0
      const tagMatches = (career.tags || []).filter((tag) =>
        interests.some((interest) => tag.toLowerCase().includes(interest) || interest.includes(tag.toLowerCase())),
      ).length
      const interestScore = Math.min(1, tagMatches / Math.max(1, Math.min(3, career.tags?.length || 1)))
      const demandBonus = career.demand === 'very_high' ? 0.05 : career.demand === 'high' ? 0.03 : 0
      const quizBonus = latestAttempt?.topCareerId?.toString() === career._id.toString() ? 0.15 : 0
      const interactionBonus = bookmarkedCareerIds.has(career._id.toString())
        ? -0.05
        : viewedCareerIds.has(career._id.toString())
        ? 0.03
        : 0
      const match = Math.max(
        1,
        Math.min(99, Math.round((skillScore * 0.65 + interestScore * 0.2 + demandBonus + quizBonus + interactionBonus) * 100)),
      )
      const reasons = []
      if (matchedSkills.length) reasons.push(`Matches ${matchedSkills.length} of your profile skills`)
      if (tagMatches) reasons.push('Overlaps with your stated interests')
      if (quizBonus) reasons.push('Top career signal from your latest completed quiz')
      if (viewedCareerIds.has(career._id.toString())) reasons.push('Related to careers you recently explored')
      if (career.growthRatePercent != null) reasons.push(`${career.growthRatePercent}% projected growth`)
      return { career, match, reasons: reasons.slice(0, 3) }
    })
  return scored
    .sort((a, b) => b.match - a.match || (b.career.growthRatePercent || 0) - (a.career.growthRatePercent || 0))
    .slice(0, limit)
}

export async function getRecommendedContent(userId, limit = 6) {
  const preference = await UserProfile.findOne({ userId }).select('preferences.aiPersonalization').lean()
  if (preference?.preferences?.aiPersonalization === false) return { media: [], resources: [] }

  const bookmarked = await Bookmark.find({ userId, itemType: 'career' }).select('itemId').lean()
  const recent = await RecentlyViewed.find({ userId, itemType: 'career' })
    .sort({ viewedAt: -1 })
    .limit(10)
    .select('itemId')
    .lean()
  const careerIds = [...new Set([...bookmarked, ...recent].map((item) => item.itemId.toString()))]
  const careers = careerIds.length
    ? await Career.find({ _id: { $in: careerIds }, active: true }).select('tags').lean()
    : []
  const tags = [...new Set(careers.flatMap((career) => career.tags || []).map((tag) => tag.toLowerCase()))].slice(0, 12)
  const [media, resources] = await Promise.all([
    Multimedia.find({
      active: true,
      ...(careerIds.length
        ? { $or: [{ relatedCareerIds: { $in: careerIds } }, ...(tags.length ? [{ tags: { $in: tags } }] : [])] }
        : {}),
    })
      .sort({ ratingAvg: -1, createdAt: -1 })
      .limit(limit)
      .lean(),
    Resource.find({ active: true, ...(tags.length ? { tags: { $in: tags } } : {}) })
      .sort({ downloadCount: -1, createdAt: -1 })
      .limit(limit)
      .lean(),
  ])
  return { media, resources }
}

export default {
  listBookmarks,
  addBookmark,
  updateBookmarkNote,
  removeBookmark,
  listRecentlyViewed,
  recordView,
  listSavedFilters,
  createSavedFilter,
  deleteSavedFilter,
  updateSavedFilter,
  removeRecentlyViewed,
  clearRecentlyViewed,
  exportBookmarks,
  listComparisons,
  getRecommendations,
  getRecommendedContent,
  createComparison,
  deleteComparison,
}