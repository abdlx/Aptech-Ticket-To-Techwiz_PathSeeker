const API_ROOT = import.meta.env.VITE_API_URL || '/api'

export const endpoints = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendVerification: '/auth/resend-verification',
    adminLogin: '/auth/admin/login',
  },
  domains: '/domains',
  skills: '/skills',
  careers: '/careers',
  relatedCareers: (slug) => `/careers/${encodeURIComponent(slug)}/related`,
  relatedContent: (slug) => `/careers/${encodeURIComponent(slug)}/related-content`,
  searchSuggestions: '/search/suggestions',
  profile: '/users/me/profile',
  profileOnboarding: '/users/me/profile/onboarding',
  account: '/users/me/profile',
  recommendations: '/users/me/recommendations',
  recommendationContent: '/users/me/recommendation-content',
  assistant: '/assistant/respond',
  bookmarks: '/users/me/bookmarks',
  bookmarkExport: '/users/me/bookmarks/export.pdf',
  notifications: '/notifications',
  quizQuestions: '/quiz-questions',
  quizAttempts: '/quiz-attempts',
  recentlyViewed: '/users/me/recently-viewed',
  savedFilters: '/users/me/saved-filters',
  comparisons: '/users/me/comparisons',
  media: '/media',
  relatedMedia: (id) => `/media/${encodeURIComponent(id)}/related`,
  resources: '/resources',
  stories: '/stories',
  myStories: '/stories/mine',
  myStory: (id) => `/stories/mine/${encodeURIComponent(id)}`,
  submitMyStory: (id) => `/stories/mine/${encodeURIComponent(id)}/submit`,
  help: '/help',
  storyUpload: '/stories/upload',
  feedback: '/feedback',
  admin: {
    users: '/admin/users',
    careers: '/admin/careers',
    quizQuestions: '/admin/quiz-questions',
    resources: '/admin/resources',
    media: '/admin/media',
    stories: '/admin/stories',
    storyItem: (id) => `/admin/stories/${encodeURIComponent(id)}`,
    storyAction: (id, action) => `/admin/stories/${encodeURIComponent(id)}/${action}`,
    feedback: '/admin/feedback',
    feedbackAssignees: '/admin/feedback/assignees',
    feedbackAnalytics: '/admin/feedback/analytics',
    stats: '/admin/stats',
    auditLogs: '/admin/audit-logs',
    settings: '/admin/settings',
    uploads: '/admin/uploads',
    help: '/help/admin/list',
    helpCreate: '/help/admin',
    helpItem: (id) => `/help/admin/${encodeURIComponent(id)}`,
    careerStatus: (id, status) => `/admin/careers/${encodeURIComponent(id)}/status/${status}`,
    resourceStatus: (id, status) => `/admin/resources/${encodeURIComponent(id)}/status/${status}`,
    mediaStatus: (id, status) => `/admin/media/${encodeURIComponent(id)}/status/${status}`,
    quizOrder: '/admin/quiz-questions/reorder',
    quizPublish: '/admin/quiz-questions/publish',
    quizVersions: '/admin/quiz-questions/versions',
    quizPreview: '/admin/quiz-questions/preview',
  },
}

function buildUrl(path) {
  return `${API_ROOT}${path}`
}

export async function apiRequest(path, options = {}) {
  const { headers, body, timeoutMs = 15000, ...rest } = options
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const combinedSignal = rest.signal && typeof AbortSignal !== 'undefined' && AbortSignal.any
      ? AbortSignal.any([controller.signal, rest.signal])
      : controller.signal
    const response = await fetch(buildUrl(path), {
      credentials: 'include',
      ...rest,
      signal: combinedSignal,
      headers: { ...(body !== undefined && !(typeof FormData !== 'undefined' && body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body,
    })
    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      const error = new Error(payload?.message || `Request failed with status ${response.status}`)
      error.status = response.status
      error.code = payload?.code
      error.details = payload?.details
      if (response.status === 401 && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('pathseeker:session-expired'))
      throw error
    }
    return response.status === 204 ? null : response.json()
  } catch (error) {
    if (error.name === 'AbortError') {
      const timeoutError = new Error('The request timed out. Please try again.')
      timeoutError.code = 'TIMEOUT'
      throw timeoutError
    }
    throw error
  } finally {
    clearTimeout(timeout)
  }
}

export async function apiFileRequest(path, options = {}) {
  const { timeoutMs = 15000, ...rest } = options
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const combinedSignal = rest.signal && typeof AbortSignal !== 'undefined' && AbortSignal.any
      ? AbortSignal.any([controller.signal, rest.signal])
      : controller.signal
    const response = await fetch(buildUrl(path), { credentials: 'include', ...rest, signal: combinedSignal })
    if (!response.ok) {
      const payload = await response.json().catch(() => null)
      const error = new Error(payload?.message || `Request failed with status ${response.status}`)
      error.status = response.status
      if (response.status === 401 && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('pathseeker:session-expired'))
      throw error
    }
    return response.blob()
  } finally {
    clearTimeout(timeout)
  }
}

export function formatDemand(value) {
  return String(value || 'medium').replace('_', ' ')
}

export function formatSalary(salary) {
  if (!salary) return 'Not listed'
  const money = (value) => {
    if (value == null) return '—'
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: salary.currency || 'USD', maximumFractionDigits: 0 }).format(value)
  }
  return `${money(salary.min)} – ${money(salary.max)}`
}

export function mapCareer(career, match) {
  return {
    id: career.slug || career._id,
    _id: career._id,
    slug: career.slug,
    title: career.title,
    field: career.domainId?.name || 'Career',
    match: match ?? null,
    salary: formatSalary(career.expectedSalary),
    demand: formatDemand(career.demand),
    growth: career.growthRatePercent != null ? `+${career.growthRatePercent}%` : '—',
    icon: career.iconKey || 'compass',
    tone: career.colorTone || 'mint',
    skills: (career.requiredSkills || []).map((item) => item.skillId?.name || item.skillId).filter(Boolean),
    summary: career.summary || career.description || '',
    description: career.description || '',
    responsibilities: career.responsibilities || [],
    toolsToLearn: career.toolsToLearn || [],
    timeToJobReady: career.timeToJobReadyMinMonths != null
      ? `${career.timeToJobReadyMinMonths}–${career.timeToJobReadyMaxMonths ?? career.timeToJobReadyMinMonths} months`
      : 'Varies',
    raw: career,
  }
}

export function mapResource(resource) {
  const iconByType = { pdf: 'file', checklist: 'check', infographic: 'chart', template: 'file' }
  const toneByType = { pdf: 'amber', checklist: 'mint', infographic: 'blue', template: 'lavender' }
  return {
    ...resource,
    id: resource._id,
    type: resource.type === 'pdf' ? 'Document' : resource.type,
    title: resource.title,
    meta: [resource.pageCount ? `${resource.pageCount} pages` : null, resource.targetAudience?.join(', ')].filter(Boolean).join(' · '),
    icon: iconByType[resource.type] || 'file',
    tone: toneByType[resource.type] || 'amber',
    progress: 0,
  }
}

export function mapMedia(media) {
  return {
    ...media,
    id: media._id,
    type: media.type,
    icon: media.type === 'audio' ? 'headphones' : media.type === 'animation' ? 'sparkles' : 'video',
  }
}

export function mapStory(story) {
  return {
    ...story,
    id: story._id,
    domain: story.domainId?.name || 'Career journey',
    initials: (story.authorName || '?').split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase(),
  }
}
