import { profileIds, skillIds, userIds } from './ids.js'

export function buildUsersSeed(passwordHash) {
  const verifiedAt = new Date('2026-08-01T09:00:00.000Z')

  return [
    {
      _id: userIds.superAdmin,
      name: 'Sarah Malik',
      email: 'admin@pathseeker.local',
      normalizedEmail: 'admin@pathseeker.local',
      passwordHash,
      role: 'super_admin',
      status: 'active',
      emailVerified: true,
      emailVerifiedAt: verifiedAt,
    },
    {
      _id: userIds.student,
      name: 'Alex Morgan',
      email: 'demo.student@pathseeker.local',
      normalizedEmail: 'demo.student@pathseeker.local',
      passwordHash,
      role: 'user',
      stage: 'student',
      status: 'active',
      emailVerified: true,
      emailVerifiedAt: verifiedAt,
    },
    {
      _id: userIds.graduate,
      name: 'Zara Noor',
      email: 'demo.graduate@pathseeker.local',
      normalizedEmail: 'demo.graduate@pathseeker.local',
      passwordHash,
      role: 'user',
      stage: 'graduate',
      status: 'active',
      emailVerified: true,
      emailVerifiedAt: verifiedAt,
    },
    {
      _id: userIds.professional,
      name: 'Daniel Kim',
      email: 'demo.professional@pathseeker.local',
      normalizedEmail: 'demo.professional@pathseeker.local',
      passwordHash,
      role: 'user',
      stage: 'professional',
      status: 'active',
      emailVerified: true,
      emailVerifiedAt: verifiedAt,
    },
  ]
}

export const profilesSeed = [
  {
    _id: profileIds.student,
    userId: userIds.student,
    headline: 'Student exploring people-centered technology careers',
    education: [{ level: 'Undergraduate', field: 'Psychology', current: true, startYear: 2024 }],
    skills: [
      { skillId: skillIds.empathy, selfRating: 8, source: 'self_reported' },
      { skillId: skillIds.research, selfRating: 7, source: 'education' },
      { skillId: skillIds.communication, selfRating: 7, source: 'self_reported' },
    ],
    interests: ['Design', 'Technology', 'Helping people'],
    location: { country: 'Pakistan', city: 'Karachi' },
    goals: {
      primaryGoal: 'Discover careers that fit me',
      remotePreference: 'flexible',
      timeframeMonths: 12,
    },
    onboarding: { status: 'completed', currentStep: 3, completedAt: new Date('2026-08-02T10:00:00.000Z') },
  },
  {
    _id: profileIds.graduate,
    userId: userIds.graduate,
    headline: 'Computer science graduate building practical product skills',
    education: [{ level: 'Bachelor', field: 'Computer Science', endYear: 2026 }],
    skills: [
      { skillId: skillIds.javascript, selfRating: 7, experienceMonths: 18, source: 'education' },
      { skillId: skillIds.react, selfRating: 6, experienceMonths: 12, source: 'education' },
      { skillId: skillIds.problemSolving, selfRating: 8, source: 'self_reported' },
    ],
    interests: ['Technology', 'Business', 'Data'],
    location: { country: 'Pakistan', city: 'Lahore' },
    goals: {
      primaryGoal: 'Build skills for a target career',
      remotePreference: 'hybrid',
      timeframeMonths: 6,
    },
    onboarding: { status: 'completed', currentStep: 3, completedAt: new Date('2026-08-03T10:00:00.000Z') },
  },
  {
    _id: profileIds.professional,
    userId: userIds.professional,
    headline: 'Finance professional transitioning into data analysis',
    education: [{ level: 'Bachelor', field: 'Finance', endYear: 2020 }],
    skills: [
      { skillId: skillIds.financialAnalysis, selfRating: 8, experienceMonths: 60, source: 'experience' },
      { skillId: skillIds.sql, selfRating: 5, experienceMonths: 8, source: 'self_reported' },
      { skillId: skillIds.dataAnalysis, selfRating: 6, experienceMonths: 12, source: 'experience' },
    ],
    interests: ['Data', 'Business', 'Technology'],
    location: { country: 'Pakistan', city: 'Islamabad' },
    goals: {
      primaryGoal: 'Compare careers I am considering',
      remotePreference: 'remote',
      timeframeMonths: 9,
    },
    onboarding: { status: 'completed', currentStep: 3, completedAt: new Date('2026-08-04T10:00:00.000Z') },
  },
]
