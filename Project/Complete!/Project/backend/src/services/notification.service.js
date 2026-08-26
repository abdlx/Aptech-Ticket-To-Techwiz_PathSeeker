import { Notification } from '../models/index.js'
import { buildPaginationMeta } from '../utils/pagination.js'
import AppError from '../utils/AppError.js'

export async function listNotifications(userId, { page, limit, skip }) {
  const filter = { userId }
  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId, read: false }),
  ])

  return { notifications, unreadCount, meta: buildPaginationMeta({ page, limit, total }) }
}

export async function markNotificationRead(userId, notificationId) {
  const notification = await Notification.findOne({ _id: notificationId, userId })
  if (!notification) {
    throw new AppError(404, 'Notification not found.', 'NOT_FOUND')
  }
  notification.read = true
  notification.readAt = new Date()
  await notification.save()
  return notification
}

export async function markAllNotificationsRead(userId) {
  await Notification.updateMany(
    { userId, read: false },
    { $set: { read: true, readAt: new Date() } },
  )
}

// Not exposed over HTTP in this milestone — called internally by other
// services (quiz completion, feedback responses, etc.) to raise a
// notification for a user.
export async function createNotification({ userId, type, title, body, icon, targetType, targetId, targetScreen }) {
  return Notification.create({ userId, type, title, body, icon, targetType, targetId, targetScreen })
}

export default {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createNotification,
}