import fs from 'node:fs/promises'
import path from 'node:path'
import {
  AuditLog,
  Career,
  Feedback,
  Multimedia,
  QuizAttempt,
  QuizQuestion,
  QuizVersion,
  RecommendationSnapshot,
  RecentlyViewed,
  Resource,
  SuccessStory,
  User,
} from '../models/index.js'
import { logAction } from './auditLog.service.js'
import { buildPaginationMeta } from '../utils/pagination.js'
import AppError from '../utils/AppError.js'
import { stripHtml } from '../utils/sanitize.js'
import { createNotification } from './notification.service.js'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assertPublicationTransition(current, next) {
  const allowed = { draft: ['published'], published: ['archived'], archived: ['draft'] }
  if (current !== next && !allowed[current]?.includes(next)) {
    throw new AppError(409, `Cannot move ${current} content directly to ${next}.`, 'INVALID_PUBLICATION_TRANSITION')
  }
}

async function removeStoredAsset(asset) {
  if (!asset?.assetKey) return
  try {
    const uploadDir = path.resolve(process.env.UPLOAD_DIR || './uploads')
    await fs.rm(path.join(uploadDir, path.basename(asset.assetKey)), { force: true })
  } catch {
    // Database deletion must not fail solely because an old optional file is missing.
  }
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function listUsers({ q, stage, status, role, page, limit, skip }) {
  const filter = {}
  if (stage) filter.stage = stage
  if (status) filter.status = status
  if (role) filter.role = role
  if (q) {
    const regex = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    filter.$or = [{ name: regex }, { email: regex }]
  }

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
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

export async function updateUser(adminUserId, id, { name, email, stage, role, status, emailVerified }) {
  const user = await getUserById(id)
  if (user._id.toString() === adminUserId.toString() && status === 'suspended') {
    throw new AppError(400, 'You cannot suspend your own admin account.', 'SELF_LOCKOUT')
  }
  if (user.role === 'super_admin' && (role && role !== 'super_admin' || status && status !== 'active')) {
    const remaining = await User.countDocuments({ role: 'super_admin', status: 'active', _id: { $ne: user._id } })
    if (remaining < 1) throw new AppError(400, 'At least one active super admin must remain.', 'LAST_ADMIN')
  }
  if (name !== undefined) user.name = name
  if (email !== undefined) user.email = email
  if (stage !== undefined) user.stage = stage || undefined
  if (role) user.role = role
  if (status) user.status = status
  if (emailVerified !== undefined) {
    user.emailVerified = Boolean(emailVerified)
    user.emailVerifiedAt = user.emailVerified ? (user.emailVerifiedAt || new Date()) : undefined
  }
  await user.save()
  await logAction(adminUserId, 'user.update', 'User', user._id, { name, email, stage, role, status, emailVerified })
  return user
}

// ---------------------------------------------------------------------------
// Careers (full CRUD — public browsing is read-only via catalog.service)
// ---------------------------------------------------------------------------

export async function listAllCareers({ q, status, page, limit, skip }) {
  const filter = {}
  if (status) filter.status = status
  if (q) filter.$text = { $search: q }
  const [careers, total] = await Promise.all([
    Career.find(filter)
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('domainId', 'name slug')
      .lean(),
    Career.countDocuments(filter),
  ])
  return { careers, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function createCareer(adminUserId, payload) {
  const career = await Career.create({
    ...payload,
    status: payload.status || 'draft',
    active: payload.status === 'published',
    createdBy: adminUserId,
  })
  await logAction(adminUserId, 'career.create', 'Career', career._id)
  return career
}

export async function updateCareer(adminUserId, careerId, payload) {
  const career = await Career.findById(careerId)
  if (!career) {
    throw new AppError(404, 'Career not found.', 'NOT_FOUND')
  }
  if (payload.status && payload.status !== career.status) {
    assertPublicationTransition(career.status || (career.active ? 'published' : 'draft'), payload.status)
  }
  Object.assign(career, payload)
  career.active = career.status === 'published'
  if (career.status === 'published' && !career.publishedAt) career.publishedAt = new Date()
  if (career.status === 'archived') career.archivedAt = new Date()
  await career.save()
  await logAction(adminUserId, 'career.update', 'Career', career._id)
  return career
}

export async function deleteCareer(adminUserId, careerId) {
  const result = await Career.deleteOne({ _id: careerId })
  if (result.deletedCount === 0) {
    throw new AppError(404, 'Career not found.', 'NOT_FOUND')
  }
  await logAction(adminUserId, 'career.delete', 'Career', careerId)
}

export async function setCareerPublication(adminUserId, careerId, status) {
  const career = await Career.findById(careerId)
  if (!career) throw new AppError(404, 'Career not found.', 'NOT_FOUND')
  assertPublicationTransition(career.status || (career.active ? 'published' : 'draft'), status)
  career.status = status
  career.active = status === 'published'
  if (status === 'published') {
    career.publishedAt = career.publishedAt || new Date()
    career.archivedAt = undefined
  }
  if (status === 'archived') career.archivedAt = new Date()
  await career.save()
  await logAction(adminUserId, `career.${status}`, 'Career', career._id)
  return career
}

// ---------------------------------------------------------------------------
// Quiz questions & versioning (full CRUD, builder, versions)
// ---------------------------------------------------------------------------

export async function listAllQuizQuestions() {
  return QuizQuestion.find({}).sort({ order: 1, createdAt: -1 })
}

export async function createQuizQuestion(adminUserId, payload) {
  const question = await QuizQuestion.create({ ...payload, createdBy: adminUserId })
  await logAction(adminUserId, 'quizQuestion.create', 'QuizQuestion', question._id)
  return question
}

export async function updateQuizQuestion(adminUserId, questionId, payload) {
  const question = await QuizQuestion.findById(questionId)
  if (!question) {
    throw new AppError(404, 'Quiz question not found.', 'NOT_FOUND')
  }
  const contentKeys = ['questionText', 'type', 'options', 'timeLimitSeconds']
  const contentChanged = contentKeys.some((key) => payload[key] !== undefined)
  Object.assign(question, payload)
  if (contentChanged) question.version = (question.version || 1) + 1
  await question.save()
  await logAction(adminUserId, 'quizQuestion.update', 'QuizQuestion', question._id, { version: question.version })
  return question
}

export async function deleteQuizQuestion(adminUserId, questionId) {
  const result = await QuizQuestion.deleteOne({ _id: questionId })
  if (result.deletedCount === 0) {
    throw new AppError(404, 'Quiz question not found.', 'NOT_FOUND')
  }
  await logAction(adminUserId, 'quizQuestion.delete', 'QuizQuestion', questionId)
}

export async function reorderQuizQuestions(adminUserId, questionIds) {
  if (!Array.isArray(questionIds) || !questionIds.length) {
    throw new AppError(400, 'questionIds must be a non-empty array.', 'VALIDATION_ERROR')
  }
  const questions = await QuizQuestion.find({ _id: { $in: questionIds } })
  if (questions.length !== questionIds.length) {
    throw new AppError(400, 'All question IDs must exist.', 'VALIDATION_ERROR')
  }
  const ops = questionIds.map((id, index) => ({
    updateOne: { filter: { _id: id }, update: { $set: { order: index } } },
  }))
  await QuizQuestion.bulkWrite(ops)
  await logAction(adminUserId, 'quizQuestion.reorder', 'QuizQuestion', null, { count: questionIds.length })
  return QuizQuestion.find({}).sort({ order: 1, createdAt: -1 })
}

export async function previewQuiz() {
  return QuizQuestion.find({}).sort({ order: 1, createdAt: -1 }).lean()
}

export async function listQuizVersions() {
  return QuizVersion.find({}).sort({ version: -1 }).populate('createdBy', 'name email').lean()
}

export async function publishQuizVersion(adminUserId, title = 'Interest Quiz') {
  const questions = await QuizQuestion.find({}).sort({ order: 1, createdAt: -1 }).lean()
  if (!questions.length) throw new AppError(400, 'Add at least one quiz question before publishing.', 'NO_QUESTIONS')
  const activeQuestions = questions.filter((q) => q.active !== false)
  if (!activeQuestions.length) throw new AppError(400, 'At least one active quiz question is required.', 'NO_ACTIVE_QUESTIONS')

  const latest = await QuizVersion.findOne({}).sort({ version: -1 }).lean()
  const version = (latest?.version || 0) + 1
  await QuizVersion.updateMany({ status: 'published' }, { $set: { status: 'archived' } })
  const snapshot = activeQuestions.map(
    ({ _id, key, version: questionVersion, questionText, type, order, timeLimitSeconds, options }) => ({
      questionId: _id,
      key: key || _id.toString(),
      version: questionVersion || 1,
      questionText,
      type,
      order,
      timeLimitSeconds: timeLimitSeconds || 0,
      options,
    }),
  )
  const published = await QuizVersion.create({
    version,
    title,
    status: 'published',
    questions: snapshot,
    scoringVersion: 'domain-weight-v1',
    createdBy: adminUserId,
    publishedAt: new Date(),
  })
  await logAction(adminUserId, 'quiz.publish', 'QuizVersion', published._id, { version })
  return published
}

export async function archiveQuizVersion(adminUserId, version) {
  const quiz = await QuizVersion.findOne({ version })
  if (!quiz) throw new AppError(404, 'Quiz version not found.', 'NOT_FOUND')
  if (quiz.status === 'published') {
    throw new AppError(409, 'Publish another quiz version before archiving the current published version.', 'PUBLISHED_VERSION')
  }
  quiz.status = 'archived'
  await quiz.save()
  await logAction(adminUserId, 'quiz.archive', 'QuizVersion', quiz._id, { version })
  return quiz
}

// ---------------------------------------------------------------------------
// Resources (full CRUD, uploads & lifecycle)
// ---------------------------------------------------------------------------

export async function listAllResources({ q, status, type, page, limit, skip }) {
  const filter = {}
  if (status) filter.status = status
  if (type) filter.type = type
  if (q) filter.$text = { $search: q }
  const [resources, total] = await Promise.all([
    Resource.find(filter)
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Resource.countDocuments(filter),
  ])
  return { resources, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function createResource(adminUserId, payload) {
  const resource = await Resource.create({
    ...payload,
    status: payload.status || 'draft',
    active: payload.status === 'published',
    createdBy: adminUserId,
  })
  await logAction(adminUserId, 'resource.create', 'Resource', resource._id)
  return resource
}

export async function updateResource(adminUserId, resourceId, payload) {
  const resource = await Resource.findById(resourceId)
  if (!resource) {
    throw new AppError(404, 'Resource not found.', 'NOT_FOUND')
  }
  const previousAsset = resource.file
  if (payload.status && payload.status !== resource.status) {
    assertPublicationTransition(resource.status || (resource.active ? 'published' : 'draft'), payload.status)
  }
  Object.assign(resource, payload)
  resource.active = resource.status === 'published'
  if (resource.status === 'published' && !resource.publishedAt) resource.publishedAt = new Date()
  if (resource.status === 'archived') resource.archivedAt = new Date()
  await resource.save()
  if (payload.file?.assetKey && payload.file.assetKey !== previousAsset?.assetKey) {
    await removeStoredAsset(previousAsset)
  }
  await logAction(adminUserId, 'resource.update', 'Resource', resource._id)
  return resource
}

export async function deleteResource(adminUserId, resourceId) {
  const resource = await Resource.findById(resourceId)
  if (!resource) throw new AppError(404, 'Resource not found.', 'NOT_FOUND')
  await Resource.deleteOne({ _id: resourceId })
  await removeStoredAsset(resource.file)
  await logAction(adminUserId, 'resource.delete', 'Resource', resourceId)
}

export async function setResourcePublication(adminUserId, resourceId, status) {
  const resource = await Resource.findById(resourceId)
  if (!resource) throw new AppError(404, 'Resource not found.', 'NOT_FOUND')
  assertPublicationTransition(resource.status || (resource.active ? 'published' : 'draft'), status)
  resource.status = status
  resource.active = status === 'published'
  if (status === 'published') {
    resource.publishedAt = resource.publishedAt || new Date()
    resource.archivedAt = undefined
  }
  if (status === 'archived') resource.archivedAt = new Date()
  await resource.save()
  await logAction(adminUserId, `resource.${status}`, 'Resource', resource._id)
  return resource
}

// ---------------------------------------------------------------------------
// Multimedia (full CRUD, uploads & lifecycle)
// ---------------------------------------------------------------------------

export async function listAllMedia({ q, status, type, page, limit, skip }) {
  const filter = {}
  if (status) filter.status = status
  if (type) filter.type = type
  if (q) filter.$text = { $search: q }
  const [media, total] = await Promise.all([
    Multimedia.find(filter)
      .sort(q ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Multimedia.countDocuments(filter),
  ])
  return { media, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function createMedia(adminUserId, payload) {
  const media = await Multimedia.create({
    ...payload,
    status: payload.status || 'draft',
    active: payload.status === 'published',
    createdBy: adminUserId,
  })
  await logAction(adminUserId, 'media.create', 'Multimedia', media._id)
  return media
}

export async function updateMedia(adminUserId, mediaId, payload) {
  const media = await Multimedia.findById(mediaId)
  if (!media) {
    throw new AppError(404, 'Media not found.', 'NOT_FOUND')
  }
  const previousUrl = media.url
  if (payload.status && payload.status !== media.status) {
    assertPublicationTransition(media.status || (media.active ? 'published' : 'draft'), payload.status)
  }
  Object.assign(media, payload)
  media.active = media.status === 'published'
  if (media.status === 'published' && !media.publishedAt) media.publishedAt = new Date()
  if (media.status === 'archived') media.archivedAt = new Date()
  await media.save()
  if (payload.url && payload.url !== previousUrl && previousUrl?.includes('/uploads/')) {
    await removeStoredAsset({ assetKey: previousUrl.split('/uploads/')[1] })
  }
  await logAction(adminUserId, 'media.update', 'Multimedia', media._id)
  return media
}

export async function deleteMedia(adminUserId, mediaId) {
  const media = await Multimedia.findById(mediaId)
  if (!media) throw new AppError(404, 'Media not found.', 'NOT_FOUND')
  await Multimedia.deleteOne({ _id: mediaId })
  if (media.url?.includes('/uploads/')) {
    await removeStoredAsset({ assetKey: media.url.split('/uploads/')[1] })
  }
  await logAction(adminUserId, 'media.delete', 'Multimedia', mediaId)
}

export async function setMediaPublication(adminUserId, mediaId, status) {
  const media = await Multimedia.findById(mediaId)
  if (!media) throw new AppError(404, 'Media not found.', 'NOT_FOUND')
  assertPublicationTransition(media.status || (media.active ? 'published' : 'draft'), status)
  media.status = status
  media.active = status === 'published'
  if (status === 'published') {
    media.publishedAt = media.publishedAt || new Date()
    media.archivedAt = undefined
  }
  if (status === 'archived') media.archivedAt = new Date()
  await media.save()
  await logAction(adminUserId, `media.${status}`, 'Multimedia', media._id)
  return media
}

// ---------------------------------------------------------------------------
// Success story approval & moderation workflow
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
      .populate('submittedBy', 'name email')
      .lean(),
    SuccessStory.countDocuments(filter),
  ])
  return { stories, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function getStoryByIdAdmin(storyId) {
  const story = await SuccessStory.findById(storyId)
    .populate('domainId', 'name slug')
    .populate('submittedBy', 'name email stage')
    .populate('reviewerId', 'name email')
  if (!story) throw new AppError(404, 'Story not found.', 'NOT_FOUND')
  return story
}

async function getStoryOrThrow(storyId) {
  const story = await SuccessStory.findById(storyId)
  if (!story) {
    throw new AppError(404, 'Story not found.', 'NOT_FOUND')
  }
  return story
}

export async function approveStory(adminUserId, storyId, moderationNote = '') {
  const story = await getStoryOrThrow(storyId)
  if (!['pending', 'changes_requested'].includes(story.status)) {
    throw new AppError(409, 'Only pending stories or resubmissions can be approved.', 'INVALID_STORY_TRANSITION')
  }
  story.status = 'approved'
  story.approvedBy = adminUserId
  story.reviewerId = adminUserId
  story.reviewedAt = new Date()
  story.publishedAt = new Date()
  story.moderationNote = moderationNote
  await story.save()
  await logAction(adminUserId, 'story.approve', 'SuccessStory', story._id)
  await createNotification({
    userId: story.submittedBy,
    type: 'announcement',
    title: 'Story approved',
    body: 'Your success story has been approved and is now eligible to appear in the community.',
    icon: 'check',
    targetScreen: 'stories',
  })
  return story
}

export async function rejectStory(adminUserId, storyId, moderationNote = '') {
  const story = await getStoryOrThrow(storyId)
  if (!['pending', 'changes_requested'].includes(story.status)) {
    throw new AppError(409, 'Only stories awaiting review can be rejected.', 'INVALID_STORY_TRANSITION')
  }
  story.status = 'rejected'
  story.approvedBy = adminUserId
  story.reviewerId = adminUserId
  story.reviewedAt = new Date()
  story.moderationNote = moderationNote
  await story.save()
  await logAction(adminUserId, 'story.reject', 'SuccessStory', story._id)
  await createNotification({
    userId: story.submittedBy,
    type: 'announcement',
    title: 'Story review update',
    body: 'Your success story was not approved for publication. You can review the submission and contact support if needed.',
    icon: 'message',
    targetScreen: 'stories',
  })
  return story
}

export async function requestStoryChanges(adminUserId, storyId, moderationNote = '') {
  const story = await getStoryOrThrow(storyId)
  if (!['pending'].includes(story.status)) {
    throw new AppError(409, 'Only pending stories can receive change requests.', 'INVALID_STORY_TRANSITION')
  }
  story.status = 'changes_requested'
  story.approvedBy = adminUserId
  story.reviewerId = adminUserId
  story.reviewedAt = new Date()
  story.moderationNote = moderationNote
  await story.save()
  await logAction(adminUserId, 'story.request_changes', 'SuccessStory', story._id)
  await createNotification({
    userId: story.submittedBy,
    type: 'announcement',
    title: 'Story changes requested',
    body: 'An administrator requested changes to your success story before it can be published.',
    icon: 'message',
    targetScreen: 'stories',
  })
  return story
}

export async function updateStoryAsAdmin(adminUserId, storyId, payload) {
  const story = await getStoryOrThrow(storyId)
  if (payload.authorName !== undefined) story.authorName = stripHtml(payload.authorName).slice(0, 150)
  if (payload.storyText !== undefined) story.storyText = stripHtml(payload.storyText).slice(0, 5000)
  if (payload.educationPath !== undefined) story.educationPath = stripHtml(payload.educationPath).slice(0, 1500)
  if (payload.challenges !== undefined) story.challenges = stripHtml(payload.challenges).slice(0, 2000)
  if (payload.outcome !== undefined) story.outcome = stripHtml(payload.outcome).slice(0, 1500)
  if (payload.moderationNote !== undefined) story.moderationNote = stripHtml(payload.moderationNote).slice(0, 2000)
  await story.save()
  await logAction(adminUserId, 'story.update', 'SuccessStory', story._id)
  return story
}

export async function featureStory(adminUserId, storyId, featured) {
  const story = await getStoryOrThrow(storyId)
  if (story.status !== 'approved') throw new AppError(409, 'Only approved stories can be featured.', 'STORY_NOT_PUBLISHED')
  story.featured = Boolean(featured)
  await story.save()
  await logAction(adminUserId, featured ? 'story.feature' : 'story.unfeature', 'SuccessStory', story._id)
  return story
}

// ---------------------------------------------------------------------------
// Feedback (admin triage, assignment, internal notes, response)
// ---------------------------------------------------------------------------

export async function listFeedbackAssignees() {
  return User.find({
    role: { $in: ['content_editor', 'support_manager', 'admin', 'super_admin'] },
    status: 'active',
  })
    .select('name email role')
    .sort({ name: 1 })
    .lean()
}

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

export async function updateFeedbackTriage(adminUserId, feedbackId, { status, assignee, internalNotes }) {
  const feedback = await Feedback.findById(feedbackId)
  if (!feedback) throw new AppError(404, 'Feedback not found.', 'NOT_FOUND')
  if (status !== undefined) feedback.status = status
  if (assignee !== undefined) feedback.assignee = assignee || null
  if (internalNotes !== undefined) feedback.internalNotes = stripHtml(internalNotes).slice(0, 5_000)
  await feedback.save()
  await logAction(adminUserId, 'feedback.triage', 'Feedback', feedback._id, { status, assignee: assignee || null })
  return Feedback.findById(feedback._id).populate('userId', 'name email').populate('assignee', 'name email')
}

export async function respondToFeedback(adminUserId, feedbackId, { response, status }) {
  const feedback = await Feedback.findById(feedbackId)
  if (!feedback) {
    throw new AppError(404, 'Feedback not found.', 'NOT_FOUND')
  }
  feedback.response = stripHtml(response).slice(0, 2_000)
  feedback.respondedBy = adminUserId
  if (status) feedback.status = status
  await feedback.save()
  await logAction(adminUserId, 'feedback.respond', 'Feedback', feedback._id, { status })
  await createNotification({
    userId: feedback.userId,
    type: 'feedback',
    title: 'Your feedback has a response',
    body: feedback.response,
    icon: 'message',
    targetType: 'Feedback',
    targetId: feedback._id,
    targetScreen: 'feedback',
  })
  return feedback
}

export async function getFeedbackAnalytics() {
  const [result = {}] = await Feedback.aggregate([
    {
      $facet: {
        byCategory: [{ $group: { _id: '$category', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        byStatus: [{ $group: { _id: '$status', count: { $sum: 1 } } }, { $sort: { count: -1 } }],
        summary: [{
          $group: {
            _id: null,
            total: { $sum: 1 },
            resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
            averageRating: { $avg: '$rating' },
            ratedCount: { $sum: { $cond: [{ $ne: [{ $type: '$rating' }, 'missing'] }, 1, 0] } },
            averageResponseMs: {
              $avg: { $cond: [{ $and: ['$respondedAt', '$createdAt'] }, { $subtract: ['$respondedAt', '$createdAt'] }, null] },
            },
          },
        }],
        sentiment: [
          { $project: { message: { $toLower: { $ifNull: ['$message', ''] } } } },
          {
            $project: {
              tone: {
                $switch: {
                  branches: [
                    { case: { $regexMatch: { input: '$message', regex: /(great|good|love|helpful|easy|useful|thanks|clear)/ } }, then: 'positive' },
                    { case: { $regexMatch: { input: '$message', regex: /(bad|broken|bug|confusing|hard|error|problem|slow)/ } }, then: 'negative' },
                  ],
                  default: 'neutral',
                },
              },
            },
          },
          { $group: { _id: '$tone', count: { $sum: 1 } } },
        ],
      },
    },
  ])
  const summary = result.summary?.[0] || {}
  const sentiment = Object.fromEntries((result.sentiment || []).map(({ _id, count }) => [_id, count]))
  const total = summary.total || 0
  return {
    total,
    totalCount: total,
    byCategory: result.byCategory || [],
    byStatus: result.byStatus || [],
    sentiment: { positive: sentiment.positive || 0, neutral: sentiment.neutral || 0, negative: sentiment.negative || 0 },
    averageRating: Math.round((summary.averageRating || 0) * 10) / 10,
    ratedCount: summary.ratedCount || 0,
    resolutionRate: total ? Math.round(((summary.resolved || 0) / total) * 100) : 0,
    avgResponseHours: Math.round(((summary.averageResponseMs || 0) / 3_600_000) * 10) / 10,
  }
}

// ---------------------------------------------------------------------------
// Usage statistics
// ---------------------------------------------------------------------------

export async function getUsageStats() {
  const now = new Date()
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
  const activityStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1))

  const [
    totalUsers,
    activeUsers,
    staffUsers,
    totalQuizAttempts,
    completedQuizAttempts,
    totalCareers,
    userStages,
    averageMatch,
    popularCareers,
    popularResources,
    careerViewsByMonth,
    quizCompletionsByMonth,
    registrationsByMonth,
    currentRegistrations,
    previousRegistrations,
    currentCompletions,
    previousCompletions,
    pendingStories,
    openFeedback,
    draftResources,
    draftMedia,
    recentActivity,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', status: 'active', lastLoginAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ role: { $ne: 'user' }, status: 'active' }),
    QuizAttempt.countDocuments({}),
    QuizAttempt.countDocuments({ status: 'completed' }),
    Career.countDocuments({ active: true }),
    User.aggregate([
      { $match: { role: 'user' } },
      { $group: { _id: '$stage', count: { $sum: 1 } } },
    ]),
    RecommendationSnapshot.aggregate([
      { $unwind: '$matches' },
      { $group: { _id: null, average: { $avg: '$matches.compatibilityScore' }, samples: { $sum: 1 } } },
    ]),
    RecentlyViewed.aggregate([
      { $match: { itemType: 'career' } },
      { $group: { _id: '$itemId', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'careers', localField: '_id', foreignField: '_id', as: 'career' } },
      { $unwind: '$career' },
      { $lookup: { from: 'domains', localField: 'career.domainId', foreignField: '_id', as: 'domain' } },
      { $project: {
        _id: 0,
        careerId: '$career._id',
        slug: '$career.slug',
        title: '$career.title',
        growthRatePercent: '$career.growthRatePercent',
        iconKey: '$career.iconKey',
        colorTone: '$career.colorTone',
        domain: { $arrayElemAt: ['$domain.name', 0] },
        views: 1,
      } },
    ]),
    Resource.find({ active: true })
      .sort({ downloadCount: -1 })
      .limit(5)
      .select('title downloadCount type')
      .lean(),
    RecentlyViewed.aggregate([
      { $match: { itemType: 'career', viewedAt: { $gte: activityStart } } },
      { $group: { _id: { year: { $year: '$viewedAt' }, month: { $month: '$viewedAt' } }, value: { $sum: 1 } } },
    ]),
    QuizAttempt.aggregate([
      { $match: { status: 'completed', completedAt: { $gte: activityStart } } },
      { $group: { _id: { year: { $year: '$completedAt' }, month: { $month: '$completedAt' } }, value: { $sum: 1 } } },
    ]),
    User.aggregate([
      { $match: { role: 'user', createdAt: { $gte: activityStart } } },
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, value: { $sum: 1 } } },
    ]),
    User.countDocuments({ role: 'user', createdAt: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ role: 'user', createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    QuizAttempt.countDocuments({ status: 'completed', completedAt: { $gte: thirtyDaysAgo } }),
    QuizAttempt.countDocuments({ status: 'completed', completedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } }),
    SuccessStory.countDocuments({ status: { $in: ['pending', 'changes_requested'] } }),
    Feedback.countDocuments({ status: { $in: ['open', 'in_review'] } }),
    Resource.countDocuments({ status: 'draft' }),
    Multimedia.countDocuments({ status: 'draft' }),
    AuditLog.find({})
      .sort({ createdAt: -1 })
      .limit(8)
      .select('action targetType targetId createdAt actorId')
      .populate('actorId', 'name role')
      .lean(),
  ])

  const stageCounts = Object.fromEntries(userStages.map(({ _id, count }) => [_id || 'unknown', count]))
  const monthValue = (rows, date) => rows.find(
    ({ _id }) => _id.year === date.getUTCFullYear() && _id.month === date.getUTCMonth() + 1,
  )?.value || 0
  const monthlyActivity = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5 + index, 1))
    return {
      key: `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`,
      label: date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }),
      careerViews: monthValue(careerViewsByMonth, date),
      quizCompletions: monthValue(quizCompletionsByMonth, date),
      registrations: monthValue(registrationsByMonth, date),
    }
  })
  const percentChange = (current, previous) => {
    if (previous === 0) return current === 0 ? 0 : 100
    return Math.round(((current - previous) / previous) * 1_000) / 10
  }

  return {
    totalUsers,
    activeUsersLast30Days: activeUsers,
    activeStaff: staffUsers,
    totalQuizAttempts,
    completedQuizAttempts,
    completedAttempts: completedQuizAttempts,
    totalActiveCareers: totalCareers,
    totalCareers,
    avgMatchScore: Math.round((averageMatch[0]?.average || 0) * 10) / 10,
    matchSamples: averageMatch[0]?.samples || 0,
    userStages: stageCounts,
    monthlyActivity,
    trends: {
      registrations: percentChange(currentRegistrations, previousRegistrations),
      quizCompletions: percentChange(currentCompletions, previousCompletions),
    },
    queues: { pendingStories, openFeedback, draftResources, draftMedia },
    popularCareers,
    popularResources,
    recentActivity,
    generatedAt: now.toISOString(),
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
  setCareerPublication,
  listAllQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  reorderQuizQuestions,
  previewQuiz,
  listQuizVersions,
  publishQuizVersion,
  archiveQuizVersion,
  listAllResources,
  createResource,
  updateResource,
  deleteResource,
  setResourcePublication,
  listAllMedia,
  createMedia,
  updateMedia,
  deleteMedia,
  setMediaPublication,
  listAllStories,
  getStoryByIdAdmin,
  approveStory,
  rejectStory,
  requestStoryChanges,
  updateStoryAsAdmin,
  featureStory,
  listAllFeedback,
  listFeedbackAssignees,
  respondToFeedback,
  updateFeedbackTriage,
  getFeedbackAnalytics,
  getUsageStats,
}
