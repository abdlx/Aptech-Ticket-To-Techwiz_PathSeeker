import { quizIds } from './ids.js'
import { quizQuestionsSeed } from './quizQuestions.seed.js'

export const quizzesSeed = [{
  _id: quizIds.careerPassportV1,
  slug: 'career-passport-assessment',
  version: 1,
  title: 'Career Passport Assessment',
  description: 'A short deterministic assessment of interests, working style, and career signals.',
  status: 'published',
  algorithmVersion: 'passport-v1',
  publishedAt: new Date('2026-08-01T00:00:00.000Z'),
  questions: quizQuestionsSeed.map((question, index) => ({
    key: `q${index + 1}`,
    questionText: question.questionText,
    eyebrow: question.eyebrow,
    hint: question.hint,
    type: question.type,
    order: question.order,
    timeLimitSeconds: question.timeLimitSeconds,
    options: question.options,
  })),
}]
