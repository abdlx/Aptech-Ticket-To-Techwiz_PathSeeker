import * as adminService from '../services/admin.service.js'
import * as auditLogService from '../services/auditLog.service.js'
import AppError from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { parsePagination } from '../utils/pagination.js'
import { isNonEmptyString, isSafeHttpUrl } from '../utils/validators.js'
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  MULTIMEDIA_TYPES,
  RESOURCE_TYPES,
  STORY_STATUSES,
  PUBLICATION_STATUSES,
  USER_ROLES,
  USER_STAGES,
  USER_STATUSES,
} from '../constants/database.js'

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.uploadedFile) throw new AppError(400, 'No file uploaded.', 'FILE_REQUIRED')
  res.status(201).json({ data: { asset: req.uploadedFile } })
})

// --- Users -------------------------------------------------------------

export const getUsers = asyncHandler(async (req, res) => {
  const { q, stage, status } = req.query
  if (stage && !USER_STAGES.includes(stage)) {
    throw new AppError(400, `stage must be one of: ${USER_STAGES.join(', ')}`, 'VALIDATION_ERROR')
  }
  if (status && !USER_STATUSES.includes(status)) {
    throw new AppError(400, `status must be one of: ${USER_STATUSES.join(', ')}`, 'VALIDATION_ERROR')
  }
  const { page, limit, skip } = parsePagination(req.query)
  const { users, meta } = await adminService.listUsers({ q, stage, status, page, limit, skip })
  res.status(200).json({ data: { users, meta } })
})

export const getUserById = asyncHandler(async (req, res) => {
  const user = await adminService.getUserById(req.params.id)
  res.status(200).json({ data: { user } })
})

export const updateUser = asyncHandler(async (req, res) => {
  const { role, status } = req.body
  if (role && !USER_ROLES.includes(role)) {
    throw new AppError(400, `role must be one of: ${USER_ROLES.join(', ')}`, 'VALIDATION_ERROR')
  }
  if (status && !USER_STATUSES.includes(status)) {
    throw new AppError(400, `status must be one of: ${USER_STATUSES.join(', ')}`, 'VALIDATION_ERROR')
  }
  const user = await adminService.updateUser(req.user.id, req.params.id, { role, status })
  res.status(200).json({ data: { user } })
})

// --- Careers -------------------------------------------------------------

export const getCareers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const { careers, meta } = await adminService.listAllCareers({ page, limit, skip })
  res.status(200).json({ data: { careers, meta } })
})

export const createCareer = asyncHandler(async (req, res) => {
  const { slug, title, domainId } = req.body
  if (!isNonEmptyString(slug, { min: 2, max: 150 }) || !isNonEmptyString(title, { min: 2, max: 150 })) {
    throw new AppError(400, 'slug and title are required.', 'VALIDATION_ERROR')
  }
  if (!isNonEmptyString(domainId, { min: 12, max: 64 })) {
    throw new AppError(400, 'domainId is required.', 'VALIDATION_ERROR')
  }
  const career = await adminService.createCareer(req.user.id, req.body)
  res.status(201).json({ data: { career } })
})

export const updateCareer = asyncHandler(async (req, res) => {
  const career = await adminService.updateCareer(req.user.id, req.params.id, req.body)
  res.status(200).json({ data: { career } })
})

export const deleteCareer = asyncHandler(async (req, res) => {
  await adminService.deleteCareer(req.user.id, req.params.id)
  res.status(200).json({ data: null, message: 'Career deleted.' })
})

// --- Quiz questions -------------------------------------------------------------

export const getQuizQuestions = asyncHandler(async (_req, res) => {
  const questions = await adminService.listAllQuizQuestions()
  res.status(200).json({ data: { questions } })
})

