import * as profileService from '../services/profile.service.js'
import AppError from '../utils/AppError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { isNonEmptyString, isSafeHttpUrl } from '../utils/validators.js'
import { ONBOARDING_STATUSES } from '../constants/database.js'

export const getMyProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.getProfile(req.user.id)
  res.status(200).json({ data: { profile } })
})

export const updateMyProfile = asyncHandler(async (req, res) => {
  const profile = await profileService.updateProfile(req.user.id, req.body)
  res.status(200).json({ data: { profile }, message: 'Profile updated.' })
})

export const updateOnboarding = asyncHandler(async (req, res) => {
  const { status, currentStep } = req.body
  if (status && !ONBOARDING_STATUSES.includes(status)) {
    throw new AppError(400, `status must be one of: ${ONBOARDING_STATUSES.join(', ')}`, 'VALIDATION_ERROR')
  }
  const profile = await profileService.updateOnboardingStep(req.user.id, { status, currentStep })
  res.status(200).json({ data: { profile } })
})

export const deleteMyAccount = asyncHandler(async (req, res) => {
  await profileService.deactivateAccount(req.user.id)
  res.clearCookie(req.app.locals.sessionCookieName || 'ps_session', { path: '/' })
  res.status(204).send()
})

export const updateAsset = asyncHandler(async (req, res) => {
  const { assetType } = req.params
  const { url, assetKey, mimeType, sizeBytes, originalName } = req.body
  if (!isNonEmptyString(url, { min: 1, max: 2_000 }) || !isSafeHttpUrl(url)) {
    throw new AppError(400, 'url must be a valid http(s) URL.', 'VALIDATION_ERROR')
  }
  const profile = await profileService.updateAsset(req.user.id, assetType, {
    url,
    assetKey,
    mimeType,
    sizeBytes,
    originalName,
  })
  res.status(200).json({ data: { profile }, message: `${assetType} updated.` })
})

export default { getMyProfile, updateMyProfile, updateOnboarding, updateAsset, deleteMyAccount }