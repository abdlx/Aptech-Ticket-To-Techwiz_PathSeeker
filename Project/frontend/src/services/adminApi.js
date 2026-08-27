import { apiRequest } from './apiClient'

export const adminApi = {
  // Runtime health
  getHealth: (options = {}) => apiRequest('/health', options),
  getDatabaseHealth: (options = {}) => apiRequest('/health/db', options),

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

  uploadFile: (file, options = {}) => {
    const body = new FormData()
    body.append('file', file)
    return apiRequest('/admin/uploads', { method: 'POST', body, ...options })
  },

  // Careers
  getCareers: (params = {}, options = {}) =>
    apiRequest('/admin/careers', { query: params, ...options }),

  createCareer: (payload, options = {}) =>
    apiRequest('/admin/careers', { method: 'POST', body: payload, ...options }),

  updateCareer: (id, payload, options = {}) =>
    apiRequest(`/admin/careers/${id}`, { method: 'PATCH', body: payload, ...options }),

  deleteCareer: (id, options = {}) =>
    apiRequest(`/admin/careers/${id}`, { method: 'DELETE', ...options }),

  setCareerStatus: (id, status, options = {}) =>
    apiRequest(`/admin/careers/${id}/status/${status}`, { method: 'PATCH', ...options }),

  // Quiz Questions
  getQuizQuestions: (options = {}) =>
    apiRequest('/admin/quiz-questions', options),

  createQuizQuestion: (payload, options = {}) =>
    apiRequest('/admin/quiz-questions', { method: 'POST', body: payload, ...options }),

  updateQuizQuestion: (id, payload, options = {}) =>
    apiRequest(`/admin/quiz-questions/${id}`, { method: 'PATCH', body: payload, ...options }),

  deleteQuizQuestion: (id, options = {}) =>
    apiRequest(`/admin/quiz-questions/${id}`, { method: 'DELETE', ...options }),

  reorderQuizQuestions: (questionIds, options = {}) =>
    apiRequest('/admin/quiz-questions/reorder', { method: 'PATCH', body: { questionIds }, ...options }),

  previewQuiz: (options = {}) => apiRequest('/admin/quiz-questions/preview', options),

  getQuizVersions: (options = {}) => apiRequest('/admin/quiz-questions/versions', options),

  publishQuiz: (title, options = {}) =>
    apiRequest('/admin/quiz-questions/publish', { method: 'POST', body: { title }, ...options }),

  archiveQuizVersion: (version, options = {}) =>
    apiRequest(`/admin/quiz-questions/versions/${version}/archive`, { method: 'PATCH', ...options }),

  // Resources
  getResources: (params = {}, options = {}) =>
    apiRequest('/admin/resources', { query: params, ...options }),

  createResource: (payload, options = {}) =>
    apiRequest('/admin/resources', { method: 'POST', body: payload, ...options }),

  updateResource: (id, payload, options = {}) =>
    apiRequest(`/admin/resources/${id}`, { method: 'PATCH', body: payload, ...options }),

  deleteResource: (id, options = {}) =>
    apiRequest(`/admin/resources/${id}`, { method: 'DELETE', ...options }),

  setResourceStatus: (id, status, options = {}) =>
    apiRequest(`/admin/resources/${id}/status/${status}`, { method: 'PATCH', ...options }),

  // Multimedia
  getMedia: (params = {}, options = {}) =>
    apiRequest('/admin/media', { query: params, ...options }),

  createMedia: (payload, options = {}) =>
    apiRequest('/admin/media', { method: 'POST', body: payload, ...options }),

  updateMedia: (id, payload, options = {}) =>
    apiRequest(`/admin/media/${id}`, { method: 'PATCH', body: payload, ...options }),

  deleteMedia: (id, options = {}) =>
    apiRequest(`/admin/media/${id}`, { method: 'DELETE', ...options }),

  setMediaStatus: (id, status, options = {}) =>
    apiRequest(`/admin/media/${id}/status/${status}`, { method: 'PATCH', ...options }),

  // Stories
  getStories: (params = {}, options = {}) =>
    apiRequest('/admin/stories', { query: params, ...options }),

  getStoryById: (id, options = {}) => apiRequest(`/admin/stories/${id}`, options),

  approveStory: (id, payload = {}, options = {}) =>
    apiRequest(`/admin/stories/${id}/approve`, { method: 'PATCH', body: payload, ...options }),

  rejectStory: (id, payload = {}, options = {}) =>
    apiRequest(`/admin/stories/${id}/reject`, { method: 'PATCH', body: payload, ...options }),

  requestStoryChanges: (id, payload = {}, options = {}) =>
    apiRequest(`/admin/stories/${id}/request-changes`, { method: 'PATCH', body: payload, ...options }),

  updateStory: (id, payload, options = {}) =>
    apiRequest(`/admin/stories/${id}`, { method: 'PATCH', body: payload, ...options }),

  featureStory: (id, featured, options = {}) =>
    apiRequest(`/admin/stories/${id}/feature`, { method: 'PATCH', body: { featured }, ...options }),

  // Feedback & Analytics
  getFeedback: (params = {}, options = {}) =>
    apiRequest('/admin/feedback', { query: params, ...options }),

  getFeedbackAssignees: (options = {}) => apiRequest('/admin/feedback/assignees', options),

  updateFeedback: (id, payload, options = {}) =>
    apiRequest(`/admin/feedback/${id}`, { method: 'PATCH', body: payload, ...options }),

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

  // Help center management
  getHelpArticles: (params = {}, options = {}) =>
    apiRequest('/help/admin/list', { query: params, ...options }),

  createHelpArticle: (payload, options = {}) =>
    apiRequest('/help/admin', { method: 'POST', body: payload, ...options }),

  updateHelpArticle: (id, payload, options = {}) =>
    apiRequest(`/help/admin/${id}`, { method: 'PATCH', body: payload, ...options }),

  deleteHelpArticle: (id, options = {}) =>
    apiRequest(`/help/admin/${id}`, { method: 'DELETE', ...options }),
}

export default adminApi
