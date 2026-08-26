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

test('CORS preflight is handled before API routes', async () => {
  const origin = 'https://aptech-ticket-to-techwiz-path-seeke.vercel.app'
  const response = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'OPTIONS',
    headers: {
      origin,
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type',
    },
  })

  assert.equal(response.status, 204)
  assert.equal(response.headers.get('access-control-allow-origin'), origin)
  assert.equal(response.headers.get('access-control-allow-credentials'), 'true')
  assert.match(response.headers.get('access-control-allow-methods'), /POST/)
  assert.match(response.headers.get('access-control-allow-headers'), /Content-Type/i)

  const demoOrigin = 'https://pathseeker-demo.alync.co'
  const demoResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'OPTIONS',
    headers: {
      origin: demoOrigin,
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type',
    },
  })
  assert.equal(demoResponse.status, 204)
  assert.equal(demoResponse.headers.get('access-control-allow-origin'), demoOrigin)
  assert.equal(demoResponse.headers.get('access-control-allow-credentials'), 'true')
})

test('email verification endpoints reject malformed requests before database access', async () => {
  const verifyResponse = await fetch(`${baseUrl}/api/auth/verify-email`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email', otp: '123' }),
  })
  assert.equal(verifyResponse.status, 400)
  assert.equal((await verifyResponse.json()).code, 'VALIDATION_ERROR')

  const resendResponse = await fetch(`${baseUrl}/api/auth/resend-verification`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'not-an-email' }),
  })
  assert.equal(resendResponse.status, 400)
  assert.equal((await resendResponse.json()).code, 'VALIDATION_ERROR')
})
