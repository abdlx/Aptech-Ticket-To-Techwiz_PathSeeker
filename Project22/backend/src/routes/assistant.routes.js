import { Router } from 'express'
import * as assistantController from '../controllers/assistant.controller.js'
import { assistantRateLimiter } from '../middleware/rateLimit.middleware.js'

const router = Router()
router.post('/respond', assistantRateLimiter, assistantController.respond)
export default router
