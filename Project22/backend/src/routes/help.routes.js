import { Router } from 'express'
import * as helpController from '../controllers/help.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import { STAFF_ROLES } from '../constants/database.js'
const router = Router()
router.get('/admin/list', requireAuth, requireRole(...STAFF_ROLES), helpController.adminList)
router.post('/admin', requireAuth, requireRole(...STAFF_ROLES), helpController.create)
router.patch('/admin/:id', requireAuth, requireRole(...STAFF_ROLES), helpController.update)
router.delete('/admin/:id', requireAuth, requireRole(...STAFF_ROLES), helpController.remove)
router.get('/', helpController.listHelp)
router.get('/:slug', helpController.getHelp)
export default router
