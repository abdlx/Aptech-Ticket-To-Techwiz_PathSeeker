import { apiRequest } from './apiClient'

export const quizApi = {
  getActive: (options) => apiRequest('/quiz-questions', options),
  listAttempts: (query, options = {}) => apiRequest('/quiz-attempts', { ...options, query }),
  getAttempt: (id, options) => apiRequest(`/quiz-attempts/${id}`, options),
  startAttempt: () => apiRequest('/quiz-attempts', { method: 'POST' }),
  answer: (attemptId, answer) => apiRequest(`/quiz-attempts/${attemptId}/answer`, { method: 'PATCH', body: answer }),
  complete: (attemptId) => apiRequest(`/quiz-attempts/${attemptId}/complete`, { method: 'POST' }),
}

export default quizApi
