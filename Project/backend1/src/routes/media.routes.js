import { Router } from 'express'
import * as contentController from '../controllers/content.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

router.get('/', contentController.getMedia)
router.get('/:id', contentController.getMediaById)
// Rating requires auth: MediaRating is one-per-(user, media) and needs an
// identity to enforce that and to prevent the same person inflating a score.
router.post('/:id/ratings', requireAuth, contentController.rateMedia)

export default router