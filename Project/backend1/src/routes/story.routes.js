import { Router } from 'express'
import * as contentController from '../controllers/content.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', contentController.getStories)
router.get('/:id', contentController.getStoryById)
// Submitting requires auth (approval workflow needs to know who submitted it).
router.post('/', requireAuth, contentController.submitStory)

export default router