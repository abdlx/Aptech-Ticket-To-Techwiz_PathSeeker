import { Router } from 'express'
import * as authController from '../controllers/auth.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { authRateLimiter } from '../middleware/rateLimit.middleware.js'

const router = Router()

router.post('/register', authRateLimiter, authController.register)
router.post('/verify-email', authRateLimiter, authController.verifyEmail)
router.post('/resend-verification', authRateLimiter, authController.resendVerification)
router.post('/login', authRateLimiter, authController.login)
router.post('/admin/login', authRateLimiter, authController.adminLogin)
router.post('/forgot-password', authRateLimiter, authController.forgotPassword)
router.post('/reset-password', authRateLimiter, authController.resetPassword)

router.post('/logout', requireAuth, authController.logout)
router.get('/me', requireAuth, authController.me)

export default router
