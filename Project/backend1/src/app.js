import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js'
import { requestContext } from './middleware/requestContext.js'
import apiRouter from './routes/index.js'

export function isOriginAllowed(origin, allowedOrigins) {
  if (!origin) return true
  const cleanOrigin = origin.replace(/\/$/, '')
  return allowedOrigins.some((allowed) => {
    const cleanAllowed = allowed.replace(/\/$/, '')
    if (cleanAllowed === '*' || cleanAllowed === cleanOrigin) return true
    if (cleanAllowed.startsWith('*.')) {
      const suffix = cleanAllowed.slice(2)
      try {
        const { hostname } = new URL(cleanOrigin)
        return hostname === suffix || hostname.endsWith(`.${suffix}`)
      } catch {
        return false
      }
    }
    try {
      const originUrl = new URL(cleanOrigin)
      const allowedUrl = new URL(cleanAllowed)
      return originUrl.origin === allowedUrl.origin
    } catch {
      return false
    }
  })
}

export function createApp() {
  const app = express()

  const corsMiddleware = cors({
    origin(origin, callback) {
      if (isOriginAllowed(origin, env.frontendOrigins)) {
        return callback(null, true)
      }

      console.warn(JSON.stringify({ level: 'warn', event: 'cors_origin_blocked', origin }))
      return callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    optionsSuccessStatus: 204,
  })

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.options(/.*/, corsMiddleware)
  app.use(corsMiddleware)
  app.use(helmet())
  app.use(requestContext)
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  app.use('/api', apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

export default createApp
