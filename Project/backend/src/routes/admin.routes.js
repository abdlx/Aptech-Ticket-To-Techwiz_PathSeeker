import { Router } from 'express'
import * as adminController from '../controllers/admin.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import { STAFF_ROLES, USER_MANAGEMENT_ROLES } from '../constants/database.js'

const router = Router()

// Every /admin/* route needs a logged-in staff account. requireAuth first,
// then a per-route requireRole narrows it further.
router.use(requireAuth, requireRole(...STAFF_ROLES))

// User management is sensitive (role/status changes) — admin/super_admin only.
router.get('/users', requireRole(...USER_MANAGEMENT_ROLES), adminController.getUsers)
router.get('/users/:id', requireRole(...USER_MANAGEMENT_ROLES), adminController.getUserById)
router.patch('/users/:id', requireRole(...USER_MANAGEMENT_ROLES), adminController.updateUser)

// Career Bank and Quiz content management — any staff role.
router.get('/careers', adminController.getCareers)
router.post('/careers', adminController.createCareer)
router.patch('/careers/:id', adminController.updateCareer)
router.delete('/careers/:id', adminController.deleteCareer)

router.get('/quiz-questions', adminController.getQuizQuestions)
router.post('/quiz-questions', adminController.createQuizQuestion)
router.patch('/quiz-questions/:id', adminController.updateQuizQuestion)
router.delete('/quiz-questions/:id', adminController.deleteQuizQuestion)

// Resource library management — any staff role.
router.get('/resources', adminController.getResources)
router.post('/resources', adminController.createResource)
router.patch('/resources/:id', adminController.updateResource)
router.delete('/resources/:id', adminController.deleteResource)

// Multimedia center management — any staff role.
router.get('/media', adminController.getMedia)
router.post('/media', adminController.createMedia)
router.patch('/media/:id', adminController.updateMedia)
router.delete('/media/:id', adminController.deleteMedia)

// Success story approval workflow — any staff role.
router.get('/stories', adminController.getStories)
router.patch('/stories/:id/approve', adminController.approveStory)
router.patch('/stories/:id/reject', adminController.rejectStory)

// Feedback triage + analytics — any staff role.
router.get('/feedback', adminController.getFeedback)
router.patch('/feedback/:id/respond', adminController.respondToFeedback)
router.get('/feedback/analytics', adminController.getFeedbackAnalytics)

router.get('/stats', adminController.getStats)

export default router