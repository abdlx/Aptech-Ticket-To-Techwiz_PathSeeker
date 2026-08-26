import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import {
  Domain,
  Session,
  Skill,
  User,
  UserProfile,
  VerificationToken,
} from '../src/models/index.js'

const objectId = () => new mongoose.Types.ObjectId()

function hasIndex(model, fields, expectedOptions = {}) {
  return model.schema.indexes().some(([definition, options]) => {
    const sameFields = JSON.stringify(definition) === JSON.stringify(fields)
    const sameOptions = Object.entries(expectedOptions).every(([key, value]) => options[key] === value)
    return sameFields && sameOptions
  })
}

test('Skill normalizes slugs and rejects duplicate aliases', async () => {
  const validSkill = new Skill({
    slug: 'JavaScript',
    name: 'JavaScript',
    category: 'technical',
    aliases: ['JS', 'ECMAScript'],
  })

  await validSkill.validate()
  assert.equal(validSkill.slug, 'javascript')

  const invalidSkill = new Skill({
    slug: 'javascript',
    name: 'JavaScript',
    category: 'technical',
    aliases: ['JS', 'js'],
  })

  await assert.rejects(invalidSkill.validate(), /aliases must be unique/i)
})

test('Domain defines a unique slug and stable listing index', () => {
  assert.ok(hasIndex(Domain, { slug: 1 }, { unique: true }))
  assert.ok(hasIndex(Domain, { active: 1, sortOrder: 1, name: 1 }))
})

test('User normalizes email, requires a stage for normal users, and hides secrets', async () => {
  const user = new User({
    name: 'Alex Morgan',
    email: '  Alex@Example.COM ',
    passwordHash: 'a-secure-password-hash-value',
    role: 'user',
    stage: 'student',
    emailVerifiedAt: new Date(),
  })

  await user.validate()
  assert.equal(user.email, 'alex@example.com')
  assert.equal(user.normalizedEmail, 'alex@example.com')
  assert.equal(user.emailVerified, true)
  assert.equal(user.toJSON().passwordHash, undefined)
  assert.equal(user.toJSON().normalizedEmail, undefined)

  const missingStage = new User({
    name: 'Normal User',
    email: 'normal@example.com',
    passwordHash: 'a-secure-password-hash-value',
    role: 'user',
  })
  await assert.rejects(missingStage.validate(), /stage.*required/i)

  const administrator = new User({
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash: 'a-secure-password-hash-value',
    role: 'super_admin',
  })
  await administrator.validate()
  assert.equal(administrator.stage, undefined)
})

test('User soft-delete state records deletedAt during validation', async () => {
  const user = new User({
    name: 'Deleted User',
    email: 'deleted@example.com',
    passwordHash: 'a-secure-password-hash-value',
    role: 'user',
    stage: 'graduate',
    status: 'deleted',
  })

  await user.validate()
  assert.ok(user.deletedAt instanceof Date)
})

test('UserProfile enforces unique skills, bounded scores, and chronological education', async () => {
  const repeatedSkillId = objectId()
  const duplicateSkills = new UserProfile({
    userId: objectId(),
    skills: [
      { skillId: repeatedSkillId, selfRating: 5 },
      { skillId: repeatedSkillId, selfRating: 7 },
    ],
  })
  await assert.rejects(duplicateSkills.validate(), /same skill more than once/i)

  const invalidRating = new UserProfile({
    userId: objectId(),
    skills: [{ skillId: objectId(), selfRating: 11 }],
  })
  await assert.rejects(invalidRating.validate(), /selfRating/i)

  const invalidEducation = new UserProfile({
    userId: objectId(),
    education: [{ level: 'Bachelor', startYear: 2026, endYear: 2024 }],
  })
  await assert.rejects(invalidEducation.validate(), /end year cannot be before start year/i)
})

test('UserProfile has one profile per user and an indexed skill reference', () => {
  assert.ok(hasIndex(UserProfile, { userId: 1 }, { unique: true }))
  assert.ok(hasIndex(UserProfile, { 'skills.skillId': 1 }))
})

test('Session stores only a token hash and expires through a TTL index', async () => {
  assert.equal(Session.schema.path('tokenHash').options.select, false)
  assert.equal(Session.schema.path('token'), undefined)
  assert.ok(hasIndex(Session, { expiresAt: 1 }, { expireAfterSeconds: 0 }))

  const session = new Session({
    userId: objectId(),
    tokenHash: 'x'.repeat(64),
    expiresAt: new Date(Date.now() + 60_000),
  })
  await session.validate()
})

test('VerificationToken is single-purpose, attempt-bounded, hashed, and TTL-indexed', async () => {
  assert.equal(VerificationToken.schema.path('tokenHash').options.select, false)
  assert.ok(hasIndex(VerificationToken, { expiresAt: 1 }, { expireAfterSeconds: 0 }))

  const invalidToken = new VerificationToken({
    userId: objectId(),
    purpose: 'login',
    tokenHash: 'x'.repeat(64),
    expiresAt: new Date(Date.now() + 60_000),
  })
  await assert.rejects(invalidToken.validate(), /purpose/i)

  const tooManyAttempts = new VerificationToken({
    userId: objectId(),
    purpose: 'password_reset',
    tokenHash: 'x'.repeat(64),
    attempts: 11,
    expiresAt: new Date(Date.now() + 60_000),
  })
  await assert.rejects(tooManyAttempts.validate(), /attempts/i)
})

test('all Phase 1 models use explicit collection names', () => {
  assert.equal(Skill.collection.collectionName, 'skills')
  assert.equal(Domain.collection.collectionName, 'domains')
  assert.equal(User.collection.collectionName, 'users')
  assert.equal(UserProfile.collection.collectionName, 'userProfiles')
  assert.equal(Session.collection.collectionName, 'sessions')
  assert.equal(VerificationToken.collection.collectionName, 'verificationTokens')
})
