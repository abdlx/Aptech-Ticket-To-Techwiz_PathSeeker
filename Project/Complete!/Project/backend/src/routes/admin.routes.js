import { Router } from 'express'
import * as adminController from '../controllers/admin.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import { STAFF_ROLES, USER_MANAGEMENT_ROLES } from '../constants/database.js'
import { uploadSingleFile } from '../middleware/upload.middleware.js'
import { authRateLimiter } from '../middleware/rateLimit.middleware.js'

const router = Router()

// Every /admin/* route needs a logged-in staff account.
// requireAuth first, then requireRole ensures the user has a staff role.
router.use(requireAuth, requireRole(...STAFF_ROLES))
router.post('/uploads', authRateLimiter, uploadSingleFile({ fieldName: 'file' }), adminController.uploadFile)

// User management is sensitive (role/status changes) — admin/super_admin only.
router.get('/users', requireRole(...USER_MANAGEMENT_ROLES), adminController.getUsers)
router.get('/users/:id', requireRole(...USER_MANAGEMENT_ROLES), adminController.getUserById)
router.patch('/users/:id', requireRole(...USER_MANAGEMENT_ROLES), adminController.updateUser)

// Career Bank and Quiz content management — any staff role.
router.get('/careers', adminController.getCareers)
router.post('/careers', adminController.createCareer)
router.patch('/careers/:id', adminController.updateCareer)
router.delete('/careers/:id', adminController.deleteCareer)
router.patch('/careers/:id/status/:status', adminController.setCareerPublication)

router.get('/quiz-questions', adminController.getQuizQuestions)
router.post('/quiz-questions', adminController.createQuizQuestion)
router.patch('/quiz-questions/reorder', adminController.reorderQuizQuestions)
router.get('/quiz-questions/preview', adminController.previewQuiz)
router.get('/quiz-questions/versions', adminController.getQuizVersions)
router.post('/quiz-questions/publish', adminController.publishQuizVersion)
router.patch('/quiz-questions/versions/:version/archive', adminController.archiveQuizVersion)
router.patch('/quiz-questions/:id', adminController.updateQuizQuestion)
router.delete('/quiz-questions/:id', adminController.deleteQuizQuestion)

// Resource library management — any staff role.
router.get('/resources', adminController.getResources)
router.post('/resources', adminController.createResource)
router.patch('/resources/:id', adminController.updateResource)
router.delete('/resources/:id', adminController.deleteResource)
router.patch('/resources/:id/status/:status', adminController.setResourcePublication)

// Multimedia center management — any staff role.
router.get('/media', adminController.getMedia)
router.post('/media', adminController.createMedia)
router.patch('/media/:id', adminController.updateMedia)
router.delete('/media/:id', adminController.deleteMedia)
router.patch('/media/:id/status/:status', adminController.setMediaPublication)

// Success story approval workflow — any staff role.
router.get('/stories', adminController.getStories)
router.get('/stories/:id', adminController.getStoryByIdAdmin)
router.patch('/stories/:id/approve', adminController.approveStory)
router.patch('/stories/:id/reject', adminController.rejectStory)
router.patch('/stories/:id/request-changes', adminController.requestStoryChanges)
router.patch('/stories/:id', adminController.updateStory)
router.patch('/stories/:id/feature', adminController.featureStory)

// Feedback triage + analytics — any staff role.
router.get('/feedback/assignees', adminController.getFeedbackAssignees)
router.get('/feedback', adminController.getFeedback)
router.patch('/feedback/:id', adminController.updateFeedbackTriage)
router.patch('/feedback/:id/respond', adminController.respondToFeedback)
router.get('/feedback/analytics', adminController.getFeedbackAnalytics)

// Dashboard statistics — any staff role.
router.get('/stats', adminController.getStats)

// Audit logs are sensitive oversight data — admin/super_admin only,
// same permission level as user management.
router.get(
  '/audit-logs',
  requireRole(...USER_MANAGEMENT_ROLES),
  adminController.getAuditLogs
)

export default router
 