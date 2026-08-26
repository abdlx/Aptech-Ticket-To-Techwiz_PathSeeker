import { apiRequest, endpoints } from './apiClient'
export const careersApi = { list: (query, { signal } = {}) => apiRequest(endpoints.careers, { query, signal }), detail: (slug, { signal } = {}) => apiRequest(`${endpoints.careers}/${encodeURIComponent(slug)}`, { signal }), domains: ({ signal } = {}) => apiRequest(endpoints.domains, { signal }) }
