import { Router } from 'express'
import { body } from 'express-validator'
import { validateRequest } from '../middleware/validate.js'
import { requireAuth } from '../middleware/auth.js'
import {
  listQuizQuestions,
  submitQuiz,
  getQuizHistory,
  getLatestQuizAttempt,
} from '../controllers/quizController.js'

const router = Router()

router.get('/questions', listQuizQuestions)

router.post(
  '/submit',
  requireAuth,
  [
    body('answers').isArray({ min: 1 }).withMessage('At least one answer is required.'),
    body('answers.*.questionId').notEmpty().withMessage('Each answer needs a questionId.'),
    body('answers.*.optionIndex').isInt({ min: 0 }).withMessage('Each answer needs a valid optionIndex.'),
  ],
  validateRequest,
  submitQuiz,
)

router.get('/history', requireAuth, getQuizHistory)
router.get('/attempts/latest', requireAuth, getLatestQuizAttempt)

export default router