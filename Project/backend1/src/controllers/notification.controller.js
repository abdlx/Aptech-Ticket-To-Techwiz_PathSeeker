import * as notificationService from '../services/notification.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { parsePagination } from '../utils/pagination.js'

export const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query)
  const { notifications, unreadCount, meta } = await notificationService.listNotifications(req.user.id, {
    page,
    limit,
    skip,
  })
  res.status(200).json({ data: { notifications, unreadCount, meta } })
})

export const markRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markNotificationRead(req.user.id, req.params.id)
  res.status(200).json({ data: { notification } })
})

export const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllNotificationsRead(req.user.id)
  res.status(200).json({ data: null, message: 'All notifications marked as read.' })
})

export default { getNotifications, markRead, markAllRead }