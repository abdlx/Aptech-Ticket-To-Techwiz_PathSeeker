import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import mongoose from 'mongoose'
import { createApp } from '../src/app.js'
import { respondToIntent } from '../src/services/assistant.service.js'

let server
let baseUrl

before(async () => {
  const app = createApp()
  server = await new Promise((resolve, reject) => {
    const listener = app.listen(0, '127.0.0.1', () => resolve(listener))
    listener.once('error', reject)
  })
  baseUrl = `http://127.0.0.1:${server.address().port}`
})

after(async () => {
  await new Promise((resolve) => server.close(resolve))
})

test('assistant service responds with matched intent and guidance', () => {
  const quizMatch = respondToIntent('I want to take a quiz')
  assert.equal(quizMatch.intent, 'quiz')
  assert.match(quizMatch.reply, /career quiz/)

  const careerMatch = respondToIntent('show me careers')
  assert.equal(careerMatch.intent, 'careers')

  const fallback = respondToIntent('something unknown')
  assert.equal(fallback.intent, 'help')
})

test('assistant endpoint responds via HTTP', async () => {
  const response = await fetch(`${baseUrl}/api/assistant/respond`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: 'Help me find jobs' }),
  })
  assert.equal(response.status, 200)
  const body = await response.json()
  assert.equal(body.data.intent, 'careers')
})

test('assistant endpoint rejects empty text payloads', async () => {
  const response = await fetch(`${baseUrl}/api/assistant/respond`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text: '' }),
  })
  assert.equal(response.status, 400)
  const body = await response.json()
  assert.equal(body.code, 'VALIDATION_ERROR')
})

test('admin protected endpoints reject unauthenticated access', async () => {
  const [careers, quiz, uploads, stories, feedback, helpList] = await Promise.all([
    fetch(`${baseUrl}/api/admin/careers`),
    fetch(`${baseUrl}/api/admin/quiz-questions`),
    fetch(`${baseUrl}/api/admin/uploads`, { method: 'POST' }),
    fetch(`${baseUrl}/api/admin/stories`),
    fetch(`${baseUrl}/api/admin/feedback`),
    fetch(`${baseUrl}/api/help/admin/list`),
  ])
  assert.equal(careers.status, 401)
  assert.equal(quiz.status, 401)
  assert.equal(uploads.status, 401)
  assert.equal(stories.status, 401)
  assert.equal(feedback.status, 401)
  assert.equal(helpList.status, 401)
})

test(
  'catalog and help center live query endpoints with MongoDB connection',
  { skip: mongoose.connection.readyState !== 1 },
  async () => {
    const [domainsRes, skillsRes, suggestRes, helpRes] = await Promise.all([
      fetch(`${baseUrl}/api/domains`),
      fetch(`${baseUrl}/api/skills`),
      fetch(`${baseUrl}/api/search/suggestions?q=software`),
      fetch(`${baseUrl}/api/help`),
    ])
    assert.equal(domainsRes.status, 200)
    assert.equal(skillsRes.status, 200)
    assert.equal(suggestRes.status, 200)
    assert.equal(helpRes.status, 200)
  },
)
