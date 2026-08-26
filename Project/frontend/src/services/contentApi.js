import { apiRequest, endpoints } from './apiClient'

export const contentApi = {
  // Resources
  getResources: (params = {}, options = {}) =>
    apiRequest(endpoints.resources, { query: params, ...options }),

  getResourceById: (id, options = {}) =>
    apiRequest(`${endpoints.resources}/${id}`, options),

  recordDownload: (id, options = {}) =>
    apiRequest(`${endpoints.resources}/${id}/download`, { method: 'POST', ...options }),

  // Media
  getMedia: (params = {}, options = {}) =>
    apiRequest(endpoints.media, { query: params, ...options }),

  getMediaById: (id, options = {}) =>
    apiRequest(`${endpoints.media}/${id}`, options),

  rateMedia: (id, value, options = {}) =>
    apiRequest(`${endpoints.media}/${id}/ratings`, { method: 'POST', body: { value }, ...options }),

  // Stories
  getStories: (params = {}, options = {}) =>
    apiRequest(endpoints.stories, { query: params, ...options }),

  getStoryById: (id, options = {}) =>
    apiRequest(`${endpoints.stories}/${id}`, options),

  submitStory: (payload, options = {}) =>
    apiRequest(endpoints.stories, { method: 'POST', body: payload, ...options }),
}

export default contentApi
