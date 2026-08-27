import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import { env } from './config/env.js'
import path from 'node:path'
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js'
import { csrfOriginGuard } from './middleware/csrf.middleware.js'
import { requestLog } from './middleware/requestLog.middleware.js'
import apiRouter from './routes/index.js'

export function createApp() {
  const app = express()
  app.locals.uploadDir = path.resolve(env.uploadDir)
  app.locals.sessionCookieName = env.sessionCookieName
  app.use('/uploads', express.static(app.locals.uploadDir, { index: false, fallthrough: false }))

  app.disable('x-powered-by')
  app.set('trust proxy', 1)

  app.use(helmet())
  app.use(
    cors({
      origin: env.frontendOrigins,
      credentials: true,
    }),
  )
  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())
  app.use(requestLog)
  app.use('/api', csrfOriginGuard, apiRouter)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}

export default createApp