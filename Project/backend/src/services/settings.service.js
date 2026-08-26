import { Settings } from '../models/index.js'

const SINGLETON_FILTER = {}

// There's always exactly one settings document. This finds it, or creates
// the default one on first access, so callers never have to think about it.
export async function getSettings() {
  let settings = await Settings.findOne(SINGLETON_FILTER)
  if (!settings) {
    settings = await Settings.create({})
  }
  return settings
}

export async function updateSettings(adminUserId, payload) {
  const settings = await getSettings()

  if (payload.maintenanceMode !== undefined) settings.maintenanceMode = payload.maintenanceMode
  if (payload.allowNewRegistrations !== undefined) settings.allowNewRegistrations = payload.allowNewRegistrations
  if (payload.siteAnnouncement !== undefined) settings.siteAnnouncement = payload.siteAnnouncement
  settings.updatedBy = adminUserId

  await settings.save()
  return settings
}

export default { getSettings, updateSettings }