import test from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import {
  Bookmark,
  Career,
  Comparison,
  Feedback,
  Notification,
  QuizAttempt,
  QuizQuestion,
  RecentlyViewed,
  Resource,
  SavedFilter,
  SuccessStory,
} from '../src/models/index.js'

const objectId = () => new mongoose.Types.ObjectId()

function hasIndex(model, fields, expectedOptions = {}) {
  return model.schema.indexes().some(([definition, options]) => {
    const sameFields = JSON.stringify(definition) === JSON.stringify(fields)
    const sameOptions = Object.entries(expectedOptions).every(([key, value]) => options[key] === value)
    return sameFields && sameOptions
  })
}

test('Career requires a unique-per-document skill list and a valid salary range', async () => {
  const career = new Career({
    slug: 'ux-designer',
    title: 'UX Designer',
    domainId: objectId(),
    requiredSkills: [
      { skillId: objectId(), importance: 'critical' },
      { skillId: objectId(), importance: 'important' },
    ],
    expectedSalary: { min: 60_000, max: 90_000 },
  })
  await career.validate()
  assert.ok(hasIndex(Career, { slug: 1 }, { unique: true }))

  const invalidSalary = new Career({
    slug: 'bad-salary',
    title: 'Bad Salary Career',
    domainId: objectId(),
    expectedSalary: { min: 100_000, max: 50_000 },
  })
  await assert.rejects(invalidSalary.validate(), /max/i)
})

test('QuizQuestion requires unique option keys and at least two options for multiple choice', async () => {
  const question = new QuizQuestion({
    questionText: 'What energizes you most?',
    type: 'multiple_choice',
    options: [
      { key: 'a', label: 'Solving problems', domainWeights: [{ domainId: objectId(), weight: 3 }] },
      { key: 'b', label: 'Helping people' },
    ],
  })
  await question.validate()

  const tooFewOptions = new QuizQuestion({
    questionText: 'Only one option',
    type: 'multiple_choice',
    options: [{ key: 'a', label: 'Only choice' }],
  })
  await assert.rejects(tooFewOptions.validate(), /at least two options/i)

  const duplicateKeys = new QuizQuestion({
    questionText: 'Duplicate keys',
    type: 'multiple_choice',
    options: [
      { key: 'a', label: 'First' },
      { key: 'a', label: 'Second' },
    ],
  })
  await assert.rejects(duplicateKeys.validate(), /unique/i)
})

test('QuizAttempt auto-stamps completedAt when marked completed', async () => {
  const attempt = new QuizAttempt({
    userId: objectId(),
    status: 'completed',
    score: 88,
    archetype: 'Curious Strategist',
  })
  await attempt.validate()
  assert.ok(attempt.completedAt instanceof Date)
})

test('Resource requires a file asset and a valid type', async () => {
  const resource = new Resource({
    title: 'Career Decision Workbook',
    type: 'pdf',
    file: { url: 'https://example.com/workbook.pdf' },
    targetAudience: ['student', 'graduate'],
  })
  await resource.validate()

  const missingFile = new Resource({ title: 'No file', type: 'pdf' })
  await assert.rejects(missingFile.validate(), /file/i)
})

test('SuccessStory stamps approvedAt when status becomes approved', async () => {
  const story = new SuccessStory({
    submittedBy: objectId(),
    authorName: 'Aisha Khan',
    domainId: objectId(),
    storyText: 'From psychology to UX in 18 months.',
    status: 'approved',
  })
  await story.validate()
  assert.ok(story.approvedAt instanceof Date)
})

test('Feedback restricts category/status enums and stamps respondedAt', async () => {
  const feedback = new Feedback({
    userId: objectId(),
    category: 'bug',
    message: 'The quiz timer resets unexpectedly.',
    response: 'Fixed in the latest release.',
  })
  await feedback.validate()
  assert.ok(feedback.respondedAt instanceof Date)

  const badCategory = new Feedback({ userId: objectId(), category: 'invalid', message: 'x' })
  await assert.rejects(badCategory.validate(), /category/i)
})

test('Bookmark derives itemModel from itemType and enforces one bookmark per item', async () => {
  const bookmark = new Bookmark({
    userId: objectId(),
    itemType: 'career',
    itemId: objectId(),
    note: 'Compare salary bands later.',
  })
  await bookmark.validate()
  assert.equal(bookmark.itemModel, 'Career')
  assert.ok(hasIndex(Bookmark, { userId: 1, itemType: 1, itemId: 1 }, { unique: true }))
})

test('RecentlyViewed derives itemModel the same way as Bookmark', async () => {
  const recent = new RecentlyViewed({ userId: objectId(), itemType: 'media', itemId: objectId() })
  await recent.validate()
  assert.equal(recent.itemModel, 'Multimedia')
})

test('Comparison requires between 2 and 5 careers', async () => {
  const tooFew = new Comparison({ userId: objectId(), careerIds: [objectId()] })
  await assert.rejects(tooFew.validate(), /between 2 and 5/i)

  const valid = new Comparison({ userId: objectId(), careerIds: [objectId(), objectId(), objectId()] })
  await valid.validate()
})

test('SavedFilter defaults demand to "any" and Notification stamps readAt', async () => {
  const filter = new SavedFilter({ userId: objectId(), name: 'Creative technology' })
  await filter.validate()
  assert.equal(filter.demand, 'any')

  const notification = new Notification({
    userId: objectId(),
    type: 'match',
    title: 'Your matches are ready',
    read: true,
  })
  await notification.validate()
  assert.ok(notification.readAt instanceof Date)
})

test('all Milestone 2 models use explicit collection names', () => {
  assert.equal(Career.collection.collectionName, 'careers')
  assert.equal(QuizQuestion.collection.collectionName, 'quizQuestions')
  assert.equal(QuizAttempt.collection.collectionName, 'quizAttempts')
  assert.equal(Resource.collection.collectionName, 'resources')
  assert.equal(SuccessStory.collection.collectionName, 'successStories')
  assert.equal(Feedback.collection.collectionName, 'feedback')
  assert.equal(Bookmark.collection.collectionName, 'bookmarks')
  assert.equal(RecentlyViewed.collection.collectionName, 'recentlyViewed')
  assert.equal(Comparison.collection.collectionName, 'comparisons')
  assert.equal(SavedFilter.collection.collectionName, 'savedFilters')
  assert.equal(Notification.collection.collectionName, 'notifications')
})