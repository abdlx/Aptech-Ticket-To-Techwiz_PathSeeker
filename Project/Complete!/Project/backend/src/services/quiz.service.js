import { Career, Domain, QuizAttempt, QuizQuestion, QuizVersion } from '../models/index.js'
import { buildPaginationMeta } from '../utils/pagination.js'
import AppError from '../utils/AppError.js'
import { createNotification } from './notification.service.js'

export async function getPublishedVersion() {
  return QuizVersion.findOne({ status: 'published' }).sort({ version: -1 }).lean()
}

export async function listActiveQuestions() {
  const version = await getPublishedVersion()
  if (version?.questions?.length) return version.questions
  return QuizQuestion.find({ active: true }).sort({ order: 1 }).lean()
}

export async function startAttempt(userId) {
  const published = await getPublishedVersion()
  const questions = published?.questions?.length ? published.questions : await QuizQuestion.find({ active: true }).sort({ order: 1 }).lean()
  const quizVersion = published?.version || questions.reduce((max, question) => Math.max(max, question.version || 1), 1)
  const questionSnapshot = questions.map(({ _id, questionId, version, questionText, type, timeLimitSeconds, options }) => ({ questionId: questionId || _id, version: version || 1, questionText, type, timeLimitSeconds: timeLimitSeconds || 0, options }))
  return QuizAttempt.create({ userId, status: 'in_progress', answers: [], quizVersion, questionSnapshot })
}

export async function listAttempts(userId, { page = 1, limit = 20, skip = 0 } = {}) {
  const [attempts, total] = await Promise.all([
    QuizAttempt.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('topCareerId', 'title slug'),
    QuizAttempt.countDocuments({ userId }),
  ])
  return { attempts, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function getAttempt(userId, attemptId) {
  const attempt = await QuizAttempt.findOne({ _id: attemptId, userId }).populate('topCareerId', 'title slug').populate('scoreBreakdown.domainId', 'name slug')
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

  const snapshotQuestion = attempt.questionSnapshot.find((item) => item.questionId.toString() === questionId)
  if (!snapshotQuestion) throw new AppError(404, 'Question is not part of this quiz attempt.', 'NOT_FOUND')
  if (!snapshotQuestion.options.some((option) => option.key === optionKey)) {
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
    return QuizAttempt.findById(attempt._id).populate('topCareerId', 'title slug').populate('scoreBreakdown.domainId', 'name slug')
  }
  if (attempt.answers.length === 0) {
    throw new AppError(400, 'Answer at least one question before completing the quiz.', 'NO_ANSWERS')
  }

  const questionsById = new Map((attempt.questionSnapshot || []).map((q) => [q.questionId.toString(), q]))

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

  const sortedDomainScores = [...domainScores.entries()].sort((a, b) => b[1] - a[1])
  const scoreBreakdown = sortedDomainScores.map(([domainId, domainScore]) => ({
    domainId,
    score: domainScore,
    percentage: maxPossible > 0 ? Math.max(0, Math.min(100, Math.round((domainScore / maxPossible) * 100))) : 0,
  }))

  const completed = await QuizAttempt.findOneAndUpdate(
    { _id: attempt._id, userId, status: 'in_progress' },
    { $set: { status: 'completed', completedAt: new Date(), score, archetype, topCareerId, scoreBreakdown } },
    { new: true },
  )
  if (!completed) return QuizAttempt.findOne({ _id: attempt._id, userId }).populate('topCareerId', 'title slug').populate('scoreBreakdown.domainId', 'name slug')

  await createNotification({
    userId,
    type: 'match',
    title: 'Your matches are ready',
    body: 'Navi found career paths that align with your latest quiz answers.',
    icon: 'sparkles',
    targetScreen: 'recommendations',
  })

  return QuizAttempt.findById(completed._id).populate('topCareerId', 'title slug').populate('scoreBreakdown.domainId', 'name slug')
}

export default { listActiveQuestions, startAttempt, listAttempts, getAttempt, answerQuestion, completeAttempt }