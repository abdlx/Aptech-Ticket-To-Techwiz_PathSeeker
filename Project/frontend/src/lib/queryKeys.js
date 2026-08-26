export const queryKeys = {
  auth: { me: () => ['auth', 'me'] }, profile: { me: () => ['profile', 'me'] },
  careers: { list: (filters = {}) => ['careers', 'list', filters], detail: (slug) => ['careers', 'detail', slug] },
  recommendations: { me: () => ['recommendations', 'me'] },
  quiz: { questions: (version) => ['quiz', 'questions', version], attempts: { list: (params = {}) => ['quiz', 'attempts', params], detail: (id) => ['quiz', 'attempt', id] } },
  bookmarks: { list: (params = {}) => ['bookmarks', params] }, recentlyViewed: { list: (params = {}) => ['recently-viewed', params] },
  savedFilters: { list: () => ['saved-filters'] }, comparisons: { list: () => ['comparisons'] },
  resources: { list: (filters = {}) => ['resources', filters], detail: (id) => ['resources', id] }, media: { list: (filters = {}) => ['media', filters], detail: (id) => ['media', id] },
  stories: { list: (filters = {}) => ['stories', filters], detail: (id) => ['stories', id] }, feedback: { mine: () => ['feedback', 'mine'] }, notifications: { list: (params = {}) => ['notifications', params] },
  admin: { users: (params = {}) => ['admin', 'users', params], careers: (params = {}) => ['admin', 'careers', params], content: (params = {}) => ['admin', 'content', params], feedback: (params = {}) => ['admin', 'feedback', params], stats: () => ['admin', 'stats'], settings: () => ['admin', 'settings'], auditLogs: (params = {}) => ['admin', 'audit-logs', params] },
}
