import { Career, Domain, QuizAttempt, QuizQuestion } from '../models/index.js'
import AppError from '../utils/AppError.js'
import { createNotification } from './notification.service.js'

export async function listActiveQuestions() {
  return QuizQuestion.find({ active: true }).sort({ order: 1 })
}

export async function startAttempt(userId) {
  return QuizAttempt.create({ userId, status: 'in_progress', answers: [] })
}

export async function listAttempts(userId) {
  return QuizAttempt.find({ userId }).sort({ createdAt: -1 }).populate('topCareerId', 'title slug')
}

export async function getAttempt(userId, attemptId) {
  const attempt = await QuizAttempt.findOne({ _id: attemptId, userId }).populate('topCareerId', 'title slug')
  if (!attempt) {
    throw new AppError(404, 'Quiz attempt not found.', 'NOT_FOUND')
  }
  return attempt
}

export async function answerQuestion(userId, attemptId, { questionId, optionKey }) {
  const attempt = await QuizAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) {
    throw new AppError(404, 'Quiz attempt not found.', 'NOT_FOUND')
  }
  if (attempt.status === 'completed') {
    throw new AppError(400, 'This quiz attempt is already completed.', 'ATTEMPT_COMPLETED')
  }

  const question = await QuizQuestion.findOne({ _id: questionId, active: true })
  if (!question) {
    throw new AppError(404, 'Quiz question not found.', 'NOT_FOUND')
  }
  if (!question.options.some((option) => option.key === optionKey)) {
    throw new AppError(400, 'Invalid option for this question.', 'VALIDATION_ERROR')
  }

  const existingAnswer = attempt.answers.find((a) => a.questionId.toString() === questionId)
  if (existingAnswer) {
    existingAnswer.optionKey = optionKey
  } else {
    attempt.answers.push({ questionId, optionKey })
  }

  await attempt.save()
  return attempt
}

// Sums each answer's domain weights, picks the strongest domain, scales the
// total into a 0-100 "score", and suggests one career from that domain.
// This satisfies the SRS's quiz-scoring requirement without an ML model.
export async function completeAttempt(userId, attemptId) {
  const attempt = await QuizAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) {
    throw new AppError(404, 'Quiz attempt not found.', 'NOT_FOUND')
  }
  if (attempt.status === 'completed') {
    return attempt
  }
  if (attempt.answers.length === 0) {
    throw new AppError(400, 'Answer at least one question before completing the quiz.', 'NO_ANSWERS')
  }

  const questions = await QuizQuestion.find({
    _id: { $in: attempt.answers.map((a) => a.questionId) },
  })
  const questionsById = new Map(questions.map((q) => [q._id.toString(), q]))

  const domainScores = new Map()
  let maxPossible = 0

  for (const answer of attempt.answers) {
    const question = questionsById.get(answer.questionId.toString())
    if (!question) continue

    const option = question.options.find((o) => o.key === answer.optionKey)
    if (!option) continue

    const questionMaxWeight = Math.max(0, ...question.options.flatMap((o) => o.domainWeights.map((w) => w.weight)), 0)
    maxPossible += questionMaxWeight

    for (const { domainId, weight } of option.domainWeights) {
      const key = domainId.toString()
      domainScores.set(key, (domainScores.get(key) || 0) + weight)
    }
  }

  let topDomainId = null
  let topDomainScore = -Infinity
  for (const [domainId, score] of domainScores.entries()) {
    if (score > topDomainScore) {
      topDomainScore = score
      topDomainId = domainId
    }
  }

  const score = maxPossible > 0 ? Math.max(0, Math.min(100, Math.round((topDomainScore / maxPossible) * 100))) : 0

  let topCareerId = null
  let archetype = 'Explorer'
  if (topDomainId) {
    const [domain, topCareer] = await Promise.all([
      Domain.findById(topDomainId),
      Career.findOne({ domainId: topDomainId, active: true }).sort({ demand: -1, title: 1 }),
    ])
    if (domain) archetype = `${domain.name} Enthusiast`
    if (topCareer) topCareerId = topCareer._id
  }

  attempt.status = 'completed'
  attempt.completedAt = new Date()
  attempt.score = score
  attempt.archetype = archetype
  attempt.topCareerId = topCareerId
  await attempt.save()

  await createNotification({
    userId,
    type: 'match',
    title: 'Your matches are ready',
    body: 'Navi found career paths that align with your latest quiz answers.',
    icon: 'sparkles',
  })

  return attempt
}

export default { listActiveQuestions, startAttempt, listAttempts, getAttempt, answerQuestion, completeAttempt }