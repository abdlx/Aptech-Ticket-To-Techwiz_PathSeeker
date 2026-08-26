import { apiRequest, endpoints } from './apiClient'

export const notificationApi = {
  getNotifications: (params = {}, options = {}) =>
    apiRequest(endpoints.notifications, { query: params, ...options }),

  markRead: (id, options = {}) =>
    apiRequest(`${endpoints.notifications}/${id}/read`, { method: 'PATCH', ...options }),

  markAllRead: (options = {}) =>
    apiRequest(`${endpoints.notifications}/read-all`, { method: 'PATCH', ...options }),
}

export default notificationApi
