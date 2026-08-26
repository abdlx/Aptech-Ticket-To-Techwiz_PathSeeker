import { apiRequest, endpoints } from './apiClient'

const BOOKMARKS_ENDPOINT = '/users/me/bookmarks'

export const personalizationApi = {
  // Saved Filters
  getSavedFilters: (options = {}) =>
    apiRequest(endpoints.savedFilters, options),

  createSavedFilter: (payload, options = {}) =>
    apiRequest(endpoints.savedFilters, { method: 'POST', body: payload, ...options }),

  deleteSavedFilter: (id, options = {}) =>
    apiRequest(`${endpoints.savedFilters}/${id}`, { method: 'DELETE', ...options }),

  // Recently Viewed
  getRecentlyViewed: (params = {}, options = {}) =>
    apiRequest(endpoints.recentlyViewed, { query: params, ...options }),

  recordRecentlyViewed: (payload, options = {}) =>
    apiRequest(endpoints.recentlyViewed, { method: 'POST', body: payload, ...options }),

  // Bookmarks & Notes
  getBookmarks: (params = {}, options = {}) =>
    apiRequest(BOOKMARKS_ENDPOINT, { query: params, ...options }),

  addBookmark: (payload, options = {}) =>
    apiRequest(BOOKMARKS_ENDPOINT, { method: 'POST', body: payload, ...options }),

  updateBookmarkNote: (id, note, options = {}) =>
    apiRequest(`${BOOKMARKS_ENDPOINT}/${id}`, { method: 'PATCH', body: { note }, ...options }),

  removeBookmark: (id, options = {}) =>
    apiRequest(`${BOOKMARKS_ENDPOINT}/${id}`, { method: 'DELETE', ...options }),

  // Comparisons
  getComparisons: (options = {}) =>
    apiRequest(endpoints.comparisons, options),

  saveComparison: (payload, options = {}) =>
    apiRequest(endpoints.comparisons, { method: 'POST', body: payload, ...options }),

  deleteComparison: (id, options = {}) =>
    apiRequest(`${endpoints.comparisons}/${id}`, { method: 'DELETE', ...options }),
}

export default personalizationApi
