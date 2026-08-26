import { Quiz, QuizAttempt } from '../models/index.js'
import AppError from '../utils/AppError.js'
import { generateCareerIntelligence } from './careerIntelligence.service.js'
import { createNotification } from './notification.service.js'

function publicQuiz(quiz) {
  return {
    _id: quiz._id,
    slug: quiz.slug,
    version: quiz.version,
    title: quiz.title,
    description: quiz.description,
    algorithmVersion: quiz.algorithmVersion,
    questions: quiz.questions.map((question) => ({
      key: question.key,
      questionText: question.questionText,
      eyebrow: question.eyebrow,
      hint: question.hint,
      type: question.type,
      order: question.order,
      timeLimitSeconds: question.timeLimitSeconds,
      options: question.options.map((option) => ({ key: option.key, label: option.label, icon: option.icon, value: option.value })),
    })),
  }
}

export async function getActiveQuiz() {
  const quiz = await Quiz.findOne({ status: 'published' }).sort({ publishedAt: -1, version: -1 })
  if (!quiz) throw new AppError(503, 'No published career assessment is currently available.', 'QUIZ_UNAVAILABLE')
  return quiz
}

export async function listActiveQuestions() {
  return publicQuiz(await getActiveQuiz())
}

export async function startAttempt(userId) {
  const quiz = await getActiveQuiz()
  const existing = await QuizAttempt.findOne({ userId, quizId: quiz._id, status: 'in_progress' }).sort({ createdAt: -1 })
  if (existing) return existing
  const questionSnapshots = quiz.questions.map((question) => question.toObject({ depopulate: true }))
  return QuizAttempt.create({
    userId,
    quizId: quiz._id,
    quizVersion: quiz.version,
    questionSnapshots,
    algorithmVersion: quiz.algorithmVersion,
    status: 'in_progress',
    answers: [],
  })
}

export async function listAttempts(userId) {
  return QuizAttempt.find({ userId }).sort({ createdAt: -1 }).populate('topCareerId', 'title slug')
}

export async function getAttempt(userId, attemptId) {
  const attempt = await QuizAttempt.findOne({ _id: attemptId, userId })
    .populate('topCareerId', 'title slug')
    .populate('passportId')
    .populate({ path: 'recommendationSnapshotId', populate: { path: 'matches.careerId', select: 'title slug summary description iconKey colorTone' } })
  if (!attempt) throw new AppError(404, 'Quiz attempt not found.', 'NOT_FOUND')
  return attempt
}

export async function answerQuestion(userId, attemptId, { questionKey, optionKey }) {
  const attempt = await QuizAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) throw new AppError(404, 'Quiz attempt not found.', 'NOT_FOUND')
  if (attempt.status === 'completed') throw new AppError(409, 'This quiz attempt is already completed.', 'ATTEMPT_COMPLETED')

  const question = attempt.questionSnapshots.find((item) => item.key === questionKey)
  if (!question) throw new AppError(404, 'Quiz question not found in this attempt.', 'NOT_FOUND')
  if (!question.options.some((option) => option.key === optionKey)) {
    throw new AppError(400, 'Invalid option for this question.', 'VALIDATION_ERROR')
  }

  const existingAnswer = attempt.answers.find((answer) => answer.questionKey === questionKey)
  if (existingAnswer) {
    existingAnswer.optionKey = optionKey
    existingAnswer.answeredAt = new Date()
  } else {
    attempt.answers.push({ questionKey, optionKey, answeredAt: new Date() })
  }
  await attempt.save()
  return attempt
}

export async function completeAttempt(userId, attemptId) {
  const attempt = await QuizAttempt.findOne({ _id: attemptId, userId })
  if (!attempt) throw new AppError(404, 'Quiz attempt not found.', 'NOT_FOUND')
  if (attempt.status === 'completed') return getAttempt(userId, attemptId)

  const requiredKeys = new Set(attempt.questionSnapshots.map(({ key }) => key))
  const answeredKeys = new Set(attempt.answers.map(({ questionKey }) => questionKey))
  const missing = [...requiredKeys].filter((key) => !answeredKeys.has(key))
  if (missing.length) {
    throw new AppError(400, `Answer all questions before completing the assessment (${missing.length} remaining).`, 'INCOMPLETE_ATTEMPT')
  }

  const quiz = await Quiz.findById(attempt.quizId)
  if (!quiz) throw new AppError(409, 'The quiz version for this attempt is unavailable.', 'QUIZ_VERSION_MISSING')
  const { passport, snapshot } = await generateCareerIntelligence({ userId, attempt, quiz })
  const topMatch = snapshot.matches[0]

  attempt.status = 'completed'
  attempt.completedAt = new Date()
  attempt.score = topMatch?.compatibilityScore || 0
  attempt.archetype = passport.archetype
  attempt.topCareerId = topMatch?.careerId
  attempt.passportId = passport._id
  attempt.recommendationSnapshotId = snapshot._id
  await attempt.save()

  await createNotification({
    userId,
    type: 'match',
    title: 'Your Career Passport is ready',
    body: 'Your deterministic assessment results, skill gaps, and explainable career matches are ready to explore.',
    icon: 'sparkles',
  })
  return getAttempt(userId, attemptId)
}

export default { getActiveQuiz, listActiveQuestions, startAttempt, listAttempts, getAttempt, answerQuestion, completeAttempt }
