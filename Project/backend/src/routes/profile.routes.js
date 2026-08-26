import { Router } from 'express'
import * as profileController from '../controllers/profile.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()
router.use(requireAuth)

router.get('/', profileController.getMyProfile)
router.patch('/', profileController.updateMyProfile)
router.patch('/onboarding', profileController.updateOnboarding)
router.patch('/assets/:assetType', profileController.updateAsset)

export default router