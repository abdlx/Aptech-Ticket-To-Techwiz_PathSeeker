import {
  Career,
  Feedback,
  Multimedia,
  QuizAttempt,
  QuizQuestion,
  RecentlyViewed,
  Resource,
  SuccessStory,
  User,
} from '../models/index.js'
import { buildPaginationMeta } from '../utils/pagination.js'
import AppError from '../utils/AppError.js'

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function listUsers({ q, stage, status, page, limit, skip }) {
  const filter = {}
  if (stage) filter.stage = stage
  if (status) filter.status = status
  if (q) {
    const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ name: regex }, { email: regex }]
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ])
  return { users, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function getUserById(id) {
  const user = await User.findById(id)
  if (!user) {
    throw new AppError(404, 'User not found.', 'NOT_FOUND')
  }
  return user
}

export async function updateUser(id, { role, status }) {
  const user = await getUserById(id)
  if (role) user.role = role
  if (status) user.status = status
  await user.save()
  return user
}

// ---------------------------------------------------------------------------
// Careers (full CRUD — public browsing is read-only via catalog.service)
// ---------------------------------------------------------------------------

export async function listAllCareers({ page, limit, skip }) {
  const [careers, total] = await Promise.all([
    Career.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('domainId', 'name slug'),
    Career.countDocuments({}),
  ])
  return { careers, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function createCareer(adminUserId, payload) {
  return Career.create({ ...payload, createdBy: adminUserId })
}

export async function updateCareer(careerId, payload) {
  const career = await Career.findById(careerId)
  if (!career) {
    throw new AppError(404, 'Career not found.', 'NOT_FOUND')
  }
  Object.assign(career, payload)
  await career.save()
  return career
}

export async function deleteCareer(careerId) {
  const result = await Career.deleteOne({ _id: careerId })
  if (result.deletedCount === 0) {
    throw new AppError(404, 'Career not found.', 'NOT_FOUND')
  }
}

// ---------------------------------------------------------------------------
// Quiz questions (full CRUD, including drafts/inactive)
// ---------------------------------------------------------------------------

export async function listAllQuizQuestions() {
  return QuizQuestion.find({}).sort({ order: 1, createdAt: -1 })
}

export async function createQuizQuestion(adminUserId, payload) {
  return QuizQuestion.create({ ...payload, createdBy: adminUserId })
}

export async function updateQuizQuestion(questionId, payload) {
  const question = await QuizQuestion.findById(questionId)
  if (!question) {
    throw new AppError(404, 'Quiz question not found.', 'NOT_FOUND')
  }
  Object.assign(question, payload)
  await question.save()
  return question
}

export async function deleteQuizQuestion(questionId) {
  const result = await QuizQuestion.deleteOne({ _id: questionId })
  if (result.deletedCount === 0) {
    throw new AppError(404, 'Quiz question not found.', 'NOT_FOUND')
  }
}

// ---------------------------------------------------------------------------
// Resources (full CRUD, including inactive) — Milestone 6 Part B
// ---------------------------------------------------------------------------

export async function listAllResources({ page, limit, skip }) {
  const [resources, total] = await Promise.all([
    Resource.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Resource.countDocuments({}),
  ])
  return { resources, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function createResource(adminUserId, payload) {
  return Resource.create({ ...payload, createdBy: adminUserId })
}

export async function updateResource(resourceId, payload) {
  const resource = await Resource.findById(resourceId)
  if (!resource) {
    throw new AppError(404, 'Resource not found.', 'NOT_FOUND')
  }
  Object.assign(resource, payload)
  await resource.save()
  return resource
}

export async function deleteResource(resourceId) {
  const result = await Resource.deleteOne({ _id: resourceId })
  if (result.deletedCount === 0) {
    throw new AppError(404, 'Resource not found.', 'NOT_FOUND')
  }
}

// ---------------------------------------------------------------------------
// Multimedia (full CRUD, including inactive) — Milestone 6 Part B
// ---------------------------------------------------------------------------

export async function listAllMedia({ page, limit, skip }) {
  const [media, total] = await Promise.all([
    Multimedia.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Multimedia.countDocuments({}),
  ])
  return { media, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function createMedia(adminUserId, payload) {
  return Multimedia.create({ ...payload, createdBy: adminUserId })
}

export async function updateMedia(mediaId, payload) {
  const media = await Multimedia.findById(mediaId)
  if (!media) {
    throw new AppError(404, 'Media not found.', 'NOT_FOUND')
  }
  Object.assign(media, payload)
  await media.save()
  return media
}

export async function deleteMedia(mediaId) {
  const result = await Multimedia.deleteOne({ _id: mediaId })
  if (result.deletedCount === 0) {
    throw new AppError(404, 'Media not found.', 'NOT_FOUND')
  }
}

// ---------------------------------------------------------------------------
// Success story approval workflow — Milestone 6 Part B
// ---------------------------------------------------------------------------

export async function listAllStories({ status, page, limit, skip }) {
  const filter = {}
  if (status) filter.status = status

  const [stories, total] = await Promise.all([
    SuccessStory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('domainId', 'name slug')
      .populate('submittedBy', 'name email'),
    SuccessStory.countDocuments(filter),
  ])
  return { stories, meta: buildPaginationMeta({ page, limit, total }) }
}

async function getStoryOrThrow(storyId) {
  const story = await SuccessStory.findById(storyId)
  if (!story) {
    throw new AppError(404, 'Story not found.', 'NOT_FOUND')
  }
  return story
}

export async function approveStory(adminUserId, storyId) {
  const story = await getStoryOrThrow(storyId)
  story.status = 'approved'
  story.approvedBy = adminUserId
  // approvedAt is set automatically by the model's pre('validate') hook.
  await story.save()
  return story
}

export async function rejectStory(adminUserId, storyId) {
  const story = await getStoryOrThrow(storyId)
  story.status = 'rejected'
  story.approvedBy = adminUserId
  await story.save()
  return story
}

// ---------------------------------------------------------------------------
// Feedback (admin view + response) — Milestone 6 Part B
// ---------------------------------------------------------------------------

export async function listAllFeedback({ status, category, page, limit, skip }) {
  const filter = {}
  if (status) filter.status = status
  if (category) filter.category = category

  const [feedback, total] = await Promise.all([
    Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('userId', 'name email'),
    Feedback.countDocuments(filter),
  ])
  return { feedback, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function respondToFeedback(adminUserId, feedbackId, { response, status }) {
  const feedback = await Feedback.findById(feedbackId)
  if (!feedback) {
    throw new AppError(404, 'Feedback not found.', 'NOT_FOUND')
  }
  feedback.response = response
  feedback.respondedBy = adminUserId
  if (status) feedback.status = status
  // respondedAt is set automatically by the model's pre('validate') hook.
  await feedback.save()
  return feedback
}

// Real aggregate counts (by category, by status). Note: the SRS mentions a
// "sentiment summary" — true sentiment analysis needs an NLP provider that
// hasn't been chosen/confirmed, so it's intentionally left out here rather
// than faked. Category/status breakdowns below are genuine DB aggregates.
export async function getFeedbackAnalytics() {
  const [byCategory, byStatus, total] = await Promise.all([
    Feedback.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    Feedback.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Feedback.countDocuments({}),
  ])

  return { total, byCategory, byStatus }
}

// ---------------------------------------------------------------------------
// Usage statistics (SRS: "View usage statistics: active users, quiz
// attempts, popular content")
// ---------------------------------------------------------------------------

export async function getUsageStats() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalUsers,
    activeUsers,
    totalQuizAttempts,
    completedQuizAttempts,
    totalCareers,
    popularCareers,
    popularResources,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', status: 'active', lastLoginAt: { $gte: thirtyDaysAgo } }),
    QuizAttempt.countDocuments({}),
    QuizAttempt.countDocuments({ status: 'completed' }),
    Career.countDocuments({ active: true }),
    RecentlyViewed.aggregate([
      { $match: { itemType: 'career' } },
      { $group: { _id: '$itemId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'careers', localField: '_id', foreignField: '_id', as: 'career' } },
      { $unwind: '$career' },
      { $project: { _id: 0, careerId: '$career._id', title: '$career.title', views: 1 } },
    ]),
    Resource.find({ active: true }).sort({ downloadCount: -1 }).limit(5).select('title downloadCount'),
  ])

  return {
    totalUsers,
    activeUsersLast30Days: activeUsers,
    totalQuizAttempts,
    completedQuizAttempts,
    totalActiveCareers: totalCareers,
    popularCareers,
    popularResources,
  }
}

export default {
  listUsers,
  getUserById,
  updateUser,
  listAllCareers,
  createCareer,
  updateCareer,
  deleteCareer,
  listAllQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  listAllResources,
  createResource,
  updateResource,
  deleteResource,
  listAllMedia,
  createMedia,
  updateMedia,
  deleteMedia,
  listAllStories,
  approveStory,
  rejectStory,
  listAllFeedback,
  respondToFeedback,
  getFeedbackAnalytics,
  getUsageStats,
}