import { UserProfile } from '../models/index.js'
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

// Stores asset metadata (url/mimeType/etc.) against the profile. Actual file
// upload/storage (multer + a storage provider) is intentionally NOT included
// here — no storage provider (local disk vs S3 vs Cloudinary) has been
// confirmed yet, and the SRS marks resume upload as optional. This endpoint
// accepts a URL the same way Resource/Multimedia already do, so it's ready
// to plug into a real upload flow later without changing this contract.
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

export default { getProfile, updateProfile, updateOnboardingStep, updateAsset }