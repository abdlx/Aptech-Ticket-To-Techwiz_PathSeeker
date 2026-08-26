import mongoose from 'mongoose'
import {
  ONBOARDING_STATUSES,
  PROFILE_SKILL_SOURCES,
  REMOTE_PREFERENCES,
} from '../constants/database.js'
import { AssetSchema } from '../schemas/asset.schema.js'

const { Schema } = mongoose

const educationSchema = new Schema(
  {
    level: { type: String, required: true, trim: true, maxlength: 100 },
    institution: { type: String, trim: true, maxlength: 200 },
    field: { type: String, trim: true, maxlength: 150 },
    startYear: { type: Number, min: 1950, max: 2200 },
    endYear: { type: Number, min: 1950, max: 2200 },
    current: { type: Boolean, default: false },
  },
  { _id: false },
)

educationSchema.pre('validate', function validateEducationDates() {
  if (this.startYear && this.endYear && this.endYear < this.startYear) {
    this.invalidate('endYear', 'Education end year cannot be before start year.')
  }
})

const profileSkillSchema = new Schema(
  {
    skillId: { type: Schema.Types.ObjectId, ref: 'Skill', required: true },
    selfRating: { type: Number, required: true, min: 1, max: 10 },
    experienceMonths: { type: Number, min: 0, max: 1_200, default: 0 },
    source: { type: String, enum: PROFILE_SKILL_SOURCES, default: 'self_reported' },
  },
  { _id: false },
)

const experienceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 150 },
    organization: { type: String, trim: true, maxlength: 200 },
    description: { type: String, trim: true, maxlength: 2_000 },
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false },
  },
  { _id: false },
)

experienceSchema.pre('validate', function validateExperienceDates() {
  if (this.startDate && this.endDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'Experience end date cannot be before start date.')
  }
})

const userProfileSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, immutable: true },
    headline: { type: String, trim: true, maxlength: 180 },
    education: { type: [educationSchema], default: [] },
    skills: {
      type: [profileSkillSchema],
      default: [],
      validate: {
        validator: (skills) => new Set(skills.map(({ skillId }) => skillId.toString())).size === skills.length,
        message: 'A profile cannot contain the same skill more than once.',
      },
    },
    interests: {
      type: [{ type: String, trim: true, maxlength: 100 }],
      default: [],
      validate: {
        validator: (interests) => new Set(interests.map((interest) => interest.toLowerCase())).size === interests.length,
        message: 'Profile interests must be unique (case-insensitive).',
      },
    },
    experience: { type: [experienceSchema], default: [] },
    location: {
      country: { type: String, trim: true, maxlength: 100 },
      city: { type: String, trim: true, maxlength: 100 },
    },
    goals: {
      primaryGoal: { type: String, trim: true, maxlength: 200 },
      desiredIncome: { type: Number, min: 0 },
      desiredIncomeCurrency: { type: String, trim: true, uppercase: true, minlength: 3, maxlength: 3 },
      remotePreference: { type: String, enum: REMOTE_PREFERENCES, default: 'unspecified' },
      timeframeMonths: { type: Number, min: 1, max: 240 },
    },
    onboarding: {
      status: { type: String, enum: ONBOARDING_STATUSES, default: 'not_started' },
      currentStep: { type: Number, min: 0, max: 20, default: 0 },
      completedAt: { type: Date },
    },
    assets: {
      avatar: { type: AssetSchema },
      resume: { type: AssetSchema },
    },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
      fontScale: { type: Number, min: 0.75, max: 2, default: 1 },
      reducedMotion: { type: Boolean, default: false },
      emailNotifications: { type: Boolean, default: true },
      recommendationNotifications: { type: Boolean, default: true },
      roadmapReminders: { type: Boolean, default: true },
      aiPersonalization: { type: Boolean, default: true },
      activityHistory: { type: Boolean, default: true },
    },
  },
  { timestamps: true, collection: 'userProfiles' },
)

userProfileSchema.index({ userId: 1 }, { unique: true })
userProfileSchema.index({ 'skills.skillId': 1 })

export const UserProfile =
  mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema)
export default UserProfile