export const createQuizQuestion = asyncHandler(async (req, res) => {
  const { questionText, options } = req.body
  if (!isNonEmptyString(questionText, { min: 3, max: 500 })) {
    throw new AppError(400, 'questionText is required.', 'VALIDATION_ERROR')
  }
  if (!Array.isArray(options) || options.length < 2) {
    throw new AppError(400, 'options must contain at least two entries.', 'VALIDATION_ERROR')
  }
  const question = await adminService.createQuizQuestion(req.user.id, req.body)
  res.status(201).json({ data: { question } })
})

export const updateQuizQuestion = asyncHandler(async (req, res) => {
  const question = await adminService.updateQuizQuestion(req.user.id, req.params.id, req.body)
  res.status(200).json({ data: { question } })
})

export const deleteQuizQuestion = asyncHandler(async (req, res) => {
  await adminService.deleteQuizQuestion(req.user.id, req.params.id)
  res.status(200).json({ data: null, message: 'Quiz question deleted.' })
})


export const reorderQuizQuestions = asyncHandler(async (req, res) => {
  const questions = await adminService.reorderQuizQuestions(req.user.id, req.body.questionIds)
  res.json({ data: { questions } })
})
export const previewQuiz = asyncHandler(async (_req, res) => {
  const questions = await adminService.previewQuiz()
  res.json({ data: { questions } })
})
export const getQuizVersions = asyncHandler(async (_req, res) => {
  const versions = await adminService.listQuizVersions()
  res.json({ data: { versions } })
})
export const publishQuizVersion = asyncHandler(async (req, res) => {
  const quiz = await adminService.publishQuizVersion(req.user.id, req.body?.title)
  res.status(201).json({ data: { quiz }, message: `Quiz version ${quiz.version} published.` })
})
export const archiveQuizVersion = asyncHandler(async (req, res) => {
  const quiz = await adminService.archiveQuizVersion(req.user.id, Number(req.params.version))
  res.json({ data: { quiz } })
})

// --- Resources -------------------------------------------------------------

export const getResources = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const { resources, meta } = await adminService.listAllResources({ page, limit, skip })
  res.status(200).json({ data: { resources, meta } })
})

export const createResource = asyncHandler(async (req, res) => {
  const { title, type, file } = req.body
  if (!isNonEmptyString(title, { min: 2, max: 200 })) {
    throw new AppError(400, 'title must be between 2 and 200 characters.', 'VALIDATION_ERROR')
  }
  if (!RESOURCE_TYPES.includes(type)) {
    throw new AppError(400, `type must be one of: ${RESOURCE_TYPES.join(', ')}`, 'VALIDATION_ERROR')
  }
  if (!isNonEmptyString(file?.url, { min: 1, max: 2_000 }) || !isSafeHttpUrl(file.url)) {
    throw new AppError(400, 'file.url must be a valid http(s) URL.', 'VALIDATION_ERROR')
  }
  const resource = await adminService.createResource(req.user.id, req.body)
  res.status(201).json({ data: { resource } })
})

export const updateResource = asyncHandler(async (req, res) => {
  if (req.body.file?.url !== undefined && (!isNonEmptyString(req.body.file.url, { min: 1, max: 2_000 }) || !isSafeHttpUrl(req.body.file.url))) throw new AppError(400, 'file.url must be a valid http(s) URL.', 'VALIDATION_ERROR')
  const resource = await adminService.updateResource(req.user.id, req.params.id, req.body)
  res.status(200).json({ data: { resource } })
})

export const deleteResource = asyncHandler(async (req, res) => {
  await adminService.deleteResource(req.user.id, req.params.id)
  res.status(200).json({ data: null, message: 'Resource deleted.' })
})

// --- Multimedia -------------------------------------------------------------

export const getMedia = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const { media, meta } = await adminService.listAllMedia({ page, limit, skip })
  res.status(200).json({ data: { media, meta } })
})

