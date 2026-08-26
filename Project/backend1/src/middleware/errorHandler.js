import { AppError } from '../utils/appError.js'

export function notFound(req, res, next) {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404))
}

export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500

  if (statusCode === 500) {
    console.error(err)
  }

  res.status(statusCode).json({
    message: err.message || 'Something went wrong on the server.',
    ...(err.errors ? { errors: err.errors } : {}),
  })
}