import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { createApp } from '../src/app.js'

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

test('application module imports and health endpoint responds', async () => {
  const response = await fetch(`${baseUrl}/api/health`)
  assert.equal(response.status, 200)
  assert.match(response.headers.get('x-request-id'), /^[0-9a-f-]{36}$/)
  assert.deepEqual(await response.json(), { data: { status: 'ok' } })
})

test('database readiness is unavailable while MongoDB is disconnected', async () => {
  const response = await fetch(`${baseUrl}/api/health/db`)
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), {
    data: { status: 'not_ready', database: 'disconnected' },
  })
})

test('unknown routes use the standard error contract and correlation ID', async () => {
  const response = await fetch(`${baseUrl}/api/does-not-exist`)
  const payload = await response.json()
  assert.equal(response.status, 404)
  assert.equal(payload.code, 'NOT_FOUND')
  assert.equal(payload.requestId, response.headers.get('x-request-id'))
})
