import { env } from '../config/env.js'
import AppError from '../utils/AppError.js'

export function notFoundHandler(req, _res, next) {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'NOT_FOUND'))
}

// Must be registered last, with 4 params, so Express treats it as the error handler.
export function errorHandler(error, _req, res, _next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    })
  }

  // Mongoose validation errors -> 400 with a readable message.
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(error.errors).map((e) => e.message).join(' '),
      code: 'VALIDATION_ERROR',
    })
  }

  // Duplicate key (e.g. unique email) -> 409.
  if (error.code === 11000) {
    return res.status(409).json({ message: 'This record already exists.', code: 'DUPLICATE' })
  }

  console.error(error)

  return res.status(500).json({
    message: env.nodeEnv === 'production' ? 'Something went wrong.' : error.message,
    code: 'INTERNAL_ERROR',
  })
}

export default { notFoundHandler, errorHandler }