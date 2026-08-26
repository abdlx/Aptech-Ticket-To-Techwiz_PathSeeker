import { Router } from 'express'
import * as contentController from '../controllers/content.controller.js'

const router = Router()

router.get('/', contentController.getResources)
router.get('/:id', contentController.getResourceById)
router.post('/:id/download', contentController.downloadResource)

export default router