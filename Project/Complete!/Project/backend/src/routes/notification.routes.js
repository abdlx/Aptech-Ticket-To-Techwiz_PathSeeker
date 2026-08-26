import { Router } from 'express'
import * as notificationController from '../controllers/notification.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()
router.use(requireAuth)

router.get('/', notificationController.getNotifications)
router.patch('/read-all', notificationController.markAllRead)
router.patch('/:id/read', notificationController.markRead)

export default router