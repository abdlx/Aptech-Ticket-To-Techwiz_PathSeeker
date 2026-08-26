import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDatabase, disconnectDatabase } from '../../config/database.js'
import {
  Career,
  CareerPassport,
  Domain,
  Quiz,
  QuizQuestion,
  QuizAttempt,
  RecommendationSnapshot,
  Session,
  Skill,
  User,
  UserProfile,
  VerificationToken,
} from '../../models/index.js'
import { careersSeed } from './careers.seed.js'
import { domainsSeed, skillsSeed } from './catalog.seed.js'
import { profileIds, userIds } from './ids.js'
import { quizQuestionsSeed } from './quizQuestions.seed.js'
import { quizzesSeed } from './quizzes.seed.js'
import { buildUsersSeed, profilesSeed } from './users.seed.js'

const isReset = process.argv.includes('--reset')

function assertSafeEnvironment() {
  if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
    throw new Error('Production seeding is disabled. Set ALLOW_PRODUCTION_SEED=true only after explicit review.')
  }

  if (!process.env.SEED_DEMO_PASSWORD || process.env.SEED_DEMO_PASSWORD.length < 12) {
    throw new Error('SEED_DEMO_PASSWORD must be set and contain at least 12 characters.')
  }
}

function toUpserts(documents) {
  return documents.map(({ _id, ...document }) => ({
    updateOne: {
      filter: { _id },
      update: { $set: document, $setOnInsert: { _id } },
      upsert: true,
    },
  }))
}

async function resetSeedOwnedRecords() {
  const seededUserIds = Object.values(userIds)

  await Promise.all([
    Session.deleteMany({ userId: { $in: seededUserIds } }),
    VerificationToken.deleteMany({ userId: { $in: seededUserIds } }),
    UserProfile.deleteMany({ _id: { $in: Object.values(profileIds) } }),
    CareerPassport.deleteMany({ userId: { $in: seededUserIds } }),
    RecommendationSnapshot.deleteMany({ userId: { $in: seededUserIds } }),
    QuizAttempt.deleteMany({ userId: { $in: seededUserIds } }),
  ])

  await Promise.all([
    User.deleteMany({ _id: { $in: seededUserIds } }),
    Skill.deleteMany({ _id: { $in: skillsSeed.map(({ _id }) => _id) } }),
    Domain.deleteMany({ _id: { $in: domainsSeed.map(({ _id }) => _id) } }),
    Career.deleteMany({ _id: { $in: careersSeed.map(({ _id }) => _id) } }),
    QuizQuestion.deleteMany({ _id: { $in: quizQuestionsSeed.map(({ _id }) => _id) } }),
    Quiz.deleteMany({ _id: { $in: quizzesSeed.map(({ _id }) => _id) } }),
  ])
}

async function seed() {
  assertSafeEnvironment()
  await connectDatabase()

  if (isReset) {
    await resetSeedOwnedRecords()
  }

  const passwordHash = await bcrypt.hash(process.env.SEED_DEMO_PASSWORD, 12)
  const usersSeed = buildUsersSeed(passwordHash)

  await Skill.bulkWrite(toUpserts(skillsSeed))
  await Domain.bulkWrite(toUpserts(domainsSeed))
  await Career.bulkWrite(toUpserts(careersSeed))
  await QuizQuestion.bulkWrite(toUpserts(quizQuestionsSeed))
  await Quiz.bulkWrite(toUpserts(quizzesSeed))
  await User.bulkWrite(toUpserts(usersSeed))
  await UserProfile.bulkWrite(toUpserts(profilesSeed))

  await Promise.all([
    Skill.syncIndexes(),
    Domain.syncIndexes(),
    Career.syncIndexes(),
    QuizQuestion.syncIndexes(),
    Quiz.syncIndexes(),
    QuizAttempt.syncIndexes(),
    CareerPassport.syncIndexes(),
    RecommendationSnapshot.syncIndexes(),
    User.syncIndexes(),
    UserProfile.syncIndexes(),
    Session.syncIndexes(),
    VerificationToken.syncIndexes(),
  ])

  const counts = await Promise.all([
    Skill.countDocuments({ _id: { $in: skillsSeed.map(({ _id }) => _id) } }),
    Domain.countDocuments({ _id: { $in: domainsSeed.map(({ _id }) => _id) } }),
    Career.countDocuments({ _id: { $in: careersSeed.map(({ _id }) => _id) } }),
    QuizQuestion.countDocuments({ _id: { $in: quizQuestionsSeed.map(({ _id }) => _id) } }),
    Quiz.countDocuments({ _id: { $in: quizzesSeed.map(({ _id }) => _id) } }),
    User.countDocuments({ _id: { $in: Object.values(userIds) } }),
    UserProfile.countDocuments({ _id: { $in: Object.values(profileIds) } }),
  ])

  console.log(
    `Seed complete: ${counts[0]} skills, ${counts[1]} domains, ${counts[2]} careers, ${counts[3]} quiz questions, ${counts[4]} quizzes, ${counts[5]} users, ${counts[6]} profiles.`,
  )
}

seed()
  .catch((error) => {
    console.error(error.message)
    process.exitCode = 1
  })
  .finally(disconnectDatabase)
