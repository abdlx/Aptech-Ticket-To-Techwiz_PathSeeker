import * as quizService from '../services/quiz.service.js'
import AppError from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { isNonEmptyString } from '../utils/validators.js'

export const getQuestions = asyncHandler(async (_req, res) => {
  const quiz = await quizService.listActiveQuestions()
  res.status(200).json({ data: { quiz, questions: quiz.questions } })
})

export const getAttempts = asyncHandler(async (req, res) => {
  const attempts = await quizService.listAttempts(req.user.id)
  res.status(200).json({ data: { attempts } })
})

export const startAttempt = asyncHandler(async (req, res) => {
  const attempt = await quizService.startAttempt(req.user.id)
  res.status(201).json({ data: { attempt } })
})

export const getAttempt = asyncHandler(async (req, res) => {
  const attempt = await quizService.getAttempt(req.user.id, req.params.id)
  res.status(200).json({ data: { attempt } })
})

export const answerQuestion = asyncHandler(async (req, res) => {
  const { questionKey, optionKey } = req.body
  if (!isNonEmptyString(questionKey, { min: 1, max: 50 }) || !isNonEmptyString(optionKey, { min: 1, max: 20 })) {
    throw new AppError(400, 'questionKey and optionKey are required.', 'VALIDATION_ERROR')
  }
  const attempt = await quizService.answerQuestion(req.user.id, req.params.id, { questionKey, optionKey })
  res.status(200).json({ data: { attempt } })
})

export const completeAttempt = asyncHandler(async (req, res) => {
  const attempt = await quizService.completeAttempt(req.user.id, req.params.id)
  res.status(200).json({ data: { attempt } })
})

export default { getQuestions, getAttempts, startAttempt, getAttempt, answerQuestion, completeAttempt }
