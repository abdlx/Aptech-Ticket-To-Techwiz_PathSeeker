import { validationResult } from 'express-validator'
import { AppError } from '../utils/appError.js'

export function validateRequest(req, res, next) {
  const result = validationResult(req)

  if (!result.isEmpty()) {
    const error = new AppError('Validation failed.', 400)
    error.errors = result.array().map((item) => ({
      field: item.path,
      message: item.msg,
    }))
    return next(error)
  }

  next()
}