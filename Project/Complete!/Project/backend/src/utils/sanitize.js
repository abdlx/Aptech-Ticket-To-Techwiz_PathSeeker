export function stripHtml(value) {
  return String(value ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .trim()
}

export function sanitizeOptional(value, maxLength = 2000) {
  if (value == null) return value
  return stripHtml(value).slice(0, maxLength)
}

export default { stripHtml, sanitizeOptional }
