import { apiRequest, endpoints } from './apiClient'

export const authApi = {
  me: ({ signal } = {}) => apiRequest(endpoints.auth.me, { signal }),
  register: (body) => apiRequest(endpoints.auth.register, { method: 'POST', body }),
  login: (body) => apiRequest(endpoints.auth.login, { method: 'POST', body }),
  adminLogin: (body) => apiRequest(endpoints.auth.adminLogin, { method: 'POST', body }),
  forgotPassword: (body) => apiRequest(endpoints.auth.forgotPassword, { method: 'POST', body }),
  resetPassword: (body) => apiRequest(endpoints.auth.resetPassword, { method: 'POST', body }),
  logout: () => apiRequest(endpoints.auth.logout, { method: 'POST' }),
}
