import * as personalizationService from '../services/personalization.service.js'
import AppError from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { isNonEmptyString } from '../utils/validators.js'
import { parsePagination } from '../utils/pagination.js'
import { CAREER_DEMAND_LEVELS } from '../constants/database.js'

// --- Bookmarks ---------------------------------------------------------

export const getBookmarks = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const { bookmarks, meta } = await personalizationService.listBookmarks(req.user.id, { page, limit, skip })
  res.status(200).json({ data: { bookmarks, meta } })
})

export const createBookmark = asyncHandler(async (req, res) => {
  const { itemType, itemId, note } = req.body
  if (!isNonEmptyString(itemId, { min: 12, max: 64 })) {
    throw new AppError(400, 'itemId is required.', 'VALIDATION_ERROR')
  }
  const bookmark = await personalizationService.addBookmark(req.user.id, { itemType, itemId, note })
  res.status(201).json({ data: { bookmark } })
})

export const updateBookmark = asyncHandler(async (req, res) => {
  const { note } = req.body
  const bookmark = await personalizationService.updateBookmarkNote(req.user.id, req.params.id, note)
  res.status(200).json({ data: { bookmark } })
})

export const deleteBookmark = asyncHandler(async (req, res) => {
  await personalizationService.removeBookmark(req.user.id, req.params.id)
  res.status(200).json({ data: null, message: 'Bookmark removed.' })
})

// --- Recently viewed -----------------------------------------------------

export const getRecentlyViewed = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const { items, meta } = await personalizationService.listRecentlyViewed(req.user.id, { page, limit, skip })
  res.status(200).json({ data: { items, meta } })
})

export const createRecentlyViewed = asyncHandler(async (req, res) => {
  const { itemType, itemId } = req.body
  if (!isNonEmptyString(itemId, { min: 12, max: 64 })) {
    throw new AppError(400, 'itemId is required.', 'VALIDATION_ERROR')
  }
  const item = await personalizationService.recordView(req.user.id, { itemType, itemId })
  res.status(201).json({ data: { item } })
})

// --- Saved filters ---------------------------------------------------------

export const getSavedFilters = asyncHandler(async (req, res) => {
  const savedFilters = await personalizationService.listSavedFilters(req.user.id)
  res.status(200).json({ data: { savedFilters } })
})

export const createSavedFilter = asyncHandler(async (req, res) => {
  const { name, domainIds, skillIds, salaryMin, demand, alerts } = req.body
  if (!isNonEmptyString(name, { min: 2, max: 150 })) {
    throw new AppError(400, 'name must be between 2 and 150 characters.', 'VALIDATION_ERROR')
  }
  if (demand && !['any', ...CAREER_DEMAND_LEVELS].includes(demand)) {
    throw new AppError(400, `demand must be one of: any, ${CAREER_DEMAND_LEVELS.join(', ')}`, 'VALIDATION_ERROR')
  }

  const savedFilter = await personalizationService.createSavedFilter(req.user.id, {
    name,
    domainIds,
    skillIds,
    salaryMin,
    demand,
    alerts,
  })
  res.status(201).json({ data: { savedFilter } })
})

export const deleteSavedFilter = asyncHandler(async (req, res) => {
  await personalizationService.deleteSavedFilter(req.user.id, req.params.id)
  res.status(200).json({ data: null, message: 'Saved filter removed.' })
})

// --- Comparisons -----------------------------------------------------------

export const getComparisons = asyncHandler(async (req, res) => {
  const comparisons = await personalizationService.listComparisons(req.user.id)
  res.status(200).json({ data: { comparisons } })
})

export const createComparison = asyncHandler(async (req, res) => {
  const { name, careerIds } = req.body
  if (!Array.isArray(careerIds) || careerIds.length < 2 || careerIds.length > 5) {
    throw new AppError(400, 'careerIds must contain between 2 and 5 career ids.', 'VALIDATION_ERROR')
  }

  const comparison = await personalizationService.createComparison(req.user.id, { name, careerIds })
  res.status(201).json({ data: { comparison } })
})

export const deleteComparison = asyncHandler(async (req, res) => {
  await personalizationService.deleteComparison(req.user.id, req.params.id)
  res.status(200).json({ data: null, message: 'Comparison removed.' })
})

export default {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  getRecentlyViewed,
  createRecentlyViewed,
  getSavedFilters,
  createSavedFilter,
  deleteSavedFilter,
  getComparisons,
  createComparison,
  deleteComparison,
}
