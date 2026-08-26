import { Router } from 'express'
import * as contentController from '../controllers/content.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { authRateLimiter } from '../middleware/rateLimit.middleware.js'
import { uploadSingleFile } from '../middleware/upload.middleware.js'

const router = Router()

router.get('/mine', requireAuth, contentController.getMyStories)
router.get('/mine/:id', requireAuth, contentController.getMyStory)
router.patch('/mine/:id', requireAuth, authRateLimiter, contentController.updateMyStory)
router.post('/mine/:id/submit', requireAuth, authRateLimiter, contentController.submitMyStory)
router.get('/', contentController.getStories)
router.get('/:id', contentController.getStoryById)
router.post(
  '/upload',
  requireAuth,
  authRateLimiter,
  uploadSingleFile({ fieldName: 'file', maxBytes: 8 * 1024 * 1024 }),
  contentController.uploadStoryImage,
)
router.post('/', requireAuth, authRateLimiter, contentController.submitStory)

export default router