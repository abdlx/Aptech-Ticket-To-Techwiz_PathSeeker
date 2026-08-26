import { Router } from 'express'
import * as feedbackController from '../controllers/feedback.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()
router.use(requireAuth)

router.post('/', feedbackController.submitFeedback)
router.get('/mine', feedbackController.getMyFeedback)

export default router