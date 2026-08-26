import { Bookmark, Comparison, RecentlyViewed, SavedFilter } from '../models/index.js'
import { ITEM_TYPE_TO_MODEL } from '../models/Bookmark.js'
import AppError from '../utils/AppError.js'
import { buildPaginationMeta } from '../utils/pagination.js'

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

  try {
    return await Bookmark.create({ userId, itemType, itemId, note })
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
  bookmark.note = note
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

// Upserts so viewing the same item again just bumps viewedAt instead of
// growing the collection unboundedly.
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

// ---------------------------------------------------------------------------
// Saved filters
// ---------------------------------------------------------------------------

export async function listSavedFilters(userId) {
  return SavedFilter.find({ userId }).sort({ createdAt: -1 })
}

export async function createSavedFilter(userId, { name, domainIds, salaryMin, demand, alerts }) {
  return SavedFilter.create({ userId, name, domainIds, salaryMin, demand, alerts })
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
  return Comparison.create({ userId, name, careerIds })
}

export async function deleteComparison(userId, comparisonId) {
  const result = await Comparison.deleteOne({ _id: comparisonId, userId })
  if (result.deletedCount === 0) {
    throw new AppError(404, 'Comparison not found.', 'NOT_FOUND')
  }
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
  listComparisons,
  createComparison,
  deleteComparison,
}