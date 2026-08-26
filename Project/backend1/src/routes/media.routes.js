import { Router } from 'express'
import * as contentController from '../controllers/content.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', contentController.getMedia)
router.get('/:id', contentController.getMediaById)
router.get('/:id/related', contentController.getRelatedMedia)
router.post('/:id/ratings', requireAuth, contentController.rateMedia)

export default router