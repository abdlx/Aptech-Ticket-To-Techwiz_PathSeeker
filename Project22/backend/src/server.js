import { createApp } from './app.js'
import { assertRequiredEnv, env } from './config/env.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'

async function start() {
  assertRequiredEnv()
  await connectDatabase()

  const app = createApp()
  const server = app.listen(env.port, () => {
    console.log(`PathSeeker API listening on port ${env.port} (${env.nodeEnv})`)
  })

  let shuttingDown = false
  const shutdown = async (signal) => {
    if (shuttingDown) return
    shuttingDown = true
    console.log(`Received ${signal}; shutting down PathSeeker API…`)
    server.close(async () => {
      try { await disconnectDatabase(); process.exitCode = 0 }
      catch (error) { console.error('Database shutdown failed:', error.message); process.exitCode = 1 }
    })
    setTimeout(() => { console.error('Forced shutdown after timeout.'); process.exitCode = 1 }, 10_000).unref()
  }

  process.once('SIGINT', () => shutdown('SIGINT'))
  process.once('SIGTERM', () => shutdown('SIGTERM'))
}

start().catch((error) => {
  console.error('Failed to start server:', error.message)
  process.exitCode = 1
})
