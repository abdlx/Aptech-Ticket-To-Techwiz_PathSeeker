import { Router } from 'express'
import authRoutes from './auth.routes.js'
import catalogRoutes from './catalog.routes.js'
import notificationRoutes from './notification.routes.js'
import personalizationRoutes from './personalization.routes.js'
import quizAttemptsRoutes from './quizAttempts.routes.js'
import quizQuestionsRoutes from './quizQuestions.routes.js'

const router = Router()

router.get('/health', (_req, res) => res.status(200).json({ data: { status: 'ok' } }))

router.use('/auth', authRoutes)
router.use('/', catalogRoutes)
router.use('/notifications', notificationRoutes)
router.use('/quiz-questions', quizQuestionsRoutes)
router.use('/quiz-attempts', quizAttemptsRoutes)
router.use('/users/me', personalizationRoutes)
// Later milestones mount additional routers here, e.g.:
// router.use('/admin', adminRoutes)

export default router