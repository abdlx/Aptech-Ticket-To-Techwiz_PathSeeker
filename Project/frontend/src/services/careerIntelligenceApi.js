import { apiRequest } from './apiClient'

export const careerIntelligenceApi = {
  passport: (options) => apiRequest('/users/me/passport', options),
  recommendations: (options) => apiRequest('/users/me/recommendations', options),
  career: (slug, options) => apiRequest(`/users/me/careers/${slug}/intelligence`, options),
  simulate: (slug, adjustments) => apiRequest(`/users/me/careers/${slug}/simulate`, { method: 'POST', body: { adjustments } }),
}

export default careerIntelligenceApi
