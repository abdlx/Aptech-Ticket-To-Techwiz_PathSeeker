import { apiRequest } from './apiClient'

export const adminApi = {
  // Stats
  getStats: (options = {}) =>
    apiRequest('/admin/stats', options),

  // Users
  getUsers: (params = {}, options = {}) =>
    apiRequest('/admin/users', { query: params, ...options }),

  getUserById: (id, options = {}) =>
    apiRequest(`/admin/users/${id}`, options),

  updateUser: (id, payload, options = {}) =>
    apiRequest(`/admin/users/${id}`, { method: 'PATCH', body: payload, ...options }),

  // Careers
  getCareers: (params = {}, options = {}) =>
    apiRequest('/admin/careers', { query: params, ...options }),

  createCareer: (payload, options = {}) =>
    apiRequest('/admin/careers', { method: 'POST', body: payload, ...options }),

  updateCareer: (id, payload, options = {}) =>
    apiRequest(`/admin/careers/${id}`, { method: 'PATCH', body: payload, ...options }),

  deleteCareer: (id, options = {}) =>
    apiRequest(`/admin/careers/${id}`, { method: 'DELETE', ...options }),

  // Quiz Questions
  getQuizQuestions: (options = {}) =>
    apiRequest('/admin/quiz-questions', options),

  createQuizQuestion: (payload, options = {}) =>
    apiRequest('/admin/quiz-questions', { method: 'POST', body: payload, ...options }),

  updateQuizQuestion: (id, payload, options = {}) =>
    apiRequest(`/admin/quiz-questions/${id}`, { method: 'PATCH', body: payload, ...options }),

  deleteQuizQuestion: (id, options = {}) =>
    apiRequest(`/admin/quiz-questions/${id}`, { method: 'DELETE', ...options }),

  // Resources
  getResources: (params = {}, options = {}) =>
    apiRequest('/admin/resources', { query: params, ...options }),

  createResource: (payload, options = {}) =>
    apiRequest('/admin/resources', { method: 'POST', body: payload, ...options }),

  updateResource: (id, payload, options = {}) =>
    apiRequest(`/admin/resources/${id}`, { method: 'PATCH', body: payload, ...options }),

  deleteResource: (id, options = {}) =>
    apiRequest(`/admin/resources/${id}`, { method: 'DELETE', ...options }),

  // Multimedia
  getMedia: (params = {}, options = {}) =>
    apiRequest('/admin/media', { query: params, ...options }),

  createMedia: (payload, options = {}) =>
    apiRequest('/admin/media', { method: 'POST', body: payload, ...options }),

  updateMedia: (id, payload, options = {}) =>
    apiRequest(`/admin/media/${id}`, { method: 'PATCH', body: payload, ...options }),

  deleteMedia: (id, options = {}) =>
    apiRequest(`/admin/media/${id}`, { method: 'DELETE', ...options }),

  // Stories
  getStories: (params = {}, options = {}) =>
    apiRequest('/admin/stories', { query: params, ...options }),

  approveStory: (id, options = {}) =>
    apiRequest(`/admin/stories/${id}/approve`, { method: 'PATCH', ...options }),

  rejectStory: (id, options = {}) =>
    apiRequest(`/admin/stories/${id}/reject`, { method: 'PATCH', ...options }),

  // Feedback & Analytics
  getFeedback: (params = {}, options = {}) =>
    apiRequest('/admin/feedback', { query: params, ...options }),

  respondToFeedback: (id, payload, options = {}) =>
    apiRequest(`/admin/feedback/${id}/respond`, { method: 'PATCH', body: payload, ...options }),

  getFeedbackAnalytics: (options = {}) =>
    apiRequest('/admin/feedback/analytics', options),

  // Audit Logs & Settings
  getAuditLogs: (params = {}, options = {}) =>
    apiRequest('/admin/audit-logs', { query: params, ...options }),

  getSettings: (options = {}) =>
    apiRequest('/admin/settings', options),

  updateSettings: (payload, options = {}) =>
    apiRequest('/admin/settings', { method: 'PATCH', body: payload, ...options }),
}

export default adminApi
