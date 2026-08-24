const API_ROOT = import.meta.env.VITE_API_URL || '/api'

export const endpoints = {
  auth: {
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    adminLogin: '/auth/admin/login',
  },
  notifications: '/notifications',
  quizAttempts: '/quiz-attempts',
  recentlyViewed: '/users/me/recently-viewed',
  savedFilters: '/users/me/saved-filters',
  comparisons: '/users/me/comparisons',
  media: '/media',
  resources: '/resources',
  stories: '/stories',
  admin: {
    users: '/admin/users',
    careers: '/admin/careers',
    content: '/admin/content',
    stories: '/admin/stories',
    feedbackAnalytics: '/admin/feedback/analytics',
    settings: '/admin/settings',
  },
}

// Frontend pages call this boundary once the Express API is connected. MongoDB
// ObjectIds stay opaque strings in the UI, and all payloads remain plain JSON.
export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_ROOT}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Something went wrong.' }))
    throw new Error(error.message || `Request failed with status ${response.status}`)
  }

  return response.status === 204 ? null : response.json()
}

export const frontendFixtures = {
  notifications: [
    { _id: 'notif_01', type: 'match', title: 'Your matches are ready', body: 'Navi found three career paths that align with your latest answers.', time: '8 min ago', read: false, icon: 'sparkles' },
    { _id: 'notif_02', type: 'resource', title: 'A saved resource has a new lesson', body: 'UX Research: Start with Why added a practical interview template.', time: '2 hr ago', read: false, icon: 'book' },
    { _id: 'notif_03', type: 'feedback', title: 'The PathSeeker team replied', body: 'Your career comparison suggestion has been added to the roadmap.', time: 'Yesterday', read: true, icon: 'message' },
    { _id: 'notif_04', type: 'reminder', title: 'Keep your passport current', body: 'Add one recent project to improve your skill matches.', time: 'Aug 21', read: true, icon: 'target' },
  ],
  quizAttempts: [
    { _id: 'attempt_03', completedAt: '2026-08-24', archetype: 'Thoughtful Builder', score: 94, topCareer: 'UX Designer', status: 'Completed' },
    { _id: 'attempt_02', completedAt: '2026-06-12', archetype: 'Curious Strategist', score: 88, topCareer: 'Product Manager', status: 'Completed' },
    { _id: 'attempt_01', completedAt: '2026-03-03', archetype: 'Insight Explorer', score: 84, topCareer: 'Data Analyst', status: 'Completed' },
  ],
  recentItems: [
    { _id: 'recent_01', type: 'Career', title: 'UX Designer', meta: '94% match · Viewed 12 minutes ago', icon: 'pen', tone: 'lavender', target: ['career-detail', 'ux-designer'] },
    { _id: 'recent_02', type: 'Video', title: 'A day in the life of a data analyst', meta: '12 min · Viewed yesterday', icon: 'video', tone: 'blue', target: ['media-detail'] },
    { _id: 'recent_03', type: 'Story', title: 'Aisha’s path from psychology to UX', meta: 'Saved · 2 days ago', icon: 'users', tone: 'mint', target: ['story-detail'] },
    { _id: 'recent_04', type: 'Document', title: 'Career decision workbook', meta: 'PDF · 18 pages', icon: 'file', tone: 'amber', target: ['document-preview'] },
  ],
  savedFilters: [
    { _id: 'filter_01', name: 'Creative technology', domains: ['Design', 'Technology'], salaryMin: 60000, demand: 'High', alerts: true },
    { _id: 'filter_02', name: 'People-first careers', domains: ['Design', 'Business'], salaryMin: 50000, demand: 'Any', alerts: false },
    { _id: 'filter_03', name: 'Fast-growing data roles', domains: ['Data'], salaryMin: 70000, demand: 'Very high', alerts: true },
  ],
}