export const createMedia = asyncHandler(async (req, res) => {
  const { title, type, url } = req.body
  if (!isNonEmptyString(title, { min: 2, max: 200 })) {
    throw new AppError(400, 'title must be between 2 and 200 characters.', 'VALIDATION_ERROR')
  }
  if (!MULTIMEDIA_TYPES.includes(type)) {
    throw new AppError(400, `type must be one of: ${MULTIMEDIA_TYPES.join(', ')}`, 'VALIDATION_ERROR')
  }
  if (!isNonEmptyString(url, { min: 1, max: 2_000 }) || !isSafeHttpUrl(url)) {
    throw new AppError(400, 'url must be a valid http(s) URL.', 'VALIDATION_ERROR')
  }
  const media = await adminService.createMedia(req.user.id, req.body)
  res.status(201).json({ data: { media } })
})

export const updateMedia = asyncHandler(async (req, res) => {
  if (req.body.url !== undefined && (!isNonEmptyString(req.body.url, { min: 1, max: 2_000 }) || !isSafeHttpUrl(req.body.url))) throw new AppError(400, 'url must be a valid http(s) URL.', 'VALIDATION_ERROR')
  const media = await adminService.updateMedia(req.user.id, req.params.id, req.body)
  res.status(200).json({ data: { media } })
})

export const deleteMedia = asyncHandler(async (req, res) => {
  await adminService.deleteMedia(req.user.id, req.params.id)
  res.status(200).json({ data: null, message: 'Media deleted.' })
})

// --- Story approval workflow -------------------------------------------------------------

export const getStories = asyncHandler(async (req, res) => {
  const { status } = req.query
  if (status && !STORY_STATUSES.includes(status)) {
    throw new AppError(400, `status must be one of: ${STORY_STATUSES.join(', ')}`, 'VALIDATION_ERROR')
  }
  const { page, limit, skip } = parsePagination(req.query)
  const { stories, meta } = await adminService.listAllStories({ status, page, limit, skip })
  res.status(200).json({ data: { stories, meta } })
})

export const getStoryByIdAdmin = asyncHandler(async (req, res) => { const story = await adminService.getStoryByIdAdmin(req.params.id); res.json({ data: { story } }) })

export const approveStory = asyncHandler(async (req, res) => {
  const story = await adminService.approveStory(req.user.id, req.params.id, req.body?.moderationNote)
  res.status(200).json({ data: { story }, message: 'Story approved.' })
})

export const rejectStory = asyncHandler(async (req, res) => {
  const story = await adminService.rejectStory(req.user.id, req.params.id, req.body?.moderationNote)
  res.status(200).json({ data: { story }, message: 'Story rejected.' })
})


export const updateStory = asyncHandler(async (req, res) => { const story = await adminService.updateStoryAsAdmin(req.user.id, req.params.id, req.body); res.json({ data: { story } }) })
export const featureStory = asyncHandler(async (req, res) => { const story = await adminService.featureStory(req.user.id, req.params.id, req.body?.featured === true); res.json({ data: { story } }) })
// --- Feedback -------------------------------------------------------------

export const getFeedbackAssignees = asyncHandler(async (_req, res) => {
  const users = await adminService.listFeedbackAssignees()
  res.status(200).json({ data: { users } })
})

export const getFeedback = asyncHandler(async (req, res) => {
  const { status, category } = req.query
  if (status && !FEEDBACK_STATUSES.includes(status)) {
    throw new AppError(400, `status must be one of: ${FEEDBACK_STATUSES.join(', ')}`, 'VALIDATION_ERROR')
  }
  if (category && !FEEDBACK_CATEGORIES.includes(category)) {
    throw new AppError(400, `category must be one of: ${FEEDBACK_CATEGORIES.join(', ')}`, 'VALIDATION_ERROR')
  }
  const { page, limit, skip } = parsePagination(req.query)
  const { feedback, meta } = await adminService.listAllFeedback({ status, category, page, limit, skip })
  res.status(200).json({ data: { feedback, meta } })
})

