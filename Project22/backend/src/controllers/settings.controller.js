import * as settingsService from '../services/settings.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await settingsService.getSettings()
  res.status(200).json({ data: { settings } })
})

export const updateSettings = asyncHandler(async (req, res) => {
  const { maintenanceMode, allowNewRegistrations, siteAnnouncement } = req.body
  const settings = await settingsService.updateSettings(req.user.id, {
    maintenanceMode,
    allowNewRegistrations,
    siteAnnouncement,
  })
  res.status(200).json({ data: { settings }, message: 'Settings updated.' })
})

export default { getSettings, updateSettings }