import { Router } from 'express'
import * as quizController from '../controllers/quiz.controller.js'
import { requireAuth } from '../middleware/auth.middleware.js'

const router = Router()
router.use(requireAuth)

router.get('/', quizController.getAttempts)
router.post('/', quizController.startAttempt)
router.get('/:id', quizController.getAttempt)
router.patch('/:id/answer', quizController.answerQuestion)
router.post('/:id/complete', quizController.completeAttempt)

export default router