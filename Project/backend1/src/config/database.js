import mongoose from 'mongoose'
import dns from 'node:dns'

const DEFAULT_OPTIONS = Object.freeze({
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
  maxPoolSize: 10,
  minPoolSize: 0,
  autoIndex: true,
})

export async function connectDatabase({ uri, dbName, options = {} } = {}) {
  const connectionUri = uri ?? process.env.MONGODB_URI
  const databaseName = dbName ?? process.env.MONGODB_DB_NAME

  if (!connectionUri) {
    throw new Error('MONGODB_URI is required to connect to MongoDB.')
  }

  if (!databaseName) {
    throw new Error('MONGODB_DB_NAME is required to connect to MongoDB.')
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection
  }

  // Some Windows/network configurations refuse SRV lookups through the
  // system resolver. Apply the repository's reviewed fallback at the shared
  // adapter boundary so the server, seeds, and integration tools behave alike.
  if (connectionUri.startsWith('mongodb+srv://')) {
    dns.setServers(['1.1.1.1', '8.8.8.8'])
  }

  await mongoose.connect(connectionUri, {
    ...DEFAULT_OPTIONS,
    ...options,
    dbName: databaseName,
  })

  return mongoose.connection
}

export async function disconnectDatabase() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}
