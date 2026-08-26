import { MediaRating, Multimedia, Resource, SuccessStory } from '../models/index.js'
import { buildPaginationMeta } from '../utils/pagination.js'
import AppError from '../utils/AppError.js'

// ---------------------------------------------------------------------------
// Resources (document library)
// ---------------------------------------------------------------------------

export async function listResources({ type, tag, page, limit, skip }) {
  const filter = { active: true }
  if (type) filter.type = type
  if (tag) filter.tags = tag

  const [resources, total] = await Promise.all([
    Resource.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Resource.countDocuments(filter),
  ])
  return { resources, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function getResourceById(id) {
  const resource = await Resource.findOne({ _id: id, active: true })
  if (!resource) {
    throw new AppError(404, 'Resource not found.', 'NOT_FOUND')
  }
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
  const filter = { active: true }
  if (type) filter.type = type
  if (tag) filter.tags = tag

  const [media, total] = await Promise.all([
    Multimedia.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Multimedia.countDocuments(filter),
  ])
  return { media, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function getMediaById(id) {
  const media = await Multimedia.findOne({ _id: id, active: true })
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

  // Recompute directly from MediaRating documents so ratingAvg/ratingCount
  // never drift from what's actually stored.
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

// ---------------------------------------------------------------------------
// Success stories
// ---------------------------------------------------------------------------

export async function listApprovedStories({ domain, page, limit, skip }) {
  const filter = { status: 'approved' }
  if (domain) filter.domainId = domain

  const [stories, total] = await Promise.all([
    SuccessStory.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('domainId', 'name slug'),
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

export async function submitStory(userId, { authorName, domainId, storyText, image }) {
  return SuccessStory.create({
    submittedBy: userId,
    authorName,
    domainId,
    storyText,
    image,
    status: 'pending',
  })
}

export default {
  listResources,
  getResourceById,
  recordResourceDownload,
  listMedia,
  getMediaById,
  rateMedia,
  listApprovedStories,
  getApprovedStoryById,
  submitStory,
}