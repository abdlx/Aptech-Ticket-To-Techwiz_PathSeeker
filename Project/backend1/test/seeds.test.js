import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { Career, Domain, Multimedia, Resource, Skill, User, UserProfile } from '../src/models/index.js'
import { domainsSeed, skillsSeed } from '../src/database/seed/catalog.seed.js'
import { userIds } from '../src/database/seed/ids.js'
import { buildUsersSeed, profilesSeed } from '../src/database/seed/users.seed.js'
import { careersSeed } from '../src/database/seed/careers.seed.js'
import { mediaSeed, resourcesSeed } from '../src/database/seed/content.seed.js'

test('Phase 1 seeds are valid, deterministic, and internally referential', async () => {
  const passwordHash = '$2b$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345'
  const usersSeed = buildUsersSeed(passwordHash)

  await Promise.all([
    ...skillsSeed.map((document) => new Skill(document).validate()),
    ...domainsSeed.map((document) => new Domain(document).validate()),
    ...usersSeed.map((document) => new User(document).validate()),
    ...profilesSeed.map((document) => new UserProfile(document).validate()),
  ])

  assert.equal(new Set(skillsSeed.map(({ slug }) => slug)).size, skillsSeed.length)
  assert.equal(new Set(domainsSeed.map(({ slug }) => slug)).size, domainsSeed.length)
  assert.equal(new Set(usersSeed.map(({ normalizedEmail }) => normalizedEmail)).size, usersSeed.length)

  const knownSkillIds = new Set(skillsSeed.map(({ _id }) => _id.toString()))
  const knownUserIds = new Set(Object.values(userIds).map((id) => id.toString()))

  for (const profile of profilesSeed) {
    assert.ok(knownUserIds.has(profile.userId.toString()))
    for (const skill of profile.skills) {
      assert.ok(knownSkillIds.has(skill.skillId.toString()))
    }
  }
})

test('submission content seeds are broad, sourced, playable, and backed by real files', async () => {
  await Promise.all([
    ...careersSeed.map((document) => new Career(document).validate()),
    ...resourcesSeed.map((document) => new Resource(document).validate()),
    ...mediaSeed.map((document) => new Multimedia(document).validate()),
  ])

  assert.ok(careersSeed.length >= 15, 'The Career Bank must contain at least 15 researched careers.')
  assert.equal(new Set(careersSeed.map((career) => career.domainId.toString())).size, domainsSeed.length)
  for (const career of careersSeed) {
    assert.match(career.dataSource?.url || '', /^https:\/\/www\.bls\.gov\//)
    assert.ok(career.expectedSalary?.median > 0)
    assert.ok(career.responsibilities?.length >= 3)
    assert.ok(career.toolsToLearn?.length >= 3)
  }

  const testDirectory = path.dirname(fileURLToPath(import.meta.url))
  const publicDirectory = path.resolve(testDirectory, '../../frontend/public')
  const knownCareerIds = new Set(careersSeed.map((career) => career._id.toString()))
  for (const resource of resourcesSeed) {
    const assetPath = path.join(publicDirectory, resource.file.url.replace(/^\//, ''))
    assert.ok(fs.existsSync(assetPath), `Missing published resource asset: ${assetPath}`)
    assert.equal(fs.statSync(assetPath).size, resource.file.sizeBytes)
    assert.ok(resource.originalContent)
    assert.ok(resource.sourceReferences?.length >= 2)
    assert.ok(resource.relatedCareerIds?.length >= 1)
    assert.ok(resource.relatedCareerIds.every((id) => knownCareerIds.has(id.toString())))
  }

  assert.ok(mediaSeed.length >= 6)
  for (const media of mediaSeed) {
    assert.equal(media.type, 'video')
    assert.match(media.url, /^https:\/\/www\.youtube-nocookie\.com\/embed\//)
    assert.doesNotMatch(media.url, /dQw4w9WgXcQ/)
    assert.equal(media.publisherName, 'Google Career Certificates')
    assert.ok(media.externalUrl)
    assert.ok(media.learningObjectives?.length >= 3)
  }
})
