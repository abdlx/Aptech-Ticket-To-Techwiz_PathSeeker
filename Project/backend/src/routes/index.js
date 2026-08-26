import { Router } from 'express'
import adminRoutes from './admin.routes.js'
import authRoutes from './auth.routes.js'
import catalogRoutes from './catalog.routes.js'
import feedbackRoutes from './feedback.routes.js'
import mediaRoutes from './media.routes.js'
import notificationRoutes from './notification.routes.js'
import personalizationRoutes from './personalization.routes.js'
import profileRoutes from './profile.routes.js'
import quizAttemptsRoutes from './quizAttempts.routes.js'
import quizQuestionsRoutes from './quizQuestions.routes.js'
import resourceRoutes from './resource.routes.js'
import settingsRoutes from './settings.routes.js'
import storyRoutes from './story.routes.js'

const router = Router()

router.get('/health', (_req, res) => res.status(200).json({ data: { status: 'ok' } }))

router.use('/auth', authRoutes)
router.use('/', catalogRoutes)
router.use('/notifications', notificationRoutes)
router.use('/quiz-questions', quizQuestionsRoutes)
router.use('/quiz-attempts', quizAttemptsRoutes)
router.use('/users/me/profile', profileRoutes)
router.use('/users/me', personalizationRoutes)
router.use('/resources', resourceRoutes)
router.use('/media', mediaRoutes)
router.use('/stories', storyRoutes)
router.use('/feedback', feedbackRoutes)
router.use('/admin/settings', settingsRoutes)
router.use('/admin', adminRoutes)

export default router