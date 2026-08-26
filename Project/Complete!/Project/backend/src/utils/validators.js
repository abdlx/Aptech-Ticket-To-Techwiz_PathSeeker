import { EMAIL_PATTERN, USER_STAGES } from '../constants/database.js'

// Mirrors the password rules already shown to users in
// frontend/src/components/auth/AuthPage.jsx: at least 8 characters, one
// uppercase letter, one number, one special character.
const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export function isNonEmptyString(value, { min = 1, max = 10_000 } = {}) {
  return typeof value === 'string' && value.trim().length >= min && value.trim().length <= max
}

export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_PATTERN.test(value.trim())
}

export function isValidPassword(value) {
  return typeof value === 'string' && PASSWORD_PATTERN.test(value)
}

export function isValidStage(value) {
  return USER_STAGES.includes(value)
}

export function isValidOtp(value, digits = 6) {
  return typeof value === 'string' && new RegExp(`^\\d{${digits}}$`).test(value)
}

export default {
  isNonEmptyString,
  isValidEmail,
  isValidPassword,
  isValidStage,
  isValidOtp,
}

export function isSafeHttpUrl(value) {
  try {
    const url = new URL(String(value))
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}
