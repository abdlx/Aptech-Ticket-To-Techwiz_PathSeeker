import { Router } from 'express'
import * as assistantController from '../controllers/assistant.controller.js'
import { optionalAuth } from '../middleware/auth.middleware.js'
import { assistantRateLimiter } from '../middleware/rateLimit.middleware.js'

const router = Router()

router.post('/respond', assistantRateLimiter, optionalAuth, assistantController.respond)

export default router
