import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { Career, Quiz, QuizQuestion } from '../src/models/index.js'
import { careersSeed } from '../src/database/seed/careers.seed.js'
import { quizQuestionsSeed } from '../src/database/seed/quizQuestions.seed.js'
import { quizzesSeed } from '../src/database/seed/quizzes.seed.js'
import { calculatePassport, scoreCareer } from '../src/services/careerIntelligence.service.js'

test('canonical career and versioned quiz seeds satisfy their Mongoose contracts', async () => {
  await Promise.all([
    ...careersSeed.map((document) => new Career(document).validate()),
    ...quizQuestionsSeed.map((document) => new QuizQuestion(document).validate()),
    ...quizzesSeed.map((document) => new Quiz(document).validate()),
  ])
  assert.ok(careersSeed.every((career) => career.requiredSkills.length >= 4))
  assert.ok(quizQuestionsSeed.every((question) => question.options.every((option) => option.key && option.trait)))
  assert.equal(quizzesSeed[0].status, 'published')
})

test('Career Passport calculation is deterministic and retains explainable signals', () => {
  const userId = new mongoose.Types.ObjectId()
  const attemptId = new mongoose.Types.ObjectId()
  const domainId = new mongoose.Types.ObjectId()
  const attempt = {
    _id: attemptId,
    userId,
    answers: [{ questionKey: 'q1', optionKey: 'a' }, { questionKey: 'q2', optionKey: 'b' }],
    questionSnapshots: [
      { key: 'q1', options: [{ key: 'a', trait: 'creative', domainWeights: [{ domainId, weight: 3 }] }] },
      { key: 'q2', options: [{ key: 'b', trait: 'empathy', domainWeights: [{ domainId, weight: 2 }] }] },
    ],
  }
  const profile = { updatedAt: new Date('2026-08-01'), headline: 'Designer', education: [{}], skills: [], interests: ['Design'], goals: { primaryGoal: 'Grow' }, onboarding: { status: 'completed' } }
  const first = calculatePassport({ attempt, profile, quiz: {}, domainNames: new Map([[domainId.toString(), 'Design']]) })
  const second = calculatePassport({ attempt, profile, quiz: {}, domainNames: new Map([[domainId.toString(), 'Design']]) })
  assert.deepEqual(first.traitScores, second.traitScores)
  assert.equal(first.traitScores.length, 2)
  assert.equal(first.domainScores[0].label, 'Design')
  assert.equal(first.algorithmVersion, 'passport-v1')
})

test('Career Match stays distinct from readiness and simulation does not mutate the passport', () => {
  const skillId = new mongoose.Types.ObjectId()
  const careerId = new mongoose.Types.ObjectId()
  const passport = { traitScores: [{ key: 'creative', score: 100 }], skills: [{ skillId, level: 2 }] }
  const profile = { interests: ['Design'] }
  const career = {
    _id: careerId,
    traits: ['creative'],
    tags: ['design'],
    domainId: { name: 'Design' },
    requiredSkills: [{ skillId, importance: 'critical', requiredLevel: 8 }],
  }
  const before = scoreCareer({ passport, profile, career })
  const after = scoreCareer({ passport, profile, career, skillOverrides: { [skillId.toString()]: 8 } })
  assert.ok(before.compatibilityScore > before.readinessScore)
  assert.equal(before.skillGap[0].difference, 6)
  assert.equal(after.readinessScore, 100)
  assert.equal(passport.skills[0].level, 2)
})
