import { Router } from 'express'
import * as settingsController from '../controllers/settings.controller.js'
import { requireAuth, requireRole } from '../middleware/auth.middleware.js'
import { USER_MANAGEMENT_ROLES } from '../constants/database.js'

const router = Router()

// Site-wide settings are as sensitive as user management — same role gate.
router.use(requireAuth, requireRole(...USER_MANAGEMENT_ROLES))

router.get('/', settingsController.getSettings)
router.patch('/', settingsController.updateSettings)

export default router