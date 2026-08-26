import dns from 'node:dns'
import { pathToFileURL } from 'node:url'
import { createApp } from './app.js'
import { connectDatabase, disconnectDatabase } from './config/database.js'
import { assertRequiredEnv, env } from './config/env.js'

// Fix: The system DNS resolver on this machine refuses SRV queries, which
// prevents MongoDB Atlas SRV connection strings from resolving. Force Node.js
// to use Cloudflare (1.1.1.1) and Google (8.8.8.8) public DNS instead.
// This must run before any mongoose.connect() call.
dns.setServers(['1.1.1.1', '8.8.8.8'])

export async function startServer() {
  assertRequiredEnv()
  await connectDatabase({ uri: env.mongodbUri, dbName: env.mongodbDbName })

  const app = createApp()
  const server = await new Promise((resolve, reject) => {
    const listener = app.listen(env.port, () => resolve(listener))
    listener.once('error', reject)
  })

  console.log(JSON.stringify({ level: 'info', event: 'server_started', port: server.address().port, environment: env.nodeEnv }))

  let shuttingDown = false
  const shutdown = async (signal) => {
    if (shuttingDown) return
    shuttingDown = true
    console.log(JSON.stringify({ level: 'info', event: 'server_stopping', signal }))
    await new Promise((resolve) => server.close(resolve))
    await disconnectDatabase()
  }

  process.once('SIGINT', () => shutdown('SIGINT').catch((error) => { console.error(error); process.exitCode = 1 }))
  process.once('SIGTERM', () => shutdown('SIGTERM').catch((error) => { console.error(error); process.exitCode = 1 }))

  return { app, server, shutdown }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  startServer().catch((error) => {
    console.error(JSON.stringify({ level: 'error', event: 'server_start_failed', message: error.message }))
    process.exitCode = 1
  })
}
