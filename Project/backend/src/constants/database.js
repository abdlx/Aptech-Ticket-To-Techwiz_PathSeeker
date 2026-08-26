export const USER_ROLES = Object.freeze([
  'user',
  'content_editor',
  'support_manager',
  'admin',
  'super_admin',
])

export const USER_STAGES = Object.freeze(['student', 'graduate', 'professional'])
export const USER_STATUSES = Object.freeze(['active', 'suspended', 'deleted'])

export const STAFF_ROLES = Object.freeze(['content_editor', 'support_manager', 'admin', 'super_admin'])
export const USER_MANAGEMENT_ROLES = Object.freeze(['admin', 'super_admin'])

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

// --- Milestone 2: Career Bank, Quiz, Content, Feedback, Personalization ---

export const CAREER_DEMAND_LEVELS = Object.freeze(['low', 'medium', 'high', 'very_high'])
export const SKILL_IMPORTANCE_LEVELS = Object.freeze(['nice_to_have', 'important', 'critical'])

export const QUIZ_TRAITS = Object.freeze([
  'creative',
  'analytical',
  'people',
  'technical',
  'communication',
  'empathy',
  'organization',
])

export const QUIZ_QUESTION_TYPES = Object.freeze(['multiple_choice', 'slider', 'likert'])
export const QUIZ_ATTEMPT_STATUSES = Object.freeze(['in_progress', 'completed'])

export const RESOURCE_TYPES = Object.freeze(['pdf', 'checklist', 'infographic', 'template'])
export const MULTIMEDIA_TYPES = Object.freeze(['video', 'audio', 'animation'])

export const STORY_STATUSES = Object.freeze(['pending', 'approved', 'rejected'])

export const FEEDBACK_CATEGORIES = Object.freeze(['bug', 'suggestion', 'query'])
export const FEEDBACK_STATUSES = Object.freeze(['open', 'in_review', 'resolved'])

// Shared across
// Shared across Bookmark / RecentlyViewed / Comparison: the kinds of content
// a user can save a polymorphic reference to.
export const SAVABLE_ITEM_TYPES = Object.freeze(['career', 'resource', 'media', 'story'])

export const NOTIFICATION_TYPES = Object.freeze([
  'match',
  'resource',
  'feedback',
  'reminder',
  'announcement',
])