import { User, UserProfile } from '../models/index.js'
import { revokeAllSessionsForUser } from './session.service.js'
import AppError from '../utils/AppError.js'

export async function getProfile(userId) {
  const profile = await UserProfile.findOne({ userId }).populate('skills.skillId', 'name slug category')
  if (!profile) {
    throw new AppError(404, 'Profile not found.', 'NOT_FOUND')
  }
  return profile
}

// Whitelist of fields a user is allowed to edit themselves — keeps this
// separate from admin-only fields if any get added to UserProfile later.
const EDITABLE_FIELDS = ['headline', 'education', 'skills', 'interests', 'experience', 'location', 'goals', 'preferences']

export async function updateProfile(userId, payload) {
  const profile = await UserProfile.findOne({ userId })
  if (!profile) {
    throw new AppError(404, 'Profile not found.', 'NOT_FOUND')
  }

  for (const field of EDITABLE_FIELDS) {
    if (payload[field] !== undefined) {
      profile[field] = payload[field]
    }
  }

  await profile.save()
  return profile
}

export async function updateOnboardingStep(userId, { status, currentStep }) {
  const profile = await UserProfile.findOne({ userId })
  if (!profile) {
    throw new AppError(404, 'Profile not found.', 'NOT_FOUND')
  }

  if (status) profile.onboarding.status = status
  if (currentStep !== undefined) profile.onboarding.currentStep = currentStep
  if (status === 'completed' && !profile.onboarding.completedAt) {
    profile.onboarding.completedAt = new Date()
  }

  await profile.save()
  return profile
}

// Stores profile asset metadata. Binary resume/avatar upload is optional in
// the SRS and remains outside the mandatory release boundary; URLs are
// validated as controlled http(s) assets rather than filesystem paths.
export async function updateAsset(userId, assetType, assetPayload) {
  if (!['avatar', 'resume'].includes(assetType)) {
    throw new AppError(400, 'assetType must be avatar or resume.', 'VALIDATION_ERROR')
  }
  const profile = await UserProfile.findOne({ userId })
  if (!profile) {
    throw new AppError(404, 'Profile not found.', 'NOT_FOUND')
  }
  profile.assets[assetType] = assetPayload
  await profile.save()
  return profile
}

export async function deactivateAccount(userId) {
  const user = await User.findById(userId)
  if (!user) throw new AppError(404, 'Account not found.', 'NOT_FOUND')
  user.status = 'deleted'
  user.deletedAt = new Date()
  await user.save()
  await revokeAllSessionsForUser(userId)
  return true
}

export default { getProfile, updateProfile, updateOnboardingStep, updateAsset, deactivateAccount }