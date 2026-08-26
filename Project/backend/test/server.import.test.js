import assert from 'node:assert/strict'
import { test } from 'node:test'

test('server entry point imports without starting a listener', async () => {
  const module = await import('../src/server.js')
  assert.equal(typeof module.startServer, 'function')
})
