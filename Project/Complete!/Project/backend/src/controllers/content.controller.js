import * as contentService from '../services/content.service.js'
import AppError from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { parsePagination } from '../utils/pagination.js'
import { isNonEmptyString, isSafeHttpUrl } from '../utils/validators.js'
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

export const viewResource = asyncHandler(async (req, res) => {
  const resource = await contentService.recordResourceView(req.params.id)
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

export const getRelatedMedia = asyncHandler(async (req, res) => {
  const media = await contentService.getRelatedMedia(req.params.id, Number(req.query.limit) || 6)
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

export const uploadStoryImage = asyncHandler(async (req, res) => {
  if (!req.uploadedFile || !req.uploadedFile.mimeType.startsWith('image/')) {
    throw new AppError(415, 'Story images must be JPEG, PNG, WebP, or GIF files.', 'UNSUPPORTED_FILE_TYPE')
  }
  res.status(201).json({ data: { asset: req.uploadedFile } })
})


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
  const { authorName, domainId, storyText, educationPath, challenges, outcome, image, consent } = req.body
  if (!isNonEmptyString(authorName, { min: 2, max: 150 })) {
    throw new AppError(400, 'authorName must be between 2 and 150 characters.', 'VALIDATION_ERROR')
  }
  if (!isNonEmptyString(domainId, { min: 12, max: 64 })) {
    throw new AppError(400, 'domainId is required.', 'VALIDATION_ERROR')
  }
  if (consent !== true) throw new AppError(400, 'You must consent to submit this story.', 'VALIDATION_ERROR')
  if (!isNonEmptyString(storyText, { min: 20, max: 5_000 })) {
    throw new AppError(400, 'storyText must be at least 20 characters.', 'VALIDATION_ERROR')
  }
  if (image !== undefined) {
    if (!image || !isNonEmptyString(image.assetKey, { min: 10, max: 200 }) || !isNonEmptyString(image.url, { min: 1, max: 2_000 }) || !isSafeHttpUrl(image.url) || !String(image.mimeType || '').startsWith('image/')) {
      throw new AppError(400, 'image must be a validated uploaded image asset.', 'VALIDATION_ERROR')
    }
  }

  const story = await contentService.submitStory(req.user.id, { authorName, domainId, storyText, educationPath, challenges, outcome, image, consent })
  res.status(201).json({
    data: { story },
    message: 'Your story is with our review team.',
  })
})


export const getMyStories = asyncHandler(async (req, res) => {
  const stories = await contentService.listMyStories(req.user.id)
  res.json({ data: { stories } })
})
export const getMyStory = asyncHandler(async (req, res) => {
  const story = await contentService.getMyStory(req.user.id, req.params.id)
  res.json({ data: { story } })
})
export const updateMyStory = asyncHandler(async (req, res) => {
  const story = await contentService.updateMyStory(req.user.id, req.params.id, req.body)
  res.json({ data: { story } })
})
export const submitMyStory = asyncHandler(async (req, res) => {
  const story = await contentService.submitMyStory(req.user.id, req.params.id)
  res.json({ data: { story }, message: 'Story submitted for review.' })
})

export default {
  getResources,
  getResourceById,
  viewResource,
  downloadResource,
  getMedia,
  getMediaById,
  rateMedia,
  getRelatedMedia,
  getStories,
  getStoryById,
  submitStory,
  getMyStories,
  getMyStory,
  updateMyStory,
  submitMyStory,
  uploadStoryImage,
}