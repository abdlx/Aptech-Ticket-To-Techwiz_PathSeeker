import { apiRequest, endpoints } from './apiClient'

export const profileApi = {
  get: ({ signal } = {}) => apiRequest(endpoints.profile, { signal }),
  update: (body) => apiRequest(endpoints.profile, { method: 'PATCH', body }),
  updateOnboarding: (body) => apiRequest(endpoints.onboarding, { method: 'PATCH', body }),
}
