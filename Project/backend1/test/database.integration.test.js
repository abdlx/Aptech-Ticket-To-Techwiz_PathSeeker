import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { connectDatabase, disconnectDatabase } from '../src/config/database.js'
import { Session, User, UserProfile, VerificationToken } from '../src/models/index.js'

const integrationEnabled = Boolean(process.env.TEST_MONGODB_URI)

test(
  'Phase 1 models persist and enforce unique and TTL indexes in MongoDB',
  { skip: !integrationEnabled, timeout: 30_000 },
  async (context) => {
    const dbName = process.env.TEST_MONGODB_DB_NAME || 'pathseeker_test'
    assert.match(dbName, /test/i, 'TEST_MONGODB_DB_NAME must clearly identify a disposable test database.')

    await connectDatabase({
      uri: process.env.TEST_MONGODB_URI,
      dbName,
      options: { autoIndex: true },
    })
    context.after(disconnectDatabase)

    const testMarker = `phase1-${Date.now()}`
    const email = `${testMarker}@example.com`
    const createdIds = []

    context.after(async () => {
      await Promise.all([
        Session.deleteMany({ userId: { $in: createdIds } }),
        VerificationToken.deleteMany({ userId: { $in: createdIds } }),
        UserProfile.deleteMany({ userId: { $in: createdIds } }),
        User.deleteMany({ _id: { $in: createdIds } }),
      ])
    })

    await Promise.all([
      User.syncIndexes(),
      UserProfile.syncIndexes(),
      Session.syncIndexes(),
      VerificationToken.syncIndexes(),
    ])

    const user = await User.create({
      name: 'Integration User',
      email,
      passwordHash: 'integration-password-hash-value',
      role: 'user',
      stage: 'student',
    })
    createdIds.push(user._id)

    await UserProfile.create({ userId: user._id, interests: ['Technology'] })

    await assert.rejects(
      User.create({
        name: 'Duplicate User',
        email: email.toUpperCase(),
        passwordHash: 'integration-password-hash-value',
        role: 'user',
        stage: 'student',
      }),
      (error) => error?.code === 11000,
    )

    const sessionIndexes = await mongoose.connection.collection('sessions').indexes()
    const ttlIndex = sessionIndexes.find((index) => index.key?.expiresAt === 1)
    assert.equal(ttlIndex?.expireAfterSeconds, 0)
  },
)
