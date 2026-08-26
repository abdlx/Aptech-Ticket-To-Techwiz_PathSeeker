import { apiRequest } from './apiClient'

export const dashboardApi = {
  get: (options) => apiRequest('/users/me/dashboard', options),
}

export default dashboardApi
