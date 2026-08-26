import { Career, QuizAttempt, QuizQuestion } from '../models/index.js'
import { AppError } from '../utils/appError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

// Friendly display name for each dominant trait — shown on the results screen.
const ARCHETYPE_LABELS = {
  creative: 'Creative Explorer',
  analytical: 'Analytical Thinker',
  people: 'People-First Leader',
  technical: 'Technical Builder',
  communication: 'Clear Communicator',
  empathy: 'Thoughtful Builder',
  organization: 'Structured Planner',
}

// GET /api/quiz/questions
// Options are shaped as [label, icon] tuples to match the existing frontend's
// `question.options.map(([label, icon], i) => ...)` usage pattern (see data.js).
export const listQuizQuestions = asyncHandler(async (req, res) => {
  const questions = await QuizQuestion.find({ active: true }).sort({ order: 1 })

  const shaped = questions.map((question) => ({
    id: question._id,
    order: question.order,
    eyebrow: question.eyebrow,
    question: question.question,
    hint: question.hint,
    type: question.type,
    timeLimitSeconds: question.timeLimitSeconds,
    options: question.options.map((option) => [option.label, option.icon]),
  }))

  res.status(200).json({ questions: shaped })
})

// POST /api/quiz/submit
// Body: { answers: [{ questionId, optionIndex }, ...] }
export const submitQuiz = asyncHandler(async (req, res) => {
  const { answers } = req.body

  const questionIds = answers.map((answer) => answer.questionId)
  const questions = await QuizQuestion.find({ _id: { $in: questionIds }, active: true })
  const questionMap = new Map(questions.map((question) => [question._id.toString(), question]))

  const traitScores = {}
  const resolvedAnswers = []

  for (const answer of answers) {
    const question = questionMap.get(String(answer.questionId))
    if (!question) {
      throw new AppError(`Unknown or inactive question: ${answer.questionId}`, 400)
    }

    const option = question.options[answer.optionIndex]
    if (!option) {
      throw new AppError(`Invalid optionIndex for question: ${answer.questionId}`, 400)
    }

    traitScores[option.trait] = (traitScores[option.trait] || 0) + 1
    resolvedAnswers.push({ questionId: question._id, optionIndex: answer.optionIndex, trait: option.trait })
  }

  const totalAnswers = resolvedAnswers.length
  const [topTrait] = Object.entries(traitScores).sort((a, b) => b[1] - a[1])[0]
  const archetype = ARCHETYPE_LABELS[topTrait] || 'Thoughtful Explorer'

  const matchingCareers = await Career.find({
    active: true,
    traits: { $in: Object.keys(traitScores) },
  }).populate('domainId', 'name slug icon')

  const scoredCareers = matchingCareers
    .map((career) => {
      const overlapScore = career.traits.reduce((sum, trait) => sum + (traitScores[trait] || 0), 0)
      const score = Math.min(100, Math.round((overlapScore / totalAnswers) * 100))
      return { career, score }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)

  const attempt = await QuizAttempt.create({
    userId: req.user._id,
    answers: resolvedAnswers,
    traitScores,
    archetype,
    topCareers: scoredCareers.map(({ career, score }) => ({ careerId: career._id, score })),
  })

  res.status(201).json({
    message: 'Quiz submitted successfully.',
    attempt,
    archetype,
    traitScores,
    careers: scoredCareers.map(({ career, score }) => ({ career, score })),
  })
})

// GET /api/quiz/history
export const getQuizHistory = asyncHandler(async (req, res) => {
  const attempts = await QuizAttempt.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('topCareers.careerId', 'title slug icon tone')

  res.status(200).json({ attempts })
})

// GET /api/quiz/attempts/latest
export const getLatestQuizAttempt = asyncHandler(async (req, res) => {
  const attempt = await QuizAttempt.findOne({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .populate('topCareers.careerId', 'title slug icon tone summary salaryMin salaryMax')

  if (!attempt) {
    throw new AppError('No quiz attempts found yet.', 404)
  }

  res.status(200).json({ attempt })
})