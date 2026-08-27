import { apiRequest, endpoints } from './apiClient'

export const careersApi = {
  list: (query = {}, { signal } = {}) => apiRequest(endpoints.careers, { query, signal }),
  getCareers: (query = {}, { signal } = {}) => apiRequest(endpoints.careers, { query, signal }),
  detail: (slug, { signal } = {}) =>
    apiRequest(`${endpoints.careers}/${encodeURIComponent(slug)}`, { signal }),
  domains: ({ signal } = {}) => apiRequest(endpoints.domains, { signal }),
  getDomains: ({ signal } = {}) => apiRequest(endpoints.domains, { signal }),
  skills: (query = {}, { signal } = {}) => apiRequest('/skills', { query, signal }),
  suggestions: (q, { signal } = {}) => apiRequest('/search/suggestions', { query: { q }, signal }),
  related: (slug, { signal } = {}) =>
    apiRequest(`${endpoints.careers}/${encodeURIComponent(slug)}/related`, { signal }),
  relatedContent: (slug, { signal } = {}) =>
    apiRequest(`${endpoints.careers}/${encodeURIComponent(slug)}/related-content`, { signal }),
}
