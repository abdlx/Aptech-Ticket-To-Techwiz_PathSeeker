import test from 'node:test'
import assert from 'node:assert/strict'
import { Domain, Skill, User, UserProfile } from '../src/models/index.js'
import { domainsSeed, skillsSeed } from '../src/database/seed/catalog.seed.js'
import { userIds } from '../src/database/seed/ids.js'
import { buildUsersSeed, profilesSeed } from '../src/database/seed/users.seed.js'

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
