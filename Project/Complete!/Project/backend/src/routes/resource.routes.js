import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import * as contentController from '../controllers/content.controller.js'

const router = Router()

router.get('/', contentController.getResources)
router.get('/:id', contentController.getResourceById)
router.post('/:id/view', contentController.viewResource)
router.post('/:id/download', requireAuth, contentController.downloadResource)

export default router