export const updateFeedbackTriage = asyncHandler(async (req, res) => {
  const { status, assignee, internalNotes } = req.body
  if (status && !FEEDBACK_STATUSES.includes(status)) throw new AppError(400, `status must be one of: ${FEEDBACK_STATUSES.join(', ')}`, 'VALIDATION_ERROR')
  const feedback = await adminService.updateFeedbackTriage(req.user.id, req.params.id, { status, assignee, internalNotes })
  res.status(200).json({ data: { feedback } })
})

export const respondToFeedback = asyncHandler(async (req, res) => {
  const { response, status } = req.body
  if (!isNonEmptyString(response, { min: 1, max: 2_000 })) {
    throw new AppError(400, 'response is required.', 'VALIDATION_ERROR')
  }
  if (status && !FEEDBACK_STATUSES.includes(status)) {
    throw new AppError(400, `status must be one of: ${FEEDBACK_STATUSES.join(', ')}`, 'VALIDATION_ERROR')
  }
  const feedback = await adminService.respondToFeedback(req.user.id, req.params.id, { response, status })
  res.status(200).json({ data: { feedback }, message: 'Response sent.' })
})

export const getFeedbackAnalytics = asyncHandler(async (_req, res) => {
  const analytics = await adminService.getFeedbackAnalytics()
  res.status(200).json({ data: { analytics } })
})

// --- Usage statistics -------------------------------------------------------------

export const getStats = asyncHandler(async (_req, res) => {
  const stats = await adminService.getUsageStats()
  res.status(200).json({ data: { stats } })
})

// --- Audit logs -------------------------------------------------------------

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { actorId, targetType } = req.query
  const { page, limit, skip } = parsePagination(req.query)
  const { logs, meta } = await auditLogService.listAuditLogs({ actorId, targetType, page, limit, skip })
  res.status(200).json({ data: { logs, meta } })
})


export const setCareerPublication = asyncHandler(async (req, res) => {
  if (!PUBLICATION_STATUSES.includes(req.params.status)) throw new AppError(400, 'Invalid publication status.', 'VALIDATION_ERROR')
  const career = await adminService.setCareerPublication(req.user.id, req.params.id, req.params.status)
  res.json({ data: { career } })
})
export const setResourcePublication = asyncHandler(async (req, res) => {
  if (!PUBLICATION_STATUSES.includes(req.params.status)) throw new AppError(400, 'Invalid publication status.', 'VALIDATION_ERROR')
  const resource = await adminService.setResourcePublication(req.user.id, req.params.id, req.params.status)
  res.json({ data: { resource } })
})
export const setMediaPublication = asyncHandler(async (req, res) => {
  if (!PUBLICATION_STATUSES.includes(req.params.status)) throw new AppError(400, 'Invalid publication status.', 'VALIDATION_ERROR')
  const media = await adminService.setMediaPublication(req.user.id, req.params.id, req.params.status)
  res.json({ data: { media } })
})

export default {
  uploadFile,
  getUsers,
  getUserById,
  updateUser,
  getCareers,
  createCareer,
  updateCareer,
  deleteCareer,
  setCareerPublication,
  getQuizQuestions,
  createQuizQuestion,
  updateQuizQuestion,
  deleteQuizQuestion,
  reorderQuizQuestions,
  previewQuiz,
  getQuizVersions,
  publishQuizVersion,
  archiveQuizVersion,
  getResources,
  createResource,
  updateResource,
  deleteResource,
  setResourcePublication,
  getMedia,
  createMedia,
  updateMedia,
  deleteMedia,
  setMediaPublication,
  getStories,
  getStoryByIdAdmin,
  approveStory,
  rejectStory,
  requestStoryChanges,
  updateStory,
  featureStory,
  getFeedback,
  getFeedbackAssignees,
  respondToFeedback,
  updateFeedbackTriage,
  getFeedbackAnalytics,
  getStats,
  getAuditLogs,
}