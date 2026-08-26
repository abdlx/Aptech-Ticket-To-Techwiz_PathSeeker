import { createApp } from './app.js'
import { assertRequiredEnv, env } from './config/env.js'
import { connectDatabase } from './config/database.js'

async function start() {
  assertRequiredEnv()
  await connectDatabase()

  const app = createApp()

  app.listen(env.port, () => {
    console.log(`PathSeeker API listening on port ${env.port} (${env.nodeEnv})`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error.message)
  process.exitCode = 1
})