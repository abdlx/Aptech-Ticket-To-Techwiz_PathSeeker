const API_ROOT = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '')
const DEFAULT_TIMEOUT_MS = 15_000

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'NETWORK_ERROR', details, requestId, cause } = {}) {
    super(message, { cause })
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
    this.requestId = requestId
  }
}

function withQuery(path, query) {
  if (!query) return path
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item))
    else params.set(key, String(value))
  })
  const serialized = params.toString()
  return serialized ? `${path}?${serialized}` : path
}

export async function apiRequest(path, { query, timeoutMs = DEFAULT_TIMEOUT_MS, signal, body, headers, ...options } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), timeoutMs)
  const abort = () => controller.abort(signal.reason)
  signal?.addEventListener('abort', abort, { once: true })

  try {
    const response = await fetch(`${API_ROOT}${withQuery(path, query)}`, {
      credentials: 'include',
      headers: body === undefined || body instanceof FormData ? headers : { 'Content-Type': 'application/json', ...headers },
      body: body === undefined || typeof body === 'string' || body instanceof FormData ? body : JSON.stringify(body),
      signal: controller.signal,
      ...options,
    })
    const payload = response.status === 204 ? null : await response.json().catch(() => null)
    if (!response.ok) {
      throw new ApiError(payload?.message || `Request failed with status ${response.status}`, {
        status: response.status, code: payload?.code || 'HTTP_ERROR', details: payload?.details,
        requestId: payload?.requestId || response.headers.get('x-request-id'),
      })
    }
    return payload
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (controller.signal.aborted) {
      const timedOut = controller.signal.reason?.name === 'TimeoutError'
      throw new ApiError(timedOut ? 'The request timed out.' : 'The request was cancelled.', { code: timedOut ? 'TIMEOUT' : 'CANCELLED', cause: error })
    }
    throw new ApiError('Unable to reach PathSeeker. Check your connection and try again.', { cause: error })
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', abort)
  }
}

export const endpoints = {
  auth: { register: '/auth/register', verifyEmail: '/auth/verify-email', resendVerification: '/auth/resend-verification', login: '/auth/login', adminLogin: '/auth/admin/login', logout: '/auth/logout', me: '/auth/me', forgotPassword: '/auth/forgot-password', resetPassword: '/auth/reset-password' },
  profile: '/users/me/profile', onboarding: '/users/me/profile/onboarding', careers: '/careers', domains: '/domains', skills: '/skills',
  notifications: '/notifications', quizQuestions: '/quiz-questions', quizAttempts: '/quiz-attempts', recentlyViewed: '/users/me/recently-viewed',
  savedFilters: '/users/me/saved-filters', comparisons: '/users/me/comparisons', media: '/media', resources: '/resources', stories: '/stories', feedback: '/feedback',
  admin: { users: '/admin/users', careers: '/admin/careers', resources: '/admin/resources', media: '/admin/media', stories: '/admin/stories', feedback: '/admin/feedback', feedbackAnalytics: '/admin/feedback/analytics', settings: '/admin/settings', auditLogs: '/admin/audit-logs' },
}
