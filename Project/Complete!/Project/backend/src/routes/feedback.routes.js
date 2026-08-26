import { Router } from 'express'
import * as feedbackController from '../controllers/feedback.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { authRateLimiter } from '../middleware/rateLimit.middleware.js'

const router = Router()
router.use(requireAuth)

router.post('/', authRateLimiter, feedbackController.submitFeedback)
router.get('/mine', feedbackController.getMyFeedback)

export default router