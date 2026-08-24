export const USER_ROLES = Object.freeze([
  'user',
  'content_editor',
  'support_manager',
  'admin',
  'super_admin',
])

export const USER_STAGES = Object.freeze(['student', 'graduate', 'professional'])
export const USER_STATUSES = Object.freeze(['active', 'suspended', 'deleted'])

export const SKILL_CATEGORIES = Object.freeze([
  'technical',
  'communication',
  'leadership',
  'creative',
  'analytical',
  'business',
  'design',
  'research',
  'management',
])

export const PROFILE_SKILL_SOURCES = Object.freeze([
  'self_reported',
  'education',
  'experience',
  'admin_verified',
])

export const ONBOARDING_STATUSES = Object.freeze([
  'not_started',
  'in_progress',
  'completed',
])

export const REMOTE_PREFERENCES = Object.freeze([
  'onsite',
  'hybrid',
  'remote',
  'flexible',
  'unspecified',
])

export const TOKEN_PURPOSES = Object.freeze(['email_verification', 'password_reset'])

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
