import { apiRequest } from './apiClient'

export const assistantApi = {
  respond: (text, { signal } = {}) => apiRequest('/assistant/respond', {
    method: 'POST',
    body: { text },
    signal,
    timeoutMs: 10_000,
  }),
}

export default assistantApi
