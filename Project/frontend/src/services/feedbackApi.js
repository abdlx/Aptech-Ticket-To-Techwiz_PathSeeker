import { apiRequest, endpoints } from './apiClient'

export const feedbackApi = {
  submitFeedback: (payload, options = {}) =>
    apiRequest(endpoints.feedback, { method: 'POST', body: payload, ...options }),

  getMyFeedback: (options = {}) =>
    apiRequest(`${endpoints.feedback}/mine`, options),
}

export default feedbackApi
