import { Router } from 'express'
import * as quizController from '../controllers/quiz.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()

// Quiz is part of the personalized (logged-in) experience per SRS 1.2.
router.get('/', requireAuth, quizController.getQuestions)

export default router