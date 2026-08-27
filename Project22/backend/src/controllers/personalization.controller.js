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


export const deleteRecentlyViewed = asyncHandler(async (req, res) => {
  await personalizationService.removeRecentlyViewed(req.user.id, req.params.id)
  res.status(200).json({ data: null, message: 'History item removed.' })
})

export const clearRecentlyViewed = asyncHandler(async (req, res) => {
  await personalizationService.clearRecentlyViewed(req.user.id)
  res.status(200).json({ data: null, message: 'Recently viewed history cleared.' })
})

export const updateSavedFilter = asyncHandler(async (req, res) => {
  const { name, domainIds, skillIds, salaryMin, demand, alerts } = req.body
  if (name !== undefined && !isNonEmptyString(name, { min: 2, max: 150 })) {
    throw new AppError(400, 'name must be between 2 and 150 characters.', 'VALIDATION_ERROR')
  }
  if (demand && !['any', ...CAREER_DEMAND_LEVELS].includes(demand)) {
    throw new AppError(400, `demand must be one of: any, ${CAREER_DEMAND_LEVELS.join(', ')}`, 'VALIDATION_ERROR')
  }
  const savedFilter = await personalizationService.updateSavedFilter(req.user.id, req.params.id, { name, domainIds, skillIds, salaryMin, demand, alerts })
  res.status(200).json({ data: { savedFilter } })
})

export const exportBookmarksPdf = asyncHandler(async (req, res) => {
  const text = await personalizationService.exportBookmarks(req.user.id)
  const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\\\(').replace(/\)/g, '\\\\)').replace(/\r?\n/g, ') Tj 0 -16 Td (')
  const stream = `BT /F1 10 Tf 50 780 Td (${escaped}) Tj ET`
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${Buffer.byteLength(stream, 'utf8')} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  for (let i = 0; i < objects.length; i += 1) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'))
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`
  }
  const xref = Buffer.byteLength(pdf, 'utf8')
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  for (let i = 1; i <= objects.length; i += 1) pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename="pathseeker-bookmarks.pdf"')
  res.status(200).send(pdf)
})



export const getRecommendedContent = asyncHandler(async (req, res) => {
  const content = await personalizationService.getRecommendedContent(req.user.id)
  res.status(200).json({ data: content })
})

export const getRecommendations = asyncHandler(async (req, res) => {
  const recommendations = await personalizationService.getRecommendations(req.user.id)
  res.status(200).json({ data: { recommendations } })
})

export default {
  getBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  getRecentlyViewed,
  createRecentlyViewed,
  deleteRecentlyViewed,
  clearRecentlyViewed,
  getSavedFilters,
  createSavedFilter,
  updateSavedFilter,
  deleteSavedFilter,
  exportBookmarksPdf,
  getComparisons,
  getRecommendations,
  getRecommendedContent,
  createComparison,
  deleteComparison,
}
