import * as contentService from '../services/content.service.js'
import AppError from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { parsePagination } from '../utils/pagination.js'
import { isNonEmptyString } from '../utils/validators.js'
import { MULTIMEDIA_TYPES, RESOURCE_TYPES } from '../constants/database.js'

// --- Resources -------------------------------------------------------------

export const getResources = asyncHandler(async (req, res) => {
  const { type, tag } = req.query
  if (type && !RESOURCE_TYPES.includes(type)) {
    throw new AppError(400, `type must be one of: ${RESOURCE_TYPES.join(', ')}`, 'VALIDATION_ERROR')
  }
  const { page, limit, skip } = parsePagination(req.query)
  const { resources, meta } = await contentService.listResources({ type, tag, page, limit, skip })
  res.status(200).json({ data: { resources, meta } })
})

export const getResourceById = asyncHandler(async (req, res) => {
  const resource = await contentService.getResourceById(req.params.id)
  res.status(200).json({ data: { resource } })
})

export const downloadResource = asyncHandler(async (req, res) => {
  const resource = await contentService.recordResourceDownload(req.params.id)
  res.status(200).json({ data: { resource } })
})

// --- Media -------------------------------------------------------------

export const getMedia = asyncHandler(async (req, res) => {
  const { type, tag } = req.query
  if (type && !MULTIMEDIA_TYPES.includes(type)) {
    throw new AppError(400, `type must be one of: ${MULTIMEDIA_TYPES.join(', ')}`, 'VALIDATION_ERROR')
  }
  const { page, limit, skip } = parsePagination(req.query)
  const { media, meta } = await contentService.listMedia({ type, tag, page, limit, skip })
  res.status(200).json({ data: { media, meta } })
})

export const getMediaById = asyncHandler(async (req, res) => {
  const media = await contentService.getMediaById(req.params.id)
  res.status(200).json({ data: { media } })
})

export const rateMedia = asyncHandler(async (req, res) => {
  const value = Number(req.body.value)
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    throw new AppError(400, 'value must be an integer between 1 and 5.', 'VALIDATION_ERROR')
  }
  const media = await contentService.rateMedia(req.user.id, req.params.id, value)
  res.status(200).json({ data: { media } })
})

// --- Stories -------------------------------------------------------------

export const getStories = asyncHandler(async (req, res) => {
  const { domain } = req.query
  const { page, limit, skip } = parsePagination(req.query)
  const { stories, meta } = await contentService.listApprovedStories({ domain, page, limit, skip })
  res.status(200).json({ data: { stories, meta } })
})

export const getStoryById = asyncHandler(async (req, res) => {
  const story = await contentService.getApprovedStoryById(req.params.id)
  res.status(200).json({ data: { story } })
})

export const submitStory = asyncHandler(async (req, res) => {
  const { authorName, domainId, storyText, image } = req.body
  if (!isNonEmptyString(authorName, { min: 2, max: 150 })) {
    throw new AppError(400, 'authorName must be between 2 and 150 characters.', 'VALIDATION_ERROR')
  }
  if (!isNonEmptyString(domainId, { min: 12, max: 64 })) {
    throw new AppError(400, 'domainId is required.', 'VALIDATION_ERROR')
  }
  if (!isNonEmptyString(storyText, { min: 20, max: 5_000 })) {
    throw new AppError(400, 'storyText must be at least 20 characters.', 'VALIDATION_ERROR')
  }

  const story = await contentService.submitStory(req.user.id, { authorName, domainId, storyText, image })
  res.status(201).json({
    data: { story },
    message: 'Your story is with our review team.',
  })
})

export default {
  getResources,
  getResourceById,
  downloadResource,
  getMedia,
  getMediaById,
  rateMedia,
  getStories,
  getStoryById,
  submitStory,
}