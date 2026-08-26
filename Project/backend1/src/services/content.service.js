import fs from 'node:fs/promises'
import path from 'node:path'
import { MediaRating, Multimedia, Resource, SuccessStory } from '../models/index.js'
import { buildPaginationMeta } from '../utils/pagination.js'
import AppError from '../utils/AppError.js'
import { stripHtml } from '../utils/sanitize.js'

// ---------------------------------------------------------------------------
// Resources (document library)
// ---------------------------------------------------------------------------

export async function listResources({ type, tag, page, limit, skip }) {
  const filter = { $or: [{ status: 'published' }, { status: { $exists: false }, active: true }] }
  if (type) filter.type = type
  if (tag) filter.tags = tag

  const [resources, total] = await Promise.all([
    Resource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Resource.countDocuments(filter),
  ])
  return { resources, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function getResourceById(id) {
  const resource = await Resource.findOne({
    _id: id,
    $or: [{ status: 'published' }, { status: { $exists: false }, active: true }],
  })
  if (!resource) {
    throw new AppError(404, 'Resource not found.', 'NOT_FOUND')
  }
  return resource
}

export async function recordResourceView(id) {
  const resource = await getResourceById(id)
  resource.viewsCount = (resource.viewsCount || 0) + 1
  await resource.save()
  return resource
}

export async function recordResourceDownload(id) {
  const resource = await getResourceById(id)
  resource.downloadCount += 1
  await resource.save()
  return resource
}

// ---------------------------------------------------------------------------
// Multimedia (video/audio/animation) + ratings
// ---------------------------------------------------------------------------

export async function listMedia({ type, tag, page, limit, skip }) {
  const filter = { $or: [{ status: 'published' }, { status: { $exists: false }, active: true }] }
  if (type) filter.type = type
  if (tag) filter.tags = tag

  const [media, total] = await Promise.all([
    Multimedia.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Multimedia.countDocuments(filter),
  ])
  return { media, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function getMediaById(id) {
  const media = await Multimedia.findOne({
    _id: id,
    $or: [{ status: 'published' }, { status: { $exists: false }, active: true }],
  }).populate('relatedCareerIds', 'title slug domainId')
  if (!media) {
    throw new AppError(404, 'Media not found.', 'NOT_FOUND')
  }
  return media
}

export async function rateMedia(userId, mediaId, value) {
  await getMediaById(mediaId)

  await MediaRating.findOneAndUpdate(
    { userId, mediaId },
    { $set: { value } },
    { upsert: true, setDefaultsOnInsert: true },
  )

  const [stats] = await MediaRating.aggregate([
    { $match: { mediaId: (await Multimedia.findById(mediaId))._id } },
    { $group: { _id: '$mediaId', avg: { $avg: '$value' }, count: { $sum: 1 } } },
  ])

  const media = await Multimedia.findByIdAndUpdate(
    mediaId,
    { $set: { ratingAvg: Math.round((stats?.avg || 0) * 10) / 10, ratingCount: stats?.count || 0 } },
    { new: true },
  )

  return media
}

export async function getRelatedMedia(mediaId, limit = 6) {
  const media = await Multimedia.findOne({
    _id: mediaId,
    $or: [{ status: 'published' }, { status: { $exists: false }, active: true }],
  }).lean()
  if (!media) throw new AppError(404, 'Media not found.', 'NOT_FOUND')
  const filter = {
    _id: { $ne: media._id },
    $or: [{ status: 'published' }, { status: { $exists: false }, active: true }],
  }
  if (media.relatedCareerIds?.length) filter.relatedCareerIds = { $in: media.relatedCareerIds }
  else if (media.tags?.length) filter.tags = { $in: media.tags.slice(0, 8) }
  return Multimedia.find(filter).sort({ ratingAvg: -1, createdAt: -1 }).limit(limit).lean()
}

// ---------------------------------------------------------------------------
// Success stories
// ---------------------------------------------------------------------------

export async function listApprovedStories({ domain, page, limit, skip }) {
  const filter = { status: 'approved' }
  if (domain) filter.domainId = domain

  const [stories, total] = await Promise.all([
    SuccessStory.find(filter)
      .sort({ featured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('domainId', 'name slug'),
    SuccessStory.countDocuments(filter),
  ])
  return { stories, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function getApprovedStoryById(id) {
  const story = await SuccessStory.findOne({ _id: id, status: 'approved' }).populate('domainId', 'name slug')
  if (!story) {
    throw new AppError(404, 'Story not found.', 'NOT_FOUND')
  }
  return story
}

export async function submitStory(userId, { authorName, domainId, storyText, educationPath, challenges, outcome, image, consent }) {
  return SuccessStory.create({
    submittedBy: userId,
    authorName: stripHtml(authorName).slice(0, 150),
    domainId,
    storyText: stripHtml(storyText).slice(0, 5000),
    educationPath: stripHtml(educationPath || '').slice(0, 1500),
    challenges: stripHtml(challenges || '').slice(0, 2000),
    outcome: stripHtml(outcome || '').slice(0, 1500),
    image,
    consent: consent === true,
    status: 'pending',
    submittedAt: new Date(),
  })
}

export async function listMyStories(userId) {
  return SuccessStory.find({ submittedBy: userId }).sort({ createdAt: -1 }).populate('domainId', 'name slug')
}

export async function getMyStory(userId, id) {
  const story = await SuccessStory.findOne({ _id: id, submittedBy: userId })
  if (!story) throw new AppError(404, 'Story not found.', 'NOT_FOUND')
  return story
}

async function removeStoryAsset(asset) {
  if (!asset?.assetKey) return
  const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads')
  await fs.rm(path.join(uploadDir, path.basename(asset.assetKey)), { force: true }).catch(() => {})
}

export async function updateMyStory(userId, id, payload) {
  const story = await getMyStory(userId, id)
  if (!['draft', 'changes_requested'].includes(story.status)) {
    throw new AppError(409, 'This story cannot be edited in its current review state.', 'STORY_NOT_EDITABLE')
  }
  story.authorName = stripHtml(payload.authorName ?? story.authorName).slice(0, 150)
  story.domainId = payload.domainId ?? story.domainId
  story.storyText = stripHtml(payload.storyText ?? story.storyText).slice(0, 5000)
  story.educationPath = stripHtml(payload.educationPath ?? story.educationPath ?? '').slice(0, 1500)
  story.challenges = stripHtml(payload.challenges ?? story.challenges ?? '').slice(0, 2000)
  story.outcome = stripHtml(payload.outcome ?? story.outcome ?? '').slice(0, 1500)
  if (payload.image !== undefined && payload.image?.assetKey && payload.image.assetKey !== story.image?.assetKey) {
    const previous = story.image
    story.image = payload.image
    await removeStoryAsset(previous)
  }
  if (payload.consent !== undefined) story.consent = payload.consent === true
  await story.save()
  return story
}

export async function submitMyStory(userId, id) {
  const story = await getMyStory(userId, id)
  if (!story.consent) throw new AppError(400, 'Consent is required before submission.', 'CONSENT_REQUIRED')
  if (!story.authorName || !story.domainId || story.storyText.length < 20) {
    throw new AppError(400, 'Complete the required story fields before submitting.', 'VALIDATION_ERROR')
  }
  if (!['draft', 'changes_requested'].includes(story.status)) {
    throw new AppError(409, 'This story is not awaiting resubmission.', 'STORY_NOT_SUBMITTABLE')
  }
  story.status = 'pending'
  story.submittedAt = new Date()
  story.reviewerId = undefined
  story.reviewedAt = undefined
  story.moderationNote = undefined
  await story.save()
  return story
}

export default {
  listResources,
  getResourceById,
  recordResourceView,
  recordResourceDownload,
  listMedia,
  getMediaById,
  rateMedia,
  getRelatedMedia,
  listApprovedStories,
  getApprovedStoryById,
  submitStory,
  listMyStories,
  getMyStory,
  updateMyStory,
  submitMyStory,
